'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { claimWelcomeBonus, getUserGamificationSettings, updateUserNotificationSettings } from '@/app/actions/gamification';
import { PartyPopper, X, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WelcomeBonusProps {
  userId: string;
  onPointsEarned?: (points: number) => void;
}

export default function WelcomeBonus({ userId, onPointsEarned }: WelcomeBonusProps) {
  const [visible, setVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState('');
  const [animating, setAnimating] = useState(false);
  const [hideForever, setHideForever] = useState(false);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // ローカルストレージでチェック済みフラグを確認
    const checkedKey = `welcome_bonus_checked_${userId}`;
    
    if (typeof window !== 'undefined' && localStorage.getItem(checkedKey)) {
      return; // すでにチェック済み
    }

    async function checkAndClaimBonus() {
      try {
        // ユーザー設定を取得して非表示設定を確認
        const settings = await getUserGamificationSettings(userId);
        if (settings?.hide_welcome_toast) {
          // 非表示設定されているのでスキップ
          if (typeof window !== 'undefined') {
            localStorage.setItem(checkedKey, 'true');
          }
          return;
        }

        // ウェルカムボーナスを取得
        const result = await claimWelcomeBonus(userId);
        
        if (result.success && result.points_granted > 0) {
          setPoints(result.points_granted);
          setMessage(result.message);
          setAnimating(true);
          setVisible(true);
          
          // 紙吹雪エフェクト
          fireConfetti();
          
          // コールバック
          if (onPointsEarned) {
            onPointsEarned(result.points_granted);
          }

          // アニメーション終了
          setTimeout(() => setAnimating(false), 1500);
        } else if (result.already_claimed) {
          // すでに取得済みなのでチェック済みフラグを立てる
          if (typeof window !== 'undefined') {
            localStorage.setItem(checkedKey, 'true');
          }
        }
      } catch (error) {
        console.error('Error claiming welcome bonus:', error);
      }
    }

    // 少し遅延させてから実行
    const timer = setTimeout(checkAndClaimBonus, 2000);
    return () => clearTimeout(timer);
  }, [userId, onPointsEarned, fireConfetti]);

  const handleDismiss = async () => {
    // 「今後表示しない」がチェックされている場合
    if (hideForever) {
      await updateUserNotificationSettings(userId, {
        hide_welcome_toast: true,
      });
    }
    
    // チェック済みフラグを立てる
    if (typeof window !== 'undefined') {
      localStorage.setItem(`welcome_bonus_checked_${userId}`, 'true');
    }
    
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`
          relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400
          text-white rounded-3xl shadow-2xl
          p-8 max-w-md mx-4
          transform transition-all duration-700 ease-out
          ${animating ? 'scale-110' : 'scale-100'}
        `}
      >
        {/* 閉じるボタン */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {/* アイコン */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <PartyPopper className="w-14 h-14 text-yellow-200" />
            </div>
            {animating && (
              <>
                <Sparkles className="absolute -top-2 -left-2 w-8 h-8 text-yellow-200 animate-ping" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-pink-200 animate-ping delay-100" />
                <Sparkles className="absolute -bottom-2 left-4 w-5 h-5 text-cyan-200 animate-ping delay-200" />
              </>
            )}
          </div>

          {/* タイトル */}
          <h2 className="text-2xl font-bold mb-2">ようこそ！🎉</h2>
          <p className="text-white/90 mb-6">{message || 'ウェルカムボーナスをプレゼント！'}</p>

          {/* ポイント表示 */}
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Gift className="w-10 h-10 text-yellow-200" />
              <div>
                <p className="text-4xl font-extrabold">
                  +{points}
                  <span className="text-2xl ml-1">pt</span>
                </p>
                <p className="text-sm text-white/80">ゲーミフィケーションで遊ぼう！</p>
              </div>
            </div>
          </div>

          {/* 今後表示しないチェックボックス */}
          <label className="flex items-center justify-center gap-2 mb-6 cursor-pointer text-sm text-white/80 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={hideForever}
              onChange={(e) => setHideForever(e.target.checked)}
              className="w-4 h-4 rounded border-white/50 bg-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span>今後このメッセージを表示しない</span>
          </label>

          {/* OKボタン */}
          <button
            onClick={handleDismiss}
            className="w-full bg-white text-purple-600 font-bold py-3 px-8 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            OK！ゲームを始める
          </button>
        </div>

        {/* 装飾的なキラキラ */}
        <div className="absolute top-8 left-8 w-3 h-3 bg-yellow-200 rounded-full animate-pulse" />
        <div className="absolute bottom-12 right-8 w-2 h-2 bg-pink-200 rounded-full animate-pulse delay-100" />
        <div className="absolute top-16 right-12 w-2 h-2 bg-cyan-200 rounded-full animate-pulse delay-200" />
        <div className="absolute bottom-20 left-12 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse delay-300" />
      </div>
    </div>
  );
}














