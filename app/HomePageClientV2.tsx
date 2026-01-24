'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
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
} from 'lucide-react';

export default function HomePageClientV2() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
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
      document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (page === 'diagnosis') {
      document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${page}`;
    }
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
      desc: "事務作業を自動化したいあなたに最適。名刺代わりのプロフィールページに予約機能をつけ、日程調整の手間をゼロにしましょう。"
    },
    shop: {
      title: "診断クイズ ＋ クーポンLP",
      desc: "お店の集客には「エンタメ」が効きます。診断クイズでお客様を楽しませ、結果画面でクーポンを配布して来店を促しましょう。"
    },
    influencer: {
      title: "診断ゲーム ＋ プロフィール",
      desc: "フォロワーとの距離を縮める「遊べるプロフィール」がおすすめ。診断結果に合わせて、おすすめの商品を紹介すると収益化も加速します。"
    },
    marketer: {
      title: "ビジネスLP ＋ アクセス解析",
      desc: "スピーディーな検証が必要なあなたには、テンプレートで即作成できるビジネスLPが最適。診断コンテンツをLPに埋め込むのもCVR向上に効果的です。"
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
    <div className="min-h-screen bg-white">
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
        .hero-pattern {
          background-color: #f3f4f6;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 20px 20px;
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

      {/* Hero Section */}
      <section className="hero-pattern pt-32 pb-12 lg:pt-40 lg:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-6 tracking-wide border border-orange-200">
            ✨ ずっと0円、クレジットカード登録不要
          </span>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
            あなたのビジネスに<br className="hidden sm:block" />
            <span className="text-indigo-600">「今」必要なツール</span>がわかる。
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            LP、予約、診断クイズ、アンケート...<br />
            集客メーカー (Makers) なら、あらゆる機能がこれ1つ。<br />
            まずは30秒の無料診断で、あなたにぴったりの組み合わせを見つけませんか？
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <button
              onClick={() => navigateTo('diagnosis')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              今すぐ診断する
            </button>
          </div>
          <p className="text-xs text-gray-500">※ アカウント作成は45秒で完了します</p>
        </div>
      </section>

      {/* Infinite Scroll (Marquee) */}
      <section className="py-10 bg-gray-50 border-y border-gray-200 overflow-hidden">
        <div className="container mx-auto px-4 mb-4 text-center">
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">ALL IN ONE PLATFORM</p>
        </div>
        <div className="relative">
          <div className="marquee-content inline-flex py-2">
            {/* Set 1 */}
            {[
              { icon: Sparkles, text: "診断クイズ", color: "text-pink-500" },
              { icon: UserCircle, text: "プロフィールLP", color: "text-indigo-500" },
              { icon: Building2, text: "ビジネスLP", color: "text-blue-500" },
              { icon: Calendar, text: "予約・日程調整", color: "text-green-500" },
              { icon: ClipboardList, text: "アンケート", color: "text-yellow-500" },
              { icon: Gamepad2, text: "ゲーム作成", color: "text-purple-500" }
            ].concat([
              { icon: Sparkles, text: "診断クイズ", color: "text-pink-500" },
              { icon: UserCircle, text: "プロフィールLP", color: "text-indigo-500" },
              { icon: Building2, text: "ビジネスLP", color: "text-blue-500" },
              { icon: Calendar, text: "予約・日程調整", color: "text-green-500" },
              { icon: ClipboardList, text: "アンケート", color: "text-yellow-500" },
              { icon: Gamepad2, text: "ゲーム作成", color: "text-purple-500" }
            ]).map((tool, idx) => (
              <div key={idx} className="w-[200px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mx-3">
                <div className={`${tool.color} text-3xl mb-2`}>
                  <tool.icon size={32} />
                </div>
                <h3 className="font-bold text-sm text-gray-700">{tool.text}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 診断ツール */}
      <section id="diagnosis" className="py-20 bg-indigo-900 text-white relative overflow-hidden">
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
                style={{ width: `${(showResult ? questions.length : currentQuestion) / questions.length * 100}%` }}
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
                  <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">💡 なぜこれがおすすめ？</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {results[getWinnerType()].desc}
                  </p>
                </div>

                <button
                  onClick={() => navigateTo('create')}
                  className="block w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-lg shadow-lg transition transform hover:-translate-y-1 mb-8"
                >
                  このテンプレートで作成する（無料）
                </button>

                <div className="w-full pt-6 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">他にもこんな機能が使えます：</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <span className="bg-gray-100 px-3 py-1 rounded text-sm">お問い合わせフォーム</span>
                    <span className="bg-gray-100 px-3 py-1 rounded text-sm">SNSリンク集</span>
                    <span className="bg-gray-100 px-3 py-1 rounded text-sm">アクセス解析</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 比較表 */}
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
                  <h3 className="font-bold text-white">Makersの運用</h3>
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
                    <Sparkles size={40} />
                  </div>
                  <div className="font-bold text-indigo-900 text-2xl">¥0</div>
                  <div className="text-xs text-indigo-600">ずっと無料<br />追加費用なし</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">プロ級のデザインが、あなたのものに。</h2>
            <p className="text-gray-600">デザインセンスは不要。豊富なテンプレートから選ぶだけです。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300">
                  <Sparkles size={64} />
                </div>
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-pink-500 px-2 py-1 rounded">美容・サロン</span>
                  <h4 className="text-white font-bold mt-2">予約機能付きLP</h4>
                </div>
              </div>
              <p className="text-sm text-center text-gray-600 font-bold">スタイリッシュなサロン向け</p>
            </div>
            <div className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300">
                  <UserCircle size={64} />
                </div>
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
                  <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-1 rounded">ビジネス・講師</span>
                  <h4 className="text-white font-bold mt-2">信頼感のあるプロフィール</h4>
                </div>
              </div>
              <p className="text-sm text-center text-gray-600 font-bold">講師・コンサルタント向け</p>
            </div>
            <div className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative aspect-[3/4] mb-4 transition group-hover:-translate-y-2 duration-300">
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300">
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

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ビジネスを加速させる「3つの力」</h2>
            <p className="text-gray-600">必要なのは「機能の多さ」ではなく「成果につながる流れ」です。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">【集客】知ってもらう</h3>
              <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">プロフィールLP / ビジネスLP</p>
              <p className="text-gray-600 text-sm">テンプレートを選ぶだけで、名刺代わりのWebページが完成。あなたの魅力やサービス内容を、スマホで見やすく伝えます。</p>
            </div>
            <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100 shadow-lg transform md:-translate-y-4 relative group">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">差別化ポイント！</div>
              <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                <Gamepad2 size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">【接客】ファンにする</h3>
              <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">診断クイズ / ゲーム作成</p>
              <p className="text-gray-600 text-sm">ただ読ませるだけじゃない。「あなたは何タイプ？」「検定クイズ」などの遊べるコンテンツで、お客様との距離を縮めます。</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-green-200 transition group">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">【成約】スムーズに繋がる</h3>
              <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">予約・日程調整 / アンケート</p>
              <p className="text-gray-600 text-sm">面倒な日程調整の往復メールは不要。予約受付から顧客の声の収集まで自動化し、チャンスを逃しません。</p>
            </div>
           </div>
         </div>
       </section>

      {/* Cases Tabs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">あなたの「やりたいこと」別、活用レシピ</h2>
            <p className="text-gray-600">まだ「何ができるのか」イメージできない方へ。タブを切り替えて、実際の使い方を見てみましょう。</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setActiveTab('tab-freelance')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  activeTab === 'tab-freelance'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                👤 フリーランス
              </button>
              <button
                onClick={() => setActiveTab('tab-shop')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  activeTab === 'tab-shop'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                🏪 店舗・教室
              </button>
              <button
                onClick={() => setActiveTab('tab-influencer')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  activeTab === 'tab-influencer'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                📱 インフルエンサー
              </button>
              <button
                onClick={() => setActiveTab('tab-marketer')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  activeTab === 'tab-marketer'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                💼 マーケター
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 min-h-[300px]">
              {activeTab === 'tab-freelance' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-indigo-600 mb-4">👤 フリーランス（コーチ・ヨガ講師・コンサル等）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「プロフィールLP」で実績・経歴を魅力的に紹介し、「予約機能」で日程調整の手間をゼロに。無駄な問い合わせ対応をなくし、集客に専念できます。
                  </p>
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                    <p className="text-sm font-bold text-indigo-900">✅ こんな使い方も：</p>
                    <p className="text-sm text-indigo-700 mt-1">
                      ・オンライン相談の事前ヒアリングをアンケートで自動化<br />
                      ・セミナー後のフォローアップクイズでエンゲージメント向上
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tab-shop' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-indigo-600 mb-4">🏪 店舗・教室（飲食店・美容室・スクール等）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「診断クイズ」でお客様を楽しませながら、結果ページに「おすすめメニュー」や「クーポン」を表示。SNS映えするコンテンツで拡散を狙えます。
                  </p>
                  <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded">
                    <p className="text-sm font-bold text-pink-900">✅ こんな使い方も：</p>
                    <p className="text-sm text-pink-700 mt-1">
                      ・来店スタンプラリーで「リピーター特典」を自動配布<br />
                      ・お客様の声をアンケートで収集してGoogleレビュー誘導
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tab-influencer' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-indigo-600 mb-4">📱 インフルエンサー（SNS発信者・アフィリエイター）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「プロフィールLP」に全SNSのリンクを集約し、「診断ゲーム」でフォロワーとの距離を縮める。結果画面で商品リンクを掲載すれば収益化も加速します。
                  </p>
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p className="text-sm font-bold text-purple-900">✅ こんな使い方も：</p>
                    <p className="text-sm text-purple-700 mt-1">
                      ・「あなたは何タイプ？」診断でエンゲージメント率アップ<br />
                      ・診断結果に応じてアフィリエイト商品をレコメンド
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tab-marketer' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-indigo-600 mb-4">💼 マーケター（Web制作・広告運用者）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    「ビジネスLP」をテンプレートで即作成、A/Bテストも簡単。「診断コンテンツ」をLPに埋め込めば、滞在時間とCVRを同時に改善できます。
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm font-bold text-blue-900">✅ こんな使い方も：</p>
                    <p className="text-sm text-blue-700 mt-1">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">こんな使い方が選ばれています</h2>
            <p className="text-gray-600">実際に効果があった「機能の組み合わせ方」をご紹介。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-2xl border border-pink-100 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">エステサロン × 診断クイズ</h3>
                  <p className="text-sm text-gray-500">@東京・渋谷</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                「あなたにぴったりの美肌ケア診断」を公式LINEで配信したところ、<span className="font-bold text-pink-600">診断実施者の42%が予約ページへ遷移</span>。従来のクーポン配布よりも高い反応率を記録しました。
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-pink-200 font-bold">診断クイズ</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-pink-200 font-bold">予約機能</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-pink-200 font-bold">プロフィールLP</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-500 text-white rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  <UserCircle size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">キャリアコーチ × プロフィールLP</h3>
                  <p className="text-sm text-gray-500">@オンライン</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                従来はメール・LINE・電話で日程調整していたが、プロフィールに「予約機能」を統合したことで、<span className="font-bold text-indigo-600">事務作業が週10時間削減</span>。空いた時間を本業に充てられるようになりました。
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-indigo-200 font-bold">プロフィールLP</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-indigo-200 font-bold">予約機能</span>
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-indigo-200 font-bold">アンケート</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Steps */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">使い方はシンプル</h2>
            <p className="text-gray-600">パソコンが苦手でも大丈夫。3ステップで完成します。</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="font-bold text-lg mb-3">テンプレートを選ぶ</h3>
                <p className="text-sm text-gray-600">業種や目的に合わせて、豊富なテンプレートから選択。デザインの知識は不要です。</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-pink-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="font-bold text-lg mb-3">文字と画像を変える</h3>
                <p className="text-sm text-gray-600">あなたのビジネス内容に合わせて、テキストや画像を差し替えるだけ。直感的に編集できます。</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="font-bold text-lg mb-3">公開してシェア</h3>
                <p className="text-sm text-gray-600">あなた専用のURLが発行されます。SNSや名刺に載せて、すぐに集客スタート！</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => setShowAuth(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1 inline-flex items-center gap-2"
              >
                <Sparkles size={20} />
                無料で始める（45秒で登録完了）
              </button>
              <p className="text-xs text-gray-500 mt-3">※ クレジットカード登録不要</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="create-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">シンプルでわかりやすい料金プラン</h2>
            <p className="text-gray-600">まずは無料で試して、必要に応じてアップグレード。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Guest Plan */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-700 mb-2">ゲスト</h3>
                <div className="text-4xl font-black text-gray-900 mb-2">¥0</div>
                <p className="text-sm text-gray-500">とりあえず試したい方へ</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>診断クイズ（3種類まで）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>アンケート機能</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="w-4 h-4 flex-shrink-0 mt-0.5">✕</span>
                  <span>プロフィールLP</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="w-4 h-4 flex-shrink-0 mt-0.5">✕</span>
                  <span>予約機能</span>
                </li>
              </ul>
              <button
                onClick={() => setShowAuth(true)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition"
              >
                今すぐ試す
              </button>
            </div>

            {/* Free Plan */}
            <div className="bg-white border-2 border-indigo-500 rounded-2xl p-8 relative shadow-xl transform md:-translate-y-2">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                人気No.1
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-indigo-600 mb-2">フリー</h3>
                <div className="text-4xl font-black text-gray-900 mb-2">¥0</div>
                <p className="text-sm text-gray-500">ずっと無料で使える</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>診断クイズ（無制限）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>プロフィールLP</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>ビジネスLP</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>予約機能（月30件まで）</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>アンケート機能</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <span className="w-4 h-4 flex-shrink-0 mt-0.5">✕</span>
                  <span>広告非表示</span>
                </li>
              </ul>
              <button
                onClick={() => setShowAuth(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-lg"
              >
                無料登録する
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-orange-600 mb-2">プロ</h3>
                <div className="text-4xl font-black text-gray-900 mb-2">¥1,980</div>
                <p className="text-sm text-gray-500">本格的に運用したい方へ</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span className="font-bold">フリープランの全機能</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>予約無制限</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>広告非表示</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>詳細なアクセス解析</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span>優先サポート</span>
                </li>
              </ul>
              <button
                onClick={() => setShowAuth(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition shadow-lg"
              >
                プロで始める
              </button>
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-gray-500">
              ※ プランはいつでも変更可能です。最初は無料で試してから、必要に応じてアップグレードできます。
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">よくある質問</h2>
            <p className="text-gray-600">不安や疑問を解消してから、始めましょう。</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
              <summary className="px-6 py-5 font-bold text-gray-900 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition">
                <span>Q. 本当に無料で使えますか？追加料金はかかりませんか？</span>
                <ChevronDown className="text-gray-400 group-open:rotate-180 transition-transform" size={20} />
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                はい、フリープランは永久無料です。クレジットカード登録も不要。診断クイズ、プロフィールLP、予約機能（月30件まで）などが追加料金なしで使えます。プロプランにアップグレードする際も、いつでも解約可能です。
              </div>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
              <summary className="px-6 py-5 font-bold text-gray-900 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition">
                <span>Q. パソコンが苦手でも使えますか？</span>
                <ChevronDown className="text-gray-400 group-open:rotate-180 transition-transform" size={20} />
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                大丈夫です。テンプレートを選んで文字を変えるだけなので、パソコン操作に自信がない方でも直感的に使えます。スマホからでも編集可能です。もし困ったときは、サポートチームが丁寧にご案内します。
              </div>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
              <summary className="px-6 py-5 font-bold text-gray-900 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition">
                <span>Q. 他のツールからの乗り換えは簡単ですか？</span>
                <ChevronDown className="text-gray-400 group-open:rotate-180 transition-transform" size={20} />
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                はい、とても簡単です。既存のWebページやGoogleフォームの内容をコピー＆ペーストするだけで移行できます。予約システムも同様に、既存のカレンダーと連携できるので、移行の手間はほとんどかかりません。
              </div>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
              <summary className="px-6 py-5 font-bold text-gray-900 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition">
                <span>Q. 商用利用は可能ですか？</span>
                <ChevronDown className="text-gray-400 group-open:rotate-180 transition-transform" size={20} />
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                もちろんです。フリープラン・プロプランともに商用利用が可能です。サロン集客、コンサルティング営業、アフィリエイト、クライアントワークなど、あらゆるビジネスシーンでご利用いただけます。
              </div>
            </details>

            <details className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
              <summary className="px-6 py-5 font-bold text-gray-900 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition">
                <span>Q. 作成したページは、どこで公開されますか？</span>
                <ChevronDown className="text-gray-400 group-open:rotate-180 transition-transform" size={20} />
              </summary>
              <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                makers.tokyo/あなたのID というURLで公開されます。このリンクをSNSのプロフィール、名刺、チラシなどに掲載してご利用ください。プロプランでは独自ドメインの設定も可能です（準備中）。
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            あなたのビジネスを、<br />
            もっと「楽しく」「楽に」。
          </h2>
          <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            集客メーカー (Makers) は、あなたの「やりたいこと」を実現するためのツールです。<br />
            まずは無料で試してみませんか？
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button
              onClick={() => setShowAuth(true)}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-indigo-600 text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
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

          <p className="text-sm text-indigo-200">
            ※ 登録は45秒で完了 / クレジットカード不要 / いつでも無料で使えます
          </p>
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
