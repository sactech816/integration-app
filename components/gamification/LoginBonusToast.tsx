'use client';

import React, { useState, useEffect } from 'react';
import { 
  getActiveLoginBonusCampaign, 
  claimLoginBonus, 
  checkLoginBonusClaimed,
  getUserGamificationSettings,
  updateUserNotificationSettings 
} from '@/app/actions/gamification';
import { Gift, X, Sparkles, Settings, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

interface LoginBonusToastProps {
  userId?: string;
  onPointsEarned?: (points: number, newBalance: number) => void;
}

export default function LoginBonusToast({ userId, onPointsEarned }: LoginBonusToastProps) {
  const [visible, setVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hideForever, setHideForever] = useState(false);

  useEffect(() => {
    // セッションストレージで今日のチェック済みフラグを確認
    const today = new Date().toISOString().split('T')[0];
    const checkedKey = `login_bonus_checked_${today}`;
    
    if (typeof window !== 'undefined' && sessionStorage.getItem(checkedKey)) {
      return; // 今日すでにチェック済み
    }

    async function checkAndClaimBonus() {
      try {
        console.log('[LoginBonusToast] Checking login bonus, userId:', userId);
        
        // ユーザー設定を確認して非表示設定されているかチェック
        if (userId) {
          const settings = await getUserGamificationSettings(userId);
          console.log('[LoginBonusToast] User settings:', settings);
          
          if (settings?.hide_login_bonus_toast) {
            // 非表示設定されているのでスキップ（ポイントは付与する）
            console.log('[LoginBonusToast] Toast is hidden, but claiming points silently');
            const campaign = await getActiveLoginBonusCampaign();
            if (campaign) {
              console.log('[LoginBonusToast] Active campaign found:', campaign.id);
              const result = await claimLoginBonus(campaign.id, userId);
              console.log('[LoginBonusToast] Silent claim result:', result);
            } else {
              console.log('[LoginBonusToast] No active login bonus campaign');
            }
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(checkedKey, 'true');
            }
            return;
          }
        }

        // アクティブなログインボーナスキャンペーンを取得
        console.log('[LoginBonusToast] Getting active campaign...');
        const campaign = await getActiveLoginBonusCampaign();
        if (!campaign) {
          console.log('[LoginBonusToast] No active campaign found');
          return;
        }
        console.log('[LoginBonusToast] Active campaign:', campaign);

        // 今日すでに取得済みかチェック
        const alreadyClaimed = await checkLoginBonusClaimed(campaign.id, userId);
        console.log('[LoginBonusToast] Already claimed today:', alreadyClaimed);
        
        if (alreadyClaimed) {
          // チェック済みフラグを立てる
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(checkedKey, 'true');
          }
          return;
        }

        // ログインボーナスを取得
        console.log('[LoginBonusToast] Claiming login bonus...');
        const result = await claimLoginBonus(campaign.id, userId);
        console.log('[LoginBonusToast] Claim result:', result);
        
        if (result.success && result.points) {
          console.log('[LoginBonusToast] Login bonus granted:', result.points);
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

          // 自動非表示（8秒後）
          setTimeout(() => {
            if (!dismissed) {
              setVisible(false);
            }
          }, 8000);
        } else {
          // 取得済みの場合もフラグを立てる
          console.log('[LoginBonusToast] Not granted (already claimed or error)');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(checkedKey, 'true');
          }
        }
      } catch (error) {
        console.error('[LoginBonusToast] Error checking login bonus:', error);
      }
    }

    // 少し遅延させてから実行（ページ読み込み後）
    const timer = setTimeout(checkAndClaimBonus, 1500);
    return () => clearTimeout(timer);
  }, [userId, onPointsEarned, dismissed]);

  const handleDismiss = async () => {
    // 「今後表示しない」がチェックされている場合
    if (hideForever && userId) {
      await updateUserNotificationSettings(userId, {
        hide_login_bonus_toast: true,
      });
    }
    
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
        p-4 min-w-[300px]
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

      <div className="flex items-center gap-4 mb-3">
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

      {/* アーケードへのジャンプボタン */}
      <Link
        href="/arcade"
        className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors mb-3"
      >
        <Gamepad2 className="w-4 h-4" />
        ゲームで遊ぶ
      </Link>

      {/* 今後表示しないチェックボックス */}
      {userId && (
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <label className="flex items-center gap-2 cursor-pointer text-xs opacity-80 hover:opacity-100 transition-opacity">
            <input
              type="checkbox"
              checked={hideForever}
              onChange={(e) => setHideForever(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/50 bg-white/20 text-amber-600"
            />
            <span>今後表示しない</span>
          </label>
          <Link
            href="/dashboard/settings/notifications"
            className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            <Settings className="w-3 h-3" />
            設定
          </Link>
        </div>
      )}

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


