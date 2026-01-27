'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  getCampaign, 
  getPointBalance,
  acquireStamp,
  getUserStamps
} from '@/app/actions/gamification';
import { 
  GamificationCampaign, 
  StampRallySettings,
  UserStamp
} from '@/lib/types';
import AuthModal from '@/components/shared/AuthModal';
import ContentFooter from '@/components/shared/ContentFooter';
import StampCard from '@/components/gamification/StampCard';
import PointDisplay from '@/components/gamification/PointDisplay';
import { 
  Loader2, 
  Stamp as StampIcon,
  AlertCircle, 
  Sparkles, 
  Trophy,
  QrCode,
  CheckCircle
} from 'lucide-react';

export default function StampRallyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.campaign_id as string;
  const stampParam = searchParams.get('stamp'); // QRコードからのスタンプID

  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [campaign, setCampaign] = useState<GamificationCampaign | null>(null);
  const [acquiredStamps, setAcquiredStamps] = useState<UserStamp[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acquiring, setAcquiring] = useState(false);
  const [justAcquired, setJustAcquired] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stampMessage, setStampMessage] = useState<{ type: 'success' | 'error' | 'already'; message: string } | null>(null);

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
        const [campaignData, balanceData, stampsData] = await Promise.all([
          getCampaign(campaignId),
          getPointBalance(),
          getUserStamps(campaignId),
        ]);

        setCampaign(campaignData);
        setCurrentPoints(balanceData?.current_points || 0);
        setAcquiredStamps(stampsData || []);
      } catch (error) {
        console.error('Error loading stamp rally data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId]);

  // QRコードからスタンプ取得
  useEffect(() => {
    if (stampParam && campaign && !loading) {
      handleAcquireStamp(stampParam);
    }
  }, [stampParam, campaign, loading]);

  // スタンプ取得
  const handleAcquireStamp = useCallback(async (stampId: string) => {
    if (!campaign || acquiring) return;

    // 既に取得済みかチェック
    if (acquiredStamps.some(s => s.stamp_id === stampId)) {
      setStampMessage({ type: 'already', message: 'このスタンプは既に取得済みです' });
      setTimeout(() => setStampMessage(null), 3000);
      return;
    }

    setAcquiring(true);

    try {
      // スタンプのインデックスを取得
      const settings = campaign.settings as StampRallySettings;
      const stampIds = settings.stamp_ids || Array.from({ length: settings.total_stamps || 10 }, (_, i) => `stamp_${i + 1}`);
      const stampIndex = stampIds.indexOf(stampId);
      
      const result = await acquireStamp(campaignId, stampId, stampIndex >= 0 ? stampIndex : 0);
      
      if (result.success) {
        setJustAcquired(stampId);
        const pointsPerStamp = settings.points_per_stamp || 1;
        setStampMessage({ type: 'success', message: `スタンプを取得しました！ +${pointsPerStamp}pt` });
        
        // スタンプリストを更新
        const stampsData = await getUserStamps(campaignId);
        setAcquiredStamps(stampsData || []);
        
        // ポイント更新
        if (result.newBalance !== undefined) {
          setCurrentPoints(result.newBalance);
        }
        setRefreshTrigger(prev => prev + 1);

        setTimeout(() => {
          setJustAcquired(null);
          setStampMessage(null);
        }, 3000);
      } else if (result.alreadyAcquired) {
        setStampMessage({ type: 'already', message: 'このスタンプは既に取得済みです' });
        setTimeout(() => setStampMessage(null), 3000);
      } else {
        setStampMessage({ type: 'error', message: result.error || 'スタンプの取得に失敗しました' });
        setTimeout(() => setStampMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error acquiring stamp:', error);
      setStampMessage({ type: 'error', message: 'エラーが発生しました' });
      setTimeout(() => setStampMessage(null), 3000);
    } finally {
      setAcquiring(false);
    }
  }, [campaign, campaignId, acquiring, acquiredStamps]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">キャンペーンが見つかりません</h1>
          <p className="text-gray-600">指定されたスタンプラリーは存在しないか、終了しています。</p>
        </div>
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  const settings = campaign.settings as StampRallySettings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* メッセージ表示 */}
          {stampMessage && (
            <div className={`
              fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-lg
              animate-bounce
              ${stampMessage.type === 'success' ? 'bg-green-500 text-white' :
                stampMessage.type === 'already' ? 'bg-yellow-500 text-yellow-900' :
                'bg-red-500 text-white'}
            `}>
              <div className="flex items-center gap-2">
                {stampMessage.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {stampMessage.type === 'already' && <StampIcon className="w-5 h-5" />}
                {stampMessage.type === 'error' && <AlertCircle className="w-5 h-5" />}
                <span className="font-bold">{stampMessage.message}</span>
              </div>
            </div>
          )}

          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <StampIcon className="w-7 h-7 text-amber-600" />
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="text-gray-600">{campaign.description}</p>
            )}
          </div>

          {/* ポイント表示 */}
          <div className="flex justify-center mb-6">
            <PointDisplay 
              refreshTrigger={refreshTrigger} 
              size="lg" 
              showTotal 
            />
          </div>

          {/* スタンプカード */}
          <StampCard
            campaignId={campaignId}
            settings={settings}
            acquiredStamps={acquiredStamps}
            justAcquired={justAcquired}
            acquiring={acquiring}
          />

          {/* コンプリート表示 */}
          {acquiredStamps.length === settings.total_stamps && (
            <div className="mt-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl text-center shadow-lg">
              <Trophy className="w-12 h-12 mx-auto text-white mb-2" />
              <h3 className="text-xl font-bold text-white">コンプリート！</h3>
              <p className="text-yellow-100">
                おめでとうございます！全てのスタンプを集めました！
              </p>
            </div>
          )}

          {/* QRコードのヒント */}
          <div className="mt-6 p-4 bg-white/80 rounded-xl text-center">
            <QrCode className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              各スポットのQRコードをスキャンしてスタンプをゲット！
            </p>
          </div>
        </div>
      </main>
      <ContentFooter toolType="gamification" variant="light" />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}

