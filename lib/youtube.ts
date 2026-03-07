// YouTube Data API v3 関連ユーティリティ

export type YouTubeVideoData = {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  subscriberCount: number;
  viewRatio: number;
  description: string;
  tags: string[];
  categoryId: string;
  duration: string;
  hasCaption: boolean;
};

/**
 * YouTube URLからVideo IDを抽出する
 * 対応パターン:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // Video IDのみが入力された場合
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

/**
 * 数値をカンマ区切りでフォーマット
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}

/**
 * ISO 8601 duration を読みやすい形式に変換 (PT1H2M3S → 1:02:03)
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 再生倍率を計算（再生数 / チャンネル登録者数）
 */
export function calcViewRatio(viewCount: number, subscriberCount: number): number {
  if (subscriberCount === 0) return 0;
  return Math.round((viewCount / subscriberCount) * 100) / 100;
}
