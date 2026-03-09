'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, Check, Sparkles } from 'lucide-react';

type Pack = {
  id: string;
  name: string;
  points: number;
  price: number;
  bonusPoints: number;
  totalPoints: number;
};

type PointPurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  email?: string;
  currentBalance: number;
};

export default function PointPurchaseModal({
  isOpen,
  onClose,
  userId,
  email,
  currentBalance,
}: PointPurchaseModalProps) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/points/packs')
      .then(res => res.json())
      .then(data => setPacks(data.packs || []))
      .catch(err => console.error('Failed to load packs:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handlePurchase = async (packId: string) => {
    setPurchasing(packId);
    try {
      const res = await fetch('/api/points/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('購入セッションの作成に失敗しました。');
      }
    } catch {
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setPurchasing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
            <Coins size={24} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">ポイントを購入</h2>
          <p className="text-sm text-gray-500 mt-1">
            現在の残高: <span className="font-bold text-amber-600">{currentBalance.toLocaleString()}pt</span>
          </p>
        </div>

        {/* パック一覧 */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : (
          <div className="space-y-3">
            {packs.map((pack, index) => {
              const isPopular = index === 1; // 中間パックを人気に
              const isBestValue = index === 2; // 最大パックをお得に
              return (
                <div
                  key={pack.id}
                  className={`relative border rounded-xl p-4 transition-all ${
                    isPopular
                      ? 'border-amber-400 bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 left-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      人気
                    </span>
                  )}
                  {isBestValue && (
                    <span className="absolute -top-2.5 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      お得
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{pack.name}</p>
                        {pack.bonusPoints > 0 && (
                          <span className="flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <Sparkles size={10} />
                            +{pack.bonusPoints}pt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        合計 {pack.totalPoints.toLocaleString()}pt
                      </p>
                    </div>
                    <button
                      onClick={() => handlePurchase(pack.id)}
                      disabled={purchasing !== null}
                      className={`font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm ${
                        isPopular
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      } disabled:opacity-50`}
                    >
                      {purchasing === pack.id ? '処理中...' : `¥${pack.price.toLocaleString()}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Proプラン案内 */}
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Check size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-900">
                プロプランなら毎月1,500pt付与
              </p>
              <p className="text-[10px] text-indigo-700 mt-0.5">
                月額¥3,980で全機能解放 + ポイント消費なしで使い放題
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
