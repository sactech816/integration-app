import { NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai-provider';
import type { RakutenSearchResult } from '@/lib/rakuten';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchResult } = body as { searchResult: RakutenSearchResult };

    if (!searchResult || !searchResult.keyword) {
      return NextResponse.json(
        { error: '分析データが不足しています' },
        { status: 400 }
      );
    }

    // AIプロバイダー取得
    let provider;
    try {
      provider = createAIProvider();
    } catch {
      return NextResponse.json(
        { error: 'AIが設定されていません。環境変数を確認してください。' },
        { status: 500 }
      );
    }

    // 上位20商品の要約データを作成（トークン節約）
    const topProducts = searchResult.products.slice(0, 20).map((p, i) => ({
      rank: i + 1,
      name: p.itemName.slice(0, 60),
      price: p.itemPrice,
      reviewCount: p.reviewCount,
      reviewAverage: p.reviewAverage,
      freeShipping: p.postageFlag,
      captionLength: p.itemCaption.replace(/<[^>]*>/g, '').length,
    }));

    const summary = searchResult.marketSummary;
    const titleKW = searchResult.keywordAnalysis.titleKeywords.slice(0, 15);
    const captionKW = searchResult.keywordAnalysis.captionKeywords.slice(0, 15);

    const systemPrompt = `あなたは楽天市場の出店コンサルタントです。
楽天市場で商品を販売しようとしているユーザーに対し、データに基づいた具体的なアドバイスを日本語で提供してください。

以下のJSON形式で回答してください:
{
  "marketEntry": {
    "score": 0-100の数値,
    "verdict": "参入推奨" | "条件付き推奨" | "慎重に検討" | "非推奨",
    "reason": "判定理由（2-3文）"
  },
  "pricingStrategy": {
    "recommendedRange": "推奨価格帯（例: ¥2,000〜¥3,500）",
    "strategy": "価格戦略の説明（2-3文）",
    "tips": ["具体的なアドバイス1", "アドバイス2", "アドバイス3"]
  },
  "keywordStrategy": {
    "mustUseKeywords": ["必須キーワード1", "必須キーワード2", ...最大8個],
    "titleTemplate": "推奨タイトル構成テンプレート",
    "descriptionTips": ["説明文のアドバイス1", "アドバイス2", "アドバイス3"]
  },
  "pageOptimization": {
    "recommendedCaptionLength": "推奨文章量（例: 2000文字以上）",
    "imageRecommendation": "画像に関するアドバイス",
    "tips": ["ページ最適化のコツ1", "コツ2", "コツ3"]
  },
  "competitionAnalysis": {
    "level": "低" | "中" | "高" | "非常に高い",
    "strengths": ["この市場の強み1", "強み2"],
    "weaknesses": ["この市場の弱み/チャンス1", "チャンス2"],
    "differentiationIdeas": ["差別化アイデア1", "アイデア2", "アイデア3"]
  },
  "actionPlan": ["具体的なアクション1", "アクション2", "アクション3", "アクション4", "アクション5"]
}`;

    const userPrompt = `楽天市場で「${searchResult.keyword}」を検索した結果を分析してください。

## 市場データ
- 総ヒット数: ${searchResult.totalCount}件
- 平均価格: ¥${summary.avgPrice}
- 最安値: ¥${summary.minPrice} / 最高値: ¥${summary.maxPrice}
- 中央値: ¥${summary.medianPrice}
- 上位10商品の平均価格: ¥${summary.topProductsAvgPrice}
- 平均レビュー数: ${summary.avgReviewCount}件
- 平均レビュー評価: ${summary.avgReviewScore}点
- 送料無料率: ${summary.freeShippingRate}%

## タイトル頻出キーワード
${titleKW.map(k => `${k.word}(${k.count}回)`).join(', ')}

## 説明文頻出キーワード
${captionKW.map(k => `${k.word}(${k.count}回)`).join(', ')}

## 上位20商品データ
${JSON.stringify(topProducts, null, 0)}

このデータを元に、新規出品者として「${searchResult.keyword}」関連商品を販売する場合の戦略を分析してください。`;

    const response = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 16384,
      responseFormat: 'json',
    });

    // JSONパース
    let analysis;
    try {
      analysis = JSON.parse(response.content);
    } catch {
      // JSONパースに失敗した場合、テキストからJSON部分を抽出
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI応答のパースに失敗しました');
      }
    }

    return NextResponse.json({
      data: analysis,
      model: response.model,
      provider: response.provider,
    });
  } catch (error) {
    console.error('Rakuten analysis error:', error);
    return NextResponse.json(
      { error: 'AI分析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
