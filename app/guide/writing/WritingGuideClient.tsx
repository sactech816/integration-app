'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import PageStampTracker from '@/components/gamification/PageStampTracker';
import {
  PenTool, Palette, Send, BookOpen, Lightbulb as LightbulbIcon,
  ArrowRight, Sparkles, CheckCircle, Lightbulb, Target
} from 'lucide-react';

const tools = [
  {
    icon: PenTool,
    name: 'セールスライター',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    dashboardView: 'salesletter',
    description: 'AIが売れるセールスレター・コピーを自動生成',
    useCases: [
      'LP・販売ページのキャッチコピー作成',
      'メルマガ・ステップメールの文面作成',
      'SNS広告のコピーライティング',
      'セミナー告知文の作成',
    ],
    tips: 'ターゲット像と「解決したい悩み」を具体的に入力すると、AIがより刺さるコピーを生成します。PASONAやAIDAなど定番フレームワークにも対応。',
  },
  {
    icon: Palette,
    name: 'サムネイルメーカー',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    textColor: 'text-orange-700',
    dashboardView: 'thumbnail',
    description: 'ブログ・SNS・YouTube用のアイキャッチ画像を作成',
    useCases: [
      'ブログ記事のアイキャッチ',
      'YouTubeサムネイル',
      'SNS投稿用のバナー画像',
      'メルマガのヘッダー画像',
    ],
    tips: 'テキストは短く大きく。背景色とのコントラストを意識。人物写真を入れるとクリック率が上がります。',
  },
  {
    icon: Send,
    name: 'SNS投稿メーカー',
    color: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-50',
    textColor: 'text-sky-700',
    dashboardView: 'sns-post',
    description: 'X(Twitter)・Instagram・Facebookの投稿をAI生成',
    useCases: [
      '毎日のSNS投稿ネタに困ったとき',
      'キャンペーン告知の投稿作成',
      'ハッシュタグ付き投稿の自動生成',
      '複数プラットフォーム向けの一括作成',
    ],
    tips: 'ペルソナ（ターゲット）と投稿の目的（認知/教育/販促）を設定すると、一貫性のあるSNS運用ができます。',
  },
  {
    icon: BookOpen,
    name: 'Kindle出版メーカー',
    color: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    dashboardView: 'kindle',
    description: 'Kindle本の企画・執筆・出版までをAIがサポート',
    useCases: [
      'ビジネス書・ノウハウ本の出版',
      'リードマグネット（無料本）の作成',
      'ブランディング目的の著書出版',
      '専門知識の電子書籍化',
    ],
    tips: 'まず目次をAIに作らせ、各章を順番に執筆していく方法が効率的。体験版で短い本から始めるのがおすすめ。',
  },
  {
    icon: LightbulbIcon,
    name: 'ネタ発掘',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    textColor: 'text-violet-700',
    dashboardView: 'idea',
    description: 'AIがコンテンツのアイデア・ネタを提案',
    useCases: [
      'ブログ記事のネタ出し',
      'SNS投稿のトピック探し',
      'メルマガの件名・テーマ案',
      '新サービスのアイデアブレスト',
    ],
    tips: '業界・ターゲット・競合情報を入力すると、より実践的なネタが出てきます。出てきたネタはSNS投稿メーカーやセールスライターに連携可能。',
  },
];

export default function WritingGuideClient() {
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
      <PageStampTracker pageUrl="/guide/writing" user={user} />
      <Header user={user} onLogout={handleLogout} setShowAuth={() => router.push('/?auth=true')} />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50">
        {/* Hero */}
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
              <PenTool className="w-4 h-4" />
              ライティング・制作
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ライティング・制作 活用ガイド
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              セールスコピー、サムネイル、SNS投稿、Kindle本。<br className="hidden md:block" />
              AIの力でコンテンツ制作を10倍速にする5つのツールを解説。
            </p>
          </div>
        </section>

        {/* ワークフロー */}
        <section className="pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                おすすめワークフロー
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { label: 'ネタ発掘', sub: 'アイデア出し' },
                  { label: 'セールスライター', sub: 'コピー作成' },
                  { label: 'サムネイル', sub: 'ビジュアル' },
                  { label: 'SNS投稿', sub: '配信・拡散' },
                ].map((step, i) => (
                  <React.Fragment key={step.label}>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center">
                      <p className="font-semibold text-emerald-800 text-sm">{step.label}</p>
                      <p className="text-xs text-emerald-600">{step.sub}</p>
                    </div>
                    {i < 3 && <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center mt-3">ツール間でコンテンツを連携し、効率的に制作→配信できます</p>
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
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
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
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
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
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">AIでコンテンツ制作を加速</h2>
            <p className="text-white/90 mb-6">ネタ出しからコピーライティング、ビジュアル制作まで。すべてAIにお任せ。</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
