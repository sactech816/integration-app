import { NextResponse } from 'next/server';
import {
  createAIProvider,
  DEFAULT_AI_MODELS,
  getProviderFromModelId,
} from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

async function getAISettings(userPlan: string): Promise<{ model: string; backupModel: string }> {
  const supabase = getServiceClient();
  // Gemini 2.5 Flash をデフォルトに（コスト効率重視）
  const defaultSettings = {
    model: 'gemini-2.5-flash',
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

export type KindleAnalysisResult = {
  marketOverview: {
    saturationLevel: string;
    saturationScore: number;
    priceRange: string;
    avgRating: number;
    avgReviewCount: number;
    kuRatio: string;
  };
  titleSuggestions: Array<{
    title: string;
    subtitle: string;
    reason: string;
  }>;
  coverTrends: {
    colorTrends: string;
    designPatterns: string;
    recommendations: string[];
  };
  categoryRecommendations: Array<{
    category: string;
    reason: string;
    difficulty: string;
  }>;
  keywordTips: string[];
  summary: string;
};

function buildAnalysisPrompt(
  keyword: string,
  books: Array<{
    title: string;
    author: string;
    price: string;
    rating: number | null;
    reviewCount: number;
    isKindleUnlimited: boolean;
  }>,
  suggestions: string[]
): string {
  const bookList = books
    .map(
      (b, i) =>
        `${i + 1}. 「${b.title}」著:${b.author} | ${b.price} | ★${b.rating ?? '?'} | レビュー${b.reviewCount}件 | KU:${b.isKindleUnlimited ? 'あり' : 'なし'}`
    )
    .join('\n');

  const suggestionList = suggestions.length > 0
    ? `\n【関連サジェストキーワード】\n${suggestions.join(', ')}`
    : '';

  return `あなたはKindle出版の市場リサーチ専門家です。以下のデータを分析し、Kindle出版で成功するための具体的なアドバイスを提供してください。

【検索キーワード】${keyword}
${suggestionList}

【検索上位の書籍データ（最大20件）】
${bookList || '（データなし）'}

【出力形式】以下のJSON形式で出力してください:
{
  "marketOverview": {
    "saturationLevel": "低|中|高|非常に高い",
    "saturationScore": 1〜10の数値,
    "priceRange": "価格帯の説明（例: 0〜1,500円が主流）",
    "avgRating": 平均評価（数値）,
    "avgReviewCount": 平均レビュー数（数値）,
    "kuRatio": "KU対応率の説明"
  },
  "titleSuggestions": [
    {
      "title": "提案タイトル",
      "subtitle": "提案サブタイトル",
      "reason": "このタイトルを推奨する理由"
    }
  ],
  "coverTrends": {
    "colorTrends": "上位書籍の表紙の色使いの傾向",
    "designPatterns": "デザインパターンの傾向",
    "recommendations": ["具体的な表紙デザインのアドバイス"]
  },
  "categoryRecommendations": [
    {
      "category": "おすすめカテゴリ名",
      "reason": "理由",
      "difficulty": "低|中|高"
    }
  ],
  "keywordTips": ["キーワード最適化のアドバイス（7個のキーワード枠の使い方など）"],
  "summary": "総合的なアドバイス（200文字以内）"
}

【分析の注意事項】
- タイトル提案は3つ以上
- 既存上位書籍と差別化できるタイトルを提案
- カテゴリ推奨は2〜3件
- キーワードTipsは3〜5件
- 数値データは実際の書籍データから算出
- JSONのみを出力し、他の説明は不要です`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, books = [], suggestions = [], userId, userPlan = 'free' } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'keyword is required' },
        { status: 400 }
      );
    }

    const aiSettings = await getAISettings(userPlan);
    const prompt = buildAnalysisPrompt(keyword, books, suggestions);

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
          content: 'あなたはKindle出版の市場リサーチ専門家です。指定された形式のJSONのみを出力してください。',
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

    let analysis: KindleAnalysisResult;
    try {
      let jsonStr = response.content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      analysis = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: 'AIの出力をパースできませんでした。もう一度お試しください。' },
        { status: 500 }
      );
    }

    if (userId) {
      logAIUsage({
        userId,
        actionType: 'kindle_keyword_analyze',
        service: 'makers',
        modelUsed: usedModel,
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
        metadata: { keyword: keyword.substring(0, 100) },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      analysis,
      modelUsed: usedModel,
    });
  } catch (error: any) {
    console.error('Kindle keyword analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'AI分析に失敗しました' },
      { status: 500 }
    );
  }
}
