// =============================================
// 補助金スコアリングロジック
// クライアントサイドで実行（fortuneのcalculationパターン）
// =============================================

import type { BusinessInfo, SubsidyMaster, SubsidyMatch, ScoringRules } from './types';

/**
 * 事業情報と補助金マスタデータから、各補助金のマッチングスコアを計算
 */
export function calculateSubsidyMatches(
  businessInfo: BusinessInfo,
  subsidies: SubsidyMaster[]
): SubsidyMatch[] {
  const scored = subsidies
    .filter((s) => s.is_active)
    .map((subsidy) => {
      const score = calculateScore(businessInfo, subsidy.scoring_rules);
      return {
        subsidyKey: subsidy.subsidy_key,
        name: subsidy.name,
        score,
        rank: 0,
        maxAmount: subsidy.max_amount,
        subsidyRate: subsidy.subsidy_rate,
        description: subsidy.description,
        eligibilitySummary: subsidy.eligibility_summary,
        difficulty: subsidy.difficulty,
        officialUrl: subsidy.official_url,
        category: subsidy.category,
      };
    })
    .sort((a, b) => b.score - a.score);

  // ランク付け
  scored.forEach((item, index) => {
    item.rank = index + 1;
  });

  return scored;
}

/**
 * 単一の補助金に対するスコアを計算
 */
function calculateScore(businessInfo: BusinessInfo, rules: ScoringRules): number {
  let totalScore = 0;

  for (const [field, valueMap] of Object.entries(rules)) {
    const fieldValue = getFieldValue(businessInfo, field);
    if (fieldValue === null) continue;

    // 完全一致チェック
    const stringValue = String(fieldValue);
    if (stringValue in valueMap) {
      totalScore += valueMap[stringValue];
    }
    // "all" フォールバック（業種など、すべてに共通のベーススコア）
    else if ('all' in valueMap) {
      totalScore += valueMap['all'];
    }
  }

  return totalScore;
}

/**
 * BusinessInfo からフィールド値を取得
 */
function getFieldValue(info: BusinessInfo, field: string): string | boolean | null {
  switch (field) {
    case 'industry':
      return info.industry;
    case 'employeeCount':
      return info.employeeCount;
    case 'annualRevenue':
      return info.annualRevenue;
    case 'yearsInBusiness':
      return info.yearsInBusiness;
    case 'corporationType':
      return info.corporationType;
    case 'hasItPlan':
      return info.hasItPlan;
    case 'hasEquipmentPlan':
      return info.hasEquipmentPlan;
    case 'isSmallBusiness':
      return info.isSmallBusiness;
    default:
      return null;
  }
}

/**
 * スコアを適合度パーセンテージに変換（表示用）
 * 最大スコアを100%として計算
 */
export function scoreToPercentage(score: number, maxPossibleScore: number): number {
  if (maxPossibleScore <= 0) return 0;
  return Math.min(100, Math.round((score / maxPossibleScore) * 100));
}

/**
 * マッチ結果から適合度ラベルを取得
 */
export function getMatchLabel(score: number): { label: string; color: string } {
  if (score >= 50) return { label: '非常に高い', color: 'text-green-600' };
  if (score >= 35) return { label: '高い', color: 'text-blue-600' };
  if (score >= 20) return { label: '中程度', color: 'text-amber-600' };
  return { label: '低い', color: 'text-gray-500' };
}

/**
 * 難易度のラベルと色を取得
 */
export function getDifficultyLabel(difficulty: string): { label: string; color: string; bg: string } {
  switch (difficulty) {
    case 'easy':
      return { label: '申請しやすい', color: 'text-green-700', bg: 'bg-green-100' };
    case 'medium':
      return { label: '標準', color: 'text-amber-700', bg: 'bg-amber-100' };
    case 'hard':
      return { label: '申請難度高', color: 'text-red-700', bg: 'bg-red-100' };
    default:
      return { label: '標準', color: 'text-gray-700', bg: 'bg-gray-100' };
  }
}
