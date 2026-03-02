'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  PenTool,
  Target,
  Layout,
  Zap,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import { supabase } from '@/lib/supabase';

export default function KindleFreeTrialClient() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
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

  const handleStartFreeTrial = () => {
    if (user) {
      window.location.href = '/kindle';
    } else {
      setShowAuth(true);
    }
  };

  const freeFeatures = [
    {
      icon: <Sparkles size={24} className="text-blue-500" />,
      title: 'AIタイトル生成',
      description: 'テーマを入力するだけで、売れるタイトル候補をAIが提案',
    },
    {
      icon: <Target size={24} className="text-green-500" />,
      title: 'ターゲット読者設計',
      description: '読者ペルソナ・USP・差別化ポイントを自動生成',
    },
    {
      icon: <Layout size={24} className="text-purple-500" />,
      title: '目次（章構成）作成',
      description: '5つのパターンから最適な章構成をAIが提案',
    },
    {
      icon: <PenTool size={24} className="text-orange-500" />,
      title: 'AI執筆（制限あり）',
      description: '1冊・AI合計10回まで。1章分の下書きを体験',
    },
  ];

  const steps = [
    { num: '1', title: '無料アカウント登録', desc: 'メールアドレスだけで30秒' },
    { num: '2', title: 'テーマを入力', desc: 'AIがタイトル・目次・ターゲットを提案' },
    { num: '3', title: '1章を執筆', desc: 'AIの下書きを編集して体験' },
    { num: '4', title: '気に入ったらアップグレード', desc: '全機能を解放してKindle出版へ' },
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
        onClose={() => {
          setShowAuth(false);
          // ログイン成功後にダッシュボードへ
          if (user) {
            window.location.href = '/kindle';
          }
        }}
        setUser={(u) => {
          setUser(u);
          if (u) {
            window.location.href = '/kindle';
          }
        }}
        isPasswordReset={false}
        setShowPasswordReset={() => {}}
        onNavigate={navigateTo}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap size={16} className="text-amber-400" />
            完全無料・クレジットカード不要
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            Kindle出版メーカーを<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
              無料で体験
            </span>
          </h1>

          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
            AIがタイトル・目次・ターゲット設定を自動生成。<br className="hidden sm:block" />
            1章分の執筆まで、無料でお試しいただけます。
          </p>

          <button
            onClick={handleStartFreeTrial}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-10 py-5 rounded-2xl text-lg hover:from-amber-300 hover:to-orange-400 transition-all shadow-2xl shadow-orange-500/30"
          >
            <BookOpen size={22} />
            {user ? 'ダッシュボードへ' : '無料で始める'}
            <ArrowRight size={20} />
          </button>

          {user && (
            <p className="mt-4 text-sm opacity-70">
              {user.email} でログイン中
            </p>
          )}
        </div>
      </section>

      {/* 無料でできること */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              無料プランでできること
            </h2>
            <p className="text-lg text-gray-600">
              アカウント登録だけで、以下の機能がすぐに使えます
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {freeFeatures.map((f, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ステップ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              かんたん4ステップ
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-6 bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0 shadow-lg">
                  {s.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight size={20} className="text-gray-300 ml-auto hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            まずは無料で、<br className="sm:hidden" />
            あなたの本を始めてみませんか？
          </h2>
          <p className="text-xl opacity-90 mb-10">
            クレジットカード不要・いつでもアップグレード可能
          </p>

          <button
            onClick={handleStartFreeTrial}
            className="inline-flex items-center gap-3 bg-white text-blue-900 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-gray-100 transition-all shadow-2xl"
          >
            <BookOpen size={22} />
            {user ? 'ダッシュボードへ' : '無料で始める'}
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <Footer setPage={navigateTo} />
    </div>
  );
}
