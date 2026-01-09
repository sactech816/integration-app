'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  Zap, 
  Check, 
  ArrowRight, 
  PenTool, 
  Target, 
  Clock, 
  ChevronDown,
  Rocket,
  FileText,
  Download,
  Users,
  TrendingUp,
  Crown,
  Gift,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  BookMarked,
  Edit3,
  Layout,
  Wand2,
  MessageSquare,
  PlayCircle,
  Handshake
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import SubscriptionPlans from '@/components/kindle/SubscriptionPlans';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

export default function KindleLPClient() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [prices, setPrices] = useState<{ monthly: number; yearly: number } | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // 認証状態を取得
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }

      // 価格設定を取得
      try {
        const res = await fetch('/api/settings/kdl-prices');
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
        }
      } catch (e) {
        console.error('Failed to fetch prices:', e);
      }
      
      // アフィリエイト紹介コードを取得（Cookieから）
      const refCode = getReferralCode();
      if (refCode) {
        setReferralCode(refCode);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      window.location.href = '/';
    } else {
      window.location.href = `/${page}`;
    }
  };

  // 機能一覧
  const features = [
    {
      icon: Wand2,
      title: 'AIが目次を自動生成',
      description: 'テーマを入力するだけで、売れる本の構成をAIが提案。章・節の構成を自動で作成します。',
      color: 'text-violet-500',
      bg: 'bg-violet-50',
    },
    {
      icon: Edit3,
      title: 'AI執筆サポート',
      description: '各節の内容をAIが下書き。あなたの言葉で編集するだけで、プロ品質の原稿が完成。',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Layout,
      title: '直感的な編集画面',
      description: 'ドラッグ&ドロップで章の並び替え。Word感覚で編集できる使いやすいエディター。',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      icon: Download,
      title: 'ワンクリック書き出し',
      description: 'KDP形式に最適化された原稿をワンクリックでエクスポート。そのままアップロード可能。',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: BookMarked,
      title: '出版準備ガイド',
      description: 'KDPアカウント作成から表紙作成、価格設定まで。出版の全工程をナビゲート。',
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
    {
      icon: Users,
      title: '無制限の書籍管理',
      description: '何冊でも書籍を作成・管理可能。シリーズ展開も簡単に実現できます。',
      color: 'text-cyan-500',
      bg: 'bg-cyan-50',
    },
  ];

  // ステップ
  const steps = [
    {
      num: '01',
      title: 'テーマを入力',
      description: '書きたい本のテーマやジャンルを入力。ターゲット読者も設定できます。',
      icon: Lightbulb,
    },
    {
      num: '02',
      title: 'AIが目次を提案',
      description: '売れる本の構成をAIが分析。最適な章・節構成を自動で生成します。',
      icon: FileText,
    },
    {
      num: '03',
      title: 'AIで一括執筆',
      description: 'ボタン一つで全節の下書きをAIが生成。あなたは編集に集中できます。',
      icon: PenTool,
    },
    {
      num: '04',
      title: 'あなたの言葉で編集',
      description: 'AI生成文はたたき台。あなたの経験や視点を加えてオリジナルに。',
      icon: Edit3,
    },
    {
      num: '05',
      title: '原稿をエクスポート',
      description: 'KDP形式で出力。そのままKindleにアップロードして出版準備完了！',
      icon: Rocket,
    },
  ];

  // FAQ
  const faqs = [
    {
      q: 'AI生成した文章はそのまま出版しても大丈夫ですか？',
      a: 'AI生成文はあくまで「たたき台」としてご利用ください。著作権上の問題や、Amazonのガイドライン遵守のため、ご自身の言葉で編集・リライトすることを強く推奨しています。本サービスのガイドページでも詳しく解説しています。',
    },
    {
      q: 'Kindle出版の経験がなくても使えますか？',
      a: 'はい、初心者の方でも安心してご利用いただけます。KDPアカウントの作成から表紙の準備、価格設定まで、出版に必要な全工程をガイドするページをご用意しています。',
    },
    {
      q: '何冊まで本を作成できますか？',
      a: 'プランに関わらず、書籍数に制限はありません。シリーズ本や複数ジャンルの執筆も自由に行えます。',
    },
    {
      q: 'AIの執筆機能はどのくらい使えますか？',
      a: 'プランによって1日の使用回数が異なります。ライトプランは20回/日、スタンダードプランは50回/日、プロプランは100回/日、ビジネスプランは無制限でご利用いただけます。',
    },
    {
      q: 'どんなジャンルの本が書けますか？',
      a: 'ビジネス、自己啓発、健康、料理、趣味、小説など、幅広いジャンルに対応しています。ターゲット読者や文体の指定も可能です。',
    },
    {
      q: '解約はいつでもできますか？',
      a: 'はい、いつでも解約可能です。解約後も次回更新日までは全機能をご利用いただけます。作成した書籍データも保持されます。',
    },
  ];

  // 比較表
  const comparisonItems = [
    { item: '執筆にかかる時間', without: '数週間〜数ヶ月', with: '最短数日', advantage: true },
    { item: '必要なスキル', without: 'ライティングスキル必須', with: '編集力のみでOK', advantage: true },
    { item: '構成・目次作成', without: '自分で考える', with: 'AIが自動提案', advantage: true },
    { item: '下書き作成', without: '一文字ずつ執筆', with: 'AIが一括生成', advantage: true },
    { item: 'KDP対応フォーマット', without: '変換作業が必要', with: 'ワンクリック出力', advantage: true },
    { item: '出版ノウハウ', without: '自分で調べる', with: 'ガイド付き', advantage: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* アフィリエイト追跡 */}
      <Suspense fallback={null}>
        <AffiliateTracker serviceType="kdl" />
      </Suspense>

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
        onNavigate={navigateTo}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-300/10 rounded-full blur-2xl" />
          {/* 本のアイコン装飾 */}
          <div className="absolute top-20 right-20 opacity-10">
            <BookOpen size={200} />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            {/* バッジ */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-8">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="font-bold text-sm">集客メーカー 新サービス</span>
            </div>

            {/* サービス名 */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl mb-4">
                <BookOpen size={32} className="text-yellow-300" />
                <div className="text-left">
                  <span className="block text-2xl sm:text-3xl font-black tracking-tight">
                    キンドルダイレクトライト
                  </span>
                  <span className="text-sm opacity-80">Kindle Direct Lite（KDL）</span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              AIの力で、
              <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
                誰でも作家デビュー
              </span>
            </h1>

            <p className="text-xl sm:text-2xl opacity-90 mb-4 font-medium max-w-3xl mx-auto">
              目次作成から執筆、出版準備まで<br className="sm:hidden" />
              AIがフルサポート
            </p>

            <p className="text-lg opacity-80 mb-10 max-w-2xl mx-auto">
              専門知識不要。あなたのアイデアを本にする<br />
              最短ルートがここにあります。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/kindle/new?mode=demo"
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <PlayCircle size={22} />
                まずは無料で試す
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all border border-white/30"
              >
                料金プランを見る
                <ChevronDown size={20} />
              </a>
            </div>

            {/* 信頼指標 */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-yellow-300" />
                <span>登録無料で体験可能</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} className="text-yellow-300" />
                <span>いつでも解約OK</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} className="text-yellow-300" />
                <span>書籍数無制限</span>
              </div>
            </div>
          </div>
        </div>

        {/* 波形 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H0Z" 
              fill="#fffbeb"
            />
          </svg>
        </div>
      </section>

      {/* 課題提起セクション */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              こんなお悩み、ありませんか？
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { text: '本を出版したいけど、何から始めればいいかわからない', icon: HelpCircle },
              { text: '執筆に時間がかかりすぎて、いつも途中で挫折してしまう', icon: Clock },
              { text: '文章力に自信がなくて、プロ品質の本が書けるか不安', icon: PenTool },
              { text: 'KDPの仕組みがよくわからない。フォーマットも難しそう', icon: FileText },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <item.icon size={20} className="text-red-400" />
                </div>
                <p className="text-gray-700 font-medium">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-3 rounded-full">
              <Sparkles size={20} className="text-orange-500" />
              <span className="font-bold text-gray-800">
                その悩み、KDLがすべて解決します
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <Zap size={16} />
              主な機能
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              AIがあなたの出版をフルサポート
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              執筆のプロでなくても、プロ品質の本が作れる。<br />
              それがキンドルダイレクトライトの強みです。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bg} mb-5`}>
                  <feature.icon size={28} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方ステップ */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <Target size={16} />
              使い方
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              5ステップで出版準備完了
            </h2>
            <p className="text-lg text-gray-600">
              アイデアから出版まで、最短ルートをご案内
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div 
                key={i}
                className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:border-amber-300 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-xl">{step.num}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon size={22} className="text-amber-600" />
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block flex-shrink-0 self-center">
                    <ChevronRight size={24} className="text-amber-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 比較セクション */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <TrendingUp size={16} />
              比較
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              従来の執筆 vs KDLを使った執筆
            </h2>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-3xl p-8 border border-amber-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">比較項目</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-500">従来の方法</th>
                    <th className="text-center py-4 px-4">
                      <span className="font-bold text-amber-600 flex items-center justify-center gap-2">
                        <BookOpen size={18} />
                        KDLを使うと
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonItems.map((row, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-4 px-4 font-medium text-gray-700">{row.item}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-2 text-gray-500">
                          <XCircle size={16} className="text-gray-400" />
                          {row.without}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-2 text-amber-700 font-medium">
                          <CheckCircle size={16} className="text-amber-500" />
                          {row.with}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              すべてのプランで書籍数無制限・KDP形式エクスポート対応
            </p>
          </div>

          {/* サブスク選択コンポーネント */}
          <SubscriptionPlans 
            userEmail={user?.email}
            customPrices={prices || undefined}
            referralCode={referralCode}
          />

          {/* 無料体験 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg border border-amber-100">
              <Gift size={24} className="text-amber-500" />
              <div className="text-left">
                <p className="font-bold text-gray-900">まずは無料で体験</p>
                <p className="text-sm text-gray-500">登録するだけで基本機能をお試しいただけます</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <MessageSquare size={16} />
              よくある質問
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="font-bold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-gray-400 flex-shrink-0 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 代理店募集セクション */}
      <section className="py-12 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 p-3 rounded-xl">
                <Handshake size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  代理店パートナー募集中
                </h3>
                <p className="text-gray-300 text-sm">
                  KDLを活用したビジネスパートナーを募集しています
                </p>
              </div>
            </div>
            <Link
              href="/kindle/agency"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg whitespace-nowrap"
            >
              詳しく見る
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <BookOpen size={20} className="text-yellow-300" />
            <span className="font-bold">キンドルダイレクトライト</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
            あなたの中にある本を、<br />
            世界に届けよう
          </h2>
          
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            アイデアはある。あとはAIの力を借りて形にするだけ。<br />
            今日から、あなたも作家の仲間入りです。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kindle/new?mode=demo"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-10 py-5 rounded-full text-xl hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <PlayCircle size={24} />
              まずは無料で試す
            </Link>
            <Link
              href="/kindle"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-10 py-5 rounded-full text-xl hover:bg-white/30 transition-all border border-white/30"
            >
              <Rocket size={24} />
              ログインして始める
            </Link>
          </div>

          <p className="mt-8 text-sm opacity-70">
            ※ デモは登録不要。製品版も登録無料でお試しいただけます。
          </p>
        </div>
      </section>

      <Footer 
        setPage={navigateTo}
        onCreate={() => {}}
        user={user}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

