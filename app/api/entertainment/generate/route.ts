import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkAIUsageLimitForFeature, logAIUsage } from '@/lib/ai-usage';
import { getProviderFromAdminSettings, createAIProvider } from '@/lib/ai-provider';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuizConcept {
  theme: string;
  resultCount: number;
  style: string;
  mode: 'diagnosis' | 'fortune';
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
        { error: 'LOGIN_REQUIRED', message: 'ログインが必要です' },
        { status: 401 }
      );
    }

    const usageCheck = await checkAIUsageLimitForFeature(user.id, 'quiz');
    if (!usageCheck.isWithinLimit) {
      return NextResponse.json(
        {
          error: 'LIMIT_EXCEEDED',
          message: 'AI機能の1日の上限に達しました',
          usage: {
            featureUsage: usageCheck.featureUsage,
            featureLimit: usageCheck.featureLimit,
            featureRemaining: usageCheck.featureRemaining,
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { phase, messages, quizConcept } = body as {
      phase: 'collect' | 'generate';
      messages?: ChatMessage[];
      quizConcept?: QuizConcept;
    };

    let aiProvider, modelUsed: string;
    try {
      const settings = await getProviderFromAdminSettings('makers', 'free', 'outline');
      aiProvider = settings.provider;
      modelUsed = settings.model;
    } catch {
      aiProvider = createAIProvider({ preferProvider: 'gemini', model: 'gemini-2.5-flash-lite' });
      modelUsed = 'gemini-2.5-flash-lite';
    }

    if (phase === 'collect') {
      return await handleCollectPhase(aiProvider, modelUsed, messages || [], user.id);
    } else if (phase === 'generate') {
      if (!quizConcept) {
        return NextResponse.json({ error: 'quizConceptが必要です' }, { status: 400 });
      }
      return await handleGeneratePhase(aiProvider, modelUsed, quizConcept, user.id);
    }

    return NextResponse.json({ error: '無効なphaseです' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Entertainment generate error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: 'エンタメ診断の生成に失敗しました: ' + message },
      { status: 500 }
    );
  }
}

async function handleCollectPhase(
  aiProvider: { generate: Function },
  modelUsed: string,
  messages: ChatMessage[],
  userId: string,
) {
  const systemPrompt = `あなたはエンタメ診断メーカーのアシスタントです。
ユーザーと短い会話（2-3往復）で、楽しいエンタメ診断クイズのコンセプトを決めます。

あなたの役割:
1. ユーザーのアイデアを聞く（初回メッセージで）
2. 結果タイプ数（4/6/自由指定）とテイスト（かわいい/クール/ポップ）を確認
3. 十分な情報が集まったら conceptReady: true を返す

レスポンスは必ず以下のJSON形式で返してください:
{
  "reply": "AIの返答テキスト",
  "options": [
    { "label": "ボタンテキスト", "value": "値", "emoji": "絵文字" }
  ],
  "conceptReady": false,
  "extractedConcept": null
}

コンセプトが決まった場合:
{
  "reply": "確認メッセージ",
  "options": [],
  "conceptReady": true,
  "extractedConcept": {
    "theme": "テーマ名（例: どうぶつ占い）",
    "resultCount": 4,
    "style": "cute",
    "mode": "diagnosis"
  }
}

style: "cute"（かわいい系）、"cool"（クール系）、"pop"（ポップ系）、"vibrant"（ビビッド系）
mode: "diagnosis"（タイプ診断）または "fortune"（占い系）

会話はテンポよく、楽しく、絵文字を使ってフレンドリーに進めてください。
初回（messagesが空）は挨拶と例示を含めてください。`;

  const aiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  if (messages.length === 0) {
    aiMessages.push({
      role: 'user' as const,
      content: '（初回表示）エンタメ診断を作りたいです。',
    });
  }

  const aiResponse = await aiProvider.generate({
    messages: aiMessages,
    responseFormat: 'json',
    temperature: 0.8,
  });

  let parsed;
  try {
    parsed = JSON.parse(aiResponse.content);
  } catch {
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = {
        reply: 'すみません、もう一度お試しください。',
        options: [],
        conceptReady: false,
        extractedConcept: null,
      };
    }
  }

  await logAIUsage({
    userId,
    actionType: 'entertainment_quiz_collect',
    service: 'quiz',
    featureType: 'quiz',
    modelUsed: aiResponse.model || modelUsed,
    inputTokens: aiResponse.usage?.inputTokens || 0,
    outputTokens: aiResponse.usage?.outputTokens || 0,
    metadata: { phase: 'collect', messageCount: messages.length },
  });

  return NextResponse.json(parsed);
}

async function handleGeneratePhase(
  aiProvider: { generate: Function },
  modelUsed: string,
  concept: QuizConcept,
  userId: string,
) {
  const { theme, resultCount, style, mode } = concept;
  const questionCount = 5;

  const styleDescriptions: Record<string, string> = {
    cute: 'かわいくてファンシーな雰囲気。絵文字や柔らかい表現を使う',
    cool: 'クールでスタイリッシュな雰囲気。シャープな表現を使う',
    pop: 'ポップで元気な雰囲気。テンション高めの表現を使う',
    vibrant: 'カラフルでエネルギッシュな雰囲気。インパクトのある表現を使う',
  };

  const types = Array.from({ length: resultCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const scoreExamples = types
    .map((type, idx) => {
      const score: Record<string, number> = {};
      types.forEach((t) => (score[t] = t === type ? 3 : 0));
      return `        { "label": "選択肢${idx + 1}", "score": ${JSON.stringify(score)} }`;
    })
    .join(',\n');

  const balancedScore: Record<string, number> = {};
  types.forEach((t) => (balancedScore[t] = 1));

  const resultExamples = types
    .map(
      (type) =>
        `    { "type": "${type}", "title": "結果タイトル", "description": "150文字程度の楽しい説明文" }`
    )
    .join(',\n');

  const systemPrompt = `あなたはエンタメ診断クイズ作成の天才クリエイターです。
テーマ「${theme}」で、${styleDescriptions[style] || styleDescriptions.pop}の${
    mode === 'fortune' ? '占い' : 'タイプ診断'
  }を作成してください。

重要: エンタメ性を重視！面白くて、SNSでシェアしたくなる内容にしてください。

以下のJSON形式で返してください:
{
  "title": "診断タイトル（キャッチーに）",
  "description": "診断の説明文（ワクワクする紹介文）",
  "questions": [
    {
      "text": "質問文",
      "options": [
${scoreExamples},
        { "label": "バランス選択肢", "score": ${JSON.stringify(balancedScore)} }
      ]
    }
  ],
  "results": [
${resultExamples}
  ],
  "shareTemplate": "わたしは「{{result_title}}」タイプでした！\\n{{quiz_title}}\\n#エンタメ診断"
}

注意事項:
- 質問数: ${questionCount}問、各4つの選択肢
- 結果パターン: ${resultCount}個（${types.join(', ')}）
- 結果のtitleは具体的で面白いタイプ名にする（例: 「甘えん坊ネコ」「孤高のオオカミ」）
- 結果のdescriptionは楽しく読めて、思わずシェアしたくなる内容に
- shareTemplateはSNS投稿用テンプレート。{{result_title}}と{{quiz_title}}が置換される`;

  const aiResponse = await aiProvider.generate({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `テーマ「${theme}」でエンタメ診断を作ってください。結果は${resultCount}タイプ、${style}系のテイストで！` },
    ],
    responseFormat: 'json',
    temperature: 0.7,
  });

  let quiz;
  try {
    quiz = JSON.parse(aiResponse.content);
  } catch {
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      quiz = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('JSONの解析に失敗しました');
    }
  }

  await logAIUsage({
    userId,
    actionType: 'entertainment_quiz_generate',
    service: 'quiz',
    featureType: 'quiz',
    modelUsed: aiResponse.model || modelUsed,
    inputTokens: aiResponse.usage?.inputTokens || 0,
    outputTokens: aiResponse.usage?.outputTokens || 0,
    metadata: { theme, resultCount, style, mode },
  });

  return NextResponse.json({ quiz, shareTemplate: quiz.shareTemplate || '' });
}
