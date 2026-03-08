import { NextRequest, NextResponse } from 'next/server';

export type RedditPostData = {
  id: string;
  title: string;
  subreddit: string;
  subredditSubscribers: number;
  author: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  createdUtc: number;
  permalink: string;
  url: string;
  selftext: string;
  thumbnail: string;
  domain: string;
  isVideo: boolean;
  isSelf: boolean;
  linkFlairText: string;
  engagementRate: number;
  commentScoreRatio: number;
  hoursAgo: number;
  scorePerHour: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, maxResults = 25, sort = 'relevance', timeFilter = 'all', subreddit } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json(
        { error: 'キーワードを入力してください' },
        { status: 400 }
      );
    }

    const validSorts = ['relevance', 'hot', 'top', 'new', 'comments'];
    const validTimes = ['hour', 'day', 'week', 'month', 'year', 'all'];
    const sortParam = validSorts.includes(sort) ? sort : 'relevance';
    const timeParam = validTimes.includes(timeFilter) ? timeFilter : 'all';
    const limit = Math.min(Math.max(maxResults, 1), 100);

    let baseUrl = 'https://www.reddit.com/search.json';
    const params = new URLSearchParams({
      q: keyword.trim(),
      sort: sortParam,
      t: timeParam,
      limit: String(limit),
      type: 'link',
    });

    if (subreddit && typeof subreddit === 'string' && subreddit.trim()) {
      const sub = subreddit.trim().replace(/^r\//, '');
      baseUrl = `https://www.reddit.com/r/${encodeURIComponent(sub)}/search.json`;
      params.set('restrict_sr', 'on');
    }

    const res = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MakersTokyo/1.0)',
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Reddit API error:', res.status, errorBody);
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Reddit APIのレート制限に達しました。しばらく時間をおいてお試しください' },
          { status: 429 }
        );
      }
      if (res.status === 403) {
        return NextResponse.json(
          { error: 'Reddit APIへのアクセスが制限されています。しばらく時間をおいてお試しください' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Reddit APIエラー: ${res.status}` },
        { status: res.status || 500 }
      );
    }

    const data = await res.json();

    if (!data.data?.children || data.data.children.length === 0) {
      return NextResponse.json(
        { error: '検索結果が見つかりませんでした。別のキーワードをお試しください' },
        { status: 404 }
      );
    }

    const now = Date.now() / 1000;

    const results: RedditPostData[] = data.data.children
      .filter((child: any) => child.kind === 't3')
      .map((child: any) => {
        const post = child.data;
        const score = post.score || 0;
        const numComments = post.num_comments || 0;
        const subredditSubscribers = post.subreddit_subscribers || 0;
        const createdUtc = post.created_utc || 0;
        const hoursAgo = Math.max((now - createdUtc) / 3600, 0.1);

        const engagementRate = subredditSubscribers > 0
          ? Math.round(((score + numComments) / subredditSubscribers) * 10000) / 100
          : 0;
        const commentScoreRatio = score > 0
          ? Math.round((numComments / score) * 100) / 100
          : 0;
        const scorePerHour = Math.round((score / hoursAgo) * 100) / 100;

        let thumbnail = post.thumbnail || '';
        if (['self', 'default', 'nsfw', 'spoiler', 'image', ''].includes(thumbnail)) {
          thumbnail = '';
        }

        return {
          id: post.id || '',
          title: post.title || '',
          subreddit: post.subreddit || '',
          subredditSubscribers,
          author: post.author || '[deleted]',
          score,
          upvoteRatio: post.upvote_ratio || 0,
          numComments,
          createdUtc,
          permalink: post.permalink || '',
          url: post.url || '',
          selftext: (post.selftext || '').slice(0, 500),
          thumbnail,
          domain: post.domain || '',
          isVideo: post.is_video || false,
          isSelf: post.is_self || false,
          linkFlairText: post.link_flair_text || '',
          engagementRate,
          commentScoreRatio,
          hoursAgo: Math.round(hoursAgo * 10) / 10,
          scorePerHour,
        };
      });

    return NextResponse.json({ data: results, keyword: keyword.trim() });
  } catch (error) {
    console.error('Reddit keyword research error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
