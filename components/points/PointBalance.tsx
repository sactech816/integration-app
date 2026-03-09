'use client';

import React from 'react';
import { Coins } from 'lucide-react';

type PointBalanceProps = {
  balance: number;
  isPro?: boolean;
  onPurchaseClick?: () => void;
  compact?: boolean;
};

/**
 * ポイント残高表示コンポーネント
 * サイドバーやヘッダーに配置可能
 */
export default function PointBalance({
  balance,
  isPro = false,
  onPurchaseClick,
  compact = false,
}: PointBalanceProps) {
  if (compact) {
    return (
      <button
        onClick={onPurchaseClick}
        className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
      >
        <Coins size={14} className="text-amber-600" />
        <span className="text-sm font-bold text-amber-700">{balance.toLocaleString()}</span>
        <span className="text-xs text-amber-500">pt</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-1.5 rounded-full">
            <Coins size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-amber-600 font-bold">ポイント残高</p>
            <p className="text-lg font-extrabold text-amber-700">
              {balance.toLocaleString()}
              <span className="text-xs font-bold ml-0.5">pt</span>
            </p>
          </div>
        </div>
        {isPro && (
          <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
            PRO
          </span>
        )}
      </div>
      {onPurchaseClick && (
        <button
          onClick={onPurchaseClick}
          className="w-full mt-2 bg-amber-500 text-white font-bold text-xs py-2 rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
        >
          ポイントを購入
        </button>
      )}
    </div>
  );
}
