import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkAIUsageLimitForFeature, logAIUsage } from '@/lib/ai-usage';
import { getProviderFromAdminSettings } from '@/lib/ai-provider';

export async function POST(request) {
  try {
    // 1. 認証チェック
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      return NextResponse.json(
        { error: 'LOGIN_REQUIRED', message: 'AI機能を利用するにはログインが必要です' },
        { status: 401 }
      );
    }

    // 2. AI使用量チェック（機能タイプごと）
    const featureType = 'quiz';
    const usageCheck = await checkAIUsageLimitForFeature(user.id, featureType);
    
    if (!usageCheck.isWithinLimit) {
      return NextResponse.json(
        { 
          error: 'LIMIT_EXCEEDED', 
          message: `本日の診断クイズAI生成上限に達しました（残り: ${usageCheck.featureRemaining}回）`,
          usage: {
            featureUsage: usageCheck.featureUsage,
            featureLimit: usageCheck.featureLimit,
            featureRemaining: usageCheck.featureRemaining,
            totalUsage: usageCheck.dailyUsage,
            totalLimit: usageCheck.dailyLimit,
          }
        },
        { status: 429 }
      );
    }

    // 3. リクエストボディの取得
    const { prompt, mode = 'diagnosis', questionCount = 5, resultCount = 3, resultTypes } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'プロンプトが必要です' }, { status: 400 });
    }

    // admin_ai_settingsからモデル設定を取得（集客メーカーは'free'プランを使用）
    const planTier = 'free';
    let aiProvider, modelUsed;
    
    try {
      const settings = await getProviderFromAdminSettings('makers', planTier, 'outline');
      aiProvider = settings.provider;
      modelUsed = settings.model;
      console.log('[Quiz Generate] Using model from admin settings:', modelUsed);
    } catch (settingsError) {
      console.warn('[Quiz Generate] Failed to get admin settings, using fallback:', settingsError.message);
      // フォールバック
      const { createAIProvider } = await import('@/lib/ai-provider');
      aiProvider = createAIProvider({ preferProvider: 'gemini', model: 'gemini-1.5-flash' });
      modelUsed = 'gemini-1.5-flash';
    }

    // 結果タイプの配列（渡されていない場合はデフォルト）
    const types = resultTypes && resultTypes.length > 0 ? resultTypes : ['A', 'B', 'C'].slice(0, resultCount);
    
    const modeDescription = {
      diagnosis: '性格診断・タイプ診断',
      test: '正解がある検定クイズ',
      fortune: '占い・運勢診断',
    };

    // スコアの例を動的に生成
    const scoreExamples = types.map((type, idx) => {
      const score = {};
      types.forEach(t => score[t] = t === type ? 3 : 0);
      return `        { "label": "選択肢${idx + 1}の内容", "score": ${JSON.stringify(score)} }`;
    }).join(',\n');
    
    // 4つ目の選択肢（全タイプに均等配分）
    const balancedScore = {};
    types.forEach(t => balancedScore[t] = 1);
    const balancedScoreExample = `        { "label": "選択肢${types.length + 1}の内容", "score": ${JSON.stringify(balancedScore)} }`;

    // 結果パターンの例
    const resultExamples = types.map(type => 
      `    {\n      "type": "${type}",\n      "title": "結果${type}のタイトル",\n      "description": "結果${type}の説明（150文字程度）"\n    }`
    ).join(',\n');

    const systemPrompt = `あなたは診断クイズ作成の専門家です。
ユーザーのリクエストに基づいて、${modeDescription[mode] || modeDescription.diagnosis}を作成してください。

以下の形式でJSONを返してください：
{
  "title": "診断タイトル",
  "description": "診断の説明文",
  "questions": [
    {
      "text": "質問文",
      "options": [
${scoreExamples},
${balancedScoreExample}
      ]
    }
  ],
  "results": [
${resultExamples}
  ]
}

重要な注意事項：
- 質問数: ${questionCount}問
- 結果パターン: ${types.join(', ')}（${resultCount}個）
- 各質問には必ず4つの選択肢を用意してください
- 選択肢の"label"フィールドには具体的な選択肢の文章を入れてください（空にしないでください）
- 各選択肢のscoreは、どの結果タイプに対応するかを示します（0〜3の数値）
- 最初の${types.length}個の選択肢は各結果タイプに3点ずつ振り分け、最後の選択肢は全タイプに1点ずつ振り分けてください
- 診断として意味のある、魅力的な質問と選択肢を作成してください`;

    // AIプロバイダーを使用して生成
    const aiResponse = await aiProvider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下のテーマで診断クイズを作成してください：\n${prompt}` },
      ],
      responseFormat: 'json',
      temperature: 0.7,
    });

    const content = aiResponse.content;
    if (!content) {
      throw new Error('AI応答が空です');
    }

    // 実際に使用されたモデル名を取得
    const actualModel = aiResponse.model || modelUsed;

    // JSONを解析
    let quiz;
    try {
      quiz = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSONの解析に失敗しました');
      }
    }

    // 4. 使用量を記録
    await logAIUsage({
      userId: user.id,
      actionType: 'quiz_generate',
      service: 'quiz',
      featureType: featureType,
      modelUsed: actualModel,
      inputTokens: aiResponse.usage?.inputTokens || 0,
      outputTokens: aiResponse.usage?.outputTokens || 0,
      metadata: { prompt, mode, questionCount, resultCount }
    });

    return NextResponse.json({ data: quiz });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { error: '診断クイズの生成に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
}
