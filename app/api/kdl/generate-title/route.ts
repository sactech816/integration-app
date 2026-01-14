import { NextResponse } from 'next/server';
import { getProviderForPhase } from '@/lib/ai-provider';

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
-それぞれのタイトル案に対して、クリック率や魅力度を想定した独自スコア（1～100点程度）を併記

＃入力内容：
あなたが書きたい本のテーマまたはキーワードを教えてください

＃入力形式：
テキストデータ

＃出力内容：
-タイトル案①：タイトル名（SEOスコア: XX点）＋ 説明（想定ターゲットと強み）
-タイトル案②：タイトル名（SEOスコア: XX点）＋ 説明
…
-タイトル案⑩：タイトル名（SEOスコア: XX点）＋ 説明

＃出力形式：
以下のJSON形式で出力してください。必ずJSON形式で返してください。

{
  "titles": [
    { "title": "タイトル案1", "score": 95, "description": "想定ターゲット: ○○な人。強み: △△で検索需要が高く、××という訴求ポイントがある" },
    { "title": "タイトル案2", "score": 88, "description": "想定ターゲット: ○○な人。強み: △△で検索需要が高く、××という訴求ポイントがある" },
    ...
  ]
}

＃条件：
-日本語のみ
-SEOを強く意識
-検索されやすく、クリックされやすく、かつ長期的に売れる可能性があるもの
-タイトルは必ず10個生成すること
-scoreは1〜100の整数で設定すること
-descriptionは100文字以内で簡潔に${instructionAddition}`;

    // AIプロバイダーを取得（思考・構成フェーズなので planning）
    const provider = getProviderForPhase('planning');

    const response = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下のテーマで売れる書籍タイトルを10個提案してください：\n\n${theme}` },
      ],
      responseFormat: 'json',
      temperature: 0.8,
    });

    const content = response.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    const result: GeneratedTitles = JSON.parse(content);

    // バリデーション
    if (!result.titles || !Array.isArray(result.titles)) {
      throw new Error('不正な応答形式です');
    }

    // スコアが欠けているタイトルにデフォルトスコアを設定
    result.titles = result.titles.map((title, index) => ({
      ...title,
      score: typeof title.score === 'number' ? title.score : 85 - index * 2,
    }));

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

