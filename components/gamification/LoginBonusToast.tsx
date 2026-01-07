'use client';

import React, { useState, useEffect } from 'react';
import { getActiveLoginBonusCampaign, claimLoginBonus, checkLoginBonusClaimed } from '@/app/actions/gamification';
import { Gift, X, Sparkles } from 'lucide-react';

interface LoginBonusToastProps {
  userId?: string;
  onPointsEarned?: (points: number, newBalance: number) => void;
}

export default function LoginBonusToast({ userId, onPointsEarned }: LoginBonusToastProps) {
  const [visible, setVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // セッションストレージで今日のチェック済みフラグを確認
    const today = new Date().toISOString().split('T')[0];
    const checkedKey = `login_bonus_checked_${today}`;
    
    if (typeof window !== 'undefined' && sessionStorage.getItem(checkedKey)) {
      return; // 今日すでにチェック済み
    }

    async function checkAndClaimBonus() {
      try {
        // アクティブなログインボーナスキャンペーンを取得
        const campaign = await getActiveLoginBonusCampaign();
        if (!campaign) return;

        // 今日すでに取得済みかチェック
        const alreadyClaimed = await checkLoginBonusClaimed(campaign.id, userId);
        if (alreadyClaimed) {
          // チェック済みフラグを立てる
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(checkedKey, 'true');
          }
          return;
        }

        // ログインボーナスを取得
        const result = await claimLoginBonus(campaign.id, userId);
        
        if (result.success && result.points) {
          setPoints(result.points);
          setAnimating(true);
          setVisible(true);
          
          // チェック済みフラグを立てる
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(checkedKey, 'true');
          }

          // コールバック
          if (onPointsEarned && result.newBalance !== undefined) {
            onPointsEarned(result.points, result.newBalance);
          }

          // アニメーション終了
          setTimeout(() => setAnimating(false), 1000);

          // 自動非表示（5秒後）
          setTimeout(() => {
            if (!dismissed) {
              setVisible(false);
            }
          }, 5000);
        } else {
          // 取得済みの場合もフラグを立てる
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(checkedKey, 'true');
          }
        }
      } catch (error) {
        console.error('Error checking login bonus:', error);
      }
    }

    // 少し遅延させてから実行（ページ読み込み後）
    const timer = setTimeout(checkAndClaimBonus, 1500);
    return () => clearTimeout(timer);
  }, [userId, onPointsEarned, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        bg-gradient-to-r from-amber-500 to-orange-500
        text-white rounded-2xl shadow-2xl
        p-4 pr-10 min-w-[280px]
        transform transition-all duration-500 ease-out
        ${animating ? 'animate-bounce-in scale-110' : 'scale-100'}
      `}
    >
      {/* 閉じるボタン */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="閉じる"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-4">
        {/* アイコン */}
        <div className="relative">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8" />
          </div>
          {animating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-yellow-200 animate-ping" />
            </div>
          )}
        </div>

        {/* テキスト */}
        <div>
          <p className="text-sm font-medium opacity-90">ログインボーナス</p>
          <p className="text-2xl font-bold flex items-center gap-1">
            +{points}
            <span className="text-lg">pt</span>
          </p>
          <p className="text-xs opacity-75 mt-0.5">毎日ログインでポイントGET!</p>
        </div>
      </div>

      {/* 装飾的なキラキラ */}
      <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-200 rounded-full animate-pulse" />
      <div className="absolute bottom-3 right-12 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse delay-100" />
      <div className="absolute top-4 right-14 w-1 h-1 bg-yellow-200 rounded-full animate-pulse delay-200" />

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateY(-10%) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}


