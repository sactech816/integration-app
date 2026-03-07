import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';
import type { YouTubeVideoData } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '動画URLを入力してください' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: '正しいYouTube URLを入力してください' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube APIが設定されていません。管理者にお問い合わせください' },
        { status: 500 }
      );
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'API利用制限に達しました。しばらく時間をおいてお試しください' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'YouTube APIへのリクエストに失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: '動画が見つかりませんでした。URLを確認してください' },
        { status: 404 }
      );
    }

    const item = data.items[0];
    const videoData: YouTubeVideoData = {
      videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails?.maxres?.url
        || item.snippet.thumbnails?.high?.url
        || item.snippet.thumbnails?.medium?.url
        || '',
      viewCount: parseInt(item.statistics.viewCount || '0'),
      likeCount: parseInt(item.statistics.likeCount || '0'),
      commentCount: parseInt(item.statistics.commentCount || '0'),
      description: item.snippet.description || '',
      tags: item.snippet.tags || [],
      categoryId: item.snippet.categoryId || '',
      duration: item.contentDetails?.duration || '',
    };

    return NextResponse.json({ data: videoData });
  } catch (error) {
    console.error('YouTube analysis error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
