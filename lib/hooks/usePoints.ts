'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UsePointsOptions {
  userId: string | undefined;
  isPro: boolean;
}

export interface UsePointsReturn {
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
  /** ポイントを消費可能か確認（Proユーザーは常にtrue） */
  canAfford: (serviceType: string, action?: string) => Promise<boolean>;
  /** ポイントを消費してからコールバックを実行 */
  consumeAndExecute: (
    serviceType: string,
    action: string | undefined,
    onSuccess: () => Promise<void>,
    contentId?: string
  ) => Promise<boolean>;
}

/**
 * ポイントシステム用フック
 * 各エディタコンポーネントで使用する
 */
export function usePoints({ userId, isPro }: UsePointsOptions): UsePointsReturn {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshBalance = useCallback(async () => {
    // ポイント消費は廃止済み — バランス取得不要
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  const canAfford = useCallback(async (serviceType: string, action: string = 'save'): Promise<boolean> => {
    // ポイント消費は廃止済み — 常に許可
    return true;
  }, []);

  const consumeAndExecute = useCallback(async (
    serviceType: string,
    action: string = 'save',
    onSuccess: () => Promise<void>,
    contentId?: string
  ): Promise<boolean> => {
    // 新規作成時のみ作成数制限をチェック（contentIdがある＝既存の編集はスキップ）
    if (!contentId && userId) {
      try {
        const res = await fetch(`/api/check-creation-limit?userId=${encodeURIComponent(userId)}&toolType=${encodeURIComponent(serviceType)}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.allowed) {
            alert(data.message || `作成上限（${data.limit}個）に達しています。上位プランにアップグレードしてください。`);
            return false;
          }
        }
      } catch (e) {
        console.warn('[consumeAndExecute] Creation limit check failed, proceeding:', e);
      }
    }
    await onSuccess();
    return true;
  }, [userId]);

  return { balance, loading, refreshBalance, canAfford, consumeAndExecute };
}
