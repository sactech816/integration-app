'use client';

import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { purchaseFeature } from '@/lib/hooks/useFeaturePurchase';

interface FeaturePurchaseButtonProps {
  userId: string;
  productId: string;
  contentId?: string;
  contentType?: string;
  price?: number;
  label?: string;
  className?: string;
}

/**
 * 単品購入ボタン（エディタのトグル横や完成モーダルで使用）
 */
export default function FeaturePurchaseButton({
  userId,
  productId,
  contentId,
  contentType,
  price = 500,
  label,
  className,
}: FeaturePurchaseButtonProps) {
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const url = await purchaseFeature({
        userId,
        productId,
        contentId,
        contentType,
      });
      if (!url) {
        alert('購入処理でエラーが発生しました。');
      }
    } catch {
      alert('購入処理でエラーが発生しました。');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={purchasing}
      className={className || 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
    >
      {purchasing ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <CreditCard size={14} />
      )}
      {label || `¥${price.toLocaleString()}で有効化`}
    </button>
  );
}
