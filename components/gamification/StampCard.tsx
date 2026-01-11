'use client';

import React from 'react';
import { UserStamp, StampRallySettings } from '@/lib/types';
import { Stamp, Check, Lock, Sparkles } from 'lucide-react';

interface StampCardProps {
  campaignId: string;
  settings: StampRallySettings;
  acquiredStamps: UserStamp[];
  justAcquired?: string | null;
  acquiring?: boolean;
}

export default function StampCard({
  campaignId,
  settings,
  acquiredStamps,
  justAcquired,
  acquiring,
}: StampCardProps) {
  const totalStamps = settings.total_stamps || 10;
  const stampIds = settings.stamp_ids || Array.from({ length: totalStamps }, (_, i) => `stamp_${i + 1}`);
  const pointsPerStamp = settings.points_per_stamp || 1;

  // 取得済みスタンプIDのセット
  const acquiredSet = new Set(acquiredStamps.map((s) => s.stamp_id));

  // グリッドの列数を計算
  const cols = totalStamps <= 6 ? 3 : totalStamps <= 9 ? 3 : 5;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Stamp className="w-6 h-6 text-amber-500" />
          スタンプカード
        </h2>
        <span className="text-sm text-gray-500">
          1スタンプ = {pointsPerStamp}pt
        </span>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {stampIds.map((stampId, index) => {
          const isAcquired = acquiredSet.has(stampId);
          const isJustAcquired = justAcquired === stampId;

          return (
            <div
              key={stampId}
              className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center
                transition-all duration-300 ease-out
                ${
                  isAcquired
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300'
                }
                ${isJustAcquired ? 'animate-stamp-pop scale-110' : ''}
              `}
            >
              {isAcquired ? (
                <>
                  <div className="relative">
                    <Check className="w-8 h-8 md:w-10 md:h-10" />
                    {isJustAcquired && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-yellow-200 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">GET!</span>
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6 md:w-8 md:h-8" />
                  <span className="text-xs mt-1">{index + 1}</span>
                </>
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
            </div>
          );
        })}
      </div>

      {/* ローディング表示 */}
      {acquiring && (
        <div className="mt-6 flex items-center justify-center gap-2 text-amber-600">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">スタンプを取得中...</span>
        </div>
      )}

      {/* 凡例 */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-orange-500" />
          <span>取得済み</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200 border border-dashed border-gray-400" />
          <span>未取得</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes stamp-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-stamp-pop {
          animation: stamp-pop 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
















