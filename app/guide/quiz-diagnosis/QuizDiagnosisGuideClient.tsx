'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import PageStampTracker from '@/components/gamification/PageStampTracker';
import {
  ClipboardList, Brain, Sparkles, Smile,
  ArrowRight, CheckCircle, Lightbulb, Target, Share2, Users, TrendingUp
} from 'lucide-react';

const tools = [
  {
    icon: ClipboardList,
    name: '診断クイズ',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    dashboardView: 'quiz',
    link: '/quiz',
    description: 'ビジネス向け診断クイズ。リード獲得＋メルマガ登録に最適',
    useCases: [
      '「あなたに合った○○診断」でリード獲得',
      'LINE・メルマガ登録の導線として',
      'セミナー・イベントのアイスブレイク',
      'サービス提案の自動化（結果ページでCTA）',
    ],
    tips: '質問は5〜10問がベスト。結果ページにCTAボタンを設置し、LINE登録や商品ページへ誘導しましょう。SNSシェアボタンで拡散も狙えます。',
    flow: ['テーマ入力', 'AI が質問と結果パターンを生成', 'デザインカスタマイズ', '公開＆シェア'],
  },
  {
    icon: Brain,
    name: 'Big Five 性格診断',
    color: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-50',
    textColor: 'text-violet-700',
    dashboardView: 'bigfive',
    link: '/bigfive',
    description: '心理学ベースの5因子性格診断。簡易版（10問）と本格版（50問）',
    useCases: [
      'チームビルディング・組織開発',
      'コーチング・カウンセリングの事前診断',
      'SNSでのバイラルコンテンツ',
      '採用・適性検査の簡易版として',
    ],
    tips: '無料の簡易版（10問）で集客し、本格版（50問）＋プレミアムPDFレポート（¥500）で収益化する2段階モデルが効果的。',
    flow: ['簡易版 or 本格版を選択', '質問に回答', '5因子＋MBTI結果表示', 'PDFレポート購入（任意）'],
  },
  {
    icon: Smile,
    name: 'エンタメ診断',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    textColor: 'text-pink-700',
    dashboardView: 'entertainment',
    link: '/dashboard?view=entertainment',
    description: '楽しさ重視の診断コンテンツ。SNS拡散・バイラルに特化',
    useCases: [
      'SNSバズを狙ったエンタメコンテンツ',
      'ブランド認知向上キャンペーン',
      'フォロワー獲得施策',
      'イベント・季節ごとの話題作り',
    ],
    tips: '「○○に例えると？」「あなたの○○度は？」のような遊び心のあるテーマが拡散されやすい。結果画像のシェアが鍵です。',
    flow: ['テーマ入力', 'AI が面白い質問と結果を生成', 'デザイン調整', 'SNSでシェア'],
  },
];

export default function QuizDiagnosisGuideClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };
    init();
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = async () => {
    if (supabase) { await supabase.auth.signOut(); setUser(null); }
  };

  return (
    <>
      <PageStampTracker pageUrl="/guide/quiz-diagnosis" user={user} />
      <Header user={user} onLogout={handleLogout} setShowAuth={() => router.push('/?auth=true')} />
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
        {/* Hero */}
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <ClipboardList className="w-4 h-4" />
              診断・クイズ
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              診断・クイズ 活用ガイド
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              リード獲得・SNS拡散・収益化まで。<br className="hidden md:block" />
              3つの診断ツールの使い分けと効果的な活用法を解説します。
            </p>
          </div>
        </section>

        {/* 使い分け比較 */}
        <section className="pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                3つの診断ツールの使い分け
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: Share2, title: 'リード獲得なら', desc: '診断クイズ — メール/LINE登録と連携', color: 'text-indigo-600' },
                  { icon: Users, title: '組織開発なら', desc: 'Big Five — 科学的な性格分析', color: 'text-violet-600' },
                  { icon: TrendingUp, title: 'SNSバズなら', desc: 'エンタメ診断 — 拡散重視の楽しい診断', color: 'text-pink-600' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <item.icon className={`w-5 h-5 ${item.color} mt-0.5 shrink-0`} />
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 各ツール詳細 */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {tools.map((tool) => (
              <div key={tool.name} className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
                <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
                  <div className="flex items-center gap-3">
                    <tool.icon className="w-8 h-8" />
                    <div>
                      <h3 className="text-xl font-bold">{tool.name}</h3>
                      <p className="text-white/90 text-sm">{tool.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {/* フロー */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">利用の流れ</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {tool.flow.map((step, i) => (
                        <React.Fragment key={step}>
                          <span className={`${tool.bg} ${tool.textColor} text-xs font-medium px-3 py-1.5 rounded-full`}>
                            {i + 1}. {step}
                          </span>
                          {i < tool.flow.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-gray-300" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-500" />
                      こんなときに使えます
                    </h4>
                    <ul className="space-y-1.5">
                      {tool.useCases.map((uc) => (
                        <li key={uc} className="flex items-start gap-2 text-gray-700 text-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`${tool.bg} rounded-xl p-4`}>
                    <p className={`text-sm font-semibold ${tool.textColor} flex items-center gap-2 mb-1`}>
                      <Lightbulb className="w-4 h-4" />
                      効果的な使い方のコツ
                    </p>
                    <p className="text-sm text-gray-700">{tool.tips}</p>
                  </div>

                  <button
                    onClick={() => router.push(`/dashboard?view=${tool.dashboardView}`)}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    {tool.name}を使う
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">診断コンテンツで集客を自動化</h2>
            <p className="text-white/90 mb-6">診断クイズは24時間働く営業マン。一度作れば継続的にリードを獲得できます。</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              ダッシュボードへ
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
