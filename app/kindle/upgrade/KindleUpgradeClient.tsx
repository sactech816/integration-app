'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  ArrowRight,
  FileDown,
  ImageIcon,
  Rocket,
  PenLine,
  BookOpen,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import SubscriptionPlans from '@/components/kindle/SubscriptionPlans';
import { supabase } from '@/lib/supabase';

export default function KindleUpgradeClient() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
        });
        subscription = sub;
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };
    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (path: string) => {
    window.location.href = path === '/' || path === '' ? '/' : `/${path}`;
  };

  const upgradeReasons = [
    {
      icon: <FileDown size={24} className="text-blue-500" />,
      title: 'Word / EPUB エクスポート',
      description: '完成した原稿をWord・EPUB形式でダウンロード。そのままKDPにアップロードできます。',
    },
    {
      icon: <ImageIcon size={24} className="text-purple-500" />,
      title: 'AI表紙デザイン生成',
      description: 'プロ品質の表紙をAIが自動生成。テンプレートを選んでワンクリック。',
    },
    {
      icon: <Rocket size={24} className="text-orange-500" />,
      title: '書籍LP自動生成',
      description: '本のランディングページをAIが自動作成。SNSやブログでの告知に最適。',
    },
    {
      icon: <PenLine size={24} className="text-green-500" />,
      title: '文体変換',
      description: '全章一括で文体をリライト。説明文・対話形式・Q&Aなど自由に変換。',
    },
    {
      icon: <Sparkles size={24} className="text-amber-500" />,
      title: 'KDP出版情報の自動生成',
      description: 'カテゴリ・キーワード・紹介文をAIが最適化。Amazon検索で見つかりやすい本に。',
    },
    {
      icon: <TrendingUp size={24} className="text-red-500" />,
      title: 'AI回数の大幅拡張',
      description: '日次リセットで毎日たっぷり使える。プロプランなら1日120回以上。',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        isPasswordReset={false}
        setShowPasswordReset={() => {}}
        onNavigate={navigateTo}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Crown size={16} className="text-yellow-200" />
            あなたの本を完成させましょう
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            有料プランで<br />
            <span className="text-yellow-200">全機能を解放</span>
          </h1>

          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            無料プランで作った本のデータはそのまま引き継がれます。<br className="hidden sm:block" />
            アップグレードするだけで、すぐにダウンロード・出版できます。
          </p>

          <a
            href="#pricing"
            className="inline-flex items-center gap-3 bg-white text-orange-600 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-orange-50 transition-all shadow-2xl"
          >
            <Crown size={22} />
            プランを選ぶ
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* 無料プランで既に達成していること */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-green-200 rounded-2xl p-8 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-xl">
                <BookOpen size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">無料プランで作成したデータ</h2>
                <p className="text-sm text-gray-600">アップグレード後もすべて引き継がれます</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'タイトル・サブタイトル',
                'ターゲット読者設計',
                '章構成（目次）',
                '執筆した原稿データ',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
                  <Check size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* アップグレードで解放される機能 */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <Zap size={16} />
              有料プランで解放
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              出版に必要なすべてが揃います
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upgradeReasons.map((r, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-gray-50 p-3 rounded-xl w-fit mb-4">
                  {r.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-amber-50 to-orange-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <Crown size={16} />
              料金プラン
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              あなたに合ったプランを選択
            </h2>
            <p className="text-lg text-gray-600">
              すべてのプランでWord/EPUBエクスポート・表紙作成に対応
            </p>
          </div>

          <SubscriptionPlans userEmail={user?.email} />
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            せっかく書いた原稿、<br className="sm:hidden" />
            出版しませんか？
          </h2>
          <p className="text-xl opacity-90 mb-10">
            アップグレードすれば、すぐにWord出力して出版できます
          </p>

          <a
            href="#pricing"
            className="inline-flex items-center gap-3 bg-white text-orange-600 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-orange-50 transition-all shadow-2xl"
          >
            <Crown size={22} />
            プランを選ぶ
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <Footer setPage={navigateTo} />
    </div>
  );
}
