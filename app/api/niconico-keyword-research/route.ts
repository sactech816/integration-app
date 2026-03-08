import { NextRequest, NextResponse } from 'next/server';

export type NiconicoVideoData = {
  contentId: string;
  title: string;
  description: string;
  tags: string;
  categoryTags: string;
  viewCounter: number;
  mylistCounter: number;
  likeCounter: number;
  commentCounter: number;
  lengthSeconds: number;
  startTime: string;
  thumbnailUrl: string;
  engagementRate: number;
  commentRatio: number;
};

const NICONICO_API_BASE = 'https://snapshot.search.nicovideo.jp/api/v2/snapshot/video/contents/search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, maxResults = 20, sort = '-viewCounter', dateFilter } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json(
        { error: 'キーワードを入力してください' },
        { status: 400 }
      );
    }

    const validSorts = ['-viewCounter', '-startTime', '-mylistCounter', '-commentCounter', '-likeCounter', '+viewCounter', '+startTime'];
    const sortParam = validSorts.includes(sort) ? sort : '-viewCounter';
    const limit = Math.min(Math.max(maxResults, 1), 100);

    const params = new URLSearchParams({
      q: keyword.trim(),
      targets: 'title,description,tags',
      fields: 'contentId,title,description,tags,categoryTags,viewCounter,mylistCounter,likeCounter,commentCounter,lengthSeconds,startTime,thumbnailUrl',
      _sort: sortParam,
      _limit: String(limit),
      _offset: '0',
      _context: 'makers-tokyo-keyword-research',
    });

    if (dateFilter) {
      const now = new Date();
      let fromDate: Date | null = null;
      switch (dateFilter) {
        case '1month': fromDate = new Date(now.setMonth(now.getMonth() - 1)); break;
        case '3months': fromDate = new Date(now.setMonth(now.getMonth() - 3)); break;
        case '6months': fromDate = new Date(now.setMonth(now.getMonth() - 6)); break;
        case '1year': fromDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      }
      if (fromDate) {
        const jsonFilter = JSON.stringify({
          type: 'range',
          field: 'startTime',
          from: fromDate.toISOString(),
          to: new Date().toISOString(),
          include_lower: true,
        });
        params.set('jsonFilter', jsonFilter);
      }
    }

    const res = await fetch(`${NICONICO_API_BASE}?${params}`, {
      headers: { 'User-Agent': 'MakersTokyo/1.0' },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Niconico API error:', res.status, errorBody);
      if (res.status === 503) {
        return NextResponse.json(
          { error: 'ニコニコ動画APIが一時的に利用できません。しばらく時間をおいてお試しください' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: `ニコニコ動画APIエラー: ${errorBody || '不明なエラー'}` },
        { status: res.status || 500 }
      );
    }

    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: '検索結果が見つかりませんでした。別のキーワードをお試しください' },
        { status: 404 }
      );
    }

    const results: NiconicoVideoData[] = data.data.map((item: any) => {
      const viewCounter = item.viewCounter || 0;
      const mylistCounter = item.mylistCounter || 0;
      const likeCounter = item.likeCounter || 0;
      const commentCounter = item.commentCounter || 0;

      const engagementRate = viewCounter > 0
        ? Math.round(((likeCounter + mylistCounter + commentCounter) / viewCounter) * 10000) / 100
        : 0;
      const commentRatio = viewCounter > 0
        ? Math.round((commentCounter / viewCounter) * 10000) / 100
        : 0;

      return {
        contentId: item.contentId || '',
        title: item.title || '',
        description: (item.description || '').slice(0, 500),
        tags: item.tags || '',
        categoryTags: item.categoryTags || '',
        viewCounter,
        mylistCounter,
        likeCounter,
        commentCounter,
        lengthSeconds: item.lengthSeconds || 0,
        startTime: item.startTime || '',
        thumbnailUrl: item.thumbnailUrl || '',
        engagementRate,
        commentRatio,
      };
    });

    return NextResponse.json({ data: results, keyword: keyword.trim(), meta: { totalCount: data.meta?.totalCount || results.length } });
  } catch (error) {
    console.error('Niconico keyword research error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
