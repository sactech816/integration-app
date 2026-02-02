import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  getProviderFromAdminSettings, 
  generateWithFallback 
} from '@/lib/ai-provider';
import { getSubscriptionStatus } from '@/lib/subscription';
import { logAIUsage } from '@/lib/ai-usage';

// レスポンスの型定義
interface SubtitleSuggestion {
  subtitle: string;
  score: number;
  reason: string;
}

interface GeneratedSubtitles {
  keywords_set1: string[];
  keywords_set2: string[];
  subtitles: SubtitleSuggestion[];
}

export async function POST(request: Request) {
  try {
    const { title, instruction } = await request.json();

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

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルを入力してください' },
        { status: 400 }
      );
    }

    // デモモード: APIキーがない、または環境変数でデモモードが有効な場合
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // モックデータを返す（デモ・開発用）
      const mockData: GeneratedSubtitles = {
        keywords_set1: ['実践', '入門', '初心者', 'ステップバイステップ', '図解'],
        keywords_set2: ['副業', '在宅', 'スキマ時間', '効率化', 'テンプレート'],
        subtitles: [
          { subtitle: '知識ゼロから始める完全ロードマップ', score: 95, reason: '「知識ゼロ」「ロードマップ」はAmazonサジェストで需要が高く、初心者層に強く訴求' },
          { subtitle: '1日30分×3ヶ月で確実に成果を出す実践メソッド', score: 93, reason: '具体的な時間と期間を明示することで、忙しい社会人の心理的ハードルを下げる' },
          { subtitle: '図解でわかる！今日から使える実践テクニック', score: 91, reason: '「図解」は検索ボリュームが高く、視覚的なわかりやすさを求める層に刺さる' },
          { subtitle: 'プロが教える成功者だけが知っている7つの法則', score: 89, reason: '「7つの法則」のような数字は具体性を演出し、クリック率向上に貢献' },
          { subtitle: '失敗しない！はじめての人のための超入門ガイド', score: 87, reason: '「失敗しない」「超入門」で不安を解消し、初心者の購買意欲を刺激' },
          { subtitle: '副業・在宅ワークで月5万円を稼ぐための教科書', score: 85, reason: '「副業」「在宅ワーク」「月5万円」は検索需要が非常に高いキーワード群' },
          { subtitle: 'スキマ時間でできる！忙しい人のための効率学習法', score: 83, reason: '時間がない人向けの訴求で、ワーキングマザーやビジネスパーソンに響く' },
          { subtitle: '2025年最新版！トレンドを押さえた完全攻略本', score: 81, reason: '「最新版」「完全攻略」で情報の鮮度と網羅性をアピール' },
          { subtitle: 'つまずきポイントを徹底解説！挫折しない学び方', score: 79, reason: '挫折経験者や不安を抱える層に対して、安心感を与える訴求' },
          { subtitle: 'テンプレート付き！すぐに使える実践ワークブック', score: 77, reason: '「テンプレート付き」は即効性を求める実践派に強く訴求' },
        ],
      };
      
      return NextResponse.json(mockData);
    }

    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI APIキーが設定されていません（OPENAI_API_KEY または GEMINI_API_KEY が必要です）' },
        { status: 500 }
      );
    }

    // ユーザーからの追加要望があれば追記
    const instructionAddition = instruction ? `

# ユーザーからの追加修正要望:
${instruction}

上記のリクエストを反映して、再度案を作成してください。` : '';

    const systemPrompt = `＃目的：
確定した「タイトル」をもとに、Amazon SEOを最大化するサブタイトル案を10個提案してください。
サブタイトルにはタイトルで使用されなかった関連キーワードを盛り込み、検索されやすさと訴求力を兼ね備えたものにしてください。
また、Amazonランキング・サジェスト・ラッコキーワード・セラースプライトのリサーチ結果を踏まえた前提で生成してください。

＃あなたの役割：
Amazon SEOとKindleマーケティングに精通したサブタイトル職人

＃ターゲットユーザ：
Kindle出版を成功させたい著者（タイトルは決まっているがSEOを強化したい人）

＃機能：
-ユーザが本のタイトルを入力する
-本のタイトルで使われなかったSEOキーワードや、需要のある関連キーワードを抽出
-検索ボリュームが高く、競合が中程度以下のキーワードを優先
-出力は以下の2種類を含む

　例①：タイトルで使われなかった関連キーワードの羅列（2セット）
　例②：SEOを意識したサブタイトル案（10案）

-各案には「SEOスコア（100点満点）」と「なぜそのサブタイトルが有効か（読者層・悩み・SEO観点）」を簡潔に解説
-サブタイトル案はスコアの高い順に並べ替えて表示

＃条件：
-日本語のみ
-タイトルに含まれるキーワードは使わない
-読者が「思わずクリックしたくなる」要素を必ず入れる
-検索ボリュームと競合度を意識したAmazon SEO最適化済み

＃出力形式：
以下のJSON形式で出力してください。必ずJSON形式で返してください。

{
  "keywords_set1": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"],
  "keywords_set2": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"],
  "subtitles": [
    { "subtitle": "サブタイトル案1", "score": 95, "reason": "ターゲット層は○○、Amazonサジェスト「△△」を基にした需要の高いキーワードを活用" },
    { "subtitle": "サブタイトル案2", "score": 92, "reason": "○○な読者層を想定し、ラッコキーワードから抽出した関連語を盛り込みました" },
    ...
  ]
}

- keywords_set1: 関連キーワードセット1（5個）
- keywords_set2: 関連キーワードセット2（5個）
- subtitles: サブタイトル案10個（スコア降順）
- score: 1〜100の整数
- reason: 100文字以内で簡潔に${instructionAddition}`;

    // ユーザーのプランTierを取得
    let planTier = 'none';
    if (user_id) {
      const subscriptionStatus = await getSubscriptionStatus(user_id);
      planTier = subscriptionStatus.planTier;
    }

    // 管理者設定からAIプロバイダーを取得（思考・構成フェーズなので outline）
    const aiSettings = await getProviderFromAdminSettings('kdl', planTier, 'outline');
    
    console.log(`[KDL generate-subtitle] Using model=${aiSettings.model}, backup=${aiSettings.backupModel}, plan=${planTier}`);

    const aiRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `以下のタイトルに対して、SEOを最大化するサブタイトル案を10個提案してください：\n\n${title}` },
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

    const result: GeneratedSubtitles = JSON.parse(content);

    // バリデーション
    if (!result.subtitles || !Array.isArray(result.subtitles)) {
      throw new Error('不正な応答形式です');
    }

    // スコアでソート（高い順）
    result.subtitles.sort((a, b) => b.score - a.score);

    // AI使用量を記録
    if (user_id) {
      logAIUsage({
        userId: user_id,
        actionType: 'generate_subtitle',
        service: 'kdl',
        modelUsed: response.model,
        metadata: { title, plan_tier: planTier },
      }).catch(console.error);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate subtitle error:', error);
    return NextResponse.json(
      { error: 'サブタイトル生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

