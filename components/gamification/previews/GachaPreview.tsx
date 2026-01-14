'use client';

import React, { useState, useCallback } from 'react';
import { GachaPrize, GachaResult } from '@/lib/types';
import { mockGachaDraw } from '@/lib/gamification/mockGacha';
import CapsuleAnimation from '../gacha/CapsuleAnimation';
import RouletteAnimation from '../gacha/RouletteAnimation';
import OmikujiAnimation from '../gacha/OmikujiAnimation';
import { Sparkles, Coins } from 'lucide-react';

interface GachaPreviewProps {
  title: string;
  description: string;
  animationType: 'capsule' | 'roulette' | 'omikuji';
  costPerPlay: number;
  prizes: GachaPrize[];
  isTestMode: boolean;
}

export default function GachaPreview({
  title,
  description,
  animationType,
  costPerPlay,
  prizes,
  isTestMode,
}: GachaPreviewProps) {
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mockPoints, setMockPoints] = useState(100); // テスト用ポイント

  // テストプレイ
  const handlePlay = useCallback(() => {
    if (playing) return;
    if (mockPoints < costPerPlay) {
      setResult({ success: false, error_code: 'insufficient_points' });
      setShowResult(true);
      return;
    }

    setPlaying(true);
    setResult(null);
    setShowResult(false);
    setMockPoints(prev => prev - costPerPlay);

    // アニメーション時間後に結果表示
    const animationDuration = animationType === 'roulette' ? 4000 : 3000;

    setTimeout(() => {
      const gachaResult = mockGachaDraw(prizes);
      setResult(gachaResult);
      setShowResult(true);
      setPlaying(false);
    }, animationDuration);
  }, [animationType, costPerPlay, mockPoints, playing, prizes]);

  // リセット
  const handleReset = () => {
    setResult(null);
    setShowResult(false);
  };

  // ポイントリセット（テスト用）
  const resetPoints = () => {
    setMockPoints(100);
    handleReset();
  };

  const canPlay = mockPoints >= costPerPlay;

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-4">
      {/* テストモード表示 */}
      {isTestMode && (
        <div className="absolute top-12 left-0 right-0 bg-yellow-500 text-yellow-900 text-center py-1 text-xs font-bold">
          テストモード（DBに保存されません）
        </div>
      )}

      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          {title || 'ガチャ'}
        </h1>
        {description && (
          <p className="text-purple-200 text-sm">{description}</p>
        )}
      </div>

      {/* ポイント表示（テスト用） */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold">{mockPoints} pt</span>
          {isTestMode && (
            <button
              onClick={resetPoints}
              className="text-xs text-purple-300 hover:text-white ml-2 underline"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* アニメーションエリア */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        {animationType === 'capsule' && (
          <CapsuleAnimation
            playing={playing}
            result={result}
            showResult={showResult}
            onPlay={handlePlay}
            onReset={handleReset}
            cost={costPerPlay}
            canPlay={canPlay}
          />
        )}
        {animationType === 'roulette' && (
          <RouletteAnimation
            prizes={prizes}
            playing={playing}
            result={result}
            showResult={showResult}
            onPlay={handlePlay}
            onReset={handleReset}
            cost={costPerPlay}
            canPlay={canPlay}
          />
        )}
        {animationType === 'omikuji' && (
          <OmikujiAnimation
            playing={playing}
            result={result}
            showResult={showResult}
            onPlay={handlePlay}
            onReset={handleReset}
            cost={costPerPlay}
            canPlay={canPlay}
          />
        )}
      </div>
    </div>
  );
}




















