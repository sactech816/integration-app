'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  getCampaign, 
  getGachaPrizes, 
  getPointBalance, 
  playGacha,
  getUserPrizes 
} from '@/app/actions/gamification';
import { 
  GamificationCampaign, 
  GachaPrize, 
  GachaResult, 
  UserPrize,
  GachaSettings 
} from '@/lib/types';
import AuthModal from '@/components/shared/AuthModal';
import ContentFooter from '@/components/shared/ContentFooter';
import FukubikiAnimation from '@/components/gamification/gacha/FukubikiAnimation';
import PointDisplay from '@/components/gamification/PointDisplay';
import { 
  Loader2, 
  Gift, 
  AlertCircle, 
  Sparkles, 
  Trophy,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { getAdminEmails } from '@/lib/constants';
import { mockGachaDraw } from '@/lib/gamification/mockGacha';

export default function FukubikiPage() {
  const params = useParams();
  const campaignId = params.campaign_id as string;

  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [campaign, setCampaign] = useState<GamificationCampaign | null>(null);
  const [prizes, setPrizes] = useState<GachaPrize[]>([]);
  const [userPrizes, setUserPrizes] = useState<UserPrize[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showPrizeList, setShowPrizeList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // 管理者チェック
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );
  const isOwner = user?.id && campaign?.owner_id === user.id;

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
        const [campaignData, prizesData, userPrizesData] = await Promise.all([
          getCampaign(campaignId),
          getGachaPrizes(campaignId),
          getUserPrizes(),
        ]);

        setCampaign(campaignData);
        setPrizes(prizesData);
        setUserPrizes(userPrizesData.filter(p => p.campaign_id === campaignId));
      } catch (error) {
        console.error('Error loading fukubiki data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId]);

  // userが確定したらポイントを取得
  useEffect(() => {
    async function loadPoints() {
      const balanceData = await getPointBalance(user?.id);
      setCurrentPoints(balanceData?.current_points || 0);
    }
    loadPoints();
  }, [user?.id]);

  // 福引きを引く（通常モード）
  const handlePlay = useCallback(async () => {
    if (!campaign || playing) return;

    const settings = campaign.settings as GachaSettings;
    const cost = settings.cost_per_play || 10;

    if (currentPoints < cost) {
      setResult({ success: false, error_code: 'insufficient_points' });
      setShowResult(true);
      return;
    }

    setPlaying(true);
    setResult(null);
    setShowResult(false);

    try {
      const gachaResult = await playGacha(campaignId);
      
      // アニメーション時間分待機
      const animationDuration = 3000;
      
      setTimeout(() => {
        setResult(gachaResult);
        setShowResult(true);
        setPlaying(false);

        if (gachaResult.success && gachaResult.new_balance !== undefined) {
          setCurrentPoints(gachaResult.new_balance);
          setRefreshTrigger(prev => prev + 1);
          
          // 獲得景品リストを更新
          if (gachaResult.is_winning) {
            getUserPrizes().then(data => {
              setUserPrizes(data.filter(p => p.campaign_id === campaignId));
            });
          }
        }
      }, animationDuration);
    } catch (error) {
      console.error('Error playing fukubiki:', error);
      setResult({ success: false, error_code: 'campaign_not_found' });
      setShowResult(true);
      setPlaying(false);
    }
  }, [campaign, campaignId, currentPoints, playing]);

  // 管理者用フリープレイ
  const handleAdminFreePlay = useCallback(() => {
    if (!campaign || playing || !prizes.length) return;

    setPlaying(true);
    setResult(null);
    setShowResult(false);

    const animationDuration = 3000;

    setTimeout(() => {
      const mockResult = mockGachaDraw(prizes);
      setResult(mockResult);
      setShowResult(true);
      setPlaying(false);
    }, animationDuration);
  }, [campaign, playing, prizes]);

  // リセット
  const handleReset = () => {
    setResult(null);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">キャンペーンが見つかりません</h1>
          <p className="text-gray-300">指定された福引きは存在しないか、終了しています。</p>
        </div>
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  const settings = campaign.settings as GachaSettings;
  const cost = settings.cost_per_play || 10;
  const canPlay = currentPoints >= cost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <span className="text-4xl">🎊</span>
              {campaign.title}
              <span className="text-4xl">🎊</span>
            </h1>
            {campaign.description && (
              <p className="text-pink-200">{campaign.description}</p>
            )}
          </div>

          {/* 管理者モード切替 */}
          {(isAdmin || isOwner) && (
            <div className="mb-6">
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`
                  w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${isAdminMode 
                    ? 'bg-yellow-500 text-yellow-900' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'}
                `}
              >
                <Shield className="w-5 h-5" />
                {isAdminMode ? '管理者モード ON（フリープレイ）' : '管理者モードに切替'}
              </button>
              {isAdminMode && (
                <p className="text-center text-yellow-300 text-sm mt-2">
                  ポイント消費なし・DB保存なしでテストプレイできます
                </p>
              )}
            </div>
          )}

          {/* ポイント表示 */}
          {!isAdminMode && (
            <div className="flex justify-center mb-8">
              <PointDisplay 
                userId={user?.id}
                refreshTrigger={refreshTrigger} 
                size="lg" 
                showTotal 
              />
            </div>
          )}

          {/* 福引きアニメーションエリア */}
          <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-8 mb-8">
            <FukubikiAnimation
              playing={playing}
              result={result}
              showResult={showResult}
              onPlay={isAdminMode ? handleAdminFreePlay : handlePlay}
              onReset={handleReset}
              cost={isAdminMode ? 0 : cost}
              canPlay={isAdminMode ? true : canPlay}
            />
          </div>

          {/* 景品一覧 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowPrizeList(!showPrizeList)}
              className="w-full p-4 flex items-center justify-between text-white hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <Gift className="w-5 h-5" />
                景品一覧
              </span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${showPrizeList ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showPrizeList && (
              <div className="p-4 pt-0 space-y-3">
                {prizes.map((prize) => (
                  <div
                    key={prize.id}
                    className={`
                      flex items-center gap-4 p-3 rounded-xl
                      ${prize.is_winning 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                        : 'bg-white/5'}
                    `}
                  >
                    {prize.image_url ? (
                      <img
                        src={prize.image_url}
                        alt={prize.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{prize.name}</span>
                        {prize.is_winning && (
                          <span className="px-2 py-0.5 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                            当たり
                          </span>
                        )}
                      </div>
                      {prize.description && (
                        <p className="text-sm text-white/60">{prize.description}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-white/50">
                      {prize.probability}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 獲得した景品 */}
          {userPrizes.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                獲得した景品
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userPrizes.map((userPrize) => (
                  <div
                    key={userPrize.id}
                    className="bg-white/10 rounded-xl p-3 text-center"
                  >
                    {userPrize.prize?.image_url ? (
                      <img
                        src={userPrize.prize.image_url}
                        alt={userPrize.prize?.name}
                        className="w-16 h-16 mx-auto rounded-lg object-cover mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-2">
                        <Gift className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <p className="text-sm font-medium text-white truncate">
                      {userPrize.prize?.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <ContentFooter toolType="gamification" variant="transparent" />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}




















