'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GachaPrize, GachaResult } from '@/lib/types';
import { Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface RouletteAnimationProps {
  prizes: GachaPrize[];
  playing: boolean;
  result: GachaResult | null;
  showResult: boolean;
  onPlay: () => void;
  onReset: () => void;
  cost: number;
  canPlay: boolean;
}

export default function RouletteAnimation({
  prizes,
  playing,
  result,
  showResult,
  onPlay,
  onReset,
  cost,
  canPlay,
}: RouletteAnimationProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // カラーパレット
  const colors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600',
    'from-orange-500 to-orange-600',
  ];

  // 回転アニメーション
  useEffect(() => {
    if (playing && result?.prize_id) {
      // 当選した景品のインデックスを見つける
      const prizeIndex = prizes.findIndex(p => p.id === result.prize_id);
      if (prizeIndex === -1) return;

      // セグメントの角度
      const segmentAngle = 360 / prizes.length;
      // 最終的な角度（複数回転 + ターゲット位置）
      const targetRotation = 360 * 5 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));
      
      setRotation(targetRotation);
    }
  }, [playing, result, prizes]);

  // リセット時に回転をリセット
  useEffect(() => {
    if (!showResult && !playing) {
      setRotation(0);
    }
  }, [showResult, playing]);

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="flex flex-col items-center">
      {/* ルーレット */}
      <div className="relative w-72 h-72 mb-8">
        {/* 針（ポインター） */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
        </div>

        {/* ホイール */}
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/30"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: playing ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {prizes.map((prize, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              const largeArc = segmentAngle > 180 ? 1 : 0;
              
              const colorIndex = index % colors.length;
              const baseColor = colors[colorIndex].includes('red') ? '#ef4444' :
                              colors[colorIndex].includes('blue') ? '#3b82f6' :
                              colors[colorIndex].includes('green') ? '#22c55e' :
                              colors[colorIndex].includes('yellow') ? '#eab308' :
                              colors[colorIndex].includes('purple') ? '#a855f7' :
                              colors[colorIndex].includes('pink') ? '#ec4899' :
                              colors[colorIndex].includes('cyan') ? '#06b6d4' : '#f97316';

              // テキストの位置
              const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
              const textX = 50 + 32 * Math.cos(midAngle);
              const textY = 50 + 32 * Math.sin(midAngle);
              const textRotation = (startAngle + endAngle) / 2;

              return (
                <g key={prize.id}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={baseColor}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="4"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  >
                    {prize.name.length > 6 ? prize.name.slice(0, 6) + '...' : prize.name}
                  </text>
                </g>
              );
            })}
            {/* 中心円 */}
            <circle cx="50" cy="50" r="8" fill="white" />
            <circle cx="50" cy="50" r="6" fill="#1f2937" />
          </svg>
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
                <Sparkles className="w-6 h-6" />
                <span className="text-xl font-bold">
                  {result.is_winning ? '🎉 大当たり！' : '残念...'}
                </span>
              </div>
              <p className="text-lg font-medium">{result.prize_name}</p>
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
















