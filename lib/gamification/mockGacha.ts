import { GachaPrize, GachaResult } from '@/lib/types';

/**
 * フロントエンドのみでガチャ抽選を行うモック関数
 * プレビュー・テストプレイ用（DBには保存しない）
 */
export function mockGachaDraw(prizes: GachaPrize[]): GachaResult {
  if (!prizes || prizes.length === 0) {
    return {
      success: true,
      is_winning: false,
      prize_name: '景品がありません',
    };
  }

  // 確率に基づいてランダム抽選
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const prize of prizes) {
    cumulative += prize.probability;
    if (random <= cumulative) {
      return {
        success: true,
        is_winning: prize.is_winning,
        prize_id: prize.id,
        prize_name: prize.name,
        prize_image_url: prize.image_url,
      };
    }
  }

  // どれにも当たらなかった場合（確率合計が100未満の場合）
  return {
    success: true,
    is_winning: false,
    prize_name: 'ハズレ',
  };
}

/**
 * 景品の確率が正しいかチェック
 */
export function validatePrizeProbabilities(prizes: GachaPrize[]): {
  isValid: boolean;
  total: number;
  message?: string;
} {
  if (!prizes || prizes.length === 0) {
    return { isValid: false, total: 0, message: '景品を1つ以上設定してください' };
  }

  const total = prizes.reduce((sum, p) => sum + (p.probability || 0), 0);

  if (total < 99.9) {
    return { isValid: false, total, message: `確率の合計が${total.toFixed(1)}%です。100%になるよう調整してください` };
  }

  if (total > 100.1) {
    return { isValid: false, total, message: `確率の合計が${total.toFixed(1)}%です。100%以下にしてください` };
  }

  return { isValid: true, total };
}

/**
 * 確率を自動調整（残りを均等配分）
 */
export function autoAdjustProbabilities(prizes: GachaPrize[]): GachaPrize[] {
  if (!prizes || prizes.length === 0) return prizes;

  const total = prizes.reduce((sum, p) => sum + (p.probability || 0), 0);
  
  if (Math.abs(total - 100) < 0.1) return prizes;

  // 最後の景品で調整
  const adjustedPrizes = [...prizes];
  const lastIndex = adjustedPrizes.length - 1;
  const otherTotal = adjustedPrizes.slice(0, -1).reduce((sum, p) => sum + (p.probability || 0), 0);
  adjustedPrizes[lastIndex] = {
    ...adjustedPrizes[lastIndex],
    probability: Math.max(0, 100 - otherTotal),
  };

  return adjustedPrizes;
}




