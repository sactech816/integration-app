'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Zap
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
    features: ['3種のアニメーション', '景品設定', '確率カスタマイズ'],
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
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            お客様のエンゲージメントを高める3つの機能から選べます。
            <br className="hidden md:block" />
            すべてリアルタイムプレビューで簡単に作成できます。
          </p>
        </div>

        {/* タイプ選択カード */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CAMPAIGN_TYPES.map((type) => {
            const Icon = type.icon;
            const isHovered = hoveredType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => handleSelectType(type.id)}
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
                  w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color}
                  flex items-center justify-center mb-4 shadow-lg
                  group-hover:scale-110 transition-transform
                `}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* タイトル */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {type.title}
                </h3>

                {/* 説明 */}
                <p className="text-gray-600 text-sm mb-4">
                  {type.description}
                </p>

                {/* 機能タグ */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {type.features.map((feature, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full ${type.bgColor} ${type.textColor} font-medium`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* 作成ボタン */}
                <div className={`
                  flex items-center gap-2 font-bold
                  bg-gradient-to-r ${type.color} bg-clip-text text-transparent
                `}>
                  <span>作成する</span>
                  <ArrowRight className={`w-4 h-4 ${type.textColor} group-hover:translate-x-1 transition-transform`} />
                </div>

                {/* ホバー時の装飾 */}
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br ${type.color} opacity-0
                  group-hover:opacity-5 transition-opacity pointer-events-none
                `} />
              </button>
            );
          })}
        </div>

        {/* 補足情報 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 text-white/60 text-sm">
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
          </div>
        </div>
      </main>

      <Footer />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}

