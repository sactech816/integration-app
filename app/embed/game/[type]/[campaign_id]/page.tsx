'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
import SlotAnimation from '@/components/gamification/gacha/SlotAnimation';
import FukubikiAnimation from '@/components/gamification/gacha/FukubikiAnimation';
import ScratchAnimation from '@/components/gamification/gacha/ScratchAnimation';
import RouletteAnimation from '@/components/gamification/gacha/RouletteAnimation';
import PointDisplay from '@/components/gamification/PointDisplay';
import { 
  Loader2, 
  Sparkles, 
  Trophy
} from 'lucide-react';

export default function EmbedGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameType = params.type as string;
  const campaignId = params.campaign_id as string;
  
  // 埋め込みオプション
  const hidePoints = searchParams.get('hidePoints') === 'true';
  const hideHeader = searchParams.get('hideHeader') === 'true';
  const theme = searchParams.get('theme') || 'default';

  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<GamificationCampaign | null>(null);
  const [prizes, setPrizes] = useState<GachaPrize[]>([]);
  const [userPrizes, setUserPrizes] = useState<UserPrize[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);
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

  // データ読み込み
  useEffect(() => {
    async function loadData() {
      try {
        const [campaignData, prizesData, userPrizesData] = await Promise.all([
          getCampaign(campaignId),
          getGachaPrizes(campaignId),
          getUserPrizes(user?.id),
        ]);

        setCampaign(campaignData);
        setPrizes(prizesData);
        setUserPrizes(userPrizesData.filter(p => p.campaign_id === campaignId));
      } catch (error) {
        console.error('[EmbedGame] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId, user?.id]);

  // userが確定したらポイントを取得
  useEffect(() => {
    async function loadPoints() {
      const balanceData = await getPointBalance(user?.id);
      setCurrentPoints(balanceData?.current_points || 0);
    }
    loadPoints();
  }, [user?.id]);

  // 親ウィンドウにメッセージを送信
  const postMessageToParent = useCallback((message: any) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({
        source: 'gamification-embed',
        ...message
      }, '*');
    }
  }, []);

  // ゲームプレイ
  const handlePlay = useCallback(async () => {
    if (!campaign || playing) return;

    const settings = campaign.settings as GachaSettings;
    const cost = settings.cost_per_play || 10;

    console.log('[EmbedGame] Play button clicked, current points:', currentPoints, 'cost:', cost);

    if (currentPoints < cost) {
      console.warn('[EmbedGame] Insufficient points');
      setResult({ success: false, error_code: 'insufficient_points' });
      setShowResult(true);
      postMessageToParent({ type: 'error', message: 'insufficient_points' });
      return;
    }

    setPlaying(true);
    setResult(null);
    setShowResult(false);
    postMessageToParent({ type: 'play_started' });

    try {
      console.log('[EmbedGame] Calling playGacha for campaign:', campaignId);
      const gachaResult = await playGacha(campaignId, user?.id);
      console.log('[EmbedGame] Gacha result:', gachaResult);
      
      const animationDuration = 3500;
      
      setTimeout(() => {
        setResult(gachaResult);
        setShowResult(true);
        setPlaying(false);

        if (gachaResult.success && gachaResult.new_balance !== undefined) {
          console.log('[EmbedGame] Updating points to:', gachaResult.new_balance);
          setCurrentPoints(gachaResult.new_balance);
          setRefreshTrigger(prev => prev + 1);
          
          // 親ウィンドウに結果を通知
          postMessageToParent({
            type: 'play_result',
            result: {
              success: true,
              prize_name: gachaResult.prize_name,
              is_winning: gachaResult.is_winning,
              new_balance: gachaResult.new_balance,
            }
          });

          if (gachaResult.is_winning) {
            console.log('[EmbedGame] Won a prize, refreshing prize list');
            getUserPrizes(user?.id).then(data => {
              setUserPrizes(data.filter(p => p.campaign_id === campaignId));
            });
          }
        } else {
          console.error('[EmbedGame] Gacha failed:', gachaResult);
          postMessageToParent({
            type: 'play_result',
            result: { success: false, error: gachaResult.error_code }
          });
        }
      }, animationDuration);
    } catch (error) {
      console.error('[EmbedGame] Error playing game:', error);
      setResult({ success: false, error_code: 'campaign_not_found' });
      setShowResult(true);
      setPlaying(false);
      postMessageToParent({ type: 'error', message: 'play_failed' });
    }
  }, [campaign, campaignId, currentPoints, playing, postMessageToParent, user?.id]);

  const handleReset = () => {
    setResult(null);
    setShowResult(false);
    postMessageToParent({ type: 'reset' });
  };

  // テーマスタイル
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900';
      case 'light':
        return 'bg-gradient-to-br from-white via-gray-50 to-white';
      default:
        return 'bg-gradient-to-br from-gray-900 via-red-900 to-orange-900';
    }
  };

  // ゲームタイプに応じたアニメーションコンポーネント
  const renderAnimation = () => {
    const commonProps = {
      playing,
      result,
      showResult,
      onPlay: handlePlay,
      onReset: handleReset,
      cost: (campaign?.settings as GachaSettings)?.cost_per_play || 10,
      canPlay: currentPoints >= ((campaign?.settings as GachaSettings)?.cost_per_play || 10),
    };

    switch (gameType) {
      case 'slot':
        return <SlotAnimation {...commonProps} />;
      case 'fukubiki':
        return <FukubikiAnimation {...commonProps} />;
      case 'scratch':
        return <ScratchAnimation {...commonProps} />;
      case 'gacha':
      case 'roulette':
        return <RouletteAnimation {...commonProps} prizes={prizes} />;
      default:
        return <SlotAnimation {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeStyles()}`}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeStyles()}`}>
        <div className="text-center text-white">
          <p className="text-lg">キャンペーンが見つかりません</p>
        </div>
      </div>
    );
  }

  const settings = campaign.settings as GachaSettings;
  const cost = settings.cost_per_play || 10;
  const canPlay = currentPoints >= cost;

  return (
    <div className={`min-h-screen ${getThemeStyles()}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー（オプション） */}
          {!hideHeader && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                {campaign.title}
              </h1>
              {campaign.description && (
                <p className="text-white/80 text-sm">{campaign.description}</p>
              )}
            </div>
          )}

          {/* ポイント表示（オプション） */}
          {!hidePoints && (
            <div className="flex justify-center mb-6">
              <PointDisplay 
                userId={user?.id}
                refreshTrigger={refreshTrigger} 
                size="lg" 
                showTotal={false}
              />
            </div>
          )}

          {/* ゲームアニメーションエリア */}
          <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-6">
            {renderAnimation()}
          </div>

          {/* 獲得した景品（簡易版） */}
          {userPrizes.length > 0 && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                獲得した景品: {userPrizes.length}個
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
