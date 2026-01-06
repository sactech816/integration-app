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
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import CapsuleAnimation from '@/components/gamification/gacha/CapsuleAnimation';
import RouletteAnimation from '@/components/gamification/gacha/RouletteAnimation';
import OmikujiAnimation from '@/components/gamification/gacha/OmikujiAnimation';
import PointDisplay from '@/components/gamification/PointDisplay';
import { 
  Loader2, 
  Gift, 
  AlertCircle, 
  Sparkles, 
  Trophy,
  ChevronDown
} from 'lucide-react';

export default function GachaPage() {
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
        const [campaignData, prizesData, balanceData, userPrizesData] = await Promise.all([
          getCampaign(campaignId),
          getGachaPrizes(campaignId),
          getPointBalance(),
          getUserPrizes(),
        ]);

        setCampaign(campaignData);
        setPrizes(prizesData);
        setCurrentPoints(balanceData?.current_points || 0);
        setUserPrizes(userPrizesData.filter(p => p.campaign_id === campaignId));
      } catch (error) {
        console.error('Error loading gacha data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId]);

  // ガチャを回す
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
      const animationDuration = campaign.animation_type === 'roulette' ? 4000 : 3000;
      
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
      console.error('Error playing gacha:', error);
      setResult({ success: false, error_code: 'campaign_not_found' });
      setShowResult(true);
      setPlaying(false);
    }
  }, [campaign, campaignId, currentPoints, playing]);

  // リセット
  const handleReset = () => {
    setResult(null);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </main>
        <Footer />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">キャンペーンが見つかりません</h1>
            <p className="text-gray-300">指定されたガチャは存在しないか、終了しています。</p>
          </div>
        </main>
        <Footer />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const settings = campaign.settings as GachaSettings;
  const cost = settings.cost_per_play || 10;
  const canPlay = currentPoints >= cost;
  const animationType = campaign.animation_type || 'capsule';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              {campaign.title}
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </h1>
            {campaign.description && (
              <p className="text-purple-200">{campaign.description}</p>
            )}
          </div>

          {/* ポイント表示 */}
          <div className="flex justify-center mb-8">
            <PointDisplay 
              refreshTrigger={refreshTrigger} 
              size="lg" 
              showTotal 
            />
          </div>

          {/* ガチャアニメーションエリア */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
            {animationType === 'capsule' && (
              <CapsuleAnimation
                playing={playing}
                result={result}
                showResult={showResult}
                onPlay={handlePlay}
                onReset={handleReset}
                cost={cost}
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
                cost={cost}
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
                cost={cost}
                canPlay={canPlay}
              />
            )}
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
      <Footer />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

