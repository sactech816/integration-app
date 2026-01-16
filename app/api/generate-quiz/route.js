import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { checkAIUsageLimitForFeature, logAIUsage } from '@/lib/ai-usage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { prompt, mode = 'diagnosis', questionCount = 5, resultCount = 3 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'プロンプトが必要です' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI APIキーが設定されていません' }, { status: 500 });
    }

    const modeDescription = {
      diagnosis: '性格診断・タイプ診断',
      test: '正解がある検定クイズ',
      fortune: '占い・運勢診断',
    };

    const systemPrompt = `あなたは診断クイズ作成の専門家です。
ユーザーのリクエストに基づいて、${modeDescription[mode] || modeDescription.diagnosis}を作成してください。

以下の形式でJSONを返してください：
{
  "title": "診断タイトル",
  "description": "診断の説明文",
  "questions": [
    {
      "id": "q1",
      "text": "質問文",
      "options": [
        { "text": "選択肢A", "score": { "A": 1, "B": 0, "C": 0 } },
        { "text": "選択肢B", "score": { "A": 0, "B": 1, "C": 0 } },
        { "text": "選択肢C", "score": { "A": 0, "B": 0, "C": 1 } }
      ]
    }
  ],
  "results": [
    {
      "type": "A",
      "title": "結果タイトル",
      "description": "結果の説明（150文字程度）"
    }
  ]
}

質問数: ${questionCount}問
結果パターン数: ${resultCount}個
各選択肢は3つ用意してください。`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下のテーマで診断クイズを作成してください：\n${prompt}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI応答が空です');
    }

    const quiz = JSON.parse(content);

    // 4. 使用量を記録
    await logAIUsage({
      userId: user.id,
      actionType: 'quiz_generate',
      service: 'quiz',
      featureType: featureType,
      modelUsed: 'gpt-4o-mini',
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
