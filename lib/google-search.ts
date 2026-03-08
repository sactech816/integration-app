// Google検索キーワードリサーチ関連ユーティリティ

export type GoogleKeywordData = {
  keyword: string;
  allintitleCount: number;
  source: string; // どの展開文字から取得されたか（例: "a", "あ", "base"）
};

export type GoogleSuggestResult = {
  keyword: string;
  suggestions: string[];
};

/**
 * 数値をカンマ区切りでフォーマット
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}

/**
 * 競合レベルを判定
 */
export function getCompetitionLevel(allintitleCount: number): {
  level: string;
  color: string;
  description: string;
} {
  if (allintitleCount === 0) {
    return { level: 'ブルーオーシャン', color: 'text-blue-600', description: '競合なし' };
  }
  if (allintitleCount <= 10) {
    return { level: '超穴場', color: 'text-green-600', description: '非常に少ない競合' };
  }
  if (allintitleCount <= 100) {
    return { level: '穴場', color: 'text-emerald-600', description: '少ない競合' };
  }
  if (allintitleCount <= 1000) {
    return { level: '中程度', color: 'text-yellow-600', description: 'やや競合あり' };
  }
  if (allintitleCount <= 10000) {
    return { level: '競合多め', color: 'text-orange-600', description: '多くの競合' };
  }
  return { level: 'レッドオーシャン', color: 'text-red-600', description: '非常に多い競合' };
}

/**
 * allintitle件数から競合スコア (0-100) を算出
 * 件数が少ないほどスコアが高い（穴場）
 */
export function calcOpportunityScore(allintitleCount: number): number {
  if (allintitleCount === 0) return 100;
  if (allintitleCount <= 10) return 90;
  if (allintitleCount <= 50) return 80;
  if (allintitleCount <= 100) return 70;
  if (allintitleCount <= 500) return 55;
  if (allintitleCount <= 1000) return 40;
  if (allintitleCount <= 5000) return 25;
  if (allintitleCount <= 10000) return 15;
  return 5;
}
