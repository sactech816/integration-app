// 楽天商品検索API関連の型定義とユーティリティ

export type RakutenProduct = {
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  shopName: string;
  shopUrl: string;
  imageUrl: string;
  reviewCount: number;
  reviewAverage: number;
  itemCaption: string;
  genreId: string;
  tagIds: string[];
  availability: boolean;
  postageFlag: boolean; // true = 送料込み
  pointRate: number;
  rank: number; // 検索結果内での順位
};

export type RakutenSearchResult = {
  keyword: string;
  totalCount: number; // 総ヒット数（競合数）
  products: RakutenProduct[];
  marketSummary: MarketSummary;
  keywordAnalysis: KeywordAnalysis;
};

export type MarketSummary = {
  totalProducts: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  avgReviewCount: number;
  avgReviewScore: number;
  freeShippingRate: number; // 送料無料率（%）
  topProductsAvgPrice: number; // 上位10商品の平均価格
};

export type PageQualityScore = {
  totalScore: number; // 0-100
  captionLength: number;
  captionScore: number; // 文章量スコア
  reviewScore: number; // レビュー数スコア
  ratingScore: number; // レビュー評価スコア
  imageScore: number; // 画像数推定スコア
};

export type KeywordAnalysis = {
  titleKeywords: { word: string; count: number }[];
  captionKeywords: { word: string; count: number }[];
};

// 楽天APIレスポンスの型
export type RakutenAPIItem = {
  Item: {
    itemName: string;
    itemPrice: number;
    itemUrl: string;
    shopName: string;
    shopUrl: string;
    mediumImageUrls: { imageUrl: string }[];
    smallImageUrls: { imageUrl: string }[];
    reviewCount: number;
    reviewAverage: number;
    itemCaption: string;
    genreId: string;
    tagIds: number[];
    availability: number;
    postageFlag: number;
    pointRate: number;
  };
};

export type RakutenAPIResponse = {
  count: number;
  page: number;
  first: number;
  last: number;
  hits: number;
  pageCount: number;
  Items: RakutenAPIItem[];
};

// --- ユーティリティ関数 ---

export function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}

export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

// HTMLタグを除去してプレーンテキストを取得
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

// ページ充実度スコアを計算
export function calcPageQualityScore(product: RakutenProduct): PageQualityScore {
  const plainCaption = stripHtml(product.itemCaption);
  const captionLength = plainCaption.length;

  // 文章量スコア（0-30）: 1000文字以上で満点
  const captionScore = Math.min(30, Math.round((captionLength / 1000) * 30));

  // レビュー数スコア（0-30）: 100件以上で満点
  const reviewScore = Math.min(30, Math.round((product.reviewCount / 100) * 30));

  // レビュー評価スコア（0-20）: 4.0以上で満点
  const ratingScore = Math.min(20, Math.round((product.reviewAverage / 4.0) * 20));

  // 画像数推定スコア（0-20）: 説明文内のimg数で推定
  const imgCount = (product.itemCaption.match(/<img/gi) || []).length;
  const imageScore = Math.min(20, imgCount * 4);

  const totalScore = captionScore + reviewScore + ratingScore + imageScore;

  return { totalScore, captionLength, captionScore, reviewScore, ratingScore, imageScore };
}

// テキストからキーワードを抽出（簡易版：2文字以上の単語を頻度順に）
export function extractKeywords(texts: string[], topN: number = 20): { word: string; count: number }[] {
  const wordCount: Record<string, number> = {};
  // 除外ワード
  const stopWords = new Set([
    'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
    'ある', 'いる', 'する', 'から', 'こと', 'として', 'できる', 'される',
    'など', 'ため', 'この', 'それ', 'これ', 'あの', 'その',
    'nbsp', 'amp', 'lt', 'gt', 'quot',
    'br', 'div', 'span', 'img', 'src', 'alt', 'href', 'class', 'style',
    '送料', '無料', '商品', '購入', 'ポイント', '倍', '円',
  ]);

  for (const text of texts) {
    const plain = stripHtml(text);
    // カタカナ語、漢字語、英数語を抽出（2文字以上）
    const words = plain.match(/[ァ-ヶー]{2,}|[一-龥々]{2,}|[a-zA-Z0-9]{2,}/g) || [];
    for (const word of words) {
      if (!stopWords.has(word.toLowerCase()) && word.length >= 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    }
  }

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

// 市場サマリーを計算
export function calcMarketSummary(products: RakutenProduct[]): MarketSummary {
  if (products.length === 0) {
    return {
      totalProducts: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      medianPrice: 0,
      avgReviewCount: 0,
      avgReviewScore: 0,
      freeShippingRate: 0,
      topProductsAvgPrice: 0,
    };
  }

  const prices = products.map((p) => p.itemPrice).sort((a, b) => a - b);
  const totalPrice = prices.reduce((a, b) => a + b, 0);
  const medianIndex = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 === 0
    ? Math.round((prices[medianIndex - 1] + prices[medianIndex]) / 2)
    : prices[medianIndex];

  const totalReviews = products.reduce((sum, p) => sum + p.reviewCount, 0);
  const productsWithReviews = products.filter((p) => p.reviewAverage > 0);
  const avgReviewScore = productsWithReviews.length > 0
    ? productsWithReviews.reduce((sum, p) => sum + p.reviewAverage, 0) / productsWithReviews.length
    : 0;

  const freeShippingCount = products.filter((p) => p.postageFlag).length;

  const top10 = products.slice(0, 10);
  const topProductsAvgPrice = top10.length > 0
    ? Math.round(top10.reduce((sum, p) => sum + p.itemPrice, 0) / top10.length)
    : 0;

  return {
    totalProducts: products.length,
    avgPrice: Math.round(totalPrice / products.length),
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    medianPrice,
    avgReviewCount: Math.round(totalReviews / products.length),
    avgReviewScore: Math.round(avgReviewScore * 100) / 100,
    freeShippingRate: Math.round((freeShippingCount / products.length) * 100),
    topProductsAvgPrice,
  };
}
