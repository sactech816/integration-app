import { NextResponse } from 'next/server';

/**
 * Amazon サジェストキーワード取得 API
 * Amazon の検索オートコンプリートエンドポイントを利用
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
      return NextResponse.json({ suggestions: [] });
    }

    // Amazon.co.jp のオートコンプリート API
    const url = `https://completion.amazon.co.jp/api/2017/suggestions?mid=A1VC38T7YXB528&alias=stripbooks&prefix=${encodeURIComponent(trimmed)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'ja-JP,ja;q=0.9',
      },
    });

    if (!response.ok) {
      console.error('Amazon suggest API error:', response.status);
      return NextResponse.json({ suggestions: [] });
    }

    const data = await response.json();

    // サジェストキーワードを抽出
    const suggestions: string[] = (data.suggestions || [])
      .map((s: { value?: string }) => s.value)
      .filter((v: string | undefined): v is string => !!v);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Kindle keyword suggest error:', error);
    return NextResponse.json(
      { error: error.message || 'サジェスト取得に失敗しました' },
      { status: 500 }
    );
  }
}
