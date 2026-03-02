'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Check,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  Users,
  PenTool,
  Target,
  Layout,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import { supabase } from '@/lib/supabase';

export default function KindleOptinClient() {
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

  const handleCTA = () => {
    if (user) {
      window.location.href = '/kindle';
    } else {
      setShowAuth(true);
    }
  };

  const painPoints = [
    '本を書きたいけど、何から始めればいいかわからない',
    '目次を考えるだけで挫折してしまう',
    '文章を書くのに時間がかかりすぎる',
    '出版の手順が複雑で、ハードルが高い',
  ];

  const features = [
    {
      icon: <Sparkles size={28} className="text-blue-500" />,
      title: 'AIがタイトルを提案',
      description: 'テーマを入力するだけ。売れるタイトル候補を複数AIが生成します。',
    },
    {
      icon: <Target size={28} className="text-green-500" />,
      title: '読者ターゲットを自動設計',
      description: '誰に向けた本なのか。ペルソナ・USP・差別化をAIが整理します。',
    },
    {
      icon: <Layout size={28} className="text-purple-500" />,
      title: '目次を自動生成',
      description: '5つのパターンから選ぶだけ。章立てをAIが組み上げます。',
    },
    {
      icon: <PenTool size={28} className="text-orange-500" />,
      title: '1章分のAI執筆',
      description: 'ボタン一つでAIが下書きを作成。あなたは編集するだけ。',
    },
  ];

  const trustPoints = [
    { icon: <Shield size={20} />, text: 'クレジットカード不要' },
    { icon: <Clock size={20} />, text: '登録30秒' },
    { icon: <Zap size={20} />, text: 'すぐに使える' },
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

      {/* Hero — ファーストビューでメールアドレス取得が目的 */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full filter blur-[120px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500 rounded-full filter blur-[100px] opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm text-amber-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap size={16} />
              完全無料 — AI × Kindle出版
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              AIがあなたの本の<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                タイトル・目次・原稿
              </span>
              <br />を自動生成
            </h1>

            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed mb-10">
              テーマを入力するだけで、本の企画から1章分の執筆まで。<br className="hidden sm:block" />
              メールアドレスの登録だけで、今すぐ無料で始められます。
            </p>

            {/* CTA */}
            <div className="max-w-md mx-auto">
              <button
                onClick={handleCTA}
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-8 py-5 rounded-2xl text-lg hover:from-amber-300 hover:to-orange-400 transition-all shadow-2xl shadow-orange-500/30"
              >
                <BookOpen size={22} />
                {user ? 'ダッシュボードへ' : '無料でAI出版を体験する'}
                <ArrowRight size={20} />
              </button>

              {user ? (
                <p className="mt-3 text-sm opacity-60">{user.email} でログイン中</p>
              ) : (
                <div className="flex items-center justify-center gap-4 mt-4">
                  {trustPoints.map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs opacity-70">
                      {t.icon}
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 悩みへの共感 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              こんなお悩みありませんか？
            </h2>
          </div>
          <div className="space-y-4">
            {painPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-xl px-6 py-4 border border-gray-200 shadow-sm">
                <span className="text-red-400 text-xl font-bold flex-shrink-0">?</span>
                <p className="text-gray-700">{p}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-lg font-bold text-blue-700">
              Kindle出版メーカーなら、すべてAIが解決します。
            </p>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              無料で使える4つのAI機能
            </h2>
            <p className="text-lg text-gray-600">
              メールアドレスの登録だけで、すべて今すぐ利用できます
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i} className="relative">
                <div className="absolute -top-3 -left-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  {i + 1}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 h-full">
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 社会的証明（シンプル） */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-blue-700 mb-6">
            <Users size={20} />
            <span className="font-bold text-sm">多くの方にご利用いただいています</span>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-black text-blue-700">30秒</p>
              <p className="text-sm text-gray-600 mt-1">登録にかかる時間</p>
            </div>
            <div>
              <p className="text-4xl font-black text-blue-700">10回</p>
              <p className="text-sm text-gray-600 mt-1">無料で使えるAI回数</p>
            </div>
            <div>
              <p className="text-4xl font-black text-blue-700">¥0</p>
              <p className="text-sm text-gray-600 mt-1">完全無料で開始</p>
            </div>
          </div>
        </div>
      </section>

      {/* よくある質問 */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">よくある質問</h2>
          <div className="space-y-4">
            {[
              { q: '本当に無料ですか？', a: 'はい。メールアドレスの登録だけで、タイトル生成から1章分の執筆まで完全無料で利用できます。クレジットカードの登録も不要です。' },
              { q: 'Kindle出版の経験がなくても大丈夫？', a: 'もちろんです。AIがタイトルから目次、原稿まで提案するので、はじめての方でもスムーズに本の企画を体験できます。' },
              { q: '登録後にしつこい勧誘はありますか？', a: 'ありません。ご自身のペースでお使いいただけます。有料プランへの案内はアプリ内に表示されますが、いつでも無料のままご利用を続けられます。' },
              { q: '無料プランで作ったデータは消えますか？', a: 'いいえ。作成した本のデータはアカウントに保存されます。後から有料プランにアップグレードして、そのまま出版に進むことも可能です。' },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-2">Q. {faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            今日から、あなたも<br className="sm:hidden" />
            作家デビューの第一歩を
          </h2>
          <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto">
            テーマを入力するだけで、AIがあなたの本の企画を作ります。<br className="hidden sm:block" />
            まずは無料で試してみてください。
          </p>

          <button
            onClick={handleCTA}
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold px-10 py-5 rounded-2xl text-lg hover:from-amber-300 hover:to-orange-400 transition-all shadow-2xl shadow-orange-500/30"
          >
            <BookOpen size={22} />
            {user ? 'ダッシュボードへ' : '無料でAI出版を体験する'}
            <ArrowRight size={20} />
          </button>

          {!user && (
            <div className="flex items-center justify-center gap-4 mt-4">
              {trustPoints.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs opacity-70">
                  {t.icon}
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer setPage={navigateTo} />
    </div>
  );
}
