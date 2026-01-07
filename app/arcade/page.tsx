'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { supabase, TABLES } from '@/lib/supabase';
import { getPointBalance } from '@/app/actions/gamification';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import WelcomeBonus from '@/components/gamification/WelcomeBonus';
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
  Lock,
  TrendingUp
} from 'lucide-react';

// 固定のサンプルキャンペーンUUID（SQLで作成される）
const SAMPLE_CAMPAIGN_IDS = {
  slot: '11111111-1111-1111-1111-111111111111',
  scratch: '22222222-2222-2222-2222-222222222222',
  fukubiki: '33333333-3333-3333-3333-333333333333',
  gacha: '44444444-4444-4444-4444-444444444444',
  login_bonus: '55555555-5555-5555-5555-555555555555',
  stamp_rally: '66666666-6666-6666-6666-666666666666',
};

// サンプルクイズのslug
const SAMPLE_QUIZ_SLUG = 'arcade-sample-quiz';

interface GameType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  bgGradient: string;
  path: string;
  sampleId?: string;
  cost?: number;
  maxReward?: number;
  comingSoon?: boolean;
}

const GAME_TYPES: GameType[] = [
  {
    id: 'slot',
    title: 'スロット',
    description: '絵柄を揃えて大当たり！最大200pt獲得のチャンス！',
    icon: Zap,
    bgGradient: 'from-gray-800 via-red-900 to-orange-900',
    path: '/slot',
    sampleId: SAMPLE_CAMPAIGN_IDS.slot,
    cost: 10,
    maxReward: 200,
  },
  {
    id: 'scratch',
    title: 'スクラッチ',
    description: '削って当たりを狙おう！最大100pt獲得！',
    icon: CreditCard,
    bgGradient: 'from-amber-600 via-orange-600 to-yellow-500',
    path: '/scratch',
    sampleId: SAMPLE_CAMPAIGN_IDS.scratch,
    cost: 10,
    maxReward: 100,
  },
  {
    id: 'fukubiki',
    title: '福引',
    description: 'ガラガラ回して抽選！金玉で150pt！',
    icon: Sparkles,
    bgGradient: 'from-red-900 via-pink-900 to-purple-900',
    path: '/fukubiki',
    sampleId: SAMPLE_CAMPAIGN_IDS.fukubiki,
    cost: 10,
    maxReward: 150,
  },
  {
    id: 'gacha',
    title: 'ガチャ',
    description: 'SSR出現で500pt！夢の大当たりを狙え！',
    icon: Gift,
    bgGradient: 'from-purple-600 via-pink-600 to-rose-600',
    path: '/gacha',
    sampleId: SAMPLE_CAMPAIGN_IDS.gacha,
    cost: 10,
    maxReward: 500,
  },
  {
    id: 'login_bonus',
    title: 'ログインボーナス',
    description: '毎日無料で10pt獲得！毎日ログインしよう！',
    icon: Calendar,
    bgGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    path: '/login-bonus',
    sampleId: SAMPLE_CAMPAIGN_IDS.login_bonus,
    cost: 0,
    maxReward: 10,
  },
  {
    id: 'point_quiz',
    title: 'ポイントクイズ',
    description: '正解するたびにポイントGET！知識で稼ごう！',
    icon: HelpCircle,
    bgGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    path: '/point-quiz',
    sampleId: SAMPLE_QUIZ_SLUG,
    cost: 0,
    maxReward: 50,
  },
  {
    id: 'stamp_rally',
    title: 'スタンプラリー',
    description: 'スタンプを集めてボーナスGET！',
    icon: Stamp,
    bgGradient: 'from-amber-500 via-orange-500 to-red-500',
    path: '/stamp-rally',
    sampleId: SAMPLE_CAMPAIGN_IDS.stamp_rally,
    comingSoon: true,
  },
];

export default function ArcadePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [availableCampaigns, setAvailableCampaigns] = useState<Set<string>>(new Set());

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

        // 利用可能なサンプルキャンペーンを確認
        if (supabase) {
          const sampleIds = Object.values(SAMPLE_CAMPAIGN_IDS);
          const { data: campaigns } = await supabase
            .from(TABLES.GAMIFICATION_CAMPAIGNS)
            .select('id')
            .in('id', sampleIds)
            .eq('is_active', true);

          if (campaigns) {
            setAvailableCampaigns(new Set(campaigns.map(c => c.id)));
          }
        }
      } catch (error) {
        console.error('Error loading arcade data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // ゲームのリンク先を取得
  const getGameLink = (game: GameType): string | null => {
    if (game.comingSoon) return null;
    if (!game.sampleId) return null;
    
    // ポイントクイズは特別処理
    if (game.id === 'point_quiz') {
      return `${game.path}/${game.sampleId}`;
    }
    
    // 利用可能なキャンペーンかチェック（開発時はスキップ）
    // if (!availableCampaigns.has(game.sampleId)) return null;
    
    return `${game.path}/${game.sampleId}`;
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
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
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-8 py-4 border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-yellow-200/70 text-sm">所持ポイント</p>
                <p className="text-3xl font-black text-yellow-400">
                  {currentPoints.toLocaleString()} <span className="text-lg">pt</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 期待値バナー */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-center gap-3 text-yellow-300">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold">10pt使って最大500pt獲得のチャンス！</span>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ゲーム一覧 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {GAME_TYPES.map((game) => {
            const Icon = game.icon;
            const gameLink = getGameLink(game);
            const isPlayable = !game.comingSoon && gameLink;

            return (
              <div
                key={game.id}
                className={`
                  relative group rounded-2xl overflow-hidden transform transition-all duration-300
                  ${game.comingSoon ? 'opacity-60' : 'hover:scale-105 hover:shadow-2xl'}
                `}
              >
                {/* 背景グラデーション */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.bgGradient}`} />
                
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
                  <p className="text-white/80 text-sm mb-4 min-h-[40px]">
                    {game.description}
                  </p>

                  {/* コスト・報酬表示 */}
                  {!game.comingSoon && (
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-1.5 text-yellow-300">
                        <Coins className="w-4 h-4" />
                        <span>{game.cost === 0 ? '無料' : `${game.cost}pt`}</span>
                      </div>
                      {game.maxReward && game.maxReward > 0 && (
                        <div className="flex items-center gap-1.5 text-green-300">
                          <Trophy className="w-4 h-4" />
                          <span>最大{game.maxReward}pt</span>
                        </div>
                      )}
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
                      href={gameLink}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-white/90 transition-colors shadow-lg"
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

                  {/* 人気バッジ（ガチャ） */}
                  {game.id === 'gacha' && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                      人気
                    </div>
                  )}

                  {/* おすすめバッジ（スロット） */}
                  {game.id === 'slot' && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                      おすすめ
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
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>当たればポイント増加</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span>アニメーション演出</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-orange-400" />
              <span>ポイントで遊べる</span>
            </div>
          </div>
        </div>

        {/* 自分で作成するリンク */}
        <div className="mt-12 text-center">
          <Link
            href="/gamification/new"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-medium transition-colors border border-white/20"
          >
            <Gamepad2 className="w-5 h-5" />
            自分でゲームを作成する
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
      
      {/* ウェルカムボーナス（ログイン時に表示） */}
      {user && (
        <WelcomeBonus 
          userId={user.id} 
          onPointsEarned={(points) => setCurrentPoints(prev => prev + points)}
        />
      )}
    </div>
  );
}
