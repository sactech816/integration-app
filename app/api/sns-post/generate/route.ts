import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  createAIProvider,
  DEFAULT_AI_MODELS,
} from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

function getProviderFromModelId(modelId: string): 'openai' | 'gemini' | 'anthropic' {
  if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('o3')) return 'openai';
  if (modelId.startsWith('gemini')) return 'gemini';
  if (modelId.startsWith('claude')) return 'anthropic';
  return 'gemini';
}

async function getAISettings(userPlan: string): Promise<{ model: string; backupModel: string }> {
  const supabase = getServiceClient();
  const defaultSettings = {
    model: DEFAULT_AI_MODELS.primary.outline,
    backupModel: DEFAULT_AI_MODELS.backup.outline,
  };
  if (!supabase) return defaultSettings;

  try {
    const { data, error } = await supabase
      .from('admin_ai_settings')
      .select('custom_outline_model, backup_outline_model')
      .eq('service', 'makers')
      .eq('plan_tier', userPlan)
      .single();

    if (error || !data) return defaultSettings;
    return {
      model: data.custom_outline_model || defaultSettings.model,
      backupModel: data.backup_outline_model || defaultSettings.backupModel,
    };
  } catch {
    return defaultSettings;
  }
}

const PLATFORM_CONFIG: Record<string, { label: string; charLimit: number; hashtagLimit: number | null }> = {
  twitter: { label: 'X (Twitter)', charLimit: 280, hashtagLimit: null },
  instagram: { label: 'Instagram', charLimit: 2200, hashtagLimit: 30 },
  threads: { label: 'Threads', charLimit: 500, hashtagLimit: null },
};

const TONE_LABELS: Record<string, string> = {
  business: 'ビジネス・プロフェッショナル',
  casual: 'カジュアル・フレンドリー',
  education: '教育・解説',
  entertainment: 'エンタメ・面白い',
  inspirational: 'インスピレーション・モチベーション',
};

function generatePrompt(platform: string, tone: string, topic: string): string {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.twitter;
  const toneLabel = TONE_LABELS[tone] || tone;

  return `あなたはSNSマーケティングの専門家です。以下の条件で${config.label}向けの投稿文を作成してください。

【プラットフォーム】${config.label}（${config.charLimit}文字以内）
【トーン】${toneLabel}
【トピック/キーワード】${topic}

【出力形式】
以下のJSON形式で出力してください:
{
  "text": "投稿本文（${config.charLimit}文字以内。ハッシュタグは含めない）",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", "ハッシュタグ3"],
  "title": "この投稿の簡潔なタイトル（管理用、20文字以内）"
}

【注意事項】
- 日本語で書いてください
- ${config.label}のユーザー層に最適化してください
- ハッシュタグは#を付けずに返してください
- ハッシュタグは5〜10個程度${config.hashtagLimit ? `（最大${config.hashtagLimit}個）` : ''}
- エンゲージメントを高める文章にしてください
- 絵文字を適切に使ってください
- 改行を効果的に使ってください
- JSONのみを出力し、他の説明は不要です`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, tone, topic, userId, userPlan = 'free' } = body;

    if (!platform || !topic) {
      return NextResponse.json(
        { error: 'platform and topic are required' },
        { status: 400 }
      );
    }

    const aiSettings = await getAISettings(userPlan);
    const prompt = generatePrompt(platform, tone || 'business', topic);

    let provider;
    let usedModel = aiSettings.model;

    try {
      provider = createAIProvider({
        preferProvider: getProviderFromModelId(aiSettings.model),
        model: aiSettings.model,
      });
    } catch {
      provider = createAIProvider({
        preferProvider: getProviderFromModelId(aiSettings.backupModel),
        model: aiSettings.backupModel,
      });
      usedModel = aiSettings.backupModel;
    }

    const response = await provider.generate({
      messages: [
        {
          role: 'system',
          content: 'あなたはSNSマーケティングの専門家です。指定された形式のJSONのみを出力してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    let aiContent;
    try {
      let jsonStr = response.content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      aiContent = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: 'AIの出力をパースできませんでした。もう一度お試しください。' },
        { status: 500 }
      );
    }

    if (userId) {
      logAIUsage({
        userId,
        actionType: 'sns_post_generate',
        service: 'makers',
        modelUsed: usedModel,
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
        metadata: { platform, tone, topic: topic.substring(0, 100) },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      text: aiContent.text || '',
      hashtags: aiContent.hashtags || [],
      title: aiContent.title || 'SNS投稿',
      modelUsed: usedModel,
    });
  } catch (error: any) {
    console.error('SNS post generate error:', error);
    return NextResponse.json(
      { error: error.message || 'AI生成に失敗しました' },
      { status: 500 }
    );
  }
}
