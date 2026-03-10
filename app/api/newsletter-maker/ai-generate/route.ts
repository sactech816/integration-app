import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  createAIProvider,
  DEFAULT_AI_MODELS,
  getProviderFromModelId,
} from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { getMakersSubscriptionStatus } from '@/lib/subscription';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// プランに応じたAI設定を取得
async function getAISettings(userPlan: string): Promise<{ model: string; backupModel: string }> {
  const supabase = getServiceClient();
  const defaultSettings = {
    model: DEFAULT_AI_MODELS.primary.outline,
    backupModel: DEFAULT_AI_MODELS.backup.outline,
  };

  if (!supabase) return defaultSettings;

  try {
    const { data } = await supabase
      .from('admin_ai_settings')
      .select('custom_outline_model, backup_outline_model')
      .eq('service', 'makers')
      .eq('plan_tier', userPlan)
      .single();

    if (!data) return defaultSettings;

    return {
      model: data.custom_outline_model || defaultSettings.model,
      backupModel: data.backup_outline_model || defaultSettings.backupModel,
    };
  } catch {
    return defaultSettings;
  }
}

const PURPOSE_LABELS: Record<string, string> = {
  announcement: 'お知らせ・告知',
  sale: 'セール・割引案内',
  column: 'コラム・ブログ記事',
  event: 'イベント・セミナー案内',
  welcome: 'ウェルカムメール（新規登録者向け）',
  follow_up: 'フォローアップメール',
};

/**
 * POST: AIでメルマガコンテンツを生成
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, type, purpose, keyword, currentSubject, currentContent } = await request.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'userId と type は必須です' }, { status: 400 });
    }

    // PRO限定チェック
    const subStatus = await getMakersSubscriptionStatus(userId);
    if (!subStatus.hasActiveSubscription || (subStatus.planTier !== 'business' && subStatus.planTier !== 'premium')) {
      return NextResponse.json({ error: 'AI機能はPROプランでご利用いただけます' }, { status: 403 });
    }

    const aiSettings = await getAISettings(subStatus.planTier);
    const purposeLabel = PURPOSE_LABELS[purpose] || purpose;

    let results: string[] = [];

    if (type === 'subject') {
      results = await generateSubjects(aiSettings, purposeLabel, keyword, currentContent);
    } else if (type === 'body') {
      results = await generateBody(aiSettings, purposeLabel, keyword, currentSubject);
    } else {
      return NextResponse.json({ error: '無効なtype' }, { status: 400 });
    }

    // 利用ログ記録
    try {
      await logAIUsage({
        userId,
        actionType: `newsletter_${type}`,
        service: 'makers',
        modelUsed: aiSettings.model,
        inputTokens: 0,
        outputTokens: 0,
        usageType: 'standard',
      });
    } catch {}

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[Newsletter AI Generate] Error:', error);
    const errMsg = error instanceof Error ? error.message : 'AI生成に失敗しました';
    // 具体的なエラーメッセージを返す
    if (errMsg.includes('API key') || errMsg.includes('auth')) {
      return NextResponse.json({ error: 'AI設定が正しく構成されていません。管理者にお問い合わせください。' }, { status: 500 });
    }
    return NextResponse.json({ error: `AI生成に失敗しました: ${errMsg}` }, { status: 500 });
  }
}

async function generateSubjects(
  aiSettings: { model: string; backupModel: string },
  purposeLabel: string,
  keyword: string,
  currentContent: string
): Promise<string[]> {
  const systemPrompt = `あなたはメルマガの件名を作成する専門家です。
開封率を上げるために、以下のポイントを押さえた件名を生成してください：
- 30文字以内で簡潔に
- 読者の興味を引く表現
- 具体的な数字やメリットを含む
- 絵文字は控えめに（0〜1個）

JSON形式で3つの件名候補を返してください。
フォーマット: {"subjects": ["件名1", "件名2", "件名3"]}`;

  const userPrompt = `用途: ${purposeLabel}
${keyword ? `キーワード: ${keyword}` : ''}
${currentContent ? `本文の概要: ${currentContent.substring(0, 200)}` : ''}

上記の情報をもとに、メルマガの件名を3つ提案してください。`;

  const generateWithProvider = async (model: string) => {
    const provider = createAIProvider({
      preferProvider: getProviderFromModelId(model),
      model: model,
    });
    const response = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      maxTokens: 500,
      responseFormat: 'json',
    });
    const jsonStr = extractJson(response.content);
    const parsed = JSON.parse(jsonStr);
    return parsed.subjects || [];
  };

  try {
    return await generateWithProvider(aiSettings.model);
  } catch (err) {
    console.error('[Newsletter AI] Subject generation failed, trying backup:', err);
    try {
      return await generateWithProvider(aiSettings.backupModel);
    } catch (backupErr) {
      console.error('[Newsletter AI] Subject generation also failed with backup:', backupErr);
      throw new Error('AIモデルからの応答を処理できませんでした。しばらくしてからお試しください。');
    }
  }
}

// AIレスポンスからJSON部分を抽出するヘルパー
function extractJson(content: string): string {
  // コードブロック内のJSONを抽出
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  // { } で囲まれたJSONを抽出
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return content;
}

async function generateBody(
  aiSettings: { model: string; backupModel: string },
  purposeLabel: string,
  keyword: string,
  currentSubject: string
): Promise<string[]> {
  const systemPrompt = `あなたはメルマガの本文を作成する専門家です。
以下のルールに従ってメール本文のHTMLを生成してください：

- インラインスタイルのHTMLで出力（CSSクラスは使用しない）
- 読みやすい段落構成（1段落3〜4行程度）
- 適切な余白（margin, padding）
- リンクボタンは目立つデザインに
- 色は青紫系（#7c3aed）をアクセントに使用
- レスポンシブに配慮（固定幅は避ける）
- 「{{送信者名}}」のようなプレースホルダーを使用

必ずJSON形式で1つの本文HTMLを返してください。他のテキストは含めないでください。
フォーマット: {"bodies": ["<div>...</div>"]}`;

  const userPrompt = `用途: ${purposeLabel}
${currentSubject ? `件名: ${currentSubject}` : ''}
${keyword ? `キーワード・補足情報: ${keyword}` : ''}

上記の情報をもとに、メルマガ本文のHTMLを1つ生成してください。JSONのみで回答してください。`;

  const generateWithProvider = async (model: string) => {
    const provider = createAIProvider({
      preferProvider: getProviderFromModelId(model),
      model: model,
    });
    const response = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: 'json',
    });
    const jsonStr = extractJson(response.content);
    const parsed = JSON.parse(jsonStr);
    return parsed.bodies || [];
  };

  try {
    return await generateWithProvider(aiSettings.model);
  } catch (err) {
    console.error('[Newsletter AI] Body generation failed with primary model, trying backup:', err);
    try {
      return await generateWithProvider(aiSettings.backupModel);
    } catch (backupErr) {
      console.error('[Newsletter AI] Body generation also failed with backup model:', backupErr);
      throw new Error('AIモデルからの応答を処理できませんでした。しばらくしてからお試しください。');
    }
  }
}
