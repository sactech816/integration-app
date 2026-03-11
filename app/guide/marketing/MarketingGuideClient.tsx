'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import PageStampTracker from '@/components/gamification/PageStampTracker';
import {
  Calendar, CalendarCheck, ClipboardList, Mail, MailCheck, Filter, MessageSquare,
  ArrowRight, Sparkles, CheckCircle, Lightbulb, Target, TrendingUp
} from 'lucide-react';

const tools = [
  {
    icon: Calendar,
    name: '予約管理',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    textColor: 'text-blue-700',
    dashboardView: 'booking',
    description: 'オンライン予約フォーム。自動リマインドメール付き',
    useCases: [
      'コンサル・カウンセリングの予約受付',
      '体験レッスン・セミナーの申込み',
      '美容院・サロンの予約管理',
      '面談・商談のスケジュール調整',
    ],
    tips: '予約確認メールとリマインドメールが自動送信。キャンセル率を下げるには、予約の前日にリマインドを設定するのが効果的。',
  },
  {
    icon: CalendarCheck,
    name: '出欠管理',
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    textColor: 'text-teal-700',
    dashboardView: 'attendance',
    description: 'イベント・セミナーの出欠確認を簡単管理',
    useCases: [
      'セミナー・勉強会の出欠確認',
      '飲み会・懇親会の参加確認',
      '社内イベントの出欠管理',
      'オンラインイベントの参加登録',
    ],
    tips: 'URLを共有するだけで回答可能。回答期限を設定して早めに人数を確定しましょう。',
  },
  {
    icon: ClipboardList,
    name: 'アンケート',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-700',
    dashboardView: 'survey',
    description: 'カスタムアンケートフォームを作成・集計',
    useCases: [
      'セミナー後の満足度調査',
      '顧客ニーズのリサーチ',
      '商品・サービスのフィードバック収集',
      'イベント企画のための事前調査',
    ],
    tips: '質問は10問以内がベスト。自由記述は最後に1〜2問にして、選択式を中心にすると回答率が上がります。',
  },
  {
    icon: Mail,
    name: 'メルマガ',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    dashboardView: 'newsletter',
    description: 'メールマガジンの作成・配信・読者管理',
    useCases: [
      '新商品・キャンペーンのお知らせ',
      'ブログ更新の通知',
      '顧客フォロー・リピート促進',
      'イベント告知・集客',
    ],
    tips: '診断クイズやサンプルDLで集めたリードを自動インポート可能。開封率を上げるには、件名に数字や「限定」を入れると効果的。',
  },
  {
    icon: MailCheck,
    name: 'ステップメール',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    textColor: 'text-violet-700',
    dashboardView: 'step-email',
    description: '自動配信のシナリオメール。リード育成に最適',
    useCases: [
      '新規登録者への自動フォローアップ',
      '無料→有料への段階的セールス',
      'オンボーディング（使い方案内）',
      '購入後のアフターフォロー',
    ],
    tips: '7日間のシナリオが定番。1通目は自己紹介＋価値提供、中盤で信頼構築、最終日にオファーの流れが効果的。',
  },
  {
    icon: Filter,
    name: 'ファネル',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    textColor: 'text-rose-700',
    dashboardView: 'funnel',
    description: 'マーケティングファネルをビジュアルで構築・管理',
    useCases: [
      '集客→教育→販売の導線設計',
      '広告→LP→申込みの成果測定',
      'コンバージョン率の改善分析',
      '複数ツールの連携可視化',
    ],
    tips: '集客メーカーの各ツール（診断クイズ→LP→メルマガ→申込みフォーム）を連携してファネルを構築。ボトルネックを可視化して改善。',
  },
  {
    icon: MessageSquare,
    name: 'LINE連携',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    textColor: 'text-green-700',
    dashboardView: 'line',
    description: 'LINE公式アカウントとの連携機能',
    useCases: [
      '診断結果をLINEで通知',
      'LINE友だち追加ボタンの設置',
      'LINE経由のリード管理',
      'LINEでのリマインド配信',
    ],
    tips: 'メルマガとLINEの併用で到達率アップ。メールが届きにくい層にはLINEが有効です。',
  },
];

export default function MarketingGuideClient() {
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
      <PageStampTracker pageUrl="/guide/marketing" user={user} />
      <Header user={user} onLogout={handleLogout} setShowAuth={() => router.push('/?auth=true')} />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
        {/* Hero */}
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4" />
              集客・マーケティング
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              集客・マーケティング 活用ガイド
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              予約管理からメルマガ、ステップメール、ファネルまで。<br className="hidden md:block" />
              集客→育成→販売を一気通貫で実現する7つのツールを解説。
            </p>
          </div>
        </section>

        {/* ファネル図 */}
        <section className="pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500" />
                マーケティングファネルとツールの対応
              </h2>
              <div className="space-y-3">
                {[
                  { stage: '認知・集客', tools: 'SNS投稿・診断クイズ・LP', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { stage: 'リード獲得', tools: 'アンケート・予約・出欠管理', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                  { stage: 'リード育成', tools: 'メルマガ・ステップメール・LINE', color: 'bg-violet-100 text-violet-800 border-violet-200' },
                  { stage: '販売・成約', tools: '申込みフォーム・ビジネスLP', color: 'bg-rose-100 text-rose-800 border-rose-200' },
                ].map((item) => (
                  <div key={item.stage} className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${item.color}`}>
                    <span className="font-bold text-sm w-24 shrink-0">{item.stage}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 opacity-50" />
                    <span className="text-sm">{item.tools}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">ファネルツールですべてを可視化・管理できます</p>
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
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
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
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">集客の仕組みを今すぐ構築</h2>
            <p className="text-white/90 mb-6">予約→メルマガ→ステップメール→販売。すべてのツールが連携して自動で動きます。</p>
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
