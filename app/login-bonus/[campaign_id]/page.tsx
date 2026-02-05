'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  getCampaign, 
  getPointBalance,
  claimLoginBonus,
  checkLoginBonusClaimed
} from '@/app/actions/gamification';
import { 
  GamificationCampaign, 
  LoginBonusSettings
} from '@/lib/types';
import AuthModal from '@/components/shared/AuthModal';
import ContentFooter from '@/components/shared/ContentFooter';
import PointDisplay from '@/components/gamification/PointDisplay';
import { 
  Loader2, 
  Calendar,
  AlertCircle, 
  Sparkles, 
  Gift,
  Check,
  Coins
} from 'lucide-react';

export default function LoginBonusPage() {
  const params = useParams();
  const campaignId = params.campaign_id as string;

  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [campaign, setCampaign] = useState<GamificationCampaign | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  // 認証状態の監視
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // データ読み込み
  useEffect(() => {
    async function loadData() {
      try {
        // userはこの時点ではnullの可能性があるため、PointDisplayコンポーネントで取得する
        const [campaignData, claimedToday] = await Promise.all([
          getCampaign(campaignId),
          checkLoginBonusClaimed(campaignId),
        ]);

        setCampaign(campaignData);
        setClaimed(claimedToday);
      } catch (error) {
        console.error('Error loading login bonus data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId]);

  // ログインボーナス受け取り
  const handleClaim = useCallback(async () => {
    if (!campaign || claiming || claimed) return;

    setClaiming(true);
    setShowAnimation(true);

    try {
      const result = await claimLoginBonus(campaignId);
      
      if (result.success) {
        setClaimed(true);
        setClaimMessage(`+${result.points || 0}pt ゲット！`);
        
        if (result.newBalance !== undefined) {
          setCurrentPoints(result.newBalance);
        }
        setRefreshTrigger(prev => prev + 1);

        setTimeout(() => {
          setShowAnimation(false);
          setClaimMessage(null);
        }, 3000);
      } else if (result.alreadyClaimed) {
        setClaimed(true);
        setClaimMessage('本日は既に受け取り済みです');
        setTimeout(() => {
          setShowAnimation(false);
          setClaimMessage(null);
        }, 3000);
      } else {
        setClaimMessage(result.error || '受け取りに失敗しました');
        setTimeout(() => {
          setShowAnimation(false);
          setClaimMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error claiming login bonus:', error);
      setClaimMessage('エラーが発生しました');
      setTimeout(() => {
        setShowAnimation(false);
        setClaimMessage(null);
      }, 3000);
    } finally {
      setClaiming(false);
    }
  }, [campaign, campaignId, claiming, claimed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">キャンペーンが見つかりません</h1>
          <p className="text-gray-600">指定されたログインボーナスは存在しないか、終了しています。</p>
        </div>
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  const settings = campaign.settings as LoginBonusSettings;
  const today = new Date();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];

  // 過去7日間のカレンダー
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.getDate(),
      isToday: i === 6,
      isPast: i < 6,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <Calendar className="w-7 h-7 text-blue-600" />
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="text-gray-600">{campaign.description}</p>
            )}
          </div>

          {/* ポイント表示 */}
          <div className="flex justify-center mb-6">
            <PointDisplay 
              userId={user?.id}
              refreshTrigger={refreshTrigger} 
              size="lg" 
              showTotal 
            />
          </div>

          {/* カレンダー風表示 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-gray-700">今週のログイン</span>
              <span className="text-sm text-gray-500">
                {today.getMonth() + 1}月{today.getDate()}日（{dayOfWeek}）
              </span>
            </div>

            {/* 週間カレンダー */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
                  {d}
                </div>
              ))}
              {last7Days.map((day, i) => (
                <div
                  key={i}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-bold
                    ${day.isToday 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' 
                      : day.isPast 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-gray-50 text-gray-300'}
                  `}
                >
                  {day.isPast && !day.isToday && <Check className="w-4 h-4 text-green-500" />}
                  {day.isToday && day.day}
                </div>
              ))}
            </div>
          </div>

          {/* ボーナス受け取りカード */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="text-center">
              {/* ギフトアイコン */}
              <div className={`
                w-24 h-24 mx-auto mb-4 rounded-2xl
                flex items-center justify-center
                ${claimed 
                  ? 'bg-green-100' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'}
                ${showAnimation ? 'animate-bounce' : ''}
              `}>
                {claimed ? (
                  <Check className="w-12 h-12 text-green-600" />
                ) : (
                  <Gift className="w-12 h-12 text-white" />
                )}
              </div>

              {/* テキスト */}
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {claimed ? '本日受け取り済み！' : '今日のボーナス'}
              </h3>
              <p className="text-3xl font-black text-blue-600 mb-6">
                +{settings.points_per_day} pt
              </p>

              {/* メッセージ */}
              {claimMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl font-bold animate-pulse">
                  {claimMessage}
                </div>
              )}

              {/* ボタン */}
              <button
                onClick={handleClaim}
                disabled={claimed || claiming}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2
                  transition-all
                  ${claimed 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : claiming
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'}
                `}
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    受け取り中...
                  </>
                ) : claimed ? (
                  <>
                    <Check className="w-5 h-5" />
                    受け取り済み
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    ボーナスを受け取る
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 説明 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>毎日ログインしてポイントを貯めよう！</p>
          </div>
        </div>
      </main>
      <ContentFooter toolType="gamification" variant="light" />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}

