'use client';

import React, { useState, useEffect } from 'react';
import { GachaResult } from '@/lib/types';
import { Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface OmikujiAnimationProps {
  playing: boolean;
  result: GachaResult | null;
  showResult: boolean;
  onPlay: () => void;
  onReset: () => void;
  cost: number;
  canPlay: boolean;
}

export default function OmikujiAnimation({
  playing,
  result,
  showResult,
  onPlay,
  onReset,
  cost,
  canPlay,
}: OmikujiAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'dropping' | 'opening'>('idle');

  useEffect(() => {
    if (playing) {
      setPhase('shaking');
      setTimeout(() => setPhase('dropping'), 1500);
      setTimeout(() => setPhase('opening'), 2500);
    } else if (!showResult) {
      setPhase('idle');
    }
  }, [playing, showResult]);

  return (
    <div className="flex flex-col items-center">
      {/* おみくじ箱 */}
      <div className="relative w-48 h-64 mb-8">
        {/* 箱本体 */}
        <div 
          className={`
            absolute inset-0 
            bg-gradient-to-b from-red-700 via-red-800 to-red-900
            rounded-lg shadow-2xl
            ${phase === 'shaking' ? 'animate-omikuji-shake' : ''}
          `}
        >
          {/* 装飾パターン */}
          <div className="absolute inset-2 border-2 border-yellow-500/30 rounded" />
          <div className="absolute inset-4 border border-yellow-500/20 rounded" />
          
          {/* 「おみくじ」文字 */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 writing-vertical-rl">
            <span className="text-yellow-400 text-2xl font-bold tracking-widest" style={{ writingMode: 'vertical-rl' }}>
              おみくじ
            </span>
          </div>
          
          {/* 穴（棒が出るところ） */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-black/80 rounded-full border-2 border-yellow-600">
            {/* おみくじ棒 */}
            {(phase === 'dropping' || phase === 'opening') && (
              <div 
                className={`
                  absolute left-1/2 -translate-x-1/2 w-2 h-20
                  bg-gradient-to-b from-yellow-100 to-yellow-200
                  rounded-t-full
                  ${phase === 'dropping' ? 'animate-stick-drop' : 'animate-stick-out'}
                `}
              />
            )}
          </div>
        </div>

        {/* 結果の紙（開く演出） */}
        {phase === 'opening' && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-40">
            <div 
              className={`
                bg-gradient-to-b from-amber-50 to-amber-100
                rounded-lg shadow-xl p-4 text-center
                border border-amber-200
                animate-paper-unfold
              `}
            >
              {result?.is_winning ? (
                <>
                  <div className="text-red-600 text-3xl font-bold mb-1">大吉</div>
                  <div className="text-amber-800 text-sm">🎉 おめでとう！</div>
                </>
              ) : (
                <>
                  <div className="text-gray-600 text-2xl font-bold mb-1">小吉</div>
                  <div className="text-amber-700 text-sm">次こそ！</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* スペース確保 */}
      {phase === 'opening' && <div className="h-24" />}

      {/* 結果表示 */}
      {showResult && result && (
        <div className={`
          mb-8 p-6 rounded-2xl text-center w-full max-w-sm
          ${result.success && result.is_winning 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
            : result.success 
            ? 'bg-white/20 text-white'
            : 'bg-red-500/20 text-red-200'}
        `}>
          {result.success ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6" />
                <span className="text-xl font-bold">
                  {result.is_winning ? '🎊 大当たり！' : '残念...'}
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
          もう一度引く
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={!canPlay || playing}
          className={`
            px-10 py-5 rounded-full font-bold text-xl transition-all
            ${canPlay && !playing
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:scale-105 hover:shadow-lg active:scale-95'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
          `}
        >
          {playing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              おみくじを引いています...
            </span>
          ) : (
            <span>{cost}pt で引く</span>
          )}
        </button>
      )}

      {!canPlay && !playing && !showResult && (
        <p className="mt-4 text-red-300 text-sm">ポイントが足りません</p>
      )}

      <style jsx>{`
        @keyframes omikuji-shake {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-5deg); }
          20% { transform: rotate(5deg); }
          30% { transform: rotate(-5deg); }
          40% { transform: rotate(5deg); }
          50% { transform: rotate(-3deg); }
          60% { transform: rotate(3deg); }
          70% { transform: rotate(-3deg); }
          80% { transform: rotate(3deg); }
          90% { transform: rotate(-1deg); }
        }
        .animate-omikuji-shake {
          animation: omikuji-shake 1.5s ease-in-out;
        }

        @keyframes stick-drop {
          0% { transform: translateX(-50%) translateY(-100%); }
          100% { transform: translateX(-50%) translateY(-50%); }
        }
        .animate-stick-drop {
          animation: stick-drop 0.5s ease-out forwards;
        }

        @keyframes stick-out {
          0% { transform: translateX(-50%) translateY(-50%); }
          100% { transform: translateX(-50%) translateY(-120%); }
        }
        .animate-stick-out {
          animation: stick-out 0.5s ease-out forwards;
        }

        @keyframes paper-unfold {
          0% { 
            transform: translateX(-50%) scaleY(0);
            opacity: 0;
          }
          100% { 
            transform: translateX(-50%) scaleY(1);
            opacity: 1;
          }
        }
        .animate-paper-unfold {
          animation: paper-unfold 0.5s ease-out forwards;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
}

























