'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ServiceSelector from '@/components/shared/ServiceSelector';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { 
  Sparkles, 
  UserCircle, 
  Building2, 
  ArrowRight, 
  Check, 
  Zap,
  Loader2,
  Magnet,
  Target,
  Share2,
  LayoutGrid,
  BookOpen,
  Calendar,
  ClipboardList,
  TrendingUp,
  Eye,
  Gamepad2,
  Layers,
} from 'lucide-react';

interface PopularContent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: 'quiz' | 'profile' | 'business';
  views_count: number;
}

export default function HomePageClient() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [popularContents, setPopularContents] = useState<PopularContent[]>([]);
  
  // 診断ツール用のstate
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ freelance: 0, shop: 0, influencer: 0, marketer: 0 });
  const [showResult, setShowResult] = useState(false);
  
  // タブ切り替え用のstate
  const [activeTab, setActiveTab] = useState('tab-freelance');

  // 管理者かどうかを判定
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email => 
    user.email?.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        // 認証状態の変更を監視
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        // 初期セッション取得
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        // 人気コンテンツを取得（診断クイズのTOP5）
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
      // 作成ページへのスクロール
      document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // 全てのページをルーティング
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
      title: "プロフィールLP ＋ 予約機能",
      desc: "事務作業を自動化したいあなたに最適。名刺代わりのプロフィールページに予約機能をつけ、日程調整の手間をゼロにしましょう。",
      service: "profile"
    },
    shop: {
      title: "診断クイズ ＋ クーポンLP",
      desc: "お店の集客には「エンタメ」が効きます。診断クイズでお客様を楽しませ、結果画面でクーポンを配布して来店を促しましょう。",
      service: "quiz"
    },
    influencer: {
      title: "診断ゲーム ＋ プロフィール",
      desc: "フォロワーとの距離を縮める「遊べるプロフィール」がおすすめ。診断結果に合わせて、おすすめの商品を紹介すると収益化も加速します。",
      service: "quiz"
    },
    marketer: {
      title: "ビジネスLP ＋ アクセス解析",
      desc: "スピーディーな検証が必要なあなたには、テンプレートで即作成できるビジネスLPが最適。診断コンテンツをLPに埋め込むのもCVR向上に効果的です。",
      service: "business"
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-bold text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* メインサイト用アフィリエイトトラッカー */}
      <AffiliateTracker serviceType="main" />
      
      <AnnouncementBanner serviceType="all" />
      
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 animate-gradient-colors text-white">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* ロゴ */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
              <Magnet size={28} className="text-yellow-300" />
              <span className="text-xl font-bold">集客メーカー</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              顧客を引き寄せる
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                コンテンツ
              </span>
              を作ろう
            </h1>
            <p className="text-xl sm:text-2xl opacity-90 mb-10 font-medium">
              診断クイズ・プロフィールLP・ビジネスLP<br className="sm:hidden" />
              をAIで簡単作成。SNS拡散・SEO対策で集客を加速
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateTo('create')}
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Magnet size={22} />
                無料で作成する
              </button>
              {user ? (
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  マイページへ
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  ログイン
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 波形装飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* ポータルへの誘導 */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <LayoutGrid size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">みんなの作品を見る</h3>
                <p className="text-gray-600 text-sm">他のユーザーが作成した診断クイズ・LPをチェック</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('portal')}
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
            >
              <LayoutGrid size={18} />
              ポータルを見る
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Kindle出版サービスの誘導 */}
      <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">📚 キンドルダイレクトライト</h3>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
                </div>
                <p className="text-gray-600 text-sm">AIがあなたのKindle出版をフルサポート。目次作成から執筆まで。</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('kindle/lp')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg"
            >
              <BookOpen size={18} />
              詳しく見る
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 予約・日程調整・アンケートサービスの誘導 */}
      <section className="py-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              その他の便利な機能
            </h2>
            <p className="text-gray-600 text-sm">
              予約管理・アンケート収集など、ビジネスに役立つツール
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 予約・日程調整 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Calendar size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">予約・日程調整</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    カレンダー形式で予約を受け付け。面談・相談・サービス予約などに最適です。予約枠を簡単に管理できます。
                  </p>
                  <button
                    onClick={() => navigateTo('booking/new')}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Calendar size={16} />
                    予約メニューを作成
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* アンケート（投票） */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition-all hover:scale-[1.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <ClipboardList size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">アンケート（投票）</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    顧客の声を収集。投票機能付きアンケートで意見を集約。SNSで拡散しやすく、結果をリアルタイムで確認できます。
                  </p>
                  <button
                    onClick={() => navigateTo('survey/new')}
                    className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors text-sm"
                  >
                    <ClipboardList size={16} />
                    アンケートを作成
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 無限スクロール（Marquee） - ALL IN ONE PLATFORM */}
      <section className="py-10 bg-gray-50 border-y border-gray-200 overflow-hidden">
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
        `}</style>
        
        <div className="container mx-auto px-4 mb-4 text-center">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">ALL IN ONE PLATFORM</p>
        </div>
        
        <div className="relative">
          <div className="marquee-content inline-flex py-2">
            {/* Set 1 */}
            <div className="flex gap-6 px-3">
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-pink-400 transition-all duration-300">
                <div className="text-pink-500 text-3xl mb-2">
                  <Sparkles size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">診断クイズ</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-indigo-400 transition-all duration-300">
                <div className="text-indigo-500 text-3xl mb-2">
                  <UserCircle size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">プロフィールLP</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 transition-all duration-300">
                <div className="text-blue-500 text-3xl mb-2">
                  <Building2 size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">ビジネスLP</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-green-400 transition-all duration-300">
                <div className="text-green-500 text-3xl mb-2">
                  <Calendar size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">予約・日程調整</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-yellow-400 transition-all duration-300">
                <div className="text-yellow-500 text-3xl mb-2">
                  <ClipboardList size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">アンケート</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-purple-400 transition-all duration-300">
                <div className="text-purple-500 text-3xl mb-2">
                  <Gamepad2 size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">ゲーム作成</h3>
              </div>
            </div>
            
            {/* Set 2 (Duplicate for seamless loop) */}
            <div className="flex gap-6 px-3">
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-pink-400 transition-all duration-300">
                <div className="text-pink-500 text-3xl mb-2">
                  <Sparkles size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">診断クイズ</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-indigo-400 transition-all duration-300">
                <div className="text-indigo-500 text-3xl mb-2">
                  <UserCircle size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">プロフィールLP</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 transition-all duration-300">
                <div className="text-blue-500 text-3xl mb-2">
                  <Building2 size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">ビジネスLP</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-green-400 transition-all duration-300">
                <div className="text-green-500 text-3xl mb-2">
                  <Calendar size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">予約・日程調整</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-yellow-400 transition-all duration-300">
                <div className="text-yellow-500 text-3xl mb-2">
                  <ClipboardList size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">アンケート</h3>
              </div>
              
              <div className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-purple-400 transition-all duration-300">
                <div className="text-purple-500 text-3xl mb-2">
                  <Gamepad2 size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">ゲーム作成</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 診断ツール */}
      <section id="diagnosis" className="py-20 bg-indigo-900 text-white relative overflow-hidden">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>
        
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">あなたに最適なツール診断</h2>
            <p className="text-indigo-200">3つの質問に答えるだけで、今の課題を解決するツールセットを提案します。</p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-800 min-h-[450px] flex flex-col relative">
            <div className="w-full bg-gray-200 h-2">
              <div 
                className="bg-indigo-500 h-2 transition-all duration-300"
                style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              ></div>
            </div>

            {!showResult ? (
              <div className="p-8 md:p-12 flex-grow flex flex-col justify-center animate-fade-in" key={currentQuestion}>
                <h3 className="text-xl md:text-2xl font-bold mb-8 text-center">
                  {questions[currentQuestion].question}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {questions[currentQuestion].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt.type)}
                      className="bg-gray-50 border-2 border-gray-200 p-4 rounded-xl text-left font-bold text-gray-700 hover:border-indigo-500 hover:bg-indigo-50 hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-500 mb-1">あなたにおすすめの構成は...</h3>
                <div className="text-3xl font-black text-indigo-600 mb-6">
                  {results[getWinnerType()].title}
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 w-full text-left">
                  <h4 className="font-bold text-gray-700 mb-2 border-b pb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-500" />
                    なぜこれがおすすめ？
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {results[getWinnerType()].desc}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => navigateTo(`${results[getWinnerType()].service}/editor`)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition transform hover:-translate-y-1"
                  >
                    このテンプレートで作成する（無料）
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-lg transition"
                  >
                    もう一度診断する
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 比較表：これまでの運用 vs Makersの運用 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">こんな「ツール迷子」になっていませんか？</h2>
              <p className="text-gray-600">あれもこれも契約して、管理画面を行き来する日々はもう終わりです。</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-12">
              <div className="grid grid-cols-2 text-center">
                <div className="bg-gray-100 p-6 border-b border-r border-gray-200">
                  <h3 className="font-bold text-gray-500">これまでの運用</h3>
                </div>
                <div className="bg-indigo-600 p-6 border-b border-gray-200">
                  <h3 className="font-bold text-white">集客メーカー (Makers) の運用</h3>
                </div>
                
                {/* Row 1 */}
                <div className="p-8 border-b border-r border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="text-4xl text-gray-300">
                    <Layers size={40} />
                  </div>
                  <div className="font-bold text-gray-600">バラバラのツール</div>
                  <div className="text-xs text-gray-400">HP・予約・フォーム...<br />3つ以上の管理画面</div>
                </div>
                <div className="p-8 border-b border-gray-100 bg-indigo-50 flex flex-col items-center justify-center gap-2">
                  <div className="text-4xl text-indigo-500">
                    <Check size={40} />
                  </div>
                  <div className="font-bold text-indigo-900">これ1つで完結</div>
                  <div className="text-xs text-indigo-600">すべての機能が<br />ひとつの管理画面に</div>
                </div>

                {/* Row 2 */}
                <div className="p-8 border-r border-gray-100 flex flex-col items-center justify-center gap-2">
                  <div className="text-4xl text-gray-300">
                    <TrendingUp size={40} />
                  </div>
                  <div className="font-bold text-gray-600">月額 ¥10,000~</div>
                  <div className="text-xs text-gray-400">ツールの数だけ<br />コストがかさむ</div>
                </div>
                <div className="p-8 bg-indigo-50 flex flex-col items-center justify-center gap-2">
                  <div className="text-4xl text-indigo-500">
                    <Magnet size={40} />
                  </div>
                  <div className="font-bold text-indigo-900 text-2xl">¥0</div>
                  <div className="text-xs text-indigo-600">ずっと無料<br />追加費用なし</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ギャラリー：プロ級のデザインテンプレート */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">プロ級のデザインが、あなたのものに。</h2>
            <p className="text-gray-600">デザインセンスは不要。豊富なテンプレートから選ぶだけです。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Template 1 */}
            <div className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-gray-400">
                  <Sparkles size={64} />
                </div>
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-pink-500 px-2 py-1 rounded">美容・サロン</span>
                  <h4 className="text-white font-bold mt-2">予約機能付きLP</h4>
                </div>
              </div>
              <p className="text-sm text-center text-gray-600 font-bold">スタイリッシュなサロン向け</p>
            </div>

            {/* Template 2 */}
            <div className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center text-gray-400">
                  <UserCircle size={64} />
                </div>
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-1 rounded">ビジネス・講師</span>
                  <h4 className="text-white font-bold mt-2">信頼感のあるプロフィール</h4>
                </div>
              </div>
              <p className="text-sm text-center text-gray-600 font-bold">講師・コンサルタント向け</p>
            </div>

            {/* Template 3 */}
            <div className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center text-gray-400">
                  <Building2 size={64} />
                </div>
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-yellow-500 px-2 py-1 rounded">飲食・エンタメ</span>
                  <h4 className="text-white font-bold mt-2">診断クイズ＆クーポン</h4>
                </div>
              </div>
              <p className="text-sm text-center text-gray-600 font-bold">ポップな店舗紹介向け</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={() => navigateTo('portal')}
              className="text-indigo-600 font-bold border-b-2 border-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-2"
            >
              すべてのテンプレートを見る
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* サービス選択セクション */}
      <section id="create-section" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
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
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 p-2 rounded-lg flex-shrink-0">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      ログインすると便利な機能が使えます！
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-1 mb-4">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0" />
                        作成したコンテンツの編集・削除が可能
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0" />
                        マイページでアクセス解析を確認
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-green-600 flex-shrink-0" />
                        HTMLダウンロード・埋め込みコードなどの追加オプションが利用可能
                      </li>
                    </ul>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors text-sm"
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

      {/* 活用レシピ：タブ切り替え式 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">集客メーカーの活用レシピ</h2>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-4xl mx-auto border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tab-freelance')}
              className={`px-6 py-3 font-bold transition rounded-t-lg flex items-center gap-2 ${
                activeTab === 'tab-freelance' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              <UserCircle size={18} />
              個人事業主・コーチ
            </button>
            <button
              onClick={() => setActiveTab('tab-influencer')}
              className={`px-6 py-3 font-bold transition rounded-t-lg flex items-center gap-2 ${
                activeTab === 'tab-influencer' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              <Share2 size={18} />
              SNS発信者
            </button>
            <button
              onClick={() => setActiveTab('tab-shop')}
              className={`px-6 py-3 font-bold transition rounded-t-lg flex items-center gap-2 ${
                activeTab === 'tab-shop' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              <Building2 size={18} />
              店舗オーナー
            </button>
            <button
              onClick={() => setActiveTab('tab-marketer')}
              className={`px-6 py-3 font-bold transition rounded-t-lg flex items-center gap-2 ${
                activeTab === 'tab-marketer' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              <TrendingUp size={18} />
              マーケター
            </button>
          </div>

          <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
            {/* Freelance Tab */}
            {activeTab === 'tab-freelance' && (
              <div className="flex flex-col md:flex-row gap-8 items-center animate-fade-in">
                <div className="md:w-1/2">
                  <span className="text-orange-500 font-bold text-sm mb-2 block">RECOMMENDATION</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">事務員を雇うより、<br />集客メーカーを使おう。</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    本業が忙しいあなたに必要なのは、「勝手に働いてくれるWebページ」です。プロフィールを見て興味を持ったお客様を、そのまま予約まで自動誘導。面倒な日程調整メールから解放されましょう。
                  </p>
                  <button
                    onClick={() => navigateTo('profile/editor')}
                    className="text-indigo-600 font-bold hover:underline text-sm inline-flex items-center gap-2"
                  >
                    この構成で作成する
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <UserCircle size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">プロフィールLP</div>
                        <div className="text-xs text-slate-500">信頼できる経歴と想いを掲載</div>
                      </div>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">
                      <ArrowRight size={20} className="rotate-90" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">予約・日程調整</div>
                        <div className="text-xs text-slate-500">カレンダー連携で自動受付</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Influencer Tab */}
            {activeTab === 'tab-influencer' && (
              <div className="flex flex-col md:flex-row gap-8 items-center animate-fade-in">
                <div className="md:w-1/2">
                  <span className="text-pink-500 font-bold text-sm mb-2 block">RECOMMENDATION</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">ただのリンク集は卒業。<br />「遊べる」プロフィールへ。</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    リンクを並べるだけでは、ファンは増えません。「あなたは何タイプ？」などの診断クイズを設置して、フォロワーに楽しんでもらいましょう。滞在時間が伸び、エンゲージメントが高まります。
                  </p>
                  <button
                    onClick={() => navigateTo('quiz/editor')}
                    className="text-indigo-600 font-bold hover:underline text-sm inline-flex items-center gap-2"
                  >
                    この構成で作成する
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">診断コンテンツ</div>
                        <div className="text-xs text-slate-500">思わずシェアしたくなる仕掛け</div>
                      </div>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">
                      <ArrowRight size={20} className="rotate-90" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">商品紹介LP</div>
                        <div className="text-xs text-slate-500">診断結果に合わせた商品を提案</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Tab */}
            {activeTab === 'tab-shop' && (
              <div className="flex flex-col md:flex-row gap-8 items-center animate-fade-in">
                <div className="md:w-1/2">
                  <span className="text-green-500 font-bold text-sm mb-2 block">RECOMMENDATION</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">スマホひとつで、<br />リピーターを作る仕掛けを。</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    「激辛診断」や「骨盤歪みチェック」など、お店に関連するクイズをLINEで配信。結果ページでクーポンを渡せば、楽しみながら自然に来店・予約へ繋がります。
                  </p>
                  <button
                    onClick={() => navigateTo('quiz/editor')}
                    className="text-indigo-600 font-bold hover:underline text-sm inline-flex items-center gap-2"
                  >
                    この構成で作成する
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">面白診断・クイズ</div>
                        <div className="text-xs text-slate-500">待ち時間や店頭で楽しませる</div>
                      </div>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">
                      <ArrowRight size={20} className="rotate-90" />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Check size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">クーポン発行</div>
                        <div className="text-xs text-slate-500">結果画面で特典を付与</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Marketer Tab */}
            {activeTab === 'tab-marketer' && (
              <div className="flex flex-col md:flex-row gap-8 items-center animate-fade-in">
                <div className="md:w-1/2">
                  <span className="text-blue-500 font-bold text-sm mb-2 block">RECOMMENDATION</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">検証スピードが命。<br />3分で公開、分析まで。</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    LPの量産や、CVR改善のための診断コンテンツ導入をもっと手軽に。コーディング不要でテンプレートから作成でき、アクセス解析も標準搭載。PDCAを爆速で回せます。
                  </p>
                  <button
                    onClick={() => navigateTo('business/editor')}
                    className="text-indigo-600 font-bold hover:underline text-sm inline-flex items-center gap-2"
                  >
                    この構成で作成する
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">ビジネスLP作成</div>
                        <div className="text-xs text-slate-500">セールス特化テンプレート</div>
                      </div>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">
                      <Target size={20} />
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <Eye size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">アクセス解析</div>
                        <div className="text-xs text-slate-500">CVRを即座に確認</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 人気コンテンツセクション */}
      {popularContents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full mb-4">
                <TrendingUp size={20} />
                <span className="font-bold">人気コンテンツ</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
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
                  className="group bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-100 p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* ランキングバッジ */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
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
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm font-bold text-indigo-600 group-hover:gap-2 transition-all flex items-center gap-1">
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
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
              >
                <LayoutGrid size={20} />
                もっと見る
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 特徴セクション */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
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
                color: 'text-yellow-500',
                bg: 'bg-yellow-50'
              },
              {
                icon: Share2,
                title: 'SNS拡散設計',
                description: 'シェアされやすい診断結果、魅力的なOGP画像。オーガニックな拡散で広告費ゼロの集客を実現',
                color: 'text-indigo-500',
                bg: 'bg-indigo-50'
              },
              {
                icon: Target,
                title: 'SEO・AI検索対応',
                description: '構造化データ対応でGoogle・ChatGPT両方からの流入を最大化。検索で見つかるコンテンツに',
                color: 'text-orange-500',
                bg: 'bg-orange-50'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bg} mb-6`}>
                  <feature.icon size={32} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サービス詳細セクション */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* 診断クイズ */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                <Sparkles size={16} />
                診断クイズ
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                AIで診断クイズを<br />自動生成
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                性格診断、適職診断、心理テスト、検定クイズ、占いなど、
                様々なタイプの診断コンテンツをAIが自動生成。
                質問数や結果パターンもカスタマイズ可能です。
              </p>
              <ul className="space-y-3 mb-8">
                {['AI自動生成で数分で完成', '3つのモード（診断・検定・占い）', 'SNSシェア機能搭載', '分析ダッシュボード付き'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Check size={12} className="text-indigo-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('quiz/editor')}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                診断クイズを作成
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <Sparkles size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">診断クイズプレビュー</p>
              </div>
            </div>
          </div>

          {/* プロフィールLP */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <UserCircle size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">プロフィールLPプレビュー</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                <UserCircle size={16} />
                プロフィールLP
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                リンクまとめページを<br />おしゃれに作成
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                SNSプロフィールに最適なリンクまとめページを作成。
                ブロック形式で自由にレイアウトをカスタマイズ。
                おしゃれなテンプレートですぐに始められます。
              </p>
              <ul className="space-y-3 mb-8">
                {['ブロック形式の直感的な編集', 'おしゃれなテンプレート', 'LINE・YouTube埋め込み対応', 'カスタムドメイン対応'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('profile/editor')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                プロフィールLPを作成
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* ビジネスLP */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                <Building2 size={16} />
                ビジネスLP
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                ビジネス向けLPを<br />簡単作成
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                商品・サービスの魅力を効果的にアピール。
                CV最適化されたテンプレートで、
                プロ品質のランディングページを簡単に作成できます。
              </p>
              <ul className="space-y-3 mb-8">
                {['AI Flyer機能搭載', 'CV最適化テンプレート', '料金表・FAQ対応', 'お問い合わせフォーム付き'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                      <Check size={12} className="text-amber-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('business/editor')}
                className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors"
              >
                ビジネスLPを作成
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <Building2 size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-xl font-bold">ビジネスLPプレビュー</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方3ステップ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">使い方は、驚くほどシンプル</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-5xl mx-auto">
            <div className="w-full md:w-1/3 bg-gray-50 p-8 rounded-xl border border-gray-100">
              <div className="text-4xl font-black text-indigo-200 mb-4">01</div>
              <h3 className="text-xl font-bold mb-2">テンプレートを選ぶ</h3>
              <p className="text-gray-500 text-sm">業種に合わせた豊富なデザインから、<br />好きなものを選ぶだけ。</p>
            </div>
            <div className="hidden md:block text-2xl text-gray-300">
              <ArrowRight size={28} />
            </div>
            <div className="w-full md:w-1/3 bg-gray-50 p-8 rounded-xl border border-gray-100">
              <div className="text-4xl font-black text-indigo-200 mb-4">02</div>
              <h3 className="text-xl font-bold mb-2">中身を埋める</h3>
              <p className="text-gray-500 text-sm">ガイドに従って、<br />テキストや写真をパズルのように配置。</p>
            </div>
            <div className="hidden md:block text-2xl text-gray-300">
              <ArrowRight size={28} />
            </div>
            <div className="w-full md:w-1/3 bg-gray-50 p-8 rounded-xl border border-gray-100">
              <div className="text-4xl font-black text-indigo-200 mb-4">03</div>
              <h3 className="text-xl font-bold mb-2">3秒で公開</h3>
              <p className="text-gray-500 text-sm">ボタンを押せば、すぐに世界中へ。<br />SNSでシェアしましょう。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 料金プラン（3段階） */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">わかりやすい料金プラン</h2>
            <p className="text-gray-600">まずは無料で、すべての機能をお試しいただけます。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            {/* ゲスト */}
            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col bg-white hover:shadow-lg transition">
              <div className="mb-4 text-center">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">お試し体験</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">ゲスト</h3>
                <div className="mt-1 text-gray-500">
                  <span className="text-3xl font-bold text-gray-800">¥0</span>
                  <span className="text-xs">/ 回</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-6 text-center">
                登録なしで、今すぐお試し作成。<br />※保存はされません
              </p>
              
              <ul className="space-y-3 mb-6 flex-1 border-t border-gray-100 pt-4">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">新規作成</span>
                  <Check size={16} className="text-green-500" />
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">ポータル掲載</span>
                  <Check size={16} className="text-green-500" />
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">URL発行</span>
                  <Check size={16} className="text-green-500" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-400">
                  <span>編集・更新</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm text-gray-400">
                  <span>アフィリエイト機能</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm text-gray-400">
                  <span>アクセス解析</span>
                  <span className="text-gray-300">×</span>
                </li>
                <li className="flex items-center justify-between text-sm text-gray-400">
                  <span>AI利用</span>
                  <span className="text-gray-300">×</span>
                </li>
              </ul>

              <button
                onClick={() => navigateTo('create')}
                className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-center rounded-xl transition text-sm"
              >
                登録せず試す
              </button>
            </div>

            {/* フリープラン */}
            <div className="border-2 border-indigo-600 rounded-2xl p-6 flex flex-col bg-white shadow-xl">
              <div className="mb-4 text-center">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">標準</span>
                <h3 className="text-xl font-bold text-indigo-800 mt-2">フリープラン</h3>
                <div className="mt-1 text-gray-500">
                  <span className="text-3xl font-bold text-gray-800">¥0</span>
                  <span className="text-xs">/ 月</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-6 text-center font-bold">
                15秒でできるアカウント登録だけでOK！<br />
                ずっと無料で使い放題。
              </p>
              
              <ul className="space-y-3 mb-6 flex-1 border-t border-gray-100 pt-4">
                <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                  <span>新規作成</span>
                  <Check size={16} className="text-indigo-600" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>ポータル掲載</span>
                  <Check size={16} className="text-indigo-600" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>URL発行</span>
                  <Check size={16} className="text-indigo-600" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                  <span>編集・更新</span>
                  <Check size={16} className="text-indigo-600" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                  <span>アフィリエイト機能</span>
                  <Check size={16} className="text-indigo-600" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                  <span>アクセス解析</span>
                  <Check size={16} className="text-indigo-600" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>AI利用（回数制限）</span>
                  <Check size={16} className="text-indigo-600" />
                </li>
              </ul>

              <button
                onClick={() => setShowAuth(true)}
                className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center rounded-xl transition text-sm shadow-md"
              >
                無料で登録する
              </button>
            </div>

            {/* プロプラン */}
            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col bg-gray-50 hover:shadow-lg transition">
              <div className="mb-4 text-center">
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">ビジネス向け</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">プロプラン</h3>
                <div className="mt-1 text-gray-500">
                  <span className="text-3xl font-bold text-gray-800">¥3,980</span>
                  <span className="text-xs">/ 月</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-6 text-center">
                本格的なビジネス運用に。<br />制限なしで使い放題。
              </p>
              
              <ul className="space-y-3 mb-6 flex-1 border-t border-gray-100 pt-4">
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>新規作成</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>ポータル掲載</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>URL発行</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>編集・更新</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>アフィリエイト機能</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm text-gray-700">
                  <span>アクセス解析</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                  <span>AI利用（優先）</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                  <span>HTMLダウンロード</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
                <li className="flex items-center justify-between text-sm font-bold text-gray-800">
                  <span>埋め込みコード発行</span>
                  <Check size={16} className="text-indigo-500" />
                </li>
              </ul>

              <button
                onClick={() => navigateTo('dashboard')}
                className="block w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-center rounded-xl transition text-sm"
              >
                プロプラン詳細
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ（アコーディオン形式） */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">よくあるご質問</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 p-5 rounded-lg group cursor-pointer">
              <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                Q. 本当にずっと無料ですか？
                <span className="text-gray-400 group-open:rotate-180 transition">
                  <ArrowRight size={20} className="rotate-90" />
                </span>
              </summary>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                はい、フリープランはずっと無料でご利用いただけます。将来的には大規模法人向けのプランも検討していますが、現在の個人・スモールビジネス向け機能はずっと無料提供をお約束します。
              </p>
            </details>
            
            <details className="bg-gray-50 p-5 rounded-lg group cursor-pointer">
              <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                Q. 独自ドメインは使えますか？
                <span className="text-gray-400 group-open:rotate-180 transition">
                  <ArrowRight size={20} className="rotate-90" />
                </span>
              </summary>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                現在のバージョンでは `makers.tokyo/あなたのID` というURLになります。今後のアップデートで独自ドメイン対応を予定しております。
              </p>
            </details>
            
            <details className="bg-gray-50 p-5 rounded-lg group cursor-pointer">
              <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                Q. 作成したページは商用利用可能ですか？
                <span className="text-gray-400 group-open:rotate-180 transition">
                  <ArrowRight size={20} className="rotate-90" />
                </span>
              </summary>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                もちろんです。あなたの商品販売、アフィリエイト、店舗集客など、あらゆるビジネス用途に自由にご利用いただけます。
              </p>
            </details>
            
            <details className="bg-gray-50 p-5 rounded-lg group cursor-pointer">
              <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                Q. セキュリティやデータの扱いは大丈夫ですか？
                <span className="text-gray-400 group-open:rotate-180 transition">
                  <ArrowRight size={20} className="rotate-90" />
                </span>
              </summary>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                はい。通信はすべてSSLで暗号化されており、顧客データも厳重に管理されています。バックアップ体制も整えておりますので、安心してご利用ください。
              </p>
            </details>
            
            <details className="bg-gray-50 p-5 rounded-lg group cursor-pointer">
              <summary className="font-bold text-gray-800 flex justify-between items-center list-none">
                Q. 使い方がわからない時はサポートしてくれますか？
                <span className="text-gray-400 group-open:rotate-180 transition">
                  <ArrowRight size={20} className="rotate-90" />
                </span>
              </summary>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed pl-4 border-l-2 border-indigo-300">
                はい。基本的な操作マニュアルはもちろん、公式LINEやメールでのサポート窓口も設けております。わからないことはいつでもお聞きください。
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 animate-gradient-colors text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Magnet size={20} className="text-yellow-300" />
            <span className="font-bold">集客メーカー</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            今すぐ無料で集客を始めよう
          </h2>
          <p className="text-xl opacity-90 mb-10">
            アカウント登録不要で、すぐにコンテンツ作成を始められます
          </p>
          <button
            onClick={() => navigateTo('create')}
            className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-10 py-5 rounded-full text-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Magnet size={24} />
            無料で作成する
          </button>
        </div>
      </section>

      <Footer 
        setPage={navigateTo}
        onCreate={(service) => service && navigateTo(`${service}/editor`)}
        user={user} 
        setShowAuth={setShowAuth}
      />
    </div>
  );
}














