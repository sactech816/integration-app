'use client';

import React, { useState } from 'react';
import { Stamp, Check, Lock, Sparkles, Gift, Coins } from 'lucide-react';

interface StampRallyPreviewProps {
  title: string;
  description: string;
  totalStamps: number;
  pointsPerStamp: number;
  completionBonus: number;
  isTestMode: boolean;
}

export default function StampRallyPreview({
  title,
  description,
  totalStamps,
  pointsPerStamp,
  completionBonus,
  isTestMode,
}: StampRallyPreviewProps) {
  const [acquiredStamps, setAcquiredStamps] = useState<number[]>([]);
  const [justAcquired, setJustAcquired] = useState<number | null>(null);
  const [mockPoints, setMockPoints] = useState(0);

  // グリッドの列数を計算
  const cols = totalStamps <= 6 ? 3 : totalStamps <= 9 ? 3 : 5;

  // テスト用スタンプ取得
  const handleStampClick = (index: number) => {
    if (acquiredStamps.includes(index)) return;

    setJustAcquired(index);
    setAcquiredStamps(prev => [...prev, index]);
    setMockPoints(prev => prev + pointsPerStamp);

    // コンプリートチェック
    if (acquiredStamps.length + 1 === totalStamps) {
      setTimeout(() => {
        setMockPoints(prev => prev + completionBonus);
      }, 500);
    }

    // アニメーション解除
    setTimeout(() => {
      setJustAcquired(null);
    }, 1000);
  };

  // リセット
  const handleReset = () => {
    setAcquiredStamps([]);
    setJustAcquired(null);
    setMockPoints(0);
  };

  const isCompleted = acquiredStamps.length === totalStamps;

  return (
    <div className="min-h-full bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 pt-14 pb-6 px-4">
      {/* テストモード表示 */}
      {isTestMode && (
        <div className="absolute top-12 left-0 right-0 bg-amber-500 text-amber-900 text-center py-1 text-xs font-bold">
          テストモード（タップでスタンプ取得）
        </div>
      )}

      {/* タイトル */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
          <Stamp className="w-5 h-5 text-amber-600" />
          {title || 'スタンプラリー'}
        </h1>
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
      </div>

      {/* ポイント表示 */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
          <Coins className="w-5 h-5 text-amber-500" />
          <span className="text-gray-800 font-bold">{mockPoints} pt</span>
          {isTestMode && (
            <button
              onClick={handleReset}
              className="text-xs text-amber-600 hover:text-amber-800 ml-2 underline"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* スタンプカード */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-700">
            {acquiredStamps.length} / {totalStamps} スタンプ
          </span>
          <span className="text-xs text-gray-500">
            1スタンプ = {pointsPerStamp}pt
          </span>
        </div>

        {/* スタンプグリッド */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: totalStamps }).map((_, index) => {
            const isAcquired = acquiredStamps.includes(index);
            const isJust = justAcquired === index;

            return (
              <button
                key={index}
                onClick={() => handleStampClick(index)}
                disabled={isAcquired}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center
                  transition-all duration-300 ease-out
                  ${
                    isAcquired
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50'
                  }
                  ${isJust ? 'scale-110 animate-bounce' : ''}
                `}
              >
                {isAcquired ? (
                  <>
                    <Check className="w-6 h-6" />
                    {isJust && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-yellow-200 animate-pulse" />
                      </div>
                    )}
                  </>
                ) : (
                  <Lock className="w-5 h-5" />
                )}

                {/* スタンプ番号バッジ */}
                <div
                  className={`
                    absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold
                    flex items-center justify-center
                    ${isAcquired ? 'bg-white text-amber-600' : 'bg-gray-300 text-gray-600'}
                  `}
                >
                  {index + 1}
                </div>
              </button>
            );
          })}
        </div>

        {/* コンプリート表示 */}
        {isCompleted && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-center animate-pulse">
            <div className="flex items-center justify-center gap-2 text-white">
              <Gift className="w-6 h-6" />
              <span className="font-bold text-lg">コンプリート！</span>
              <Gift className="w-6 h-6" />
            </div>
            <p className="text-yellow-100 text-sm mt-1">
              ボーナス +{completionBonus}pt ゲット！
            </p>
          </div>
        )}

        {/* 凡例 */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-400 to-orange-500" />
            <span>取得済み</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-200 border border-dashed border-gray-400" />
            <span>未取得</span>
          </div>
        </div>
      </div>

      {/* 説明 */}
      <div className="mt-4 text-center text-xs text-gray-500">
        {isTestMode ? (
          <p>スタンプをタップしてテストプレイ</p>
        ) : (
          <p>QRコードをスキャンしてスタンプをゲット！</p>
        )}
      </div>
    </div>
  );
}





















