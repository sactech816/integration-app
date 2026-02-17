'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ServiceSelector from '@/components/shared/ServiceSelector';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import {
  Sparkles,
  UserCircle,
  Building2,
  ArrowRight,
  Loader2,
  Calendar,
  ClipboardList,
  Gamepad2,
  Layers,
  Check,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Share2,
  ChevronDown,
  Zap,
  Target,
  Eye,
  LayoutGrid,
  X,
  CreditCard,
  Crown,
  ExternalLink,
  ArrowUp,
  Users,
  FileText,
  Gift,
  Star,
  Ticket,
  Stamp,
  PenTool,
} from 'lucide-react';
import { setUserId } from '@/lib/gtag';

// V3: V2の内容 + KindleLPClientV4風デザイン（温かみのあるオレンジ基調）

interface PopularContent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: 'quiz' | 'profile' | 'business';
  views_count: number;
}

export default function HomePageClientV3() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [popularContents, setPopularContents] = useState<PopularContent[]>([]);

  // 診断ツール用のstate
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    freelance: 0,
    shop: 0,
    influencer: 0,
    marketer: 0
  });
  const [showResult, setShowResult] = useState(false);

  // タブ切り替え用のstate
  const [activeTab, setActiveTab] = useState('tab-freelance');

  // プロプランモーダル用のstate
  const [showProPlanModal, setShowProPlanModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // トップに戻るボタン用のstate
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
          setUserId(session?.user?.id || null);
        });

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        try {
          const { data: quizzes } = await supabase
            .from('quizzes')
            .select('id, slug, title, description, views_count')
            .eq('show_in_portal', true)
            .order('views_count', { ascending: false, nullsFirst: false })
            .limit(5);

          if (quizzes) {
            setPopularContents(quizzes.map(q => ({
              ...q,
              type: 'quiz' as const,
              views_count: q.views_count || 0,
            })));
          }
        } catch (error) {
          console.error('Failed to fetch popular contents:', error);
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      window.location.href = '/';
    } else if (page === 'create') {
      document.getElementById('create-section-services')?.scrollIntoView({ behavior: 'smooth' });
    } else if (page === 'diagnosis') {
      document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${page}`;
    }
  };

  const handleServiceSelect = (service: string) => {
    navigateTo(`${service}/editor`);
  };

  // 診断ツールのロジック
  const questions = [
    {
      id: 1,
      question: "Q1. あなたの主なビジネス（活動）は？",
      options: [
        { text: "個人でサービス提供（コーチ、ヨガ等）", type: "freelance" },
        { text: "お店を経営している", type: "shop" },
        { text: "SNS発信・アフィリエイト", type: "influencer" },
        { text: "Webマーケティング・制作", type: "marketer" }
      ]
    },
    {
      id: 2,
      question: "Q2. 今、一番解決したい悩みは？",
      options: [
        { text: "予約調整やメール対応が面倒...", type: "freelance" },
        { text: "集客したい・ファンを増やしたい！", type: "influencer" },
        { text: "リピーターを増やしたい", type: "shop" },
        { text: "LPを素早く作りたい・検証したい", type: "marketer" }
      ]
    },
    {
      id: 3,
      question: "Q3. パソコン操作は得意ですか？",
      options: [
        { text: "苦手。スマホで完結したい", type: "shop" },
        { text: "普通。文字入力くらいなら", type: "freelance" },
        { text: "得意。こだわりたい", type: "marketer" },
        { text: "画像加工なら得意", type: "influencer" }
      ]
    }
  ];

  const results = {
    freelance: {
      title: "プロフィールメーカー ＋ 予約メーカー ＋ アンケートメーカー",
      desc: "事務作業を自動化したいあなたに最適。名刺代わりのプロフィールページに予約機能をつけ、日程調整の手間をゼロに。アンケートで顧客の声を自動収集しましょう。"
    },
    shop: {
      title: "診断クイズメーカー ＋ ガチャ/スタンプラリー ＋ LPメーカー",
      desc: "お店の集客には「エンタメ」が効きます。診断クイズやガチャでお客様を楽しませ、スタンプラリーでリピーターを育成。結果画面でクーポンを配布して来店を促しましょう。"
    },
    influencer: {
      title: "診断クイズメーカー ＋ プロフィールメーカー ＋ 福引き/スクラッチ",
      desc: "フォロワーとの距離を縮める「遊べるプロフィール」がおすすめ。福引きやスクラッチでキャンペーンを盛り上げ、診断結果に合わせておすすめ商品を紹介すると収益化も加速します。"
    },
    marketer: {
      title: "LPメーカー ＋ セールスライター ＋ 診断クイズメーカー",
      desc: "スピーディーな検証が必要なあなたには、テンプレートで即作成できるLPとAI文章生成のセールスライターが最適。診断コンテンツをLPに埋め込むのもCVR向上に効果的です。"
    }
  };

  const handleAnswer = (type: string) => {
    setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScores({ freelance: 0, shop: 0, influencer: 0, marketer: 0 });
    setShowResult(false);
  };

  const getWinnerType = (): keyof typeof results => {
    const entries = Object.entries(scores) as [keyof typeof results, number][];
    const winner = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return winner[0];
  };

  // プロプラン決済処理（Stripe）
  const handleProPlanCheckout = async () => {
    setIsProcessingPayment(true);

    try {
      const email = user?.email;

      const referralCode = getReferralCode();
      if (referralCode && email) {
        try {
          await fetch('/api/affiliate/pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              referralCode: referralCode,
              service: 'makers',
              planTier: 'pro',
              planPeriod: 'monthly',
              userId: (user as { id?: string })?.id || null,
            }),
          });
          console.log('✅ Pending affiliate saved before Stripe checkout');
        } catch (err) {
          console.warn('⚠️ Failed to save pending affiliate:', err);
        }
      }

      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'makers_pro_monthly',
          userId: (user as { id?: string })?.id || null,
          email: email || null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        alert('決済ページの準備中です。しばらくお待ちください。');
      }
    } catch (error) {
      console.error('決済エラー:', error);
      alert('決済の開始に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#fffbf0' }}>
        <Loader2 className="animate-spin mb-4" size={48} style={{ color: '#f97316' }} />
        <p className="font-bold" style={{ color: '#5d4037' }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      fontFamily: "'Zen Maru Gothic', sans-serif",
      backgroundColor: '#fffbf0',
      color: '#5d4037',
      lineHeight: '2.0'
    }}>
      {/* アフィリエイト追跡 */}
      <Suspense fallback={null}>
        <AffiliateTracker serviceType="makers" />
      </Suspense>

      <AnnouncementBanner serviceType="all" />

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          animation: scroll 40s linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

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

      {/* プロプランモーダル */}
      {showProPlanModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 text-white px-6 py-5 flex justify-between items-center z-10 rounded-t-3xl" style={{ backgroundColor: '#f97316' }}>
              <div className="flex items-center gap-3">
                <Crown size={24} />
                <h3 className="font-bold text-xl">プロプラン</h3>
              </div>
              <button
                onClick={() => setShowProPlanModal(false)}
                className="text-white/80 hover:text-white transition p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              {/* 価格 */}
              <div className="text-center mb-6">
                <div className="text-4xl font-black" style={{ color: '#5d4037' }}>
                  ¥3,980<span className="text-lg font-normal text-gray-500">/月</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">税込 / いつでも解約可能</p>
              </div>

              {/* 機能一覧 */}
              <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#fffbf0' }}>
                <h4 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5d4037' }}>
                  <Sparkles size={18} style={{ color: '#f97316' }} />
                  プロプランで使える機能
                </h4>
                <ul className="space-y-3">
                  {[
                    { text: 'フリープランの全機能', highlight: false },
                    { text: 'アクセス解析', highlight: true },
                    { text: 'AI利用（優先・回数無制限）', highlight: true },
                    { text: 'HTMLダウンロード', highlight: true },
                    { text: '埋め込みコード発行', highlight: true },
                    { text: '広告非表示', highlight: true },
                    { text: '優先サポート', highlight: true },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check size={18} style={{ color: item.highlight ? '#f97316' : '#84cc16' }} />
                      <span className={`text-sm ${item.highlight ? 'font-bold' : ''}`} style={{ color: '#5d4037' }}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ログイン案内（未ログイン時） */}
              {!user && (
                <div className="border rounded-2xl p-4 mb-6" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <p className="text-sm" style={{ color: '#5d4037' }}>
                    <span className="font-bold">💡 ヒント：</span>
                    ログインすると、購入履歴がアカウントに紐付けられます。
                  </p>
                  <button
                    onClick={() => {
                      setShowProPlanModal(false);
                      setShowAuth(true);
                    }}
                    className="mt-2 text-sm font-bold hover:underline"
                    style={{ color: '#f97316' }}
                  >
                    ログイン / 新規登録はこちら →
                  </button>
                </div>
              )}

              {/* 決済ボタン */}
              <button
                onClick={handleProPlanCheckout}
                disabled={isProcessingPayment}
                className="w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transform"
                style={{ backgroundColor: '#f97316' }}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    処理中...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    決済ページへ進む
                    <ExternalLink size={16} />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Stripeによる安全な決済処理。カード情報は当サイトに保存されません。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-20 overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
        {/* ドット背景 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#f97316 1.5px, transparent 1.5px)',
            backgroundSize: '30px 30px',
            opacity: 0.1
          }}
        ></div>
        <div
          className="absolute top-0 left-1/2 w-[600px] h-[600px] rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{ backgroundColor: '#ffedd5' }}
        ></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-1.5 px-5 rounded-full bg-white text-sm font-bold mb-6 tracking-wide border-2 shadow-sm" style={{ color: '#f97316', borderColor: '#f97316' }}>
            ✨ ずっと0円、クレジットカード登録不要
          </span>
          <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }}>
            あなたのビジネスに<br className="hidden sm:block" />
            <span style={{ color: '#f97316' }}>「今」必要なツール</span>がわかる。
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            LP、予約、診断クイズ、アンケート...<br />
            集客メーカー (Makers) なら、あらゆる機能がこれ1つ。<br />
            まずは30秒の無料診断で、あなたにぴったりの組み合わせを見つけませんか？
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <button
              onClick={() => navigateTo('diagnosis')}
              className="w-full sm:w-auto text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#f97316' }}
            >
              <Sparkles size={20} />
              今すぐ診断する
            </button>
          </div>
          <p className="text-xs text-gray-500">※ アカウント作成は30秒で完了します</p>
        </div>
      </section>

      {/* Infinite Scroll (Marquee) */}
      <section className="py-10 border-y overflow-hidden" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)', borderColor: '#ffedd5' }}>
        <div className="container mx-auto px-4 mb-4 text-center">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">ALL IN ONE PLATFORM</p>
        </div>
        <div className="relative">
          <div className="marquee-content inline-flex py-2">
            {[
              { icon: Sparkles, text: "診断クイズメーカー", color: "text-pink-500" },
              { icon: FileText, text: "アンケートメーカー", color: "text-teal-500" },
              { icon: Users, text: "出欠表メーカー", color: "text-purple-500" },
              { icon: Calendar, text: "予約メーカー", color: "text-blue-500" },
              { icon: UserCircle, text: "プロフィールメーカー", color: "text-emerald-500" },
              { icon: Building2, text: "LPメーカー", color: "text-amber-500" },
              { icon: PenTool, text: "セールスライター", color: "text-rose-500" },
              { icon: Gift, text: "福引き", color: "text-pink-500" },
              { icon: Gamepad2, text: "ガチャ", color: "text-purple-500" },
              { icon: Star, text: "スロット", color: "text-yellow-500" },
              { icon: Ticket, text: "スクラッチ", color: "text-cyan-500" },
              { icon: Stamp, text: "スタンプラリー", color: "text-green-500" },
              { icon: TrendingUp, text: "ログインボーナス", color: "text-indigo-500" },
            ].concat([
              { icon: Sparkles, text: "診断クイズメーカー", color: "text-pink-500" },
              { icon: FileText, text: "アンケートメーカー", color: "text-teal-500" },
              { icon: Users, text: "出欠表メーカー", color: "text-purple-500" },
              { icon: Calendar, text: "予約メーカー", color: "text-blue-500" },
              { icon: UserCircle, text: "プロフィールメーカー", color: "text-emerald-500" },
              { icon: Building2, text: "LPメーカー", color: "text-amber-500" },
              { icon: PenTool, text: "セールスライター", color: "text-rose-500" },
              { icon: Gift, text: "福引き", color: "text-pink-500" },
              { icon: Gamepad2, text: "ガチャ", color: "text-purple-500" },
              { icon: Star, text: "スロット", color: "text-yellow-500" },
              { icon: Ticket, text: "スクラッチ", color: "text-cyan-500" },
              { icon: Stamp, text: "スタンプラリー", color: "text-green-500" },
              { icon: TrendingUp, text: "ログインボーナス", color: "text-indigo-500" },
            ]).map((tool, idx) => (
              <div key={idx} className="w-[200px] flex-shrink-0 bg-white border border-orange-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mx-3">
                <div className={`${tool.color} text-3xl mb-2`}>
                  <tool.icon size={32} />
                </div>
                <h3 className="font-bold text-sm" style={{ color: '#5d4037' }}>{tool.text}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 診断ツール */}
      <section id="diagnosis" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>あなたに最適なツール診断</h2>
            <p className="text-gray-600">3つの質問に答えるだけで、今の課題を解決するツールセットを提案します。</p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden min-h-[450px] flex flex-col relative border-4" style={{ borderColor: '#ffedd5' }}>
            <div className="w-full h-2" style={{ backgroundColor: '#ffedd5' }}>
              <div
                className="h-2 transition-all duration-300"
                style={{ backgroundColor: '#f97316', width: `${(showResult ? questions.length : currentQuestion) / questions.length * 100}%` }}
              ></div>
            </div>

            {!showResult ? (
              <div className="p-8 md:p-12 flex-grow flex flex-col justify-center animate-fade-in" key={currentQuestion}>
                <h3 className="text-xl md:text-2xl font-bold mb-8 text-center" style={{ color: '#5d4037' }}>
                  {questions[currentQuestion].question}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {questions[currentQuestion].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt.type)}
                      className="border-2 border-orange-100 p-4 rounded-2xl text-left font-bold hover:-translate-y-1 transition-all flex items-center gap-3 bg-white shadow-sm"
                      style={{ color: '#5d4037' }}
                    >
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#fed7aa', color: '#f97316' }}>
                        {idx + 1}
                      </div>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}>
                  <Sparkles size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-500 mb-1">あなたにおすすめの構成は...</h3>
                <div className="text-3xl font-black mb-6" style={{ color: '#f97316' }}>
                  {results[getWinnerType()].title}
                </div>

                <div className="p-6 rounded-2xl border mb-8 w-full text-left" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <h4 className="font-bold mb-2 border-b pb-2" style={{ color: '#5d4037', borderColor: '#ffedd5' }}>💡 なぜこれがおすすめ？</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {results[getWinnerType()].desc}
                  </p>
                </div>

                <button
                  onClick={() => navigateTo('create')}
                  className="block w-full md:w-auto text-white font-bold py-4 px-12 rounded-full shadow-lg transition transform hover:-translate-y-1 mb-8"
                  style={{ backgroundColor: '#f97316' }}
                >
                  このテンプレートで作成する（無料）
                </button>

                <div className="w-full pt-6 border-t" style={{ borderColor: '#ffedd5' }}>
                  <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">他にもこんな機能が使えます：</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <span className="px-3 py-1 rounded-full text-sm border border-orange-100 bg-white" style={{ color: '#5d4037' }}>お問い合わせフォーム</span>
                    <span className="px-3 py-1 rounded-full text-sm border border-orange-100 bg-white" style={{ color: '#5d4037' }}>SNSリンク集</span>
                    <span className="px-3 py-1 rounded-full text-sm border border-orange-100 bg-white" style={{ color: '#5d4037' }}>アクセス解析</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 比較表 */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#5d4037' }}>こんな「ツール迷子」になっていませんか？</h2>
              <p className="text-gray-600">あれもこれも契約して、管理画面を行き来する日々はもう終わりです。</p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border-2 overflow-hidden mb-12" style={{ borderColor: '#ffedd5' }}>
              <div className="grid grid-cols-2 text-center">
                <div className="p-6 border-b border-r" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <h3 className="font-bold text-gray-500">これまでの運用</h3>
                </div>
                <div className="p-6 border-b text-white" style={{ backgroundColor: '#f97316', borderColor: '#ffedd5' }}>
                  <h3 className="font-bold">Makersの運用</h3>
                </div>

                {/* Row 1 */}
                <div className="p-8 border-b border-r flex flex-col items-center justify-center gap-2" style={{ borderColor: '#ffedd5' }}>
                  <div className="text-4xl text-gray-300">
                    <Layers size={40} />
                  </div>
                  <div className="font-bold text-gray-600">バラバラのツール</div>
                  <div className="text-xs text-gray-400">HP・予約・フォーム...<br />3つ以上の管理画面</div>
                </div>
                <div className="p-8 border-b flex flex-col items-center justify-center gap-2" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <div className="text-4xl" style={{ color: '#f97316' }}>
                    <Check size={40} />
                  </div>
                  <div className="font-bold" style={{ color: '#5d4037' }}>これ1つで完結</div>
                  <div className="text-xs" style={{ color: '#f97316' }}>すべての機能が<br />ひとつの管理画面に</div>
                </div>

                {/* Row 2 */}
                <div className="p-8 border-r flex flex-col items-center justify-center gap-2" style={{ borderColor: '#ffedd5' }}>
                  <div className="text-4xl text-gray-300">
                    <TrendingUp size={40} />
                  </div>
                  <div className="font-bold text-gray-600">月額 ¥10,000~</div>
                  <div className="text-xs text-gray-400">ツールの数だけ<br />コストがかさむ</div>
                </div>
                <div className="p-8 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: '#fffbf0' }}>
                  <div className="text-4xl" style={{ color: '#f97316' }}>
                    <Sparkles size={40} />
                  </div>
                  <div className="font-bold text-2xl" style={{ color: '#5d4037' }}>¥0</div>
                  <div className="text-xs" style={{ color: '#f97316' }}>ずっと無料<br />追加費用なし</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 border-y" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)', borderColor: '#ffedd5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>プロ級のデザインが、あなたのものに。</h2>
            <p className="text-gray-600">デザインセンスは不要。豊富なテンプレートから選ぶだけです。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <img src="/lp/images/1.jpg" alt="カフェ＆ダイニング向けLP" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded">飲食・カフェ</span>
                  <h4 className="text-white font-bold mt-2">店舗紹介LP</h4>
                </div>
              </div>
              <p className="text-sm text-center font-bold text-gray-600">おしゃれなカフェ・飲食店向け</p>
            </div>
            <div className="group">
              <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <img src="/lp/images/2.jpg" alt="デザイナー・クリエイター向けLP" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-blue-500 px-2 py-1 rounded">ビジネス・講師</span>
                  <h4 className="text-white font-bold mt-2">ポートフォリオLP</h4>
                </div>
              </div>
              <p className="text-sm text-center font-bold text-gray-600">デザイナー・クリエイター向け</p>
            </div>
            <div className="group">
              <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <img src="/lp/images/3.jpg" alt="ビジネス課題診断クイズ" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-amber-600 px-2 py-1 rounded">診断クイズ</span>
                  <h4 className="text-white font-bold mt-2">ビジネス課題診断</h4>
                </div>
              </div>
              <p className="text-sm text-center font-bold text-gray-600">集客・リード獲得向け</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigateTo('portal')}
              className="font-bold border-b-2 transition inline-flex items-center gap-2"
              style={{ color: '#f97316', borderColor: '#f97316' }}
            >
              すべてのテンプレートを見る
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>ビジネスを加速させる「3つの力」</h2>
            <p className="text-gray-600">必要なのは「機能の多さ」ではなく「成果につながる流れ」です。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl border border-orange-50 hover:shadow-lg transition group" style={{ backgroundColor: '#fffbf0' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【集客】知ってもらう</h3>
              <p className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: '#5d4037' }}>プロフィールメーカー / LPメーカー / セールスライター</p>
              <p className="text-gray-600 text-sm">テンプレートを選ぶだけで、名刺代わりのWebページが完成。AIが売れる文章を自動生成。あなたの魅力やサービス内容を、スマホで見やすく伝えます。</p>
            </div>
            <div className="p-8 rounded-3xl border-2 shadow-lg transform md:-translate-y-4 relative group" style={{ backgroundColor: '#fffbf0', borderColor: '#f97316' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">差別化ポイント！</div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                <Gamepad2 size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【接客】ファンにする</h3>
              <p className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: '#5d4037' }}>診断クイズメーカー / ガチャ・福引き・スクラッチ等</p>
              <p className="text-gray-600 text-sm">ただ読ませるだけじゃない。「あなたは何タイプ？」診断クイズやガチャ、スタンプラリーなどの遊べるコンテンツで、お客様との距離を縮めます。</p>
            </div>
            <div className="p-8 rounded-3xl border border-orange-50 hover:shadow-lg transition group" style={{ backgroundColor: '#fffbf0' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【成約】スムーズに繋がる</h3>
              <p className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: '#5d4037' }}>予約メーカー / アンケートメーカー / 出欠表メーカー</p>
              <p className="text-gray-600 text-sm">面倒な日程調整の往復メールは不要。予約受付から顧客の声の収集、イベントの出欠管理まで自動化し、チャンスを逃しません。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cases Tabs */}
      <section className="py-24 border-y" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>あなたの「やりたいこと」別、活用レシピ</h2>
            <p className="text-gray-600">まだ「何ができるのか」イメージできない方へ。タブを切り替えて、実際の使い方を見てみましょう。</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {[
                { id: 'tab-freelance', label: '👤 フリーランス' },
                { id: 'tab-shop', label: '🏪 店舗・教室' },
                { id: 'tab-influencer', label: '📱 インフルエンサー' },
                { id: 'tab-marketer', label: '💼 マーケター' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-6 py-3 rounded-full font-bold transition"
                  style={activeTab === tab.id ? { backgroundColor: '#f97316', color: 'white' } : { backgroundColor: 'white', color: '#5d4037', border: '1px solid #ffedd5' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-lg border-2 p-8 md:p-12 min-h-[300px]" style={{ borderColor: '#ffedd5' }}>
              {activeTab === 'tab-freelance' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>👤 フリーランス（コーチ・ヨガ講師・コンサル等）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「プロフィールメーカー」で実績・経歴を魅力的に紹介し、「予約メーカー」で日程調整の手間をゼロに。「セールスライター」でAIが売れる文章を自動生成。無駄な問い合わせ対応をなくし、集客に専念できます。
                  </p>
                  <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#f97316' }}>
                    <p className="text-sm font-bold" style={{ color: '#f97316' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                      ・オンライン相談の事前ヒアリングをアンケートで自動化<br />
                      ・セミナー後のフォローアップクイズでエンゲージメント向上<br />
                      ・セールスライターでサービス紹介文を簡単作成
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tab-shop' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>🏪 店舗・教室（飲食店・美容室・スクール等）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「診断クイズメーカー」でお客様を楽しませながら、結果ページに「おすすめメニュー」や「クーポン」を表示。「ガチャ」「福引き」「スクラッチ」でキャンペーンを盛り上げ、SNS映えするコンテンツで拡散を狙えます。
                  </p>
                  <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#ec4899' }}>
                    <p className="text-sm font-bold" style={{ color: '#ec4899' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                      ・来店スタンプラリーで「リピーター特典」を自動配布<br />
                      ・ログインボーナスで毎日アプリを開く習慣を作る<br />
                      ・ガチャやスロットで景品抽選イベントを開催<br />
                      ・お客様の声をアンケートで収集してGoogleレビュー誘導
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tab-influencer' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>📱 インフルエンサー（SNS発信者・アフィリエイター）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「プロフィールメーカー」に全SNSのリンクを集約し、「診断クイズメーカー」でフォロワーとの距離を縮める。「福引き」「スクラッチ」でキャンペーンを盛り上げ、結果画面で商品リンクを掲載すれば収益化も加速します。
                  </p>
                  <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#8b5cf6' }}>
                    <p className="text-sm font-bold" style={{ color: '#8b5cf6' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                      ・「あなたは何タイプ？」診断でエンゲージメント率アップ<br />
                      ・福引きやスクラッチでプレゼント企画を開催<br />
                      ・診断結果に応じてアフィリエイト商品をレコメンド
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tab-marketer' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>💼 マーケター（Web制作・広告運用者）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「LPメーカー」をテンプレートで即作成、A/Bテストも簡単。「セールスライター」でAIが売れるコピーを自動生成。「診断コンテンツ」をLPに埋め込めば、滞在時間とCVRを同時に改善できます。
                  </p>
                  <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#2563eb' }}>
                    <p className="text-sm font-bold" style={{ color: '#2563eb' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>
                      ・セールスライターでLP文章を自動生成<br />
                      ・クライアント向けにアンケートフォームを一元管理<br />
                      ・リード獲得用の診断LPを量産してテストマーケティング
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Selected Cases */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>こんな使い方が選ばれています</h2>
            <p className="text-gray-600">実際に効果があった「機能の組み合わせ方」をご紹介。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl border-2 shadow-lg" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: '#f97316' }}>
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#5d4037' }}>エステサロン × 診断クイズ</h3>
                  <p className="text-sm text-gray-500">@東京・渋谷</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                「あなたにぴったりの美肌ケア診断」を公式LINEで配信したところ、<span className="font-bold" style={{ color: '#f97316' }}>診断実施者の42%が予約ページへ遷移</span>。従来のクーポン配布よりも高い反応率を記録しました。
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-white px-3 py-1 rounded-full border-2 font-bold" style={{ borderColor: '#f97316', color: '#5d4037' }}>診断クイズ</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border-2 font-bold" style={{ borderColor: '#f97316', color: '#5d4037' }}>予約機能</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border-2 font-bold" style={{ borderColor: '#f97316', color: '#5d4037' }}>プロフィールLP</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl border-2 shadow-lg" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: '#f97316' }}>
                  <UserCircle size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#5d4037' }}>キャリアコーチ × プロフィールLP</h3>
                  <p className="text-sm text-gray-500">@オンライン</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                従来はメール・LINE・電話で日程調整していたが、プロフィールに「予約機能」を統合したことで、<span className="font-bold" style={{ color: '#f97316' }}>事務作業が週10時間削減</span>。空いた時間を本業に充てられるようになりました。
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-white px-3 py-1 rounded-full border-2 font-bold" style={{ borderColor: '#f97316', color: '#5d4037' }}>プロフィールLP</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border-2 font-bold" style={{ borderColor: '#f97316', color: '#5d4037' }}>予約機能</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border-2 font-bold" style={{ borderColor: '#f97316', color: '#5d4037' }}>アンケート</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Steps */}
      <section className="py-24 border-t" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>使い方はシンプル</h2>
            <p className="text-gray-600">パソコンが苦手でも大丈夫。3ステップで完成します。</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#f97316' }}>
                  1
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>テンプレートを選ぶ</h3>
                <p className="text-sm text-gray-600">業種や目的に合わせて、豊富なテンプレートから選択。デザインの知識は不要です。</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#ec4899' }}>
                  2
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>文字と画像を変える</h3>
                <p className="text-sm text-gray-600">あなたのビジネス内容に合わせて、テキストや画像を差し替えるだけ。直感的に編集できます。</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#84cc16' }}>
                  3
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>公開してシェア</h3>
                <p className="text-sm text-gray-600">あなた専用のURLが発行されます。SNSや名刺に載せて、すぐに集客スタート！</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => setShowAuth(true)}
                className="text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl transition transform hover:-translate-y-1 inline-flex items-center gap-2"
                style={{ backgroundColor: '#f97316' }}
              >
                <Sparkles size={20} />
                無料で始める（30秒で登録完了）
              </button>
              <p className="text-xs text-gray-500 mt-3">※ クレジットカード登録不要</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="create-section" className="py-24 bg-white border-t" style={{ borderColor: '#ffedd5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>わかりやすい料金プラン</h2>
            <p className="text-gray-600">まずは無料で、すべての機能をお試しいただけます。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            {/* ゲスト */}
            <div className="border-2 rounded-3xl p-6 flex flex-col bg-white hover:shadow-lg transition" style={{ borderColor: '#ffedd5' }}>
              <div className="mb-4 text-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#fffbf0', color: '#5d4037' }}>お試し体験</span>
                <h3 className="text-xl font-bold mt-2" style={{ color: '#5d4037' }}>ゲスト</h3>
                <div className="mt-1 text-gray-500">
                  <span className="text-3xl font-bold" style={{ color: '#5d4037' }}>¥0</span>
                  <span className="text-xs">/ 回</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-6 text-center">
                登録なしで、今すぐお試し作成。<br />※保存はされません
              </p>

              <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>新規作成</span>
                  <Check size={16} style={{ color: '#84cc16' }} />
                </li>
                <li className="pl-3 text-xs text-gray-500 leading-relaxed">
                  診断クイズメーカー / アンケートメーカー / 出欠表メーカー / 予約メーカー / プロフィールメーカー / LPメーカー / セールスライター / 福引き / ガチャ / スロット / スクラッチ / スタンプラリー / ログインボーナス
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>ポータル掲載</span>
                  <Check size={16} style={{ color: '#84cc16' }} />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>URL発行</span>
                  <Check size={16} style={{ color: '#84cc16' }} />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>編集・更新</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>アフィリエイト機能</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>アクセス解析</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>AI利用</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>ゲーミフィケーション</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>HTMLダウンロード</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>埋め込みコード発行</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>コピーライト非表示</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>お問い合わせ</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>各種セミナー参加</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>グループコンサル</span>
                  <span className="text-gray-300">×</span>
                </li>
              </ul>

              <button
                onClick={() => navigateTo('create')}
                className="block w-full py-3 px-4 font-bold text-center rounded-2xl transition text-sm" style={{ backgroundColor: '#fffbf0', color: '#5d4037' }}
              >
                登録せず試す
              </button>
            </div>

            {/* フリープラン */}
            <div className="border-4 rounded-3xl p-6 flex flex-col bg-white shadow-xl" style={{ borderColor: '#f97316' }}>
              <div className="mb-4 text-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}>標準</span>
                <h3 className="text-xl font-bold mt-2" style={{ color: '#f97316' }}>フリープラン</h3>
                <div className="mt-1 text-gray-500">
                  <span className="text-3xl font-bold" style={{ color: '#5d4037' }}>¥0</span>
                  <span className="text-xs">/ 月</span>
                </div>
              </div>
              <p className="text-xs mb-6 text-center font-bold" style={{ color: '#5d4037' }}>
                30秒でできるアカウント登録だけでOK！<br />
                ずっと無料で使い放題。
              </p>

              <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>新規作成</span>
                  <Check size={16} style={{ color: '#f97316' }} />
                </li>
                <li className="pl-3 text-xs text-gray-500 leading-relaxed">
                  診断クイズメーカー / アンケートメーカー / 出欠表メーカー / 予約メーカー / プロフィールメーカー / LPメーカー / セールスライター / 福引き / ガチャ / スロット / スクラッチ / スタンプラリー / ログインボーナス
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>ポータル掲載</span>
                  <Check size={16} style={{ color: '#f97316' }} />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>URL発行</span>
                  <Check size={16} style={{ color: '#f97316' }} />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>編集・更新</span>
                  <Check size={16} style={{ color: '#f97316' }} />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>アフィリエイト機能</span>
                  <Check size={16} style={{ color: '#f97316' }} />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>アクセス解析</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>AI利用</span>
                  <span className="text-xs" style={{ color: '#f97316' }}>回数制限</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>ゲーミフィケーション</span>
                  <span className="text-xs" style={{ color: '#f97316' }}>回数制限</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>HTMLダウンロード</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>埋め込みコード発行</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>コピーライト非表示</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>お問い合わせ</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>各種セミナー参加</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span>グループコンサル</span>
                  <span className="text-gray-300">×</span>
                </li>
              </ul>

              <button
                onClick={() => setShowAuth(true)}
                className="block w-full py-3 px-4 text-white font-bold text-center rounded-2xl transition text-sm shadow-md hover:-translate-y-1 transform"
                style={{ backgroundColor: '#f97316' }}
              >
                無料で登録する
              </button>
            </div>

            {/* プロプラン */}
            <div className="border-2 border-purple-200 rounded-3xl p-6 flex flex-col hover:shadow-lg transition" style={{ backgroundColor: '#fffbf0' }}>
              <div className="mb-4 text-center">
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">ビジネス向け</span>
                <h3 className="text-xl font-bold text-purple-800 mt-2">プロプラン</h3>
                <div className="mt-1 text-gray-500">
                  <span className="text-3xl font-bold" style={{ color: '#5d4037' }}>¥3,980</span>
                  <span className="text-xs">/ 月</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-6 text-center">
                本格的なビジネス運用に。<br />制限なしで使い放題。
              </p>

              <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>新規作成</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="pl-3 text-xs text-gray-500 leading-relaxed">
                  診断クイズメーカー / アンケートメーカー / 出欠表メーカー / 予約メーカー / プロフィールメーカー / LPメーカー / セールスライター / 福引き / ガチャ / スロット / スクラッチ / スタンプラリー / ログインボーナス
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>ポータル掲載</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>URL発行</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>編集・更新</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>アフィリエイト機能</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>アクセス解析</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>AI利用</span>
                  <span className="text-xs text-purple-500">優先</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>ゲーミフィケーション</span>
                  <span className="text-xs text-purple-500">無制限</span>
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>HTMLダウンロード</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>埋め込みコード発行</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>コピーライト非表示</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>お問い合わせ</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>各種セミナー参加</span>
                  <Check size={16} className="text-purple-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                  <span>グループコンサル</span>
                  <Check size={16} className="text-purple-500" />
                </li>
              </ul>

              <button
                onClick={() => setShowProPlanModal(true)}
                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-center rounded-2xl transition text-sm shadow-md hover:-translate-y-1 transform"
              >
                プロプランに申し込む
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>よくある質問</h2>
            <p className="text-gray-600">不安や疑問を解消してから、始めましょう。</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Q. 本当に無料で使えますか？追加料金はかかりませんか？',
                a: 'はい、フリープランは永久無料です。クレジットカード登録も不要。診断クイズ、プロフィールLP、予約機能（月30件まで）などが追加料金なしで使えます。プロプランにアップグレードする際も、いつでも解約可能です。',
              },
              {
                q: 'Q. パソコンが苦手でも使えますか？',
                a: '大丈夫です。テンプレートを選んで文字を変えるだけなので、パソコン操作に自信がない方でも直感的に使えます。スマホからでも編集可能です。もし困ったときは、サポートチームが丁寧にご案内します。',
              },
              {
                q: 'Q. 他のツールからの乗り換えは簡単ですか？',
                a: 'はい、とても簡単です。既存のWebページやGoogleフォームの内容をコピー＆ペーストするだけで移行できます。予約システムも同様に、既存のカレンダーと連携できるので、移行の手間はほとんどかかりません。',
              },
              {
                q: 'Q. 商用利用は可能ですか？',
                a: 'もちろんです。フリープラン・プロプランともに商用利用が可能です。サロン集客、コンサルティング営業、アフィリエイト、クライアントワークなど、あらゆるビジネスシーンでご利用いただけます。',
              },
              {
                q: 'Q. 作成したページは、どこで公開されますか？',
                a: 'makers.tokyo/あなたのID というURLで公開されます。このリンクをSNSのプロフィール、名刺、チラシなどに掲載してご利用ください。プロプランでは独自ドメインの設定も可能です（準備中）。',
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-orange-50" style={{ backgroundColor: 'white' }}>
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                    <span>{faq.q}</span>
                    <span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                    {faq.a}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サービス選択セクション */}
      <section id="create-section-services" className="py-24 bg-white border-t" style={{ borderColor: '#ffedd5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>
              何を作りますか？
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              目的に合わせて最適なコンテンツタイプを選択してください
            </p>
          </div>

          <ServiceSelector
            onSelect={handleServiceSelect}
            variant="cards"
            showDescription={true}
          />

          {/* ログイン案内 */}
          {!user && (
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="border-2 rounded-3xl p-6" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl flex-shrink-0" style={{ backgroundColor: '#f97316' }}>
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#5d4037' }}>
                      ログインすると便利な機能が使えます！
                    </h3>
                    <ul className="text-sm space-y-1 mb-4" style={{ color: '#5d4037' }}>
                      <li className="flex items-center gap-2">
                        <Check size={14} style={{ color: '#84cc16' }} />
                        作成したコンテンツの編集・削除が可能
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} style={{ color: '#84cc16' }} />
                        マイページでアクセス解析を確認
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} style={{ color: '#84cc16' }} />
                        HTMLダウンロード・埋め込みコードなどの追加オプションが利用可能
                      </li>
                    </ul>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="text-white px-6 py-2 rounded-full font-bold transition-colors text-sm"
                      style={{ backgroundColor: '#f97316' }}
                    >
                      ログイン / 新規登録
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 予約・日程調整・アンケートサービスの誘導 */}
      <section className="py-12 border-y" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#5d4037' }}>
              その他の便利な機能
            </h2>
            <p className="text-gray-600 text-sm">
              予約管理・アンケート収集・出欠表・AI文章生成など、ビジネスに役立つツール
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 予約・日程調整 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Calendar size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#5d4037' }}>予約・日程調整</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    カレンダー形式で予約を受け付け。面談・相談・サービス予約などに最適です。予約枠を簡単に管理できます。
                  </p>
                  <button
                    onClick={() => navigateTo('booking/new')}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Calendar size={16} />
                    予約メニューを作成
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* アンケート（投票） */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <ClipboardList size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#5d4037' }}>アンケート（投票）</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    顧客の声を収集。投票機能付きアンケートで意見を集約。SNSで拡散しやすく、結果をリアルタイムで確認できます。
                  </p>
                  <button
                    onClick={() => navigateTo('survey/new')}
                    className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-teal-700 transition-colors text-sm"
                  >
                    <ClipboardList size={16} />
                    アンケートを作成
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* 出欠表・イベント管理 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Users size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#5d4037' }}>出欠表・イベント管理</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    飲み会・イベントの日程調整を簡単に。調整さん風の出欠表を無料で何度でも作成できます。
                  </p>
                  <button
                    onClick={() => navigateTo('attendance/new')}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Users size={16} />
                    出欠表を作成
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* セールスライター */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <PenTool size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#5d4037' }}>セールスライター（AI文章生成）</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    セールスレター・LP文章をAIで自動生成。売れるコピーライティングを誰でも簡単に作成できます。
                  </p>
                  <button
                    onClick={() => navigateTo('salesletter/editor')}
                    className="inline-flex items-center gap-2 bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-rose-700 transition-colors text-sm"
                  >
                    <PenTool size={16} />
                    文章を作成
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 人気コンテンツセクション */}
      {popularContents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#f97316' }}>
                <TrendingUp size={20} />
                <span className="font-bold">人気コンテンツ</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>
                みんなが楽しんでいる診断クイズ
              </h2>
              <p className="text-lg text-gray-600">
                人気の診断クイズをチェックしてみよう
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularContents.slice(0, 3).map((content, index) => (
                <a
                  key={content.id}
                  href={`/${content.type}/${content.slug}`}
                  className="group rounded-3xl border-2 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}
                >
                  {/* ランキングバッジ */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                        : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye size={16} />
                      <span className="font-bold">{content.views_count.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* コンテンツ情報 */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f97316' }}>
                      <Sparkles size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2 transition-colors" style={{ color: '#5d4037' }}>
                        {content.title}
                      </h3>
                      {content.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {content.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#ffedd5' }}>
                    <span className="text-sm font-bold transition-all flex items-center gap-1" style={{ color: '#f97316' }}>
                      診断を受ける
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* もっと見るボタン */}
            <div className="text-center mt-8">
              <a
                href="/portal?tab=quiz"
                className="inline-flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-full border-2 transition-all"
                style={{ color: '#f97316', borderColor: '#f97316' }}
              >
                <LayoutGrid size={20} />
                もっと見る
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 特徴セクション */}
      <section className="py-24 border-t" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>
              集客メーカーが選ばれる理由
            </h2>
            <p className="text-lg text-gray-600">
              ビジネスを加速させる「3つの力」
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI自動生成',
                description: 'テーマを入力するだけでAIが質問・結果・キャッチコピーを自動生成。プロ品質のコンテンツが数分で完成',
                iconColor: '#facc15',
                iconBg: '#fef9c3',
              },
              {
                icon: Share2,
                title: 'SNS拡散設計',
                description: 'シェアされやすい診断結果、魅力的なOGP画像。オーガニックな拡散で広告費ゼロの集客を実現',
                iconColor: '#f97316',
                iconBg: '#ffedd5',
              },
              {
                icon: Target,
                title: 'SEO・AI検索対応',
                description: '構造化データ対応でGoogle・ChatGPT両方からの流入を最大化。検索で見つかるコンテンツに',
                iconColor: '#84cc16',
                iconBg: '#ecfccb',
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-3xl border border-orange-50 hover:shadow-lg transition">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: feature.iconBg }}>
                  <feature.icon size={32} style={{ color: feature.iconColor }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden border-t" style={{ backgroundColor: '#f97316', borderColor: '#f97316' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white">
            あなたのビジネスを、<br />
            もっと「楽しく」「楽に」。
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-orange-100">
            集客メーカー (Makers) は、あなたの「やりたいこと」を実現するためのツールです。<br />
            まずは無料で試してみませんか？
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button
              onClick={() => setShowAuth(true)}
              className="w-full sm:w-auto bg-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
              style={{ color: '#f97316' }}
            >
              <Sparkles size={20} />
              無料で始める
            </button>
            <button
              onClick={() => navigateTo('diagnosis')}
              className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white/10 text-white text-lg font-bold py-4 px-12 rounded-full transition transform hover:-translate-y-1"
            >
              診断から始める
            </button>
          </div>

          <p className="text-sm text-orange-100">
            ※ 登録は30秒で完了 / クレジットカード不要 / いつでも無料で使えます
          </p>
        </div>
      </section>

      {/* トップに戻るボタン */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: '#f97316' }}
          aria-label="トップに戻る"
        >
          <ArrowUp size={24} />
        </button>
      )}

      <Footer
        setPage={navigateTo}
        onCreate={(service) => service && navigateTo(`${service}/editor`)}
        user={user}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}
