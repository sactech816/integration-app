'use client';

import React, { useState, useCallback } from 'react';
import { GachaPrize, GachaResult } from '@/lib/types';
import { mockGachaDraw } from '@/lib/gamification/mockGacha';
import CapsuleAnimation from '../gacha/CapsuleAnimation';
import RouletteAnimation from '../gacha/RouletteAnimation';
import OmikujiAnimation from '../gacha/OmikujiAnimation';
import ScratchAnimation from '../gacha/ScratchAnimation';
import FukubikiAnimation from '../gacha/FukubikiAnimation';
import SlotAnimation from '../gacha/SlotAnimation';
import { Sparkles, Coins, CreditCard, Zap, Gift } from 'lucide-react';

type GameType = 'gacha' | 'scratch' | 'fukubiki' | 'slot';

interface GamePreviewProps {
  gameType: GameType;
  title: string;
  description: string;
  animationType?: 'capsule' | 'roulette' | 'omikuji';
  costPerPlay: number;
  prizes: GachaPrize[];
  isTestMode: boolean;
}

// ゲームタイプごとの設定
const GAME_CONFIG: Record<GameType, {
  icon: React.ElementType;
  bgGradient: string;
  defaultTitle: string;
}> = {
  gacha: {
    icon: Gift,
    bgGradient: 'from-purple-900 via-indigo-900 to-blue-900',
    defaultTitle: 'ガチャ',
  },
  scratch: {
    icon: CreditCard,
    bgGradient: 'from-amber-600 via-orange-600 to-yellow-500',
    defaultTitle: 'スクラッチ',
  },
  fukubiki: {
    icon: Sparkles,
    bgGradient: 'from-red-900 via-pink-900 to-purple-900',
    defaultTitle: '福引',
  },
  slot: {
    icon: Zap,
    bgGradient: 'from-gray-900 via-red-900 to-orange-900',
    defaultTitle: 'スロット',
  },
};

export default function GamePreview({
  gameType,
  title,
  description,
  animationType = 'capsule',
  costPerPlay,
  prizes,
  isTestMode,
}: GamePreviewProps) {
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mockPoints, setMockPoints] = useState(100); // テスト用ポイント

  const config = GAME_CONFIG[gameType];
  const Icon = config.icon;

  // アニメーション時間を取得
  const getAnimationDuration = (): number => {
    switch (gameType) {
      case 'slot':
        return 3500;
      case 'fukubiki':
        return 3000;
      case 'scratch':
        return 0; // スクラッチはユーザー操作なので即時
      case 'gacha':
      default:
        return animationType === 'roulette' ? 4000 : 3000;
    }
  };

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

    const animationDuration = getAnimationDuration();

    // スクラッチの場合は即時結果をセット（スクラッチ後に表示）
    if (gameType === 'scratch') {
      const gachaResult = mockGachaDraw(prizes);
      setResult(gachaResult);
      setPlaying(false);
      return;
    }

    // その他はアニメーション後に結果表示
    setTimeout(() => {
      const gachaResult = mockGachaDraw(prizes);
      setResult(gachaResult);
      setShowResult(true);
      setPlaying(false);
    }, animationDuration);
  }, [gameType, animationType, costPerPlay, mockPoints, playing, prizes]);

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

  // アニメーションコンポーネントを選択
  const renderAnimation = () => {
    const commonProps = {
      playing,
      result,
      showResult,
      onPlay: handlePlay,
      onReset: handleReset,
      cost: costPerPlay,
      canPlay,
      prizes,
    };

    switch (gameType) {
      case 'scratch':
        return <ScratchAnimation {...commonProps} />;
      case 'fukubiki':
        return <FukubikiAnimation {...commonProps} />;
      case 'slot':
        return <SlotAnimation {...commonProps} />;
      case 'gacha':
      default:
        switch (animationType) {
          case 'roulette':
            return <RouletteAnimation {...commonProps} />;
          case 'omikuji':
            return <OmikujiAnimation {...commonProps} />;
          case 'capsule':
          default:
            return <CapsuleAnimation {...commonProps} />;
        }
    }
  };

  return (
    <div className={`min-h-full bg-gradient-to-br ${config.bgGradient} pt-12 pb-6 px-4`}>
      {/* テストモード表示 */}
      {isTestMode && (
        <div className="absolute top-12 left-0 right-0 bg-yellow-500 text-yellow-900 text-center py-1 text-xs font-bold">
          テストモード（DBに保存されません）
        </div>
      )}

      {/* タイトル */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
          <Icon className="w-5 h-5 text-yellow-400" />
          {title || config.defaultTitle}
        </h1>
        {description && (
          <p className="text-white/70 text-sm">{description}</p>
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
              className="text-xs text-white/60 hover:text-white ml-2 underline"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* アニメーションエリア */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4">
        {renderAnimation()}
      </div>

      {/* 消費ポイント表示 */}
      <div className="text-center mt-4 text-white/50 text-sm">
        1回: {costPerPlay} pt
      </div>
    </div>
  );
}

