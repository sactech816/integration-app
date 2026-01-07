'use client';

import React from 'react';
import { GachaResult } from '@/lib/types';
import { Gift, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface CapsuleAnimationProps {
  playing: boolean;
  result: GachaResult | null;
  showResult: boolean;
  onPlay: () => void;
  onReset: () => void;
  cost: number;
  canPlay: boolean;
}

export default function CapsuleAnimation({
  playing,
  result,
  showResult,
  onPlay,
  onReset,
  cost,
  canPlay,
}: CapsuleAnimationProps) {
  return (
    <div className="flex flex-col items-center">
      {/* ガチャマシン */}
      <div className="relative w-64 h-80 mb-8">
        {/* マシン本体 */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-700 rounded-t-[50%] rounded-b-3xl shadow-2xl">
          {/* ガラス部分 */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-white/30 to-white/10 rounded-full border-4 border-white/20 overflow-hidden">
            {/* カプセルたち */}
            <div className={`absolute inset-0 ${playing ? 'animate-shake' : ''}`}>
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
              <div className="absolute top-8 right-6 w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
              <div className="absolute bottom-6 left-8 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600" />
              <div className="absolute bottom-10 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
              <div className="absolute top-16 left-12 w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
            </div>
          </div>

          {/* ハンドル */}
          <div className="absolute bottom-20 right-0 translate-x-1/2">
            <div 
              className={`
                w-6 h-20 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full
                ${playing ? 'animate-handle-turn origin-top' : ''}
              `}
            />
            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-lg" />
          </div>

          {/* 取り出し口 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-12 bg-black/80 rounded-b-2xl">
            {/* 出てくるカプセル */}
            {playing && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-capsule-drop shadow-lg" />
            )}
          </div>
        </div>
      </div>

      {/* 結果表示 */}
      {showResult && result && (
        <div className={`
          mb-8 p-6 rounded-2xl text-center w-full max-w-sm
          ${result.success && result.is_winning 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-result-pop' 
            : result.success 
            ? 'bg-white/20 text-white'
            : 'bg-red-500/20 text-red-200'}
        `}>
          {result.success ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                {result.is_winning ? (
                  <Sparkles className="w-6 h-6" />
                ) : (
                  <Gift className="w-6 h-6" />
                )}
                <span className="text-xl font-bold">
                  {result.is_winning ? '🎉 大当たり！' : '残念...'}
                </span>
              </div>
              <p className="text-lg font-medium">{result.prize_name}</p>
              {result.prize_image_url && (
                <img 
                  src={result.prize_image_url} 
                  alt={result.prize_name}
                  className="w-24 h-24 mx-auto mt-4 rounded-xl object-cover"
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>
                {result.error_code === 'insufficient_points' 
                  ? 'ポイントが足りません' 
                  : 'エラーが発生しました'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ボタン */}
      {showResult ? (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          もう一度回す
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={!canPlay || playing}
          className={`
            px-10 py-5 rounded-full font-bold text-xl transition-all
            ${canPlay && !playing
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:scale-105 hover:shadow-lg active:scale-95'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
          `}
        >
          {playing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              回転中...
            </span>
          ) : (
            <span>{cost}pt で回す</span>
          )}
        </button>
      )}

      {!canPlay && !playing && !showResult && (
        <p className="mt-4 text-red-300 text-sm">ポイントが足りません</p>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          75% { transform: translateX(5px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }

        @keyframes handle-turn {
          0% { transform: rotate(0); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-handle-turn {
          animation: handle-turn 1s ease-in-out;
        }

        @keyframes capsule-drop {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          30% { transform: translate(-50%, 0); opacity: 1; }
          60% { transform: translate(-50%, 20px); }
          100% { transform: translate(-50%, 10px); }
        }
        .animate-capsule-drop {
          animation: capsule-drop 2s ease-out forwards;
        }

        @keyframes result-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-result-pop {
          animation: result-pop 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}



