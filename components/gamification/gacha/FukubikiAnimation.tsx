'use client';

import React, { useState, useEffect } from 'react';
import { GachaResult } from '@/lib/types';
import { Gift, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FukubikiAnimationProps {
  playing: boolean;
  result: GachaResult | null;
  showResult: boolean;
  onPlay: () => void;
  onReset: () => void;
  cost: number;
  canPlay: boolean;
}

// 球の色と名前
const BALL_COLORS = [
  { id: 'gold', color: 'from-yellow-300 to-yellow-500', glow: 'shadow-yellow-400/50', label: '金' },
  { id: 'red', color: 'from-red-400 to-red-600', glow: 'shadow-red-400/50', label: '赤' },
  { id: 'blue', color: 'from-blue-400 to-blue-600', glow: 'shadow-blue-400/50', label: '青' },
  { id: 'green', color: 'from-green-400 to-green-600', glow: 'shadow-green-400/50', label: '緑' },
  { id: 'white', color: 'from-gray-100 to-gray-300', glow: 'shadow-gray-300/50', label: '白' },
  { id: 'purple', color: 'from-purple-400 to-purple-600', glow: 'shadow-purple-400/50', label: '紫' },
];

export default function FukubikiAnimation({
  playing,
  result,
  showResult,
  onPlay,
  onReset,
  cost,
  canPlay,
}: FukubikiAnimationProps) {
  const [shaking, setShaking] = useState(false);
  const [ballOut, setBallOut] = useState(false);
  const [finalBall, setFinalBall] = useState(BALL_COLORS[0]);
  
  useEffect(() => {
    if (playing && !showResult) {
      // 振る演出
      setShaking(true);
      setBallOut(false);
      
      // ランダムな球を選択
      const randomBall = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
      setFinalBall(randomBall);
      
      // 2秒後に振り終わり
      setTimeout(() => {
        setShaking(false);
        setBallOut(true);
      }, 2000);
    }
  }, [playing, showResult]);
  
  // 当たり時の紙吹雪
  useEffect(() => {
    if (showResult && result?.success && result?.is_winning) {
      const duration = 3000;
      const end = Date.now() + duration;
      
      const colors = finalBall.id === 'gold' 
        ? ['#FFD700', '#FFA500', '#FFFF00']
        : ['#FFD700', '#FFA500', '#FF6347'];
      
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [showResult, result, finalBall.id]);
  
  return (
    <div className="flex flex-col items-center">
      {/* 福引きマシン */}
      <div className="relative mb-8">
        {/* ガラガラ本体 */}
        <div className={`relative ${shaking ? 'animate-fukubiki-shake' : ''}`}>
          {/* 台座 */}
          <div className="w-64 h-8 bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-lg shadow-lg" />
          
          {/* 籠部分 */}
          <div className="relative w-64 h-48 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-[40%] overflow-hidden shadow-2xl border-4 border-amber-800">
            {/* 六角形の網目パターン */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="hexagons" width="10" height="10" patternUnits="userSpaceOnUse">
                  <polygon points="5,0 10,3 10,8 5,10 0,8 0,3" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
                <rect width="100" height="100" fill="url(#hexagons)" />
              </svg>
            </div>
            
            {/* 中の球たち */}
            <div className="absolute inset-4 flex flex-wrap justify-center items-center gap-1">
              {BALL_COLORS.map((ball, i) => (
                <div
                  key={ball.id}
                  className={`
                    w-6 h-6 rounded-full bg-gradient-to-br ${ball.color} shadow-lg
                    ${shaking ? 'animate-bounce' : ''}
                  `}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
              {BALL_COLORS.map((ball, i) => (
                <div
                  key={`${ball.id}-2`}
                  className={`
                    w-5 h-5 rounded-full bg-gradient-to-br ${ball.color} shadow-md
                    ${shaking ? 'animate-bounce' : ''}
                  `}
                  style={{ animationDelay: `${(i + 6) * 0.1}s` }}
                />
              ))}
            </div>
            
            {/* ハイライト */}
            <div className="absolute top-4 left-8 w-12 h-6 bg-white/20 rounded-full blur-sm" />
          </div>
          
          {/* ハンドル */}
          <div className={`
            absolute -right-8 top-16 w-4 h-24 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg
            ${shaking ? 'animate-handle-rotate' : ''}
          `}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg" />
          </div>
          
          {/* 球が出る穴 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-8 bg-black rounded-b-full shadow-inner">
            {/* 出てきた球 */}
            {ballOut && (
              <div className={`
                absolute top-0 left-1/2 -translate-x-1/2
                w-10 h-10 rounded-full bg-gradient-to-br ${finalBall.color}
                shadow-2xl ${finalBall.glow}
                animate-ball-pop
              `}>
                {/* 球のハイライト */}
                <div className="absolute top-1 left-2 w-3 h-3 bg-white/50 rounded-full" />
              </div>
            )}
          </div>
        </div>
        
        {/* 金色の当たり演出 */}
        {ballOut && finalBall.id === 'gold' && result?.is_winning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-400/30 rounded-full animate-ping" />
          </div>
        )}
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
                  {result.is_winning ? `🎊 ${finalBall.label}玉！大当たり！` : `${finalBall.label}玉...残念`}
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
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:scale-105 hover:shadow-lg active:scale-95'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
          `}
        >
          {playing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ガラガラ...
            </span>
          ) : (
            <span>{cost > 0 ? `${cost}pt で引く` : 'フリープレイ'}</span>
          )}
        </button>
      )}

      {!canPlay && !playing && !showResult && cost > 0 && (
        <p className="mt-4 text-red-300 text-sm">ポイントが足りません</p>
      )}

      <style jsx>{`
        @keyframes fukubiki-shake {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-15deg); }
          30% { transform: rotate(15deg); }
          50% { transform: rotate(-15deg); }
          70% { transform: rotate(15deg); }
          90% { transform: rotate(-10deg); }
        }
        .animate-fukubiki-shake {
          animation: fukubiki-shake 0.5s ease-in-out infinite;
        }

        @keyframes handle-rotate {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(360deg); }
        }
        .animate-handle-rotate {
          animation: handle-rotate 1s ease-in-out infinite;
        }

        @keyframes ball-pop {
          0% { transform: translate(-50%, -100%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, 100%) scale(1.2); opacity: 1; }
          75% { transform: translate(-50%, 80%) scale(0.9); }
          100% { transform: translate(-50%, 100%) scale(1); }
        }
        .animate-ball-pop {
          animation: ball-pop 0.8s ease-out forwards;
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



