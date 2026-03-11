'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import PageStampTracker from '@/components/gamification/PageStampTracker';
import {
  Gamepad2, Store, Gift,
  ArrowRight, Sparkles, CheckCircle, Lightbulb, Target, TrendingUp, Crown
} from 'lucide-react';

const tools = [
  {
    icon: Gamepad2,
    name: 'ゲーミフィケーション',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    dashboardView: 'gamification',
    description: 'ポイント制・スタンプカード・クーポンでリピーター獲得',
    useCases: [
      'ページ閲覧でスタンプ → クーポン獲得',
      'ログインボーナスでの継続利用促進',
      'ポイント交換でサービス利用を促進',
      'ランキング機能でコミュニティ活性化',
    ],
    tips: '小さな報酬（スタンプ・ポイント）を頻繁に与えるのがコツ。達成感を感じるタイミングでクーポンを発行すると購入率が上がります。',
    details: [
      { title: 'スタンプカード', desc: '各ページの閲覧やアクションでスタンプを収集。全スタンプ達成で特典を付与。' },
      { title: 'ポイントシステム', desc: 'ログイン・コンテンツ作成・シェアなどのアクションにポイントを付与。ポイント交換で特典。' },
      { title: 'クーポン', desc: '割引クーポンを発行。新規登録特典や○○達成特典として活用。' },
    ],
  },
  {
    icon: Store,
    name: 'スキルマーケット',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    dashboardView: 'marketplace',
    description: 'スキル・サービスの出品・販売プラットフォーム',
    useCases: [
      'コンサルティングサービスの販売',
      'デザイン・ライティングのスキル出品',
      'オンラインレッスンの予約＋決済',
      'デジタルコンテンツ（テンプレート等）の販売',
    ],
    tips: 'プロフィールLPやビジネスLPと連携して信頼性アップ。実績・レビューを充実させると成約率が向上します。Stripe Connect で売上を直接受け取れます。',
    details: [
      { title: 'スキル出品', desc: 'サービス内容・価格・提供方法を設定して出品。カテゴリ分類で見つけやすく。' },
      { title: 'Stripe決済', desc: 'クレジットカード決済に対応。売上はStripe Connectで直接入金。' },
      { title: 'レビュー機能', desc: '購入者からのレビューで信頼性を構築。高評価で表示順位もアップ。' },
    ],
  },
  {
    icon: Gift,
    name: 'アフィリエイト',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-700',
    dashboardView: 'affiliate',
    description: '紹介報酬プログラム。ユーザー同士で集客し合う仕組み',
    useCases: [
      '既存ユーザーによる口コミ・紹介促進',
      'インフルエンサーとの提携',
      'パートナー経由の新規顧客獲得',
      'コンテンツクリエイターへの報酬設定',
    ],
    tips: '紹介リンクをSNSやブログで共有してもらう仕組み。報酬は売上の一定割合を設定。紹介者と被紹介者の両方に特典を付けるとより効果的。',
    details: [
      { title: '紹介リンク', desc: 'ユーザーごとに固有の紹介リンクを発行。クリック・成約を自動トラッキング。' },
      { title: '報酬設定', desc: '成約時の報酬額・割合をカスタマイズ。段階的な報酬テーブルも設定可能。' },
      { title: 'ダッシュボード', desc: '紹介数・成約数・報酬額をリアルタイムで確認できるアフィリエイトダッシュボード。' },
    ],
  },
];

export default function MonetizationGuideClient() {
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
      <PageStampTracker pageUrl="/guide/monetization" user={user} />
      <Header user={user} onLogout={handleLogout} setShowAuth={() => router.push('/?auth=true')} />
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-gray-50">
        {/* Hero */}
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-6">
              <Crown className="w-4 h-4" />
              収益化・販売
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              収益化・販売 活用ガイド
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ゲーミフィケーション、スキルマーケット、アフィリエイト。<br className="hidden md:block" />
              集客メーカーで売上を生み出す3つの仕組みを解説します。
            </p>
          </div>
        </section>

        {/* 収益化の3つの柱 */}
        <section className="pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                収益化の3つのアプローチ
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'リピーター獲得', desc: 'ゲーミフィケーションで顧客を定着させる', icon: Gamepad2, color: 'text-purple-600' },
                  { title: 'スキル販売', desc: 'マーケットプレイスで直接収益を得る', icon: Store, color: 'text-indigo-600' },
                  { title: '紹介報酬', desc: 'アフィリエイトで口コミ集客を自動化', icon: Gift, color: 'text-amber-600' },
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
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500" />
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

                  {/* 機能詳細 */}
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    {tool.details.map((d) => (
                      <div key={d.title} className={`${tool.bg} rounded-xl p-3`}>
                        <p className={`text-sm font-semibold ${tool.textColor} mb-1`}>{d.title}</p>
                        <p className="text-xs text-gray-600">{d.desc}</p>
                      </div>
                    ))}
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
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
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
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">集客メーカーで収益を最大化</h2>
            <p className="text-white/90 mb-6">集客だけで終わらない。ゲーミフィケーション・スキル販売・アフィリエイトで売上を伸ばしましょう。</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
