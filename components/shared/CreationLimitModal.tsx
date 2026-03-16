'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Gamepad2, Loader2, ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { PlanLimitDisplay } from '@/lib/hooks/usePoints';

const UNLOCK_COST = 1000;

interface CreationLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: PlanLimitDisplay | null;
  userId?: string;
  /** ポイント解除成功後に保存を続行する */
  onUnlockSuccess?: () => void;
  /** 対象ツールタイプ（購入時に使用） */
  toolType?: string;
}

export default function CreationLimitModal({
  isOpen,
  onClose,
  info,
  userId,
  onUnlockSuccess,
  toolType,
}: CreationLimitModalProps) {
  const [pointBalance, setPointBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockResult, setUnlockResult] = useState<{ success: boolean; message: string } | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // モーダルが開いたらポイント残高を取得
  useEffect(() => {
    if (!isOpen || !userId || !info?.canUsePoints) return;
    setLoadingBalance(true);
    setUnlockResult(null);
    fetch(`/api/points/unlock-tool?userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        setPointBalance(data.currentBalance ?? 0);
      })
      .catch(() => setPointBalance(0))
      .finally(() => setLoadingBalance(false));
  }, [isOpen, userId, info?.canUsePoints]);

  const canAffordUnlock = pointBalance !== null && pointBalance >= UNLOCK_COST;

  const handlePointUnlock = async () => {
    if (!info?.onPointUnlock) return;
    setUnlocking(true);
    try {
      const success = await info.onPointUnlock();
      if (success) {
        setUnlockResult({ success: true, message: '枠を追加しました！保存を続行します...' });
        // 少し待ってから保存を続行
        setTimeout(() => {
          onClose();
          onUnlockSuccess?.();
        }, 1200);
      } else {
        setUnlockResult({ success: false, message: 'ポイントが不足しているか、エラーが発生しました。' });
      }
    } catch {
      setUnlockResult({ success: false, message: 'エラーが発生しました。' });
    } finally {
      setUnlocking(false);
    }
  };

  const effectiveToolType = toolType || info?.toolType;
  const canPurchase = info?.canPurchase && info?.purchasePrice && effectiveToolType;
  const purchasePrice = info?.purchasePrice;

  const handlePurchase = async () => {
    if (!userId || !effectiveToolType || !purchasePrice) return;
    setPurchasing(true);
    try {
      const res = await fetch('/api/features/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: 'tool_unlock',
          contentType: effectiveToolType,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('購入処理でエラーが発生しました。');
      }
    } catch {
      alert('購入処理でエラーが発生しました。');
    } finally {
      setPurchasing(false);
    }
  };

  if (!isOpen || !info) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold">{info.title}</h2>
          <p className="text-white/90 text-sm mt-2">{info.message}</p>
          {info.currentUsage !== undefined && info.limit !== undefined && (
            <div className="mt-3 bg-white/20 rounded-lg px-3 py-2 text-sm">
              現在の使用数: <span className="font-bold">{info.currentUsage}</span> / {info.limit}個
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* オプション1: プランアップグレード */}
          <Link
            href="/pricing"
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">プランをアップグレード</p>
              <p className="text-sm text-gray-600">
                {info.recommendedPlan === 'standard'
                  ? 'Standard（¥1,980/月）で10個まで作成可能'
                  : 'Business（¥4,980/月）で無制限に作成可能'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* オプション2: 単品購入で解除 */}
          {canPurchase && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl hover:shadow-md transition-all group text-left"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {purchasing ? (
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    ¥{purchasePrice?.toLocaleString()}で1枠追加購入
                  </p>
                  <p className="text-sm text-gray-600">
                    クレジットカードで今すぐ作成枠を追加
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>

              {info.purchaseUnlocks !== undefined && info.purchaseUnlocks > 0 && (
                <p className="text-xs text-gray-400 text-center">
                  ※ このツールで{info.purchaseUnlocks}枠を購入済み
                </p>
              )}
            </>
          )}

          {/* オプション3: ポイントで解除 */}
          {info.canUsePoints && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">または</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">ポイントで1枠追加</p>
                    <p className="text-sm text-gray-600">
                      {UNLOCK_COST.toLocaleString()}ptで作成枠を1つ追加
                    </p>
                  </div>
                </div>

                {/* 残高表示 */}
                {loadingBalance ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-sm text-gray-500 ml-2">残高確認中...</span>
                  </div>
                ) : (
                  <div className="mb-3 bg-white/80 rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                    <span className="text-gray-600">ポイント残高</span>
                    <span className={`font-bold ${canAffordUnlock ? 'text-purple-700' : 'text-red-500'}`}>
                      {pointBalance?.toLocaleString() ?? 0}pt
                      {!canAffordUnlock && (
                        <span className="text-xs font-normal ml-1">（{UNLOCK_COST.toLocaleString()}pt必要）</span>
                      )}
                    </span>
                  </div>
                )}

                {/* 解除結果メッセージ */}
                {unlockResult && (
                  <div className={`mb-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    unlockResult.success
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {unlockResult.success && <Sparkles className="w-4 h-4 inline mr-1" />}
                    {unlockResult.message}
                  </div>
                )}

                {/* ボタン */}
                {canAffordUnlock ? (
                  <button
                    onClick={handlePointUnlock}
                    disabled={unlocking || unlockResult?.success}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {unlocking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        処理中...
                      </>
                    ) : unlockResult?.success ? (
                      '解除完了！'
                    ) : (
                      <>
                        <Gamepad2 className="w-4 h-4" />
                        {UNLOCK_COST.toLocaleString()}ptで枠を追加
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/arcade"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    アーケードでポイントを貯める
                  </Link>
                )}

                {info.pointUnlocks !== undefined && info.pointUnlocks > 0 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    ※ このツールで{info.pointUnlocks}枠をポイント解除済み
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
