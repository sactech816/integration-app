'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import { 
  Stamp, 
  Calendar, 
  Gift, 
  ArrowRight, 
  Sparkles,
  Trophy,
  Star,
  Zap,
  CreditCard,
  HelpCircle,
  Play,
  Gamepad2
} from 'lucide-react';

const CAMPAIGN_TYPES = [
  {
    id: 'stamp_rally',
    title: 'スタンプラリー',
    description: 'QRコードやボタンでスタンプを集める。コンプリート特典で来店促進！',
    icon: Stamp,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    features: ['QRコード対応', 'スタンプカード表示', 'コンプリート特典'],
  },
  {
    id: 'login_bonus',
    title: 'ログインボーナス',
    description: '毎日ログインでポイントGET！継続利用を促進します。',
    icon: Calendar,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    features: ['連続ログイン特典', 'カレンダー表示', 'ポイント付与'],
  },
  {
    id: 'gacha',
    title: 'ガチャ',
    description: 'ポイントを使ってガチャを回す！ワクワク感で再訪問を促進。',
    icon: Gift,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    features: ['カプセルアニメーション', '景品設定', '確率カスタマイズ'],
  },
  {
    id: 'scratch',
    title: 'スクラッチ',
    description: '銀色の部分を削って当たりを狙う！削る楽しさでワクワク体験。',
    icon: CreditCard,
    color: 'from-amber-600 to-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    features: ['削るアニメーション', '当たり演出', 'ポイント消費'],
  },
  {
    id: 'fukubiki',
    title: '福引',
    description: 'ガラガラ回して玉が出る！お祭り気分で盛り上がる抽選体験。',
    icon: Sparkles,
    color: 'from-red-500 to-pink-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    features: ['ガラガラ演出', '玉の色で当たり判定', 'お祭り感'],
  },
  {
    id: 'slot',
    title: 'スロット',
    description: '絵柄を揃えて大当たり！カジノ気分でドキドキ体験。',
    icon: Zap,
    color: 'from-gray-700 to-red-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    features: ['リール回転', '揃え演出', 'ジャックポット'],
  },
  {
    id: 'point_quiz',
    title: 'ポイントクイズ',
    description: 'クイズに答えてポイントGET！楽しく学んでポイントも貯まる。',
    icon: HelpCircle,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    features: ['正解でポイント', '診断連携', '知識テスト'],
  },
];

export default function GamificationNewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

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

  const handleSelectType = (typeId: string) => {
    router.push(`/gamification/editor?type=${typeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      
      <main className="container mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">ゲーミフィケーション</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            作成するタイプを選択
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto mb-6">
            お客様のエンゲージメントを高める7つの機能から選べます。
            <br className="hidden md:block" />
            すべてリアルタイムプレビューで簡単に作成できます。
          </p>
          
          {/* 試してみるボタン */}
          <Link
            href="/arcade"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-full font-bold hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Gamepad2 className="w-5 h-5" />
            ゲームを試してみる
            <Play className="w-4 h-4" />
          </Link>
        </div>

        {/* タイプ選択カード */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {CAMPAIGN_TYPES.map((type) => {
            const Icon = type.icon;
            const isHovered = hoveredType === type.id;

            return (
              <div
                key={type.id}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
                className={`
                  relative group text-left p-6 rounded-2xl border-2 transition-all duration-300
                  bg-white/95 backdrop-blur-sm
                  hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20
                  ${isHovered ? 'border-white' : 'border-white/20'}
                `}
              >
                {/* アイコン */}
                <div className={`
                  w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color}
                  flex items-center justify-center mb-4 shadow-lg
                  group-hover:scale-110 transition-transform
                `}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* タイトル */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {type.title}
                </h3>

                {/* 説明 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {type.description}
                </p>

                {/* 機能タグ */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {type.features.map((feature, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-0.5 rounded-full ${type.bgColor} ${type.textColor} font-medium`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* 作成ボタン */}
                <button
                  onClick={() => handleSelectType(type.id)}
                  className={`
                    w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold
                    bg-gradient-to-r ${type.color} text-white
                    hover:opacity-90 transition-opacity
                  `}
                >
                  <span>作成する</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* ホバー時の装飾 */}
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br ${type.color} opacity-0
                  group-hover:opacity-5 transition-opacity pointer-events-none
                `} />
              </div>
            );
          })}
        </div>

        {/* 補足情報 */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>ポイント連携可能</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>アニメーション豊富</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>すぐに公開可能</span>
            </div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span>7種類のゲーム</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}
