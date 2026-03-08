import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai-provider';
import type { GoogleKeywordData } from '@/lib/google-search';

type AnalysisType = 'full' | 'competition' | 'content-ideas' | 'long-tail' | 'persona' | 'title-pattern';

function getSystemPrompt(analysisType: AnalysisType): string {
  const baseRole = 'あなたはGoogle検索SEOの専門家です。キーワードリサーチデータに基づいて、日本語で具体的かつ実践的なアドバイスを提供してください。';

  switch (analysisType) {
    case 'full':
      return `${baseRole}

以下の観点で総合的に分析してください：

1. **市場概要**: このキーワード市場の全体像と特徴
2. **競合分析**: allintitle件数に基づく競合レベルの評価
3. **狙い目キーワード**: 競合が少なく狙いやすいキーワードTOP10
4. **コンテンツ戦略**: 上位表示を狙うためのコンテンツ方針
5. **アクションプラン**: 今すぐ実行すべきステップ5つ

Markdown形式で出力してください。`;

    case 'competition':
      return `${baseRole}

allintitle件数に基づく詳細な競合分析を行ってください：

1. **競合レベル分類**: 各キーワードを「ブルーオーシャン(0件)」「超穴場(1-10件)」「穴場(11-100件)」「中程度(101-1000件)」「激戦区(1001件以上)」に分類
2. **参入難易度マトリクス**: キーワードの検索意図 × 競合度で分類
3. **優先攻略キーワード**: 投資対効果の高いキーワードを推薦
4. **段階的攻略プラン**: 短期・中期・長期で狙うキーワード戦略
5. **差別化ポイント**: 競合が手薄な切り口やアングル

Markdown形式で出力してください。`;

    case 'content-ideas':
      return `${baseRole}

キーワードデータを元に、具体的なコンテンツアイデアを提案してください：

1. **ブログ記事アイデア15選**: タイトル案 + 概要（各2行）
2. **ピラーコンテンツ案**: 包括的なまとめ記事の構成案3つ
3. **クラスターコンテンツ**: ピラーに紐づくサブトピック群
4. **コンテンツカレンダー**: 1ヶ月の投稿スケジュール案
5. **差別化コンテンツ**: 他サイトにない独自の切り口

Markdown形式で出力してください。`;

    case 'long-tail':
      return `${baseRole}

ロングテールキーワード戦略を提案してください：

1. **ロングテールキーワード50選**: 3語以上の複合キーワードを提案
2. **検索意図別分類**: 情報収集型 / 比較検討型 / 購入意図型 / 行動型 に分類
3. **季節性キーワード**: 時期によって需要が変わるキーワード
4. **質問型キーワード**: 「〜とは」「〜方法」「〜おすすめ」などの形式
5. **ニッチキーワード**: 競合が少なく、特定ニーズに刺さるキーワード

Markdown形式で出力してください。`;

    case 'persona':
      return `${baseRole}

このキーワードを検索するユーザーのペルソナ分析を行ってください：

1. **メインペルソナ3パターン**: 年齢・性別・職業・悩み・目的
2. **検索シーン**: どんな状況でこのキーワードを検索するか
3. **検索ジャーニー**: 検索前→検索中→検索後の行動フロー
4. **情報ニーズ**: 各ペルソナが本当に求めている情報
5. **コンバージョンポイント**: 何を提供すれば行動（購入・問合せ等）に繋がるか
6. **関連する悩み・課題**: 表面的な検索意図の裏にある本質的なニーズ

Markdown形式で出力してください。`;

    case 'title-pattern':
      return `${baseRole}

SEOに効果的なページタイトル・H1の最適化パターンを提案してください：

1. **タイトルテンプレート15選**: 実際に使えるタイトルの型（数字型、疑問型、HOW TO型、比較型など）
2. **クリック率を上げる要素**: パワーワード、数字、記号の使い方
3. **メタディスクリプション案**: 各タイトルに対応するdescription案5つ
4. **H1〜H3見出し構成**: 記事の見出し構成テンプレート3パターン
5. **NGパターン**: 避けるべきタイトルの付け方

Markdown形式で出力してください。`;

    default:
      return baseRole;
  }
}

function buildUserPrompt(keyword: string, results: GoogleKeywordData[], analysisType: AnalysisType): string {
  // 上位キーワード（allintitle件数あり）を抽出
  const withAllintitle = results
    .filter((r) => r.allintitleCount >= 0)
    .sort((a, b) => a.allintitleCount - b.allintitleCount);

  const topLowCompetition = withAllintitle.slice(0, 20);
  const topHighCompetition = withAllintitle.slice(-10).reverse();

  const allKeywords = results.map((r) => r.keyword);

  return `## 検索キーワード: 「${keyword}」

## サジェストキーワード一覧（${results.length}件）
${allKeywords.slice(0, 50).join('\n')}

## 競合が少ないキーワードTOP20（allintitle件数順）
${topLowCompetition.map((r) => `- 「${r.keyword}」: allintitle ${r.allintitleCount}件`).join('\n')}

## 競合が多いキーワードTOP10
${topHighCompetition.map((r) => `- 「${r.keyword}」: allintitle ${r.allintitleCount}件`).join('\n')}

## 統計
- 総サジェスト数: ${results.length}件
- allintitle平均: ${withAllintitle.length > 0 ? Math.round(withAllintitle.reduce((s, r) => s + r.allintitleCount, 0) / withAllintitle.length) : 'N/A'}件
- allintitle中央値: ${withAllintitle.length > 0 ? withAllintitle[Math.floor(withAllintitle.length / 2)]?.allintitleCount : 'N/A'}件
- 穴場キーワード（100件以下）: ${withAllintitle.filter((r) => r.allintitleCount <= 100).length}件

上記データを元に、${analysisType === 'full' ? '総合的な' : ''}分析と提案をしてください。`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, results, analysisType = 'full' } = body as {
      keyword: string;
      results: GoogleKeywordData[];
      analysisType?: AnalysisType;
    };

    if (!keyword || !results || results.length === 0) {
      return NextResponse.json(
        { error: 'キーワードと検索結果が必要です' },
        { status: 400 }
      );
    }

    // AIプロバイダー取得（Geminiを優先 — コスト最適化）
    let provider;
    try {
      provider = createAIProvider({
        preferProvider: 'gemini',
        model: 'gemini-2.5-flash',
      });
    } catch {
      return NextResponse.json(
        { error: 'AIが設定されていません。環境変数を確認してください。' },
        { status: 500 }
      );
    }

    const systemPrompt = getSystemPrompt(analysisType);
    const userPrompt = buildUserPrompt(keyword, results, analysisType);

    const response = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 16384,
    });

    return NextResponse.json({
      analysis: response.content,
      model: response.model,
      provider: response.provider,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Google keyword AI analysis error:', error);
    return NextResponse.json(
      { error: 'AI分析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
