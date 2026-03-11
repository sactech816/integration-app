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
    // ポイント消費は廃止済み — サブスクプランに移行
    // 全プランで保存・更新を許可（プラン別の機能制限はUI側で制御）
    await onSuccess();
    return true;
  }, []);

  return { balance, loading, refreshBalance, canAfford, consumeAndExecute };
}
