import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getProviderFromAdminSettings,
  generateWithFallback
} from '@/lib/ai-provider';
import { getSubscriptionStatus } from '@/lib/subscription';
import { logAIUsage } from '@/lib/ai-usage';
import { checkKdlLimits } from '@/lib/kdl-usage-check';

interface ThemeSuggestion {
  theme: string;
  targetReader: string;
  reason: string;
}

interface GeneratedThemes {
  themes: ThemeSuggestion[];
}

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();

    // セッションからユーザーを取得
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

    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id;

    if (!answers) {
      return NextResponse.json(
        { error: '回答データが必要です' },
        { status: 400 }
      );
    }

    // 構成系AI使用制限チェック
    if (user_id) {
      const limits = await checkKdlLimits(user_id);
      if (!limits.outlineAi.canUse) {
        return NextResponse.json(
          {
            error: limits.outlineAi.message,
            code: 'OUTLINE_AI_LIMIT_EXCEEDED',
            used: limits.outlineAi.used,
            limit: limits.outlineAi.limit,
          },
          { status: 429 }
        );
      }
    }

    // デモモード: APIキーがない場合
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) || process.env.USE_MOCK_DATA === 'true';

    if (useMockData) {
      const mockThemes: ThemeSuggestion[] = [
        {
          theme: `${answers.strengths || answers.pastInvestment || '趣味'}を活かした実践ガイド`,
          targetReader: '同じ分野に興味があるが、何から始めればいいかわからない初心者',
          reason: 'あなたの経験と得意分野を活かして、初心者向けのわかりやすいガイドが作れます。',
        },
        {
          theme: `${answers.futureChallenges || 'チャレンジ'}の記録｜ゼロから始める挑戦日記`,
          targetReader: '同じ挑戦をしたいと思っているが、一歩踏み出せない人',
          reason: '挑戦の過程を共有するプロセスエコノミー型の本は、共感を呼びやすいジャンルです。',
        },
        {
          theme: `${answers.expertise || answers.immersion || '専門知識'}をわかりやすく解説する本`,
          targetReader: 'その分野に興味はあるが専門知識がない一般の読者',
          reason: 'あなたの専門知識を噛み砕いて伝えることで、ニッチだが需要のあるテーマになります。',
        },
      ];

      return NextResponse.json({ themes: mockThemes });
    }

    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI APIキーが設定されていません（OPENAI_API_KEY または GEMINI_API_KEY が必要です）' },
        { status: 500 }
      );
    }

    // 回答の整形
    const answersText = [
      answers.pastInvestment && `【時間やお金を使ってきたこと】${answers.pastInvestment}`,
      answers.immersion && `【没頭してしまうこと】${answers.immersion}`,
      answers.strengths && `【得意なこと】${answers.strengths}`,
      answers.expertise && `【専門知識・スキル】${answers.expertise}`,
      answers.futureChallenges && `【挑戦したいこと】${answers.futureChallenges}`,
      answers.lifeMessage && `【伝えたいメッセージ】${answers.lifeMessage}`,
    ].filter(Boolean).join('\n');

    const systemPrompt = `＃目的：
ユーザーの自己分析結果をもとに、Kindle出版に最適な本のテーマを3つ提案してください。

＃あなたの役割：
Kindle出版のコンサルタント兼プロデューサー。著者の強みや経験を引き出し、売れるテーマを発掘するプロフェッショナル。

＃提案の基準：
1. ユーザーの経験・強み・情熱と合致していること（書き続けられるテーマであること）
2. Amazon Kindleで検索需要があること
3. ターゲット読者が明確であること
4. ユーザーの独自性・差別化ポイントがあること

＃重要：
- 3つの提案はそれぞれ異なるアプローチで提案すること
  - 1つ目: ユーザーの過去の経験・得意分野を活かしたテーマ
  - 2つ目: ユーザーの専門知識を一般読者向けにわかりやすくするテーマ
  - 3つ目: ユーザーの未来の挑戦や伝えたいメッセージに基づくテーマ
- 回答が空の項目がある場合は、他の回答から総合的に判断すること

＃出力形式：
以下のJSON形式で出力してください。

{
  "themes": [
    {
      "theme": "本のテーマ（キャッチーで具体的な表現）",
      "targetReader": "想定読者（具体的なペルソナ）",
      "reason": "このテーマをおすすめする理由（ユーザーの回答との関連性を示す、100文字以内）"
    }
  ]
}

＃条件：
- 日本語のみ
- テーマは具体的かつキャッチーに（抽象的すぎないこと）
- 必ず3つ提案すること`;

    // ユーザーのプランTierを取得
    let planTier = 'none';
    if (user_id) {
      const subscriptionStatus = await getSubscriptionStatus(user_id);
      planTier = subscriptionStatus.planTier;
    }

    // 管理者設定からAIプロバイダーを取得
    const aiSettings = await getProviderFromAdminSettings('kdl', planTier, 'outline');

    console.log(`[KDL generate-theme] Using model=${aiSettings.model}, backup=${aiSettings.backupModel}, plan=${planTier}`);

    const aiRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `以下のユーザーの自己分析結果をもとに、Kindle出版に最適なテーマを3つ提案してください：\n\n${answersText}` },
      ],
      responseFormat: 'json' as const,
      temperature: 0.8,
    };

    // フォールバック付きでAI生成を実行
    const response = await generateWithFallback(
      aiSettings.provider,
      aiSettings.backupProvider,
      aiRequest,
      {
        service: 'kdl',
        phase: 'outline',
        model: aiSettings.model,
        backupModel: aiSettings.backupModel,
      }
    );

    const content = response.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    // AI使用量を記録
    if (user_id) {
      logAIUsage({
        userId: user_id,
        actionType: 'generate_theme',
        service: 'kdl',
        modelUsed: response.model,
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
        metadata: { plan_tier: planTier },
      }).catch(console.error);
    }

    const result: GeneratedThemes = JSON.parse(content);

    // バリデーション
    if (!result.themes || !Array.isArray(result.themes)) {
      throw new Error('不正な応答形式です');
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate theme error:', error);
    return NextResponse.json(
      { error: 'テーマ生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
