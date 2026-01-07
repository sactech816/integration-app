'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { supabase, TABLES } from '@/lib/supabase';
import { getPointBalance } from '@/app/actions/gamification';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import PointDisplay from '@/components/gamification/PointDisplay';
import { 
  Gamepad2,
  Coins,
  Gift,
  Calendar,
  CreditCard,
  Sparkles,
  Zap,
  HelpCircle,
  Stamp,
  ArrowRight,
  Star,
  Trophy,
  Loader2,
  Lock
} from 'lucide-react';

interface GameType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  path: string;
  cost?: number;
  comingSoon?: boolean;
}

const GAME_TYPES: GameType[] = [
  {
    id: 'slot',
    title: 'スロット',
    description: '絵柄を揃えて大当たり！',
    icon: Zap,
    color: 'text-red-500',
    bgGradient: 'from-gray-800 via-red-900 to-orange-900',
    path: '/slot',
    cost: 10,
  },
  {
    id: 'scratch',
    title: 'スクラッチ',
    description: '削って当たりを狙おう！',
    icon: CreditCard,
    color: 'text-yellow-500',
    bgGradient: 'from-amber-600 via-orange-600 to-yellow-500',
    path: '/scratch',
    cost: 10,
  },
  {
    id: 'fukubiki',
    title: '福引',
    description: 'ガラガラ回して抽選！',
    icon: Sparkles,
    color: 'text-pink-500',
    bgGradient: 'from-red-900 via-pink-900 to-purple-900',
    path: '/fukubiki',
    cost: 10,
  },
  {
    id: 'gacha',
    title: 'ガチャ',
    description: 'カプセルから何が出る？',
    icon: Gift,
    color: 'text-purple-500',
    bgGradient: 'from-purple-600 via-pink-600 to-rose-600',
    path: '/gacha',
    cost: 10,
  },
  {
    id: 'login_bonus',
    title: 'ログインボーナス',
    description: '毎日ポイントGET！',
    icon: Calendar,
    color: 'text-blue-500',
    bgGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    path: '/login-bonus',
    cost: 0,
  },
  {
    id: 'point_quiz',
    title: 'ポイントクイズ',
    description: '正解でポイント獲得！',
    icon: HelpCircle,
    color: 'text-indigo-500',
    bgGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    path: '/point-quiz',
    cost: 0,
  },
  {
    id: 'stamp_rally',
    title: 'スタンプラリー',
    description: 'スタンプを集めよう！',
    icon: Stamp,
    color: 'text-amber-500',
    bgGradient: 'from-amber-500 via-orange-500 to-red-500',
    path: '/stamp-rally',
    comingSoon: true,
  },
];

interface SampleCampaign {
  id: string;
  type: string;
  slug?: string;
}

export default function ArcadePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sampleCampaigns, setSampleCampaigns] = useState<SampleCampaign[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 認証状態の監視
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

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
        // ポイント残高を取得
        const balance = await getPointBalance();
        setCurrentPoints(balance?.current_points || 0);

        // サンプルキャンペーンを取得（show_in_portalがtrueのもの、またはis_sampleがtrueのもの）
        if (supabase) {
          const { data: campaigns } = await supabase
            .from(TABLES.GAMIFICATION_CAMPAIGNS)
            .select('id, type, slug')
            .or('show_in_portal.eq.true,is_sample.eq.true')
            .eq('is_active', true)
            .limit(20);

          if (campaigns) {
            setSampleCampaigns(campaigns);
          }
        }
      } catch (error) {
        console.error('Error loading arcade data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [refreshTrigger]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // ゲームタイプに対応するサンプルキャンペーンを取得
  const getSampleCampaignPath = (gameType: GameType): string | null => {
    // ポイントクイズの場合はクイズのslugを使用
    if (gameType.id === 'point_quiz') {
      // とりあえず固定のパスを返す（実際のクイズがある場合）
      return null; // サンプルクイズがない場合はnull
    }

    const campaign = sampleCampaigns.find(c => c.type === gameType.id);
    if (campaign) {
      return `${gameType.path}/${campaign.id}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <main className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </main>
        <Footer />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      
      <main className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            ゲームセンター
          </h1>
          <p className="text-lg text-purple-200 max-w-xl mx-auto">
            ポイントを使って遊ぼう！当たればポイント増加！
          </p>
        </div>

        {/* ポイント表示 */}
        <div className="flex justify-center mb-10">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-8 py-4 border border-yellow-500/30">
            <div className="flex items-center gap-4">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-yellow-200/70 text-sm">所持ポイント</p>
                <p className="text-3xl font-black text-yellow-400">
                  {currentPoints.toLocaleString()} <span className="text-lg">pt</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ゲーム一覧 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {GAME_TYPES.map((game) => {
            const Icon = game.icon;
            const samplePath = getSampleCampaignPath(game);
            const isPlayable = !game.comingSoon && samplePath;
            const needsPoints = game.cost && game.cost > 0;

            return (
              <div
                key={game.id}
                className={`
                  relative group rounded-2xl overflow-hidden
                  ${game.comingSoon ? 'opacity-60' : ''}
                `}
              >
                {/* 背景グラデーション */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.bgGradient} opacity-80`} />
                
                {/* カード内容 */}
                <div className="relative p-6">
                  {/* アイコン */}
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* タイトル */}
                  <h3 className="text-xl font-bold text-white mb-1">
                    {game.title}
                  </h3>

                  {/* 説明 */}
                  <p className="text-white/70 text-sm mb-4">
                    {game.description}
                  </p>

                  {/* コスト表示 */}
                  {needsPoints && (
                    <div className="flex items-center gap-1.5 mb-4 text-yellow-300 text-sm">
                      <Coins className="w-4 h-4" />
                      <span>{game.cost} pt / 1回</span>
                    </div>
                  )}

                  {/* ボタン */}
                  {game.comingSoon ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white/50 font-medium">
                      <Lock className="w-4 h-4" />
                      準備中
                    </div>
                  ) : isPlayable ? (
                    <Link
                      href={samplePath}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-white/90 transition-colors"
                    >
                      遊ぶ
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/20 text-white/70 font-medium">
                      サンプル準備中
                    </div>
                  )}

                  {/* Coming Soon バッジ */}
                  {game.comingSoon && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                      COMING SOON
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 補足情報 */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>当たればポイント増加</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>アニメーション演出</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span>ポイントで遊べる</span>
            </div>
          </div>
        </div>

        {/* 自分で作成するリンク */}
        <div className="mt-12 text-center">
          <Link
            href="/gamification/new"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
            自分でゲームを作成する
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}

