import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getProviderFromAdminSettings, generateWithFallback } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import {
  MOCK_ANALYSIS, MOCK_KINDLE_RESULTS, MOCK_COURSE_RESULTS, MOCK_CONSULTING_RESULTS,
  MOCK_SNS_RESULTS, MOCK_DIGITAL_RESULTS,
} from '@/components/diagnosis/monetize/types';
import type { Big5Scores } from '@/components/kindle/wizard/types';

export async function POST(request: Request) {
  try {
    const { answers, big5Scores, birthday } = await request.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    if (!answers) {
      return NextResponse.json({ error: '回答データが必要です' }, { status: 400 });
    }

    // デモモード
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) || process.env.USE_MOCK_DATA === 'true';
    if (useMockData) {
      const mockResult = {
        id: crypto.randomUUID(),
        analysis: { ...MOCK_ANALYSIS, big5Scores: big5Scores || undefined },
        kindle: MOCK_KINDLE_RESULTS,
        course: MOCK_COURSE_RESULTS,
        consulting: MOCK_CONSULTING_RESULTS,
        sns: MOCK_SNS_RESULTS,
        digital: MOCK_DIGITAL_RESULTS,
      };
      return NextResponse.json(mockResult);
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

    let big5Text = '';
    if (big5Scores) {
      const b5 = big5Scores as Big5Scores;
      big5Text = `\n\n【性格特性（Big5）】
- 外向性: ${b5.extraversion.toFixed(1)}/7
- 協調性: ${b5.agreeableness.toFixed(1)}/7
- 誠実性: ${b5.conscientiousness.toFixed(1)}/7
- 情緒安定性: ${b5.emotionalStability.toFixed(1)}/7
- 開放性: ${b5.openness.toFixed(1)}/7`;
    }

    let birthdayText = '';
    if (birthday) {
      birthdayText = `\n\n【生年月日】${birthday}
※ 生年月日から、九星気学や数秘術的な観点も加味して「才能×運勢」の一言アドバイスを birthdayInsight に含めてください。`;
    }

    const systemPrompt = `＃目的：
ユーザーの自己分析結果・性格特性をもとに才能を分析し、5つの収益化分野で最適なテーマを各5つずつ提案してください。

＃あなたの役割：
才能マネタイズのコンサルタント兼プロデューサー。ユーザーの強みや経験を引き出し、最適な収益化ルートを見つけるプロフェッショナル。占い師のように相手の可能性を見抜き、ポジティブに導く存在。

＃Big5性格特性の活用：
- 外向性が高い → コミュニケーション系・ライブ配信・コンサル向き
- 協調性が高い → サポート型コンサル・コミュニティ運営向き
- 誠実性が高い → ノウハウ系・体系的な講座・テンプレート向き
- 情緒安定性が低い → メンタルヘルス・共感型コンテンツ向き
- 開放性が高い → クリエイティブ系・新しい切り口・SNS向き

＃出力形式（JSON）：
{
  "analysis": {
    "summary": "総合分析。占い・診断風のポジティブな語り口。150-200文字。",
    "authorTraits": { "expertise": 1-5, "passion": 1-5, "communication": 1-5, "uniqueness": 1-5, "marketability": 1-5 },
    "swot": { "strengths": ["強み1", "強み2"], "weaknesses": ["課題1", "課題2"], "opportunities": ["機会1", "機会2"], "threats": ["リスク1", "リスク2"] },
    "authorType": "才能タイプ名（4-8文字）",
    "authorTypeDescription": "タイプの説明（50-80文字）"${birthday ? ',\n    "birthdayInsight": "生年月日から読み取れる才能と運勢の一言（50-100文字）"' : ''}
  },
  "kindle": [
    {
      "theme": "Kindle本のテーマ（キャッチーで具体的）",
      "targetReader": "想定読者の具体的なペルソナ",
      "reason": "おすすめ理由（100文字以内）",
      "potentialRevenue": "想定月収（例: 月1〜3万円）",
      "chapterOutline": ["第1章タイトル", "第2章", "第3章", "第4章", "第5章"],
      "differentiator": "競合との差別化ポイント（50文字以内）",
      "firstStep": "最初にやるべき具体的な一歩（80文字以内）"
    }
  ],
  "course": [
    {
      "courseName": "講座名",
      "targetAudience": "受講対象者",
      "curriculum": ["モジュール1", "モジュール2", "モジュール3", "モジュール4", "モジュール5"],
      "reason": "おすすめ理由（100文字以内）",
      "pricingHint": "想定価格帯",
      "format": "形式（動画/ライブ/テキスト+ワークシート等）",
      "differentiator": "競合との差別化ポイント",
      "firstStep": "最初の一歩"
    }
  ],
  "consulting": [
    {
      "menuName": "メニュー名",
      "targetClient": "対象クライアント",
      "deliverables": ["成果物1", "成果物2", "成果物3"],
      "reason": "おすすめ理由",
      "pricingHint": "想定価格",
      "sessionFormat": "セッション形式（単発/継続/パッケージ等）",
      "differentiator": "差別化ポイント",
      "firstStep": "最初の一歩"
    }
  ],
  "sns": [
    {
      "themeName": "SNS発信テーマ名",
      "platform": "最適なプラットフォーム（X/Instagram/YouTube等）",
      "targetFollower": "獲得したいフォロワー層",
      "contentIdeas": ["投稿ネタ1", "投稿ネタ2", "投稿ネタ3", "投稿ネタ4", "投稿ネタ5"],
      "reason": "おすすめ理由",
      "monetizeRoute": "SNSからの収益化導線（例: フォロワー→メルマガ→講座販売）",
      "differentiator": "差別化ポイント",
      "firstStep": "最初の一歩"
    }
  ],
  "digital": [
    {
      "productName": "商品名",
      "productType": "種類（Notionテンプレ/チェックリスト/Canvaテンプレ/スプレッドシート等）",
      "targetBuyer": "購入者ペルソナ",
      "features": ["特徴1", "特徴2", "特徴3", "特徴4", "特徴5"],
      "reason": "おすすめ理由",
      "pricingHint": "想定価格",
      "salesChannel": "販売チャネル（STORES/Gumroad/自社LP等）",
      "differentiator": "差別化ポイント",
      "firstStep": "最初の一歩"
    }
  ]
}

＃条件：
- 各分野5つずつ提案（合計25個）
- 日本語のみ
- 5つの提案はそれぞれ異なるアプローチ・切り口で
- Kindle: 経験ベース、専門知識ベース、挑戦ベース、ニッチ特化、トレンド活用
- 講座: 初級→上級、ライブ→動画、短期→長期など形式も変える
- コンサル: 単発→継続、個人→グループ、低単価→高単価など
- SNS: 各提案で異なるプラットフォームや発信スタイル
- デジタル商品: テンプレ、ツール、素材、ガイドなど種類を変える
- pricingHintは現実的な市場相場
- JSON以外のテキストは一切出力しないこと`;

    const userMessage = `＃ユーザーの自己分析：
${answersText}${big5Text}${birthdayText}`;

    // AIプロバイダー取得
    const planTier = 'free';
    const aiSettings = await getProviderFromAdminSettings('kdl', planTier, 'outline');

    const aiRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage },
      ],
      responseFormat: 'json' as const,
      temperature: 0.8,
    };

    const response = await generateWithFallback(
      aiSettings.provider,
      aiSettings.backupProvider,
      aiRequest,
      {
        service: 'monetize_diagnosis',
        phase: 'outline',
        model: aiSettings.model,
        backupModel: aiSettings.backupModel,
      }
    );

    const content = response.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    const parsed = JSON.parse(content);

    // DB保存
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    const { data: savedDiagnosis, error: saveError } = await serviceSupabase
      .from('monetize_diagnoses')
      .insert({
        user_id: user.id,
        answers,
        big5_scores: big5Scores || null,
        birthday: birthday || null,
        analysis: parsed.analysis,
        kindle_results: parsed.kindle,
        course_results: parsed.course,
        consulting_results: parsed.consulting,
        sns_results: parsed.sns,
        digital_results: parsed.digital,
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Failed to save diagnosis:', saveError);
    }

    // AI使用ログ
    await logAIUsage({
      userId: user.id,
      actionType: 'monetize_diagnosis',
      service: 'monetize_diagnosis',
      modelUsed: aiSettings.model,
      metadata: { plan_tier: planTier },
    }).catch(console.error);

    return NextResponse.json({
      id: savedDiagnosis?.id || crypto.randomUUID(),
      analysis: {
        ...parsed.analysis,
        big5Scores: big5Scores || undefined,
      },
      kindle: parsed.kindle,
      course: parsed.course,
      consulting: parsed.consulting,
      sns: parsed.sns,
      digital: parsed.digital,
    });

  } catch (error: any) {
    console.error('Monetize diagnosis error:', error);
    return NextResponse.json(
      { error: error.message || '診断処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}
