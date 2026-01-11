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
import CapsuleAnimation from '@/components/gamification/gacha/CapsuleAnimation';
import RouletteAnimation from '@/components/gamification/gacha/RouletteAnimation';
import OmikujiAnimation from '@/components/gamification/gacha/OmikujiAnimation';
import SlotAnimation from '@/components/gamification/gacha/SlotAnimation';
import ScratchAnimation from '@/components/gamification/gacha/ScratchAnimation';
import FukubikiAnimation from '@/components/gamification/gacha/FukubikiAnimation';
import { 
  Loader2, 
  AlertCircle, 
  LogIn,
  Coins,
} from 'lucide-react';
import { mockGachaDraw } from '@/lib/gamification/mockGacha';

type EmbedType = 'gacha' | 'slot' | 'scratch' | 'fukubiki';

export default function EmbedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = params.type as EmbedType;
  const campaignId = params.campaign_id as string;
  const theme = searchParams.get('theme') || 'dark'; // dark or light
  const hidePoints = searchParams.get('hidePoints') === 'true';

  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<GamificationCampaign | null>(null);
  const [prizes, setPrizes] = useState<GachaPrize[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);

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
        const [campaignData, prizesData, balanceData] = await Promise.all([
          getCampaign(campaignId),
          getGachaPrizes(campaignId),
          getPointBalance(),
        ]);

        setCampaign(campaignData);
        setPrizes(prizesData);
        setCurrentPoints(balanceData?.current_points || 0);
      } catch (error) {
        console.error('Error loading embed data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [campaignId]);

  // プレイ
  const handlePlay = useCallback(async () => {
    if (!campaign || playing) return;

    const settings = campaign.settings as GachaSettings;
    const cost = settings.cost_per_play || 10;

    if (!user) {
      // 未ログインの場合はデモプレイ
      setPlaying(true);
      setResult(null);
      setShowResult(false);

      setTimeout(() => {
        const mockResult = mockGachaDraw(prizes);
        setResult(mockResult);
        setShowResult(true);
        setPlaying(false);
      }, 3000);
      return;
    }

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
      
      setTimeout(() => {
        setResult(gachaResult);
        setShowResult(true);
        setPlaying(false);

        if (gachaResult.success && gachaResult.new_balance !== undefined) {
          setCurrentPoints(gachaResult.new_balance);
        }
      }, 3000);
    } catch (error) {
      console.error('Error playing:', error);
      setResult({ success: false, error_code: 'campaign_not_found' });
      setShowResult(true);
      setPlaying(false);
    }
  }, [campaign, campaignId, currentPoints, playing, prizes, user]);

  // リセット
  const handleReset = () => {
    setResult(null);
    setShowResult(false);
  };

  const bgClass = theme === 'light' 
    ? 'bg-gradient-to-br from-gray-50 to-gray-100' 
    : 'bg-gradient-to-br from-gray-900 to-gray-800';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">キャンペーンが見つかりません</p>
        </div>
      </div>
    );
  }

  const settings = campaign.settings as GachaSettings;
  const cost = settings.cost_per_play || 10;
  const canPlay = user ? currentPoints >= cost : true; // 未ログインはデモ

  // アニメーションコンポーネントを選択
  const renderAnimation = () => {
    const props = {
      playing,
      result,
      showResult,
      onPlay: handlePlay,
      onReset: handleReset,
      cost: user ? cost : 0,
      canPlay,
    };

    switch (type) {
      case 'slot':
        return <SlotAnimation {...props} />;
      case 'scratch':
        return <ScratchAnimation {...props} />;
      case 'fukubiki':
        return <FukubikiAnimation {...props} />;
      case 'gacha':
      default:
        const animationType = campaign.animation_type || 'capsule';
        switch (animationType) {
          case 'roulette':
            return <RouletteAnimation prizes={prizes} {...props} />;
          case 'omikuji':
            return <OmikujiAnimation {...props} />;
          default:
            return <CapsuleAnimation {...props} />;
        }
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} p-4`}>
      {/* タイトル */}
      <div className="text-center mb-4">
        <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          {campaign.title}
        </h1>
      </div>

      {/* ポイント表示 */}
      {!hidePoints && user && (
        <div className="flex justify-center mb-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            theme === 'light' ? 'bg-white shadow' : 'bg-white/10'
          }`}>
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className={`font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              {currentPoints.toLocaleString()} pt
            </span>
          </div>
        </div>
      )}

      {/* 未ログイン通知 */}
      {!user && (
        <div className={`text-center mb-4 p-3 rounded-lg ${
          theme === 'light' ? 'bg-yellow-50 text-yellow-800' : 'bg-yellow-500/20 text-yellow-200'
        }`}>
          <LogIn className="w-4 h-4 inline mr-1" />
          <span className="text-sm">デモプレイ中（ログインで実際にプレイ可能）</span>
        </div>
      )}

      {/* アニメーション */}
      <div className={`rounded-2xl p-6 ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-black/30'}`}>
        {renderAnimation()}
      </div>

      {/* クレジット */}
      <div className="text-center mt-4">
        <a 
          href="https://makers.tokyo" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-white/40'} hover:opacity-80`}
        >
          Powered by 集客メーカー
        </a>
      </div>
    </div>
  );
}














