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
interface TitleSuggestion {
  title: string;
  score: number;
  description: string;
}

interface GeneratedTitles {
  titles: TitleSuggestion[];
}

export async function POST(request: Request) {
  try {
    const { theme, instruction } = await request.json();

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

    if (!theme) {
      return NextResponse.json(
        { error: 'テーマを入力してください' },
        { status: 400 }
      );
    }

    // デモモード: APIキーがない、または環境変数でデモモードが有効な場合
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // モックデータを返す（デモ・開発用）
      const mockTitles = [
        { title: `【完全版】${theme}で人生を変える！初心者からプロになる最強メソッド`, score: 95, description: '想定ターゲット: 初心者〜中級者。強み: 「完全版」「最強」で検索需要が高く、ベネフィットが明確' },
        { title: `${theme}の教科書｜知識ゼロから始める実践ガイド`, score: 92, description: '想定ターゲット: 完全初心者。強み: 「教科書」「知識ゼロ」で入門者に訴求' },
        { title: `たった3ヶ月で成果が出る！${theme}の成功法則`, score: 90, description: '想定ターゲット: 早く結果を出したい人。強み: 具体的な期間で成果をイメージさせる' },
        { title: `${theme}入門｜今日から使える実践テクニック50選`, score: 88, description: '想定ターゲット: 実践派の初心者。強み: 「50選」で具体性と網羅性をアピール' },
        { title: `なぜあなたの${theme}はうまくいかないのか？`, score: 86, description: '想定ターゲット: 挫折経験者。強み: 問題提起型で悩みに刺さる' },
        { title: `${theme}で月10万円稼ぐ！副業成功の完全ロードマップ`, score: 85, description: '想定ターゲット: 副業希望者。強み: 具体的な金額とロードマップで行動を促す' },
        { title: `プロが教える${theme}の極意｜成功者だけが知っている秘訣`, score: 83, description: '想定ターゲット: 中級者〜上級者。強み: 「プロ」「極意」で権威性を演出' },
        { title: `${theme}大全｜これ1冊で全てがわかる決定版`, score: 82, description: '想定ターゲット: 網羅的に学びたい人。強み: 「大全」「決定版」で圧倒的な情報量を訴求' },
        { title: `忙しい人のための${theme}｜1日10分で身につく超効率メソッド`, score: 80, description: '想定ターゲット: 時間がない社会人。強み: 「1日10分」で手軽さをアピール' },
        { title: `${theme}の新常識｜2025年版・最新トレンド完全解説`, score: 78, description: '想定ターゲット: 最新情報を求める人。強み: 「新常識」「最新」で鮮度をアピール' },
      ];
      
      return NextResponse.json({ titles: mockTitles });
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
与えられた「テーマ・キーワード」を考慮しながら、Amazon SEOに強く、かつ売れる可能性の高い書籍タイトル案を10個提案してください。
単なるキャッチーさだけでなく、Amazonランキング・サジェスト・ラッコキーワード・セラースプライト等で確認できる「検索需要・競合状況」を想定して生成してください。

＃あなたの役割：
Amazon SEOとKindleマーケティングに精通した出版プロデューサー兼タイトル職人

＃ターゲットユーザ：
本を作成したい人（Kindle出版を成功させたい著者）

＃機能：
-ユーザが入力したキーワードを受け取る
-そのキーワードをAmazonランキング、Amazonサジェスト、ラッコキーワード、セラースプライトでリサーチした前提で解析する
-検索ボリュームが高く、競合が中程度以下のキーワードを優先的に採用
-読者の悩みやターゲット層が明確になるように表現を加える
-タイトル案ごとに「想定される読者」「強み（SEO・訴求ポイント）」を簡潔に説明
-それぞれのタイトル案に対して、クリック率や魅力度を想定した独自スコア（1～100点）を別フィールドで設定

＃スコア基準：
-95〜100点: 検索需要が非常に高く、競合が少なく、ベネフィットが明確で即購入につながるタイトル
-90〜94点: 検索需要が高く、ターゲットが明確で、強い訴求力があるタイトル
-85〜89点: SEO的に良好で、読者の興味を引くタイトル
-80〜84点: 標準的な良いタイトル
-80点未満: 改善の余地があるタイトル

＃重要：
-10個中、少なくとも3個は90点以上のタイトルを生成すること
-多様性を持たせつつ、高スコアのタイトルを優先的に考案すること

＃出力形式：
以下のJSON形式で出力してください。必ずJSON形式で返してください。

【重要】titleフィールドにはスコアを含めないでください。スコアは必ずscoreフィールドに数値で設定してください。

{
  "titles": [
    { "title": "タイトル案（スコアは含めない純粋なタイトルのみ）", "score": 95, "description": "想定ターゲット: ○○な人。強み: △△で検索需要が高く、××という訴求ポイントがある" },
    { "title": "タイトル案2", "score": 92, "description": "想定ターゲット: ○○な人。強み: △△" }
  ]
}

＃条件：
-日本語のみ
-SEOを強く意識
-検索されやすく、クリックされやすく、かつ長期的に売れる可能性があるもの
-タイトルは必ず10個生成すること
-scoreは1〜100の整数で設定すること（titleフィールドには含めない）
-descriptionは100文字以内で簡潔に${instructionAddition}`;

    // ユーザーのプランTierを取得
    let planTier = 'none';
    if (user_id) {
      const subscriptionStatus = await getSubscriptionStatus(user_id);
      planTier = subscriptionStatus.planTier;
    }

    // 管理者設定からAIプロバイダーを取得（思考・構成フェーズなので outline）
    const aiSettings = await getProviderFromAdminSettings('kdl', planTier, 'outline');
    
    console.log(`[KDL generate-title] Using model=${aiSettings.model}, backup=${aiSettings.backupModel}, plan=${planTier}`);

    const aiRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `以下のテーマで売れる書籍タイトルを10個提案してください：\n\n${theme}` },
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
        actionType: 'generate_title',
        service: 'kdl',
        modelUsed: response.model,
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
        metadata: { theme, plan_tier: planTier },
      }).catch(console.error);
    }

    const result: GeneratedTitles = JSON.parse(content);

    // バリデーション
    if (!result.titles || !Array.isArray(result.titles)) {
      throw new Error('不正な応答形式です');
    }

    // タイトルからスコアを抽出し、タイトル文字列をクリーンアップ
    result.titles = result.titles.map((title, index) => {
      let cleanTitle = title.title;
      let extractedScore = title.score;

      // タイトル内に「（SEOスコア: XX点）」や「（SEOスコア：XX点）」が含まれている場合、抽出して削除
      const scoreMatch = cleanTitle.match(/[（(]SEOスコア[:：]\s*(\d+)点[）)]/);
      if (scoreMatch) {
        extractedScore = parseInt(scoreMatch[1], 10);
        cleanTitle = cleanTitle.replace(/[（(]SEOスコア[:：]\s*\d+点[）)]/g, '').trim();
      }

      // スコアが数値でない場合はデフォルト値を設定
      const finalScore = typeof extractedScore === 'number' && !isNaN(extractedScore) 
        ? extractedScore 
        : 90 - index * 2;

      return {
        ...title,
        title: cleanTitle,
        score: finalScore,
      };
    });

    // スコアでソート（高い順）
    result.titles.sort((a, b) => b.score - a.score);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate title error:', error);
    return NextResponse.json(
      { error: 'タイトル生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

