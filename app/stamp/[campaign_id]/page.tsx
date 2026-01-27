'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCampaign, getUserStamps, acquireStamp, getPointBalance } from '@/app/actions/gamification';
import { GamificationCampaign, UserStamp, StampRallySettings } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ContentFooter from '@/components/shared/ContentFooter';
import StampCard from '@/components/gamification/StampCard';
import { Loader2, Gift, CheckCircle, AlertCircle } from 'lucide-react';

export default function StampPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.campaign_id as string;
  const stampId = searchParams.get('stamp_id');

  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [campaign, setCampaign] = useState<GamificationCampaign | null>(null);
  const [stamps, setStamps] = useState<UserStamp[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acquiring, setAcquiring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [justAcquired, setJustAcquired] = useState<string | null>(null);

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

  // キャンペーンとスタンプ情報を取得
  useEffect(() => {
    async function loadData() {
      try {
        const [campaignData, stampsData, balanceData] = await Promise.all([
          getCampaign(campaignId),
          getUserStamps(campaignId),
          getPointBalance(),
        ]);

        setCampaign(campaignData);
        setStamps(stampsData);
        setCurrentPoints(balanceData?.current_points || 0);

        // stamp_idパラメータがある場合、スタンプを取得
        if (stampId && campaignData) {
          await handleAcquireStamp(campaignData, stampsData, stampId);
        }
      } catch (error) {
        console.error('Error loading stamp data:', error);
        setMessage({ type: 'error', text: 'データの読み込みに失敗しました' });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId, stampId]);

  // スタンプ取得処理
  async function handleAcquireStamp(
    campaignData: GamificationCampaign,
    currentStamps: UserStamp[],
    targetStampId: string
  ) {
    setAcquiring(true);
    try {
      const settings = campaignData.settings as StampRallySettings;
      const stampIds = settings.stamp_ids || [];
      const stampIndex = stampIds.indexOf(targetStampId);

      if (stampIndex === -1) {
        setMessage({ type: 'error', text: '無効なスタンプIDです' });
        return;
      }

      // すでに取得済みかチェック
      const alreadyAcquired = currentStamps.some(s => s.stamp_id === targetStampId);
      if (alreadyAcquired) {
        setMessage({ type: 'info', text: 'このスタンプはすでに取得済みです！' });
        return;
      }

      const result = await acquireStamp(campaignId, targetStampId, stampIndex);

      if (result.success) {
        setJustAcquired(targetStampId);
        setMessage({ 
          type: 'success', 
          text: `スタンプを獲得しました！ +${settings.points_per_stamp || 1}ポイント` 
        });
        
        // スタンプ一覧を更新
        const newStamps = await getUserStamps(campaignId);
        setStamps(newStamps);
        
        if (result.newBalance !== undefined) {
          setCurrentPoints(result.newBalance);
        }

        // コンプリートチェック
        if (newStamps.length >= (settings.total_stamps || 10)) {
          setTimeout(() => {
            setMessage({
              type: 'success',
              text: `🎉 全スタンプをコンプリートしました！ボーナス +${settings.completion_bonus || 0}ポイント！`,
            });
          }, 2000);
        }
      } else if (result.alreadyAcquired) {
        setMessage({ type: 'info', text: 'このスタンプはすでに取得済みです！' });
      } else {
        setMessage({ type: 'error', text: result.error || 'スタンプの取得に失敗しました' });
      }
    } catch (error) {
      console.error('Error acquiring stamp:', error);
      setMessage({ type: 'error', text: 'スタンプの取得に失敗しました' });
    } finally {
      setAcquiring(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </main>
        <Footer />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">キャンペーンが見つかりません</h1>
            <p className="text-gray-600">指定されたキャンペーンは存在しないか、終了しています。</p>
          </div>
        </main>
        <Footer />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  const settings = campaign.settings as StampRallySettings;
  const totalStamps = settings.total_stamps || 10;
  const acquiredCount = stamps.length;
  const progress = Math.round((acquiredCount / totalStamps) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{campaign.title}</h1>
            {campaign.description && (
              <p className="text-gray-600">{campaign.description}</p>
            )}
          </div>

          {/* ポイント表示 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">現在のポイント</p>
                <p className="text-2xl font-bold text-gray-800">{currentPoints.toLocaleString()} pt</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">進捗</p>
              <p className="text-lg font-semibold text-amber-600">
                {acquiredCount} / {totalStamps}
              </p>
            </div>
          </div>

          {/* メッセージ */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          {/* 進捗バー */}
          <div className="bg-white/60 rounded-full h-4 mb-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* スタンプカード */}
          <StampCard
            campaignId={campaignId}
            settings={settings}
            acquiredStamps={stamps}
            justAcquired={justAcquired}
            acquiring={acquiring}
          />

          {/* コンプリート特典 */}
          {settings.completion_bonus && settings.completion_bonus > 0 && (
            <div className="mt-8 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-amber-800 mb-2">🎁 コンプリート特典</h3>
              <p className="text-amber-700">
                全{totalStamps}個のスタンプを集めると
                <span className="font-bold text-xl mx-1">{settings.completion_bonus}</span>
                ポイントをプレゼント！
              </p>
            </div>
          )}
        </div>
      </main>
      <ContentFooter toolType="gamification" variant="light" />
      <Footer />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}

