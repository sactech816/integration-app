import { NextResponse } from 'next/server';
import type {
  RakutenAPIResponse,
  RakutenProduct,
  RakutenSearchResult,
} from '@/lib/rakuten';
import {
  calcMarketSummary,
  extractKeywords,
  stripHtml,
} from '@/lib/rakuten';

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;
const RAKUTEN_API_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

// 楽天APIのレート制限（1秒1リクエスト）を守るための待機
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    if (!RAKUTEN_APP_ID) {
      return NextResponse.json(
        { error: '楽天APIが設定されていません。環境変数 RAKUTEN_APP_ID を設定してください。' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { keyword, sort, page: requestedPage } = body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: 'キーワードを入力してください' },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();

    // ソートパラメータ（デフォルト: 標準）
    // standard, +affiliateRate, -affiliateRate, +reviewCount, -reviewCount,
    // +reviewAverage, -reviewAverage, +itemPrice, -itemPrice, +updateTimestamp, -updateTimestamp
    const sortParam = sort || 'standard';
    const pageParam = requestedPage || 1;

    // 楽天商品検索API呼び出し（最大30件×最大3ページ = 最大90件）
    const allProducts: RakutenProduct[] = [];
    let totalCount = 0;
    const maxPages = Math.min(pageParam === 1 ? 3 : 1, 3); // 初回は3ページ分取得

    for (let page = 1; page <= maxPages; page++) {
      const params = new URLSearchParams({
        applicationId: RAKUTEN_APP_ID,
        keyword: trimmedKeyword,
        hits: '30',
        page: String(page),
        sort: sortParam,
        imageFlag: '1',
      });

      const apiUrl = `${RAKUTEN_API_URL}?${params.toString()}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Rakuten API error:', response.status, errorText);

        if (response.status === 404) {
          return NextResponse.json(
            { error: '商品が見つかりませんでした。別のキーワードをお試しください。' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: '楽天APIからデータを取得できませんでした。しばらくしてからお試しください。' },
          { status: 502 }
        );
      }

      const data: RakutenAPIResponse = await response.json();

      if (page === 1) {
        totalCount = data.count;
      }

      if (data.Items && data.Items.length > 0) {
        const products: RakutenProduct[] = data.Items.map((item, index) => ({
          itemName: item.Item.itemName,
          itemPrice: item.Item.itemPrice,
          itemUrl: item.Item.itemUrl,
          shopName: item.Item.shopName,
          shopUrl: item.Item.shopUrl,
          imageUrl: item.Item.mediumImageUrls?.[0]?.imageUrl || item.Item.smallImageUrls?.[0]?.imageUrl || '',
          reviewCount: item.Item.reviewCount,
          reviewAverage: item.Item.reviewAverage,
          itemCaption: item.Item.itemCaption,
          genreId: item.Item.genreId,
          tagIds: (item.Item.tagIds || []).map(String),
          availability: item.Item.availability === 1,
          postageFlag: item.Item.postageFlag === 1,
          pointRate: item.Item.pointRate,
          rank: (page - 1) * 30 + index + 1,
        }));

        allProducts.push(...products);
      }

      // 次のページがない場合は終了
      if (page >= data.pageCount) break;

      // レート制限対策: 1.1秒待機
      if (page < maxPages) {
        await sleep(1100);
      }
    }

    // キーワード分析
    const titleTexts = allProducts.map((p) => p.itemName);
    const captionTexts = allProducts.map((p) => stripHtml(p.itemCaption));
    const titleKeywords = extractKeywords(titleTexts, 20);
    const captionKeywords = extractKeywords(captionTexts, 20);

    // 市場サマリー
    const marketSummary = calcMarketSummary(allProducts);

    const result: RakutenSearchResult = {
      keyword: trimmedKeyword,
      totalCount,
      products: allProducts,
      marketSummary: {
        ...marketSummary,
        totalProducts: totalCount, // API全体のヒット数
      },
      keywordAnalysis: {
        titleKeywords,
        captionKeywords,
      },
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Rakuten research error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
