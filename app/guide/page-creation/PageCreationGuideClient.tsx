'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import PageStampTracker from '@/components/gamification/PageStampTracker';
import {
  UserCircle, Briefcase, Video, BookOpen, Globe, ClipboardList,
  ArrowRight, Sparkles, CheckCircle, Lightbulb, Target
} from 'lucide-react';

const tools = [
  {
    icon: UserCircle,
    name: 'プロフィールLP',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    textColor: 'text-blue-700',
    dashboardView: 'profile',
    description: '自己紹介・実績・サービス内容をまとめた1ページのランディングページ',
    useCases: [
      'SNSプロフィールのリンク先として',
      '名刺やチラシのQRコードから誘導',
      'セミナー・イベント講師の紹介ページ',
      'フリーランスのポートフォリオとして',
    ],
    tips: '写真・実績数値・お客様の声を入れると信頼感がアップ。CTAボタンは1つに絞ると効果的です。',
  },
  {
    icon: Briefcase,
    name: 'ビジネスLP',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    dashboardView: 'business',
    description: 'サービス・商品の販売に特化したセールスページ',
    useCases: [
      '新商品・新サービスのローンチページ',
      '広告からの誘導先（LP）として',
      'キャンペーン・限定オファーの告知',
      'オンライン講座・コンサルの申込みページ',
    ],
    tips: 'ヘッドライン→悩み共感→解決策→特徴→お客様の声→CTAの流れが王道。AIが自動で構成してくれます。',
  },
  {
    icon: Video,
    name: 'ウェビナーLP',
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    dashboardView: 'webinar',
    description: 'オンラインセミナー・ウェビナーの集客ページ',
    useCases: [
      'Zoom/YouTube Liveのウェビナー集客',
      '無料セミナーでリード獲得',
      '有料セミナーの販売ページ',
      'リプレイ（録画配信）の申込みページ',
    ],
    tips: '開催日時・講師プロフィール・参加特典を明確に。カウントダウンタイマーで緊急性を演出。',
  },
  {
    icon: BookOpen,
    name: 'ガイドメーカー',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-700',
    dashboardView: 'guide-maker',
    description: 'ステップバイステップのガイド・マニュアルページ',
    useCases: [
      'サービスの使い方マニュアル',
      '新入社員向けオンボーディングガイド',
      'お客様向けのセットアップガイド',
      '料理レシピや手順書の公開',
    ],
    tips: 'ステップを細かく分けて画像付きで説明すると、読者の離脱を防げます。',
  },
  {
    icon: Globe,
    name: 'ホームページメーカー',
    color: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-50',
    textColor: 'text-sky-700',
    dashboardView: 'homepage',
    description: '店舗・事業のホームページを簡単作成',
    useCases: [
      '個人事業主・小規模ビジネスのHP',
      '実店舗の紹介ページ（アクセス・営業時間）',
      '新規開業時のWebサイト',
      'Googleビジネスプロフィールのリンク先',
    ],
    tips: 'まずは「事業内容」「アクセス」「問い合わせ方法」の3つを押さえればOK。',
  },
  {
    icon: ClipboardList,
    name: '申し込みフォーム',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    textColor: 'text-rose-700',
    dashboardView: 'order-form',
    description: 'Stripe決済対応の申し込み・注文フォーム',
    useCases: [
      'オンライン講座の申込み受付',
      'イベント参加費の決済',
      '物販・デジタル商品の販売',
      'コンサル・サービスの予約＋決済',
    ],
    tips: '入力項目は最小限に。決済はStripe連携でクレジットカード対応。リマインドメール自動送信も活用。',
  },
];

export default function PageCreationGuideClient() {
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
      <PageStampTracker pageUrl="/guide/page-creation" user={user} />
      <Header
        user={user}
        onLogout={handleLogout}
        setShowAuth={() => router.push('/?auth=true')}
      />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
        {/* Hero */}
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Globe className="w-4 h-4" />
              LP・ページ作成
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              LP・ページ作成 活用ガイド
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              プロフィールLP、ビジネスLP、ウェビナーLPなど<br className="hidden md:block" />
              6つのページ作成ツールの活用法をまとめて解説します。
            </p>
          </div>
        </section>

        {/* 共通メリット */}
        <section className="pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                集客メーカーのページ作成が選ばれる理由
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'AI自動生成', desc: 'テーマを入力するだけでプロ品質のページが完成' },
                  { title: 'ノーコード', desc: 'コード不要。ドラッグ＆ドロップで直感的に編集' },
                  { title: '即公開', desc: '保存するだけでURLが発行。独自ドメインも対応' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
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
                      <Target className="w-4 h-4 text-blue-500" />
                      こんなときに使えます
                    </h4>
                    <ul className="space-y-1.5">
                      {tool.useCases.map((uc) => (
                        <li key={uc} className="flex items-start gap-2 text-gray-700 text-sm">
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
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
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    {tool.name}を作成する
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">まずは無料で始めてみましょう</h2>
            <p className="text-white/90 mb-6">プロフィールLPは無料プランでも作成可能。AIが自動でプロ品質のページを生成します。</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
