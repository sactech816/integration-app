'use client';

import { useState, useCallback, useRef } from 'react';
import { usePoints, type PlanLimitDisplay } from './usePoints';

export interface UsePointsWithLimitModalOptions {
  userId: string | undefined;
  isPro: boolean;
}

export interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: PlanLimitDisplay | null;
  userId?: string;
  onUnlockSuccess?: () => void;
}

/**
 * usePoints + CreationLimitModal の状態管理を統合したフック
 *
 * 使い方:
 * ```tsx
 * const { consumeAndExecute, limitModalProps } = usePointsWithLimitModal({ userId, isPro });
 * // ...
 * return (
 *   <>
 *     {/* 既存のUI *\/}
 *     <CreationLimitModal {...limitModalProps} />
 *   </>
 * );
 * ```
 */
export function usePointsWithLimitModal({ userId, isPro }: UsePointsWithLimitModalOptions) {
  const [limitInfo, setLimitInfo] = useState<PlanLimitDisplay | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const pendingSaveRef = useRef<(() => Promise<void>) | null>(null);

  const handleCreationLimitReached = useCallback((info: PlanLimitDisplay) => {
    setLimitInfo(info);
    setShowLimitModal(true);
  }, []);

  const { consumeAndExecute, balance, loading } = usePoints({
    userId,
    isPro,
    onCreationLimitReached: handleCreationLimitReached,
  });

  // ポイント解除成功後に保存を再試行する consumeAndExecute のラッパー
  const consumeAndExecuteWithRetry = useCallback(async (
    serviceType: string,
    action: string | undefined,
    onSuccess: () => Promise<void>,
    contentId?: string
  ): Promise<boolean> => {
    // 保存処理を保持しておく（ポイント解除後のリトライ用）
    pendingSaveRef.current = onSuccess;
    return consumeAndExecute(serviceType, action, onSuccess, contentId);
  }, [consumeAndExecute]);

  const handleUnlockSuccess = useCallback(() => {
    // ポイント解除後、保存処理を自動的に再実行
    if (pendingSaveRef.current) {
      pendingSaveRef.current();
      pendingSaveRef.current = null;
    }
  }, []);

  const limitModalProps: LimitModalProps = {
    isOpen: showLimitModal,
    onClose: () => setShowLimitModal(false),
    info: limitInfo,
    userId,
    onUnlockSuccess: handleUnlockSuccess,
  };

  return {
    consumeAndExecute: consumeAndExecuteWithRetry,
    balance,
    loading,
    limitModalProps,
  };
}
