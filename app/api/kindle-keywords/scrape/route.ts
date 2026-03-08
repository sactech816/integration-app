import { NextResponse } from 'next/server';

export type KindleBookResult = {
  title: string;
  author: string;
  price: string;
  rating: number | null;
  reviewCount: number;
  imageUrl: string;
  url: string;
  isKindleUnlimited: boolean;
};

/**
 * Amazon Kindle 検索結果スクレイピング API
 * Amazon.co.jp の Kindle ストア検索結果をパース
 */
export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: 'keyword is required' },
        { status: 400 }
      );
    }

    const trimmed = keyword.trim();
    if (!trimmed) {
      return NextResponse.json({ books: [], totalResults: 0 });
    }

    // Amazon.co.jp Kindle ストアの検索URL
    // i=digital-text: Kindleストアに限定
    const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(trimmed)}&i=digital-text&__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error('Amazon scrape error:', response.status);
      return NextResponse.json(
        { error: `Amazon接続エラー: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const books = parseAmazonSearchResults(html);

    // 検索結果数の取得
    const totalMatch = html.match(/(\d[\d,]*)\s*(?:件中|以上の結果)/);
    const totalResults = totalMatch
      ? parseInt(totalMatch[1].replace(/,/g, ''), 10)
      : books.length;

    return NextResponse.json({
      books,
      totalResults,
      keyword: trimmed,
    });
  } catch (error: any) {
    console.error('Kindle keyword scrape error:', error);
    return NextResponse.json(
      { error: error.message || 'スクレイピングに失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * Amazon 検索結果のHTMLをパースして書籍情報を抽出
 */
function parseAmazonSearchResults(html: string): KindleBookResult[] {
  const books: KindleBookResult[] = [];

  // 検索結果の各アイテムを抽出（data-component-type="s-search-result"）
  const itemRegex = /data-component-type="s-search-result"[^>]*data-asin="([A-Z0-9]+)"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;

  // より簡易的なアプローチ: data-asin ごとのブロックを抽出
  const asinBlocks = html.split(/data-asin="/);

  for (let i = 1; i < asinBlocks.length && books.length < 20; i++) {
    const block = asinBlocks[i];
    const asinMatch = block.match(/^([A-Z0-9]{10})/);
    if (!asinMatch) continue;

    const asin = asinMatch[1];

    // スポンサー広告をスキップ
    if (block.includes('AdHolder') || block.includes('s-ad')) continue;

    // タイトル抽出
    const titleMatch = block.match(/<span class="a-size-[^"]*a-color-base a-text-normal"[^>]*>([\s\S]*?)<\/span>/);
    const title = titleMatch ? cleanHtml(titleMatch[1]) : '';
    if (!title) continue;

    // 著者抽出
    const authorMatch = block.match(/(?:class="a-color-secondary"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>)|(?:class="a-size-base"[^>]*>([^<]+)<\/)/);
    const author = authorMatch ? cleanHtml(authorMatch[1] || authorMatch[2] || '') : '';

    // 価格抽出
    const priceMatch = block.match(/<span class="a-price"[^>]*>[\s\S]*?<span class="a-offscreen">([\s\S]*?)<\/span>/);
    const price = priceMatch ? cleanHtml(priceMatch[1]) : '¥0';

    // 評価抽出
    const ratingMatch = block.match(/class="a-icon-alt">([0-9.]+)/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    // レビュー数抽出
    const reviewMatch = block.match(/<span class="a-size-base[^"]*"[^>]*>[\s]*([\d,]+)[\s]*<\/span>/);
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : 0;

    // 画像URL抽出
    const imgMatch = block.match(/src="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/);
    const imageUrl = imgMatch ? imgMatch[1] : '';

    // Kindle Unlimited 判定
    const isKindleUnlimited = block.includes('kindle-unlimited') || block.includes('ku-icon');

    books.push({
      title,
      author,
      price,
      rating,
      reviewCount,
      imageUrl,
      url: `https://www.amazon.co.jp/dp/${asin}`,
      isKindleUnlimited,
    });
  }

  return books;
}

function cleanHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&yen;/g, '¥')
    .replace(/\s+/g, ' ')
    .trim();
}
