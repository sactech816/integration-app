import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, calcViewRatio } from '@/lib/youtube';
import type { YouTubeVideoData } from '@/lib/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

async function fetchYouTubeAPI(endpoint: string, params: Record<string, string>, apiKey: string) {
  const searchParams = new URLSearchParams({ ...params, key: apiKey });
  const res = await fetch(`${YOUTUBE_API_BASE}/${endpoint}?${searchParams}`);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`YouTube API error (${endpoint}):`, res.status, errorBody);
    throw { status: res.status, body: errorBody };
  }

  return res.json();
}

function buildVideoData(
  videoItem: any,
  channelStatsMap: Record<string, number>
): YouTubeVideoData {
  const channelId = videoItem.snippet.channelId;
  const subscriberCount = channelStatsMap[channelId] || 0;
  const viewCount = parseInt(videoItem.statistics.viewCount || '0');

  return {
    videoId: videoItem.id,
    title: videoItem.snippet.title,
    channelId,
    channelTitle: videoItem.snippet.channelTitle,
    publishedAt: videoItem.snippet.publishedAt,
    thumbnailUrl:
      videoItem.snippet.thumbnails?.maxres?.url ||
      videoItem.snippet.thumbnails?.high?.url ||
      videoItem.snippet.thumbnails?.medium?.url ||
      '',
    viewCount,
    likeCount: parseInt(videoItem.statistics.likeCount || '0'),
    commentCount: parseInt(videoItem.statistics.commentCount || '0'),
    subscriberCount,
    viewRatio: calcViewRatio(viewCount, subscriberCount),
    description: videoItem.snippet.description || '',
    tags: videoItem.snippet.tags || [],
    categoryId: videoItem.snippet.categoryId || '',
    duration: videoItem.contentDetails?.duration || '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, urls } = body;

    // 単体または複数URLの処理
    const rawUrls: string[] = urls && Array.isArray(urls) ? urls : url ? [url] : [];

    if (rawUrls.length === 0) {
      return NextResponse.json(
        { error: '動画URLを入力してください' },
        { status: 400 }
      );
    }

    if (rawUrls.length > 5) {
      return NextResponse.json(
        { error: '一度に分析できるURLは最大5件です' },
        { status: 400 }
      );
    }

    // Video ID抽出
    const videoIds: string[] = [];
    for (const u of rawUrls) {
      const vid = extractVideoId(u);
      if (!vid) {
        return NextResponse.json(
          { error: `正しいYouTube URLを入力してください: ${u}` },
          { status: 400 }
        );
      }
      videoIds.push(vid);
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube APIが設定されていません。管理者にお問い合わせください' },
        { status: 500 }
      );
    }

    // 動画データ取得（バッチ）
    let videosData;
    try {
      videosData = await fetchYouTubeAPI('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
      }, apiKey);
    } catch (err: any) {
      if (err.status === 403) {
        return NextResponse.json(
          { error: 'API利用制限に達しました。しばらく時間をおいてお試しください' },
          { status: 403 }
        );
      }
      if (err.status === 400) {
        return NextResponse.json(
          { error: 'APIキーが無効です。設定を確認してください' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `YouTube APIエラー: ${err.body || '不明なエラー'}` },
        { status: err.status || 500 }
      );
    }

    if (!videosData.items || videosData.items.length === 0) {
      return NextResponse.json(
        { error: '動画が見つかりませんでした。URLを確認してください' },
        { status: 404 }
      );
    }

    // チャンネルID収集 → チャンネル登録者数バッチ取得
    const channelIds = [...new Set(videosData.items.map((item: any) => item.snippet.channelId))];
    const channelStatsMap: Record<string, number> = {};

    try {
      const channelsData = await fetchYouTubeAPI('channels', {
        part: 'statistics',
        id: channelIds.join(','),
      }, apiKey);

      for (const ch of channelsData.items || []) {
        channelStatsMap[ch.id] = parseInt(ch.statistics.subscriberCount || '0');
      }
    } catch (err) {
      console.error('Channel data fetch failed, continuing without subscriber count:', err);
    }

    // レスポンス構築
    const results: YouTubeVideoData[] = videosData.items.map((item: any) =>
      buildVideoData(item, channelStatsMap)
    );

    // 単体URLの場合は後方互換のため単一オブジェクト、複数はarray
    if (!urls) {
      return NextResponse.json({ data: results[0] });
    }
    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('YouTube analysis error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
