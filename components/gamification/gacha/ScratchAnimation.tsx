'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GachaResult } from '@/lib/types';
import { Gift, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScratchAnimationProps {
  playing: boolean;
  result: GachaResult | null;
  showResult: boolean;
  onPlay: () => void;
  onReset: () => void;
  cost: number;
  canPlay: boolean;
}

export default function ScratchAnimation({
  playing,
  result,
  showResult,
  onPlay,
  onReset,
  cost,
  canPlay,
}: ScratchAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [cardReady, setCardReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  
  const REVEAL_THRESHOLD = 50; // 50%削ったら結果表示
  
  // スクラッチカードを初期化
  const initScratchCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // スクラッチ面を描画（銀色のグラデーション）
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.5, '#E8E8E8');
    gradient.addColorStop(1, '#A8A8A8');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 「削ってね！」テキスト
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ここを削ってね！', canvas.width / 2, canvas.height / 2);
    
    // 削り方設定
    ctx.globalCompositeOperation = 'destination-out';
  }, []);
  
  // 削り処理
  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = (x - rect.left) * (canvas.width / rect.width);
    const canvasY = (y - rect.top) * (canvas.height / rect.height);
    
    // 削る（円形で削る）
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // 前のポイントからの線も削る（スムーズな削り）
    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(canvasX, canvasY);
      ctx.lineWidth = 50;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    
    lastPointRef.current = { x: canvasX, y: canvasY };
    
    // 削った割合を計算
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }
    
    const progress = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchProgress(progress);
    
    // 閾値を超えたら自動で全表示
    if (progress >= REVEAL_THRESHOLD && !revealed) {
      setRevealed(true);
      
      // 当たりなら紙吹雪
      if (result?.is_winning) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
      }
    }
  }, [result, revealed]);
  
  // マウス/タッチイベントハンドラー
  const handleScratchStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!cardReady || revealed) return;
    
    e.preventDefault();
    setIsScratching(true);
    
    const point = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    
    scratch(point.x, point.y);
  }, [cardReady, revealed, scratch]);
  
  const handleScratchMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || !cardReady || revealed) return;
    
    e.preventDefault();
    
    const point = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    
    scratch(point.x, point.y);
  }, [isScratching, cardReady, revealed, scratch]);
  
  const handleScratchEnd = useCallback(() => {
    setIsScratching(false);
    lastPointRef.current = null;
  }, []);
  
  // playingが変化したらカードを準備
  useEffect(() => {
    if (playing && result) {
      setCardReady(true);
      setRevealed(false);
      setScratchProgress(0);
      lastPointRef.current = null;
      
      // 少し遅延してから初期化（DOMが準備されるのを待つ）
      setTimeout(() => {
        initScratchCard();
      }, 100);
    }
  }, [playing, result, initScratchCard]);
  
  // リセット時
  const handleReset = () => {
    setCardReady(false);
    setRevealed(false);
    setScratchProgress(0);
    lastPointRef.current = null;
    onReset();
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* スクラッチカード */}
      <div className="relative mb-8">
        {!cardReady ? (
          // カード購入前
          <div className="w-72 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center">
            <div className="text-center text-white">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <p className="font-bold text-lg">スクラッチカード</p>
              <p className="text-sm opacity-80">削って景品をGET!</p>
            </div>
          </div>
        ) : (
          // カード購入後（スクラッチ可能）
          <div className="relative w-72 h-48 rounded-2xl overflow-hidden shadow-2xl">
            {/* 結果の背景 */}
            <div className={`
              absolute inset-0 flex items-center justify-center p-4
              ${result?.is_winning 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : 'bg-gradient-to-br from-gray-400 to-gray-600'}
            `}>
              <div className="text-center text-white">
                {result?.is_winning && (
                  <Sparkles className="w-10 h-10 mx-auto mb-2 text-yellow-200" />
                )}
                <p className="font-bold text-xl mb-1">
                  {result?.is_winning ? '🎉 当たり！' : '残念...'}
                </p>
                <p className="font-medium">{result?.prize_name}</p>
                {result?.prize_image_url && (
                  <img 
                    src={result.prize_image_url} 
                    alt={result.prize_name}
                    className="w-16 h-16 mx-auto mt-2 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
            
            {/* スクラッチ用キャンバス */}
            {!revealed && (
              <canvas
                ref={canvasRef}
                width={288}
                height={192}
                className="absolute inset-0 cursor-pointer touch-none"
                onMouseDown={handleScratchStart}
                onMouseMove={handleScratchMove}
                onMouseUp={handleScratchEnd}
                onMouseLeave={handleScratchEnd}
                onTouchStart={handleScratchStart}
                onTouchMove={handleScratchMove}
                onTouchEnd={handleScratchEnd}
              />
            )}
            
            {/* 枠 */}
            <div className="absolute inset-0 border-4 border-yellow-500 rounded-2xl pointer-events-none" />
          </div>
        )}
        
        {/* 進捗表示 */}
        {cardReady && !revealed && (
          <div className="mt-4 text-center">
            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-yellow-400 transition-all duration-100"
                style={{ width: `${Math.min(scratchProgress * 2, 100)}%` }}
              />
            </div>
            <p className="text-white/60 text-sm mt-2">
              {scratchProgress < REVEAL_THRESHOLD 
                ? '指でこすって削ろう！' 
                : ''}
            </p>
          </div>
        )}
      </div>

      {/* 結果表示（削り終わった後） */}
      {revealed && result && (
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
                  {result.is_winning ? '🎉 おめでとう！' : 'またチャレンジ！'}
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
      {revealed || showResult ? (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          もう一枚引く
        </button>
      ) : !cardReady ? (
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
              準備中...
            </span>
          ) : (
            <span>{cost > 0 ? `${cost}pt でカードを買う` : 'フリーカード'}</span>
          )}
        </button>
      ) : null}

      {!canPlay && !playing && !cardReady && cost > 0 && (
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


