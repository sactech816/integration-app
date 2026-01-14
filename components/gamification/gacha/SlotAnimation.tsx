'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GachaResult } from '@/lib/types';
import { Gift, Sparkles, AlertCircle, RotateCcw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlotAnimationProps {
  playing: boolean;
  result: GachaResult | null;
  showResult: boolean;
  onPlay: () => void;
  onReset: () => void;
  cost: number;
  canPlay: boolean;
}

// スロットシンボル
const SYMBOLS = [
  { id: 'seven', emoji: '7️⃣', color: 'from-red-500 to-red-600' },
  { id: 'bar', emoji: '🎰', color: 'from-purple-500 to-purple-600' },
  { id: 'cherry', emoji: '🍒', color: 'from-pink-500 to-pink-600' },
  { id: 'bell', emoji: '🔔', color: 'from-yellow-500 to-yellow-600' },
  { id: 'watermelon', emoji: '🍉', color: 'from-green-500 to-green-600' },
  { id: 'plum', emoji: '🍇', color: 'from-indigo-500 to-indigo-600' },
  { id: 'lemon', emoji: '🍋', color: 'from-amber-400 to-amber-500' },
  { id: 'star', emoji: '⭐', color: 'from-orange-400 to-orange-500' },
];

// リールコンポーネント
function Reel({ 
  spinning, 
  finalSymbolIndex, 
  delay,
  stopped,
}: { 
  spinning: boolean; 
  finalSymbolIndex: number;
  delay: number;
  stopped: boolean;
}) {
  const reelRef = useRef<HTMLDivElement>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  
  useEffect(() => {
    if (!spinning) {
      // 停止時: 最終シンボルの位置に設定
      setCurrentOffset(finalSymbolIndex * 80);
      return;
    }
    
    if (stopped) {
      // このリールは停止済み
      setCurrentOffset(finalSymbolIndex * 80);
      return;
    }
    
    // スピン中: 高速でシンボルを回転
    let frame: number;
    let offset = currentOffset;
    const speed = 30; // ピクセル/フレーム
    
    const animate = () => {
      offset += speed;
      if (offset >= SYMBOLS.length * 80) {
        offset = 0;
      }
      setCurrentOffset(offset);
      frame = requestAnimationFrame(animate);
    };
    
    frame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [spinning, stopped, finalSymbolIndex, currentOffset]);
  
  // シンボルを3回繰り返して無限スクロール効果を出す
  const allSymbols = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS];
  
  return (
    <div className="relative w-20 h-24 overflow-hidden bg-black/50 rounded-xl border-4 border-yellow-500/50">
      <div
        ref={reelRef}
        className={`absolute top-0 left-0 w-full transition-transform ${stopped ? 'duration-300 ease-out' : 'duration-0'}`}
        style={{
          transform: `translateY(-${currentOffset % (SYMBOLS.length * 80)}px)`,
        }}
      >
        {allSymbols.map((symbol, idx) => (
          <div
            key={`${symbol.id}-${idx}`}
            className="w-20 h-20 flex items-center justify-center text-5xl"
          >
            {symbol.emoji}
          </div>
        ))}
      </div>
      {/* 上下のグラデーションマスク */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      {/* 中央のハイライトライン */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-yellow-400/50 transform -translate-y-1/2" />
    </div>
  );
}

export default function SlotAnimation({
  playing,
  result,
  showResult,
  onPlay,
  onReset,
  cost,
  canPlay,
}: SlotAnimationProps) {
  const [reelStates, setReelStates] = useState<{ stopped: boolean; symbolIndex: number }[]>([
    { stopped: false, symbolIndex: 0 },
    { stopped: false, symbolIndex: 0 },
    { stopped: false, symbolIndex: 0 },
  ]);
  const [allStopped, setAllStopped] = useState(false);
  
  // プレイ開始時にリールをスタート
  useEffect(() => {
    if (playing && !showResult) {
      // ランダムな最終シンボルを決定
      const finalSymbols = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      
      setReelStates([
        { stopped: false, symbolIndex: finalSymbols[0] },
        { stopped: false, symbolIndex: finalSymbols[1] },
        { stopped: false, symbolIndex: finalSymbols[2] },
      ]);
      setAllStopped(false);
      
      // 順番にリールを停止
      const stopTimes = [1500, 2200, 2900]; // 各リールの停止タイミング
      
      stopTimes.forEach((time, index) => {
        setTimeout(() => {
          setReelStates(prev => {
            const newStates = [...prev];
            newStates[index] = { ...newStates[index], stopped: true };
            return newStates;
          });
          
          // 最後のリールが停止したらフラグを立てる
          if (index === 2) {
            setTimeout(() => setAllStopped(true), 300);
          }
        }, time);
      });
    }
  }, [playing, showResult]);
  
  // 当たり時に紙吹雪
  useEffect(() => {
    if (showResult && result?.success && result?.is_winning) {
      const duration = 3000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [showResult, result]);
  
  // 3つ揃っているかチェック
  const isTriple = reelStates[0].symbolIndex === reelStates[1].symbolIndex && 
                   reelStates[1].symbolIndex === reelStates[2].symbolIndex;
  
  return (
    <div className="flex flex-col items-center">
      {/* スロットマシン */}
      <div className="relative mb-8">
        {/* マシン本体 */}
        <div className="bg-gradient-to-b from-yellow-600 to-amber-700 rounded-3xl p-6 shadow-2xl border-4 border-yellow-500">
          {/* タイトル */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-yellow-300" />
              SLOT
              <Zap className="w-6 h-6 text-yellow-300" />
            </h2>
          </div>
          
          {/* リール表示エリア */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-4 shadow-inner">
            <div className="flex gap-3 justify-center">
              {reelStates.map((state, index) => (
                <Reel
                  key={index}
                  spinning={playing && !showResult}
                  finalSymbolIndex={state.symbolIndex}
                  delay={index * 0.5}
                  stopped={state.stopped}
                />
              ))}
            </div>
          </div>
          
          {/* 装飾ライト */}
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  playing 
                    ? 'animate-pulse' 
                    : ''
                } ${
                  i % 2 === 0 
                    ? 'bg-red-500 shadow-red-500/50' 
                    : 'bg-yellow-400 shadow-yellow-400/50'
                } shadow-lg`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* 7が揃った時のエフェクト */}
        {allStopped && isTriple && reelStates[0].symbolIndex === 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 animate-ping bg-yellow-500/30 rounded-3xl" />
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
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 hover:shadow-lg active:scale-95 animate-pulse'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
          `}
        >
          {playing ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              回転中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {cost > 0 ? `${cost}pt で回す` : 'フリースロット'}
            </span>
          )}
        </button>
      )}

      {!canPlay && !playing && !showResult && cost > 0 && (
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























