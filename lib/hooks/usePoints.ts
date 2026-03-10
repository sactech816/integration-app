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
    if (!userId) return;
    try {
      const res = await fetch(`/api/points/balance?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const canAfford = useCallback(async (serviceType: string, action: string = 'save'): Promise<boolean> => {
    if (isPro) return true;

    try {
      const res = await fetch('/api/points/costs');
      if (!res.ok) return true; // コスト取得失敗時は通過させる
      const data = await res.json();
      const costEntry = (data.costs || []).find(
        (c: any) => c.serviceType === serviceType && c.action === action
      );
      if (!costEntry || costEntry.cost === 0) return true;
      return balance >= costEntry.cost;
    } catch {
      return true; // エラー時は通過させる
    }
  }, [isPro, balance]);

  const consumeAndExecute = useCallback(async (
    serviceType: string,
    action: string = 'save',
    onSuccess: () => Promise<void>,
    contentId?: string
  ): Promise<boolean> => {
    // Proユーザーはポイント消費不要
    if (isPro) {
      await onSuccess();
      return true;
    }

    if (!userId) {
      await onSuccess();
      return true;
    }

    try {
      // サーバーサイドでポイント消費
      const res = await fetch('/api/points/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, serviceType, action, contentId, isPro }),
      });
      const data = await res.json();

      if (!data.success && data.error === 'insufficient_balance') {
        alert(`ポイントが不足しています。\n\n必要ポイント: ${data.required}pt\n現在の残高: ${data.balance}pt\n\nポイントを購入するか、有料プランにアップグレードしてください。`);
        return false;
      }

      if (!data.success) {
        // ポイント消費に失敗してもブロックしない（グレースフルデグレード）
        console.warn('Point consumption failed:', data.error);
      }

      // ポイント消費成功（またはエラー時のグレースフル通過）→ 保存実行
      await onSuccess();
      await refreshBalance();
      return true;
    } catch (err) {
      console.error('Point consume error:', err);
      // エラー時でも保存を妨げない
      await onSuccess();
      return true;
    }
  }, [userId, isPro, refreshBalance]);

  return { balance, loading, refreshBalance, canAfford, consumeAndExecute };
}
