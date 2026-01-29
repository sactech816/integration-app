import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  createAIProvider, 
  AVAILABLE_AI_MODELS,
  DEFAULT_AI_MODELS 
} from '@/lib/ai-provider';
import { Block } from '@/lib/types';
import { templateGuides, getTemplateById } from '@/constants/templates/salesletter';
import {
  createHeadline,
  createParagraph,
  createCtaButton,
  createSpacer,
  createDivider,
  createImage,
} from '@/constants/templates/salesletter/helpers';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// AIモデルIDからプロバイダーを推測
function getProviderFromModelId(modelId: string): 'openai' | 'gemini' | 'anthropic' {
  if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return 'openai';
  }
  if (modelId.startsWith('gemini')) {
    return 'gemini';
  }
  if (modelId.startsWith('claude')) {
    return 'anthropic';
  }
  return 'gemini'; // デフォルト
}

// プランに応じたAI設定を取得
async function getAISettings(userPlan: string): Promise<{ model: string; backupModel: string }> {
  const supabase = getServiceClient();
  
  const defaultSettings = {
    model: DEFAULT_AI_MODELS.primary.outline,
    backupModel: DEFAULT_AI_MODELS.backup.outline,
  };

  if (!supabase) {
    return defaultSettings;
  }

  try {
    const { data, error } = await supabase
      .from('admin_ai_settings')
      .select('custom_outline_model, backup_outline_model')
      .eq('service', 'makers')
      .eq('plan_tier', userPlan)
      .single();

    if (error || !data) {
      return defaultSettings;
    }

    return {
      model: data.custom_outline_model || defaultSettings.model,
      backupModel: data.backup_outline_model || defaultSettings.backupModel,
    };
  } catch (err) {
    console.error('Failed to get AI settings:', err);
    return defaultSettings;
  }
}

// テンプレート構造に基づいたプロンプトを生成
function generatePrompt(
  templateId: string,
  input: {
    productName: string;
    target: string;
    price: string;
    features: string;
    benefits: string;
    urgency: string;
    ctaText: string;
  }
): string {
  const template = getTemplateById(templateId);
  const guide = templateGuides[templateId];

  const structureDescription = guide?.structure
    ?.map((s, i) => `${i + 1}. ${s.step}: ${s.description}`)
    .join('\n') || '';

  return `あなたは一流のセールスライターです。
以下の商品情報を基に、「${template?.name || templateId}」形式のセールスレターを作成してください。

【商品情報】
- 商品/サービス名: ${input.productName}
- ターゲット顧客: ${input.target}
- 価格: ${input.price || '未設定'}
- 主な特徴:
${input.features.split('\n').map(f => `  - ${f}`).join('\n')}
- ベネフィット（顧客が得られるメリット）:
${input.benefits.split('\n').map(b => `  - ${b}`).join('\n')}
- 緊急性/限定性: ${input.urgency || 'なし'}
- CTAテキスト: ${input.ctaText || '今すぐ申し込む'}

【構成】
${structureDescription}

【出力形式】
以下のJSON形式で出力してください。各セクションには適切なタイトルと本文を含めてください。

{
  "sections": [
    {
      "sectionTitle": "セクションのタイトル（見出し）",
      "sectionContent": "セクションの本文（HTMLタグを使用可能：<p>, <strong>, <ul>, <li>, <br>）"
    }
  ],
  "mainHeadline": "メインの見出し（キャッチコピー）",
  "subHeadline": "サブ見出し（補足文）"
}

【重要な注意事項】
- 日本語で書いてください
- 読者の感情に訴えかける文章にしてください
- 具体的な数字や事例を含めてください
- 各セクションは200〜400文字程度を目安にしてください
- 箇条書きを効果的に使ってください
- JSONのみを出力し、他の説明は不要です`;
}

// AIレスポンスをブロックに変換
function convertToBlocks(
  aiResponse: {
    sections: Array<{ sectionTitle: string; sectionContent: string }>;
    mainHeadline: string;
    subHeadline?: string;
  },
  ctaText: string
): Block[] {
  const blocks: Block[] = [];

  // メインヘッドライン
  blocks.push(createHeadline(aiResponse.mainHeadline, {
    level: 'h1',
    fontSize: 36,
    color: '#1f2937',
  }));

  // サブヘッドライン（あれば）
  if (aiResponse.subHeadline) {
    blocks.push(createSpacer(16));
    blocks.push(createParagraph(`<p style="text-align: center; color: #6b7280;">${aiResponse.subHeadline}</p>`, {
      align: 'center',
    }));
  }

  blocks.push(createSpacer(48));

  // 各セクション
  aiResponse.sections.forEach((section, index) => {
    // セクション区切り（最初のセクション以外）
    if (index > 0) {
      blocks.push(createDivider({ variant: 'short', shortWidth: 30 }));
      blocks.push(createSpacer(48));
    }

    // セクションタイトル
    blocks.push(createHeadline(section.sectionTitle, {
      level: 'h2',
      fontSize: 28,
    }));

    blocks.push(createSpacer(24));

    // セクション本文
    blocks.push(createParagraph(section.sectionContent, {
      align: 'left',
    }));

    blocks.push(createSpacer(48));
  });

  // CTA
  blocks.push(createDivider({ variant: 'short', shortWidth: 30 }));
  blocks.push(createSpacer(48));
  blocks.push(createCtaButton(ctaText, '#', {
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    size: 'lg',
    fullWidth: true,
  }));
  blocks.push(createSpacer(48));

  return blocks;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      templateId,
      input,
      userId,
      userPlan = 'free',
    } = body;

    if (!templateId || !input) {
      return NextResponse.json(
        { error: 'templateId and input are required' },
        { status: 400 }
      );
    }

    // 必須フィールドのバリデーション
    if (!input.productName || !input.target || !input.features || !input.benefits) {
      return NextResponse.json(
        { error: 'productName, target, features, and benefits are required' },
        { status: 400 }
      );
    }

    // AI設定を取得
    const aiSettings = await getAISettings(userPlan);
    
    // プロンプトを生成
    const prompt = generatePrompt(templateId, input);

    // AIプロバイダーを作成
    let provider;
    let usedModel = aiSettings.model;

    try {
      provider = createAIProvider({
        preferProvider: getProviderFromModelId(aiSettings.model),
        model: aiSettings.model,
      });
    } catch (err) {
      console.warn(`Primary model ${aiSettings.model} failed, trying backup...`);
      // バックアップモデルを試す
      provider = createAIProvider({
        preferProvider: getProviderFromModelId(aiSettings.backupModel),
        model: aiSettings.backupModel,
      });
      usedModel = aiSettings.backupModel;
    }

    // AI生成を実行
    const response = await provider.generate({
      messages: [
        {
          role: 'system',
          content: 'あなたは一流のセールスライターです。指定された形式のJSONのみを出力してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 4000,
      responseFormat: 'json',
    });

    // JSONをパース
    let aiContent;
    try {
      // レスポンスからJSONを抽出（コードブロックに囲まれている場合も対応）
      let jsonStr = response.content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      aiContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.content);
      return NextResponse.json(
        { error: 'AIの出力をパースできませんでした。もう一度お試しください。' },
        { status: 500 }
      );
    }

    // ブロックに変換
    const blocks = convertToBlocks(aiContent, input.ctaText || '今すぐ申し込む');

    // 使用量をログ（将来実装）
    // await logAIUsage({ userId, actionType: 'salesletter_generate', modelUsed: usedModel });

    return NextResponse.json({
      success: true,
      blocks,
      modelUsed: usedModel,
      message: 'セールスレターを生成しました',
    });
  } catch (error: any) {
    console.error('AI generate error:', error);
    return NextResponse.json(
      { error: error.message || 'AI生成に失敗しました' },
      { status: 500 }
    );
  }
}
