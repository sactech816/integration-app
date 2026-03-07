import { NextRequest, NextResponse } from 'next/server';
import { calcViewRatio } from '@/lib/youtube';
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

export async function POST(request: NextRequest) {
  try {
    const { keyword, maxResults = 20 } = await request.json();

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json(
        { error: '検索キーワードを入力してください' },
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

    const clampedMax = Math.min(Math.max(maxResults, 5), 50);

    // 1. YouTube Search API（100クオータ/回）
    let searchData;
    try {
      searchData = await fetchYouTubeAPI('search', {
        part: 'snippet',
        type: 'video',
        q: keyword.trim(),
        maxResults: String(clampedMax),
        order: 'relevance',
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

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json(
        { error: '検索結果が見つかりませんでした' },
        { status: 404 }
      );
    }

    // 2. Video IDs抽出 → 動画詳細バッチ取得
    const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean);

    const videosData = await fetchYouTubeAPI('videos', {
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
    }, apiKey);

    // 3. チャンネルID収集 → チャンネル登録者数バッチ取得
    const channelIds = [...new Set(videosData.items.map((item: any) => item.snippet.channelId))] as string[];
    const channelStatsMap: Record<string, number> = {};

    try {
      // チャンネルAPIは最大50件まで
      const channelsData = await fetchYouTubeAPI('channels', {
        part: 'statistics',
        id: channelIds.join(','),
      }, apiKey);

      for (const ch of channelsData.items || []) {
        channelStatsMap[ch.id] = parseInt(ch.statistics.subscriberCount || '0');
      }
    } catch (err) {
      console.error('Channel data fetch failed:', err);
    }

    // 4. データ統合
    const results: YouTubeVideoData[] = videosData.items.map((item: any) => {
      const channelId = item.snippet.channelId;
      const subscriberCount = channelStatsMap[channelId] || 0;
      const viewCount = parseInt(item.statistics.viewCount || '0');

      return {
        videoId: item.id,
        title: item.snippet.title,
        channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url ||
          '',
        viewCount,
        likeCount: parseInt(item.statistics.likeCount || '0'),
        commentCount: parseInt(item.statistics.commentCount || '0'),
        subscriberCount,
        viewRatio: calcViewRatio(viewCount, subscriberCount),
        description: item.snippet.description || '',
        tags: item.snippet.tags || [],
        categoryId: item.snippet.categoryId || '',
        duration: item.contentDetails?.duration || '',
      };
    });

    return NextResponse.json({
      data: results,
      totalResults: searchData.pageInfo?.totalResults || results.length,
    });
  } catch (error) {
    console.error('YouTube keyword research error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
