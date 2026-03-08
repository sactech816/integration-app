import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URLが必要です' }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: '有効なYouTube URLを入力してください' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube APIが未設定です' }, { status: 500 });
    }

    const params = new URLSearchParams({
      part: 'snippet,statistics',
      id: videoId,
      key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'YouTube APIエラー' }, { status: res.status });
    }

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) {
      return NextResponse.json({ error: '動画が見つかりません' }, { status: 404 });
    }

    // 軽量レスポンス
    return NextResponse.json({
      data: {
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl:
          item.snippet.thumbnails?.maxres?.url ||
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url || '',
        viewCount: parseInt(item.statistics.viewCount || '0'),
        likeCount: parseInt(item.statistics.likeCount || '0'),
        publishedAt: item.snippet.publishedAt,
        description: (item.snippet.description || '').slice(0, 200),
      },
    });
  } catch (error) {
    console.error('Video meta fetch error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
