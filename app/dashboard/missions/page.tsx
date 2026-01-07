'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getPointBalance } from '@/app/actions/gamification';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import DailyMissions from '@/components/gamification/DailyMissions';
import PointDisplay from '@/components/gamification/PointDisplay';
import {
  Target,
  ArrowLeft,
  Loader2,
  LogIn,
  Coins,
  Trophy,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function MissionsPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  // 認証チェック
  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // ポイント取得
        const balance = await getPointBalance(session.user.id);
        setTotalPoints(balance?.current_points || 0);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const balance = await getPointBalance(session.user.id);
          setTotalPoints(balance?.current_points || 0);
        } else {
          setUser(null);
          setTotalPoints(0);
        }
      });

      setLoading(false);
      return () => subscription.unsubscribe();
    }

    checkAuth();
  }, []);

  // ポイント獲得時のハンドラー
  const handlePointsEarned = (points: number) => {
    setTotalPoints(prev => prev + points);
    setRefreshTrigger(prev => prev + 1);
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // 未ログイン
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
        <Header user={user} onAuthClick={() => setShowAuth(true)} />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <Target className="w-20 h-20 text-teal-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">デイリーミッション</h1>
            <p className="text-gray-600 mb-8">
              ログインして毎日のミッションをクリアしよう！<br />
              ミッション達成でポイントをGETできます。
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              ログインして始める
            </button>
          </div>
        </main>
        <Footer />
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      <Header user={user} onAuthClick={() => setShowAuth(true)} />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ダッシュボードに戻る
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Target className="w-7 h-7 text-teal-600" />
                デイリーミッション
              </h1>
              <p className="text-gray-600 mt-1">毎日リセット・達成でポイントGET！</p>
            </div>
          </div>
        </div>

        {/* ポイント表示カード */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm mb-1">現在のポイント</p>
              <p className="text-4xl font-bold flex items-center gap-2">
                <Coins className="w-8 h-8 text-yellow-300" />
                {totalPoints.toLocaleString()}
                <span className="text-xl">pt</span>
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-teal-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date().toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 説明カード */}
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 mb-6 border border-teal-100">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">ミッションの遊び方</p>
              <ul className="space-y-1">
                <li>• 毎日0時（日本時間）にミッションがリセットされます</li>
                <li>• ミッションを達成したら「受取」ボタンでポイントをGET</li>
                <li>• 全ミッション達成でボーナスポイントがもらえます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* デイリーミッション */}
        <DailyMissions
          userId={user.id}
          onPointsEarned={handlePointsEarned}
        />

        {/* ポイントの使い道 */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            ポイントの使い道
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/gamification/new"
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors text-center"
            >
              <div className="text-3xl mb-2">🎰</div>
              <p className="font-medium text-gray-900">ガチャ</p>
              <p className="text-xs text-gray-500 mt-1">ポイントで景品をGET</p>
            </Link>
            <Link
              href="/gamification/new"
              className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors text-center"
            >
              <div className="text-3xl mb-2">🎫</div>
              <p className="font-medium text-gray-900">スタンプラリー</p>
              <p className="text-xs text-gray-500 mt-1">スタンプを集めて特典</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

