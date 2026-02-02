'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  Star,
  Lightbulb,
  Wand2,
  MessageSquare,
  Users,
  Loader2
} from 'lucide-react';
import AuthModal from '@/components/shared/AuthModal';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';
import KDLFooter from '@/components/shared/KDLFooter';

// プラン定義（LP専用の期間集中プラン）
type LPPlanType = 'trial' | 'standard';
interface LPPlan {
  id: LPPlanType;
  name: string;
  price: number;
  period: string; // 期間（表示用）
  description: string;
}

const LP_PLANS: Record<LPPlanType, LPPlan> = {
  trial: {
    id: 'trial',
    name: '1ヶ月トライアル',
    price: 49800,
    period: '1ヶ月',
    description: '記念に1冊作ってみたい方へ',
  },
  standard: {
    id: 'standard',
    name: '3ヶ月スタンダード',
    price: 99800,
    period: '3ヶ月',
    description: '副業として印税を得たい方へ',
  },
};

// V3: 初心者向けパターン - 優しいデザイン
export default function KindleLPClient() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LPPlanType | null>(null);
  
  // 診断クイズ用のState
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizResult, setQuizResult] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 認証状態を取得
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ? { email: session.user.email, id: session.user.id } : null);
        });
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ? { email: session.user.email, id: session.user.id } : null);
      }
      
      // アフィリエイト紹介コードを取得（Cookieから）
      const refCode = getReferralCode();
    };
    init();

    // スクロールイベント
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 認証完了後に決済へ進む
  useEffect(() => {
    if (user && selectedPlan) {
      // 認証が完了し、選択中のプランがある場合は決済へ
      handleCheckout(selectedPlan);
    }
  }, [user]);

  // プラン選択ボタンクリック時の処理
  const handlePlanSelect = (planType: LPPlanType) => {
    if (!user) {
      // 未認証の場合：プランを保存して認証モーダルを表示
      setSelectedPlan(planType);
      setShowAuth(true);
    } else {
      // 認証済みの場合：直接決済へ
      handleCheckout(planType);
    }
  };

  // 決済処理
  const handleCheckout = async (planType: LPPlanType) => {
    const plan = LP_PLANS[planType];
    if (!plan || !user) return;

    setIsProcessing(true);
    setSelectedPlan(planType);

    try {
      // アフィリエイト紹介コードを取得
      const referralCode = getReferralCode();

      // 決済APIを呼び出し
      const response = await fetch('/api/univapay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          userId: user.id,
          email: user.email,
          planName: `KDL ${plan.name}（${plan.period}集中プラン）`,
          period: planType === 'trial' ? 'monthly' : 'yearly', // トライアル=1ヶ月、スタンダード=3ヶ月
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // 決済ページにリダイレクト
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        alert(`エラー: ${data.error}`);
        setIsProcessing(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('決済処理中にエラーが発生しました。もう一度お試しください。');
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quizQuestions = [
    {
      question: "Q1. どんな本を作ってみたい？",
      options: [
        { text: "自分の仕事のノウハウをまとめたい" },
        { text: "趣味や思い出をエッセイにしたい" },
        { text: "まだ決まっていないけど興味がある" }
      ]
    },
    {
      question: "Q2. 文章を書くのは好き？",
      options: [
        { text: "苦手...できればやりたくない" },
        { text: "普通。メールくらいなら書ける" },
        { text: "好き！自分でこだわりたい" }
      ]
    },
    {
      question: "Q3. パソコンの操作は？",
      options: [
        { text: "スマホの方が得意" },
        { text: "文字入力くらいならできる" },
        { text: "バリバリ使いこなせる" }
      ]
    }
  ];

  const handleQuizAnswer = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setQuizResult(false);
  };

  const faqs = [
    {
      q: 'Q. パソコンが本当に苦手なんですが...',
      a: 'A. 大丈夫です！文字入力ができれば問題ありません。専門用語を使わない動画マニュアルもありますし、スタンダードプランならチャットでいつでも質問できます。',
    },
    {
      q: 'Q. AIが書いた本の著作権は誰のものですか？',
      a: 'A. あなたのものです。AIはあくまで執筆を「手伝う」ツールですので、出版された本の権利や印税はすべてあなたのものになります。',
    },
    {
      q: 'Q. 追加料金はかかりませんか？',
      a: 'A. かかりません。表示されているプラン料金のみでご利用いただけます。出版自体（Amazonへの登録）も無料です。',
    },
    {
      q: 'Q. 自分なんかに書けるネタがあるか不安です。',
      a: 'A. ほとんどの方がそう仰いますが、必ずあります！AIとおしゃべりすることで「あ、これなら書けるかも」というテーマがきっと見つかります。まずは無料診断で試してみてください。',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-700" style={{ fontFamily: "'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif" }}>
      {/* アフィリエイト追跡 */}
      <Suspense fallback={null}>
        <AffiliateTracker serviceType="kdl" />
      </Suspense>

      {/* Header */}
      <header className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="text-green-500" size={28} />
            <span className="text-xl font-bold tracking-tight text-slate-800">Kindle Direct Lite</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-slate-500">
            <a href="#diagnosis" className="hover:text-green-500 transition">かんたん診断</a>
            <a href="#steps" className="hover:text-green-500 transition">出版の流れ</a>
            <a href="#pricing" className="hover:text-green-500 transition">料金プラン</a>
            <a href="#faq" className="hover:text-green-500 transition">よくある質問</a>
          </nav>
          {user ? (
            <Link href="/kindle" className="bg-orange-400 hover:bg-orange-500 text-white px-5 py-2.5 rounded-full font-bold text-sm transition shadow-lg transform hover:-translate-y-0.5">
              マイページへ
            </Link>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="bg-orange-400 hover:bg-orange-500 text-white px-5 py-2.5 rounded-full font-bold text-sm transition shadow-lg transform hover:-translate-y-0.5"
            >
              無料で体験してみる
            </button>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => {
          setShowAuth(false);
          // 認証せずに閉じた場合、選択中のプランをリセット
          if (!user) {
            setSelectedPlan(null);
          }
        }} 
        setUser={(u) => setUser(u ? { email: u.email, id: u.id } : null)} 
        onNavigate={(page) => {
          // 認証完了後、選択中のプランがあれば決済へ進む（useEffectで処理）
          // なければ通常のナビゲーション
          if (!selectedPlan) {
            window.location.href = `/${page}`;
          }
        }}
      />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }}>
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Copy */}
          <div className="space-y-6">
            <div className="inline-block bg-white border border-green-200 rounded-full px-4 py-1 text-sm font-bold text-green-600 mb-2 shadow-sm">
              🔰 パソコンが苦手なあなたへ
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-slate-800">
              えっ、私がAmazonで<br />
              <span className="text-green-500">本を出せるの？</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              はい、本当です。文章力も、専門知識もいりません。<br />
              あなたの「趣味」や「思い出」を、AIとおしゃべりするだけ。<br />
              まるで魔法のように、あなただけの1冊が完成します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="#demo" 
                className="bg-orange-400 hover:bg-orange-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl transform hover:-translate-y-1 transition text-center flex items-center justify-center gap-2"
              >
                <Wand2 size={20} /> 魔法を体験してみる
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-2">✨ 登録は無料。難しい設定はありません。</p>
          </div>

          {/* Right: Image */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md animate-float">
              <style jsx>{`
                @keyframes float {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                  100% { transform: translateY(0px); }
                }
                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }
              `}</style>
              <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-white rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="本を読んで微笑む女性" 
                  className="rounded-2xl w-full"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg border-4 border-white transform -rotate-3">
                <Check className="inline mr-2" size={16} />主婦・シニアも活躍中！
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Scroll (Pop Style) */}
      <section className="py-10 bg-yellow-50 overflow-hidden border-b border-yellow-100">
        <div className="container mx-auto px-4 mb-4 text-center">
          <p className="text-xs font-bold text-orange-400 tracking-widest uppercase mb-2">ALL IN ONE PUBLISHING TOOLS</p>
          <h3 className="text-lg font-bold text-slate-700">出版に必要なもの、全部そろってます！</h3>
        </div>
        <div className="relative overflow-hidden whitespace-nowrap">
          <style jsx>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 40s linear infinite;
            }
          `}</style>
          <div className="animate-scroll inline-flex py-4">
            {[
              { emoji: '📝', label: 'タイトル案出し', color: 'orange' },
              { emoji: '🎨', label: '表紙デザイン', color: 'pink' },
              { emoji: '🤖', label: '執筆サポート', color: 'blue' },
              { emoji: '📑', label: '目次つくり', color: 'green' },
              { emoji: '📤', label: '原稿書き出し', color: 'purple' },
              { emoji: '🔰', label: '出版ガイド', color: 'yellow' },
              { emoji: '📝', label: 'タイトル案出し', color: 'orange' },
              { emoji: '🎨', label: '表紙デザイン', color: 'pink' },
              { emoji: '🤖', label: '執筆サポート', color: 'blue' },
              { emoji: '📑', label: '目次つくり', color: 'green' },
              { emoji: '📤', label: '原稿書き出し', color: 'purple' },
              { emoji: '🔰', label: '出版ガイド', color: 'yellow' },
            ].map((tool, i) => (
              <div
                key={i}
                className={`w-48 mx-3 bg-white p-4 rounded-2xl shadow-sm border-2 border-${tool.color}-100 flex flex-col items-center text-center hover:transform hover:-translate-y-1 hover:scale-105 transition`}
              >
                <div className="text-3xl mb-2">{tool.emoji}</div>
                <div className="font-bold text-slate-700">{tool.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Authority / Empathy */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">こんな風に思っていませんか？</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl">
              <div className="text-4xl mb-4">😓</div>
              <h3 className="font-bold text-lg mb-2">文章が苦手...</h3>
              <p className="text-sm text-slate-500">作文なんて学生以来書いてないし、長い文章なんて無理。</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="font-bold text-lg mb-2">パソコンが怖い...</h3>
              <p className="text-sm text-slate-500">難しい設定や登録作業なんて、絶対にできない。</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <div className="text-4xl mb-4">🤷‍♀️</div>
              <h3 className="font-bold text-lg mb-2">書くネタがない...</h3>
              <p className="text-sm text-slate-500">私なんかの経験が本になるわけない。</p>
            </div>
          </div>
          
          <div className="mt-12 bg-green-50 p-8 rounded-2xl border border-green-100">
            <h3 className="text-2xl font-bold text-green-700 mb-4">大丈夫、すべてAIにお任せください。</h3>
            <p className="text-lg text-slate-700">
              KDL（キンドルダイレクトライト）は、<br className="hidden md:block" />
              <strong>「おしゃべり感覚」で質問に答えるだけ</strong>で、<br />
              プロのような本が自動で作れる、夢のツールです。
            </p>
          </div>
        </div>
      </section>

      {/* Diagnosis Quiz (Pop Style) */}
      <section id="diagnosis" className="py-20 bg-gradient-to-b from-orange-100 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-orange-800">あなたにピッタリの本は？</h2>
            <p className="text-orange-600">3つの質問に答えるだけで、どんな本が作れるか診断します！</p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden text-slate-700 min-h-[400px] border-4 border-orange-200 relative">
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-3">
              <div 
                className="bg-orange-400 h-3 transition-all duration-300 rounded-r-full"
                style={{ width: `${(currentQuestion / quizQuestions.length) * 100}%` }}
              ></div>
            </div>

            {/* Quiz Screen */}
            {!quizResult && (
              <div className="p-8 md:p-12 flex-grow flex flex-col justify-center">
                <div className="animate-fade-in">
                  <span className="block text-center text-orange-400 font-bold mb-4 tracking-widest text-xs">
                    QUESTION 0{currentQuestion + 1}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold mb-8 text-center text-slate-700">
                    {quizQuestions[currentQuestion].question}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {quizQuestions[currentQuestion].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={handleQuizAnswer}
                        className="bg-white border-2 border-slate-100 p-4 rounded-xl text-left font-bold text-slate-600 transition flex items-center gap-3 hover:bg-orange-50 hover:border-orange-400 hover:scale-102"
                      >
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex-shrink-0 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Result Screen */}
            {quizResult && (
              <div className="p-8 md:p-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center text-5xl mb-6">
                  <Lightbulb size={48} />
                </div>
                <h3 className="text-lg font-bold text-slate-500 mb-2">あなたにおすすめなのは...</h3>
                <div className="text-3xl font-extrabold text-orange-600 mb-4">
                  「AIとおしゃべり執筆」タイプ
                </div>
                
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-8 w-full text-left">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    あなたは、AIと会話しながら楽しく本を作るのが向いています！難しい構成や執筆はAIに任せて、あなたは「監督」として指示を出すだけでOK。これなら、パソコンが苦手でも、文章が苦手でも、素晴らしい本が完成しますよ。
                  </p>
                </div>

                <a 
                  href="#cta" 
                  className="block w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full shadow-lg transition transform hover:-translate-y-1 mb-4"
                >
                  このタイプで本を作ってみる！
                </a>
                <button 
                  onClick={resetQuiz}
                  className="text-slate-400 text-sm underline hover:text-slate-600 mt-2"
                >
                  もう一度診断する
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works (Simplified) */}
      <section id="steps" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">たった3ステップで作家デビュー</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden border border-slate-100">
              <div className="absolute top-0 left-0 bg-orange-400 text-white font-bold px-4 py-1 rounded-br-xl">STEP 1</div>
              <div className="mt-6 text-center">
                <div className="text-5xl mb-4">💡</div>
                <h3 className="text-xl font-bold mb-2">テーマを選ぶ</h3>
                <p className="text-sm text-slate-600">「ペットとの思い出」「得意な料理」「旅行の話」...なんでもOK！AIに伝えてください。</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden border border-slate-100">
              <div className="absolute top-0 left-0 bg-orange-400 text-white font-bold px-4 py-1 rounded-br-xl">STEP 2</div>
              <div className="mt-6 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">AIが下書き</h3>
                <p className="text-sm text-slate-600">ボタンを押すと、AIが自動で文章を書いてくれます。あなたはそれを読んで、少し手直しするだけ。</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden border border-slate-100">
              <div className="absolute top-0 left-0 bg-orange-400 text-white font-bold px-4 py-1 rounded-br-xl">STEP 3</div>
              <div className="mt-6 text-center">
                <div className="text-5xl mb-4">📕</div>
                <h3 className="text-xl font-bold mb-2">世界へ出版！</h3>
                <p className="text-sm text-slate-600">完成したら、Amazonへ登録。あなたの本が世界中で販売されます。印税も入るかも？</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voices (Beginner ver) */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">「私にもできた！」喜びの声</h2>
          
          <div className="space-y-6">
            {/* User 1 */}
            <div className="bg-white p-6 rounded-2xl flex flex-col sm:flex-row items-start gap-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="User" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-slate-800">佐藤さん（60代・主婦）</span>
                  <span className="text-yellow-400 text-xs flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">
                  「孫への絵本を作ってみたくて挑戦しました。パソコンは苦手でしたが、本当に質問に答えるだけでお話ができてビックリ。製本して孫にプレゼントしたら大喜びでした！」
                </p>
              </div>
            </div>

            {/* User 2 */}
            <div className="bg-white p-6 rounded-2xl flex flex-col sm:flex-row items-start gap-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="User" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-slate-800">田中さん（40代・会社員）</span>
                  <span className="text-yellow-400 text-xs flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">
                  「趣味のキャンプ知識を本にしました。まさか自分が著者になれるなんて。毎月少しですが、お小遣い（印税）が入ってくるのが楽しみになりました。」
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">圧倒的なコスパとタイパ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-orange-100">
              <thead>
                <tr className="bg-orange-50 text-slate-600">
                  <th className="p-4 font-bold">比較項目</th>
                  <th className="p-4 font-medium text-center">自分ひとりで</th>
                  <th className="p-4 font-medium text-center">高額スクール</th>
                  <th className="p-4 bg-orange-400 text-white font-bold text-center text-lg">KDL (当サービス)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-orange-50">
                  <td className="p-4 font-bold bg-orange-50/30">かかる費用</td>
                  <td className="p-4 text-center">0円</td>
                  <td className="p-4 text-center text-red-500 font-bold">30万円〜</td>
                  <td className="p-4 text-center bg-orange-50 font-bold text-orange-600 text-xl border-x-2 border-orange-100">49,800円〜</td>
                </tr>
                <tr className="border-b border-orange-50">
                  <td className="p-4 font-bold bg-orange-50/30">かかる時間</td>
                  <td className="p-4 text-center">半年以上...</td>
                  <td className="p-4 text-center">1〜2ヶ月</td>
                  <td className="p-4 text-center bg-orange-50 font-bold text-orange-600 border-x-2 border-orange-100">最短3日！</td>
                </tr>
                <tr className="border-b border-orange-50">
                  <td className="p-4 font-bold bg-orange-50/30">パソコンスキル</td>
                  <td className="p-4 text-center text-sm">かなり必要<br />(Word設定など)</td>
                  <td className="p-4 text-center text-sm">ある程度必要</td>
                  <td className="p-4 text-center bg-orange-50 font-bold text-orange-600 border-x-2 border-orange-100 text-sm">文字入力ができればOK</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold bg-orange-50/30">大変さ</td>
                  <td className="p-4 text-center text-sm">挫折しやすい</td>
                  <td className="p-4 text-center text-sm">課題が多い</td>
                  <td className="p-4 text-center bg-orange-50 font-bold text-orange-600 border-x-2 border-orange-100 text-sm">質問に答えるだけで楽しい</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing (Simplified & Added Plan) */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-slate-800">あなたに合ったプランを選んでください</h2>
          <p className="text-slate-600 mb-12">
            まずは1冊作ってみたい方も、しっかり収益化したい方も。<br />
            追加料金なしで始められます。
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto items-stretch">
            {/* Plan 1 */}
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border-4 border-gray-200 transform hover:scale-105 transition duration-300 flex flex-col">
              <div className="bg-gray-200 text-slate-600 py-3 font-bold">まずはお試し</div>
              <div className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">1ヶ月トライアル</h3>
                <p className="text-sm text-slate-500 mb-4">記念に1冊作ってみたい方へ</p>
                <div className="text-4xl font-extrabold text-slate-700 mb-6">¥49,800 <span className="text-sm font-normal text-slate-400">（税込）</span></div>
                
                <ul className="text-left text-sm text-slate-600 space-y-3 mb-8 flex-grow">
                  <li className="flex items-center gap-2"><Check className="text-green-500" size={16} /> AI使い放題（1ヶ月間）</li>
                  <li className="flex items-center gap-2"><Check className="text-green-500" size={16} /> 本を3冊まで作れます</li>
                  <li className="flex items-center gap-2"><Check className="text-green-500" size={16} /> 初心者向けマニュアル</li>
                  <li className="flex items-center gap-2 text-slate-300">− 個別相談なし</li>
                </ul>

                <button 
                  onClick={() => handlePlanSelect('trial')}
                  disabled={isProcessing}
                  className="block w-full bg-slate-500 hover:bg-slate-600 text-white font-bold py-4 rounded-xl shadow-md transition text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing && selectedPlan === 'trial' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      処理中...
                    </>
                  ) : (
                    'このプランで始める'
                  )}
                </button>
              </div>
            </div>

            {/* Plan 2 (Featured) */}
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-400 transform scale-105 relative flex flex-col">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">人気No.1</div>
              <div className="bg-orange-400 text-white py-3 font-bold">しっかりサポート</div>
              <div className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">3ヶ月スタンダード</h3>
                <p className="text-sm text-slate-500 mb-4">副業として印税を得たい方へ</p>
                <div className="text-4xl font-extrabold text-orange-500 mb-6">¥99,800 <span className="text-sm font-normal text-slate-400">（税込）</span></div>
                
                <ul className="text-left text-sm text-slate-600 space-y-3 mb-8 flex-grow">
                  <li className="flex items-center gap-2 font-bold bg-orange-50 p-1 rounded"><Check className="text-orange-500" size={16} /> たっぷり3ヶ月使える</li>
                  <li className="flex items-center gap-2"><Check className="text-orange-500" size={16} /> 本を10冊まで作れます</li>
                  <li className="flex items-center gap-2"><Check className="text-orange-500" size={16} /> 売れる表紙テンプレート</li>
                  <li className="flex items-center gap-2"><Check className="text-orange-500" size={16} /> グループ相談会（1回）</li>
                  <li className="flex items-center gap-2"><Check className="text-orange-500" size={16} /> チャット質問し放題</li>
                </ul>

                <button 
                  onClick={() => handlePlanSelect('standard')}
                  disabled={isProcessing}
                  className="block w-full bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg transition text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing && selectedPlan === 'standard' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      処理中...
                    </>
                  ) : (
                    '今すぐ作家デビューする'
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-8">※ サポート品質維持のため、毎月5名様までの限定募集です</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">よくあるご質問</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details 
                key={i} 
                className="group bg-slate-50 p-6 rounded-2xl cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <summary className="flex justify-between items-center font-bold text-slate-700 list-none">
                  <span>{faq.q}</span>
                  <ChevronDown 
                    className={`text-orange-400 transition ${openFaq === i ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </summary>
                <div className="text-slate-600 mt-4 leading-relaxed text-sm">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-slate-800">
            あなたの人生経験は、<br />誰かの「教科書」になる。
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            「いつか本を出したい」<br />
            その夢を、今日叶えませんか？
          </p>
          <Link 
            href="/kindle/new?mode=demo" 
            className="inline-block bg-green-500 hover:bg-green-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-2xl transition transform hover:-translate-y-1"
          >
            まずは無料でデモを触ってみる
          </Link>
        </div>
      </section>

      {/* フッター - KDLFooter使用 */}
      <KDLFooter />

      {/* スクロールトップボタン */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-orange-400 hover:bg-orange-500 text-white p-3 rounded-full shadow-2xl transition-all transform hover:scale-110 z-50"
          aria-label="ページトップへ戻る"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}
