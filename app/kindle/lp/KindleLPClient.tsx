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
  Handshake,
  Trophy,
  Star,
  TrendingUpIcon,
  Search,
  Type,
  Quote,
  Heading,
  List,
  Image,
  FileImage
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
  const [activeTab, setActiveTab] = useState<'beginner' | 'retry' | 'business' | 'revenue'>('beginner');
  const [pricingTab, setPricingTab] = useState<'monthly' | 'package'>('monthly');
  
  // 診断クイズ用のState
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScores, setQuizScores] = useState({ prep: 0, story: 0, dialogue: 0, qa: 0, workbook: 0 });
  const [quizResult, setQuizResult] = useState<string | null>(null);

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

  // Marquee用ツールリスト
  const toolsList = [
    { icon: Heading, label: 'タイトル作成', color: 'text-blue-500' },
    { icon: Quote, label: 'サブタイトル作成', color: 'text-indigo-500' },
    { icon: Target, label: 'ターゲット設定', color: 'text-pink-500' },
    { icon: List, label: '目次作成', color: 'text-yellow-500' },
    { icon: Edit3, label: '執筆サポート', color: 'text-green-500' },
    { icon: FileText, label: 'Wordエクスポート', color: 'text-blue-600' },
    { icon: FileImage, label: '表紙作成ガイド', color: 'text-purple-500' },
    { icon: BookOpen, label: 'KDP登録支援', color: 'text-orange-500' },
  ];

  // 診断クイズのデータ
  const quizQuestions = [
    {
      question: "Q1. 本を書く「一番の目的」は？",
      options: [
        { text: "自分のノウハウを体系化して伝えたい", types: ["prep", "workbook"] },
        { text: "読者の悩みを解決し、信頼を得たい", types: ["qa", "dialogue"] },
        { text: "自分の想いや経験で共感を生みたい", types: ["story"] },
        { text: "読者に行動変容を促したい", types: ["workbook", "prep"] }
      ]
    },
    {
      question: "Q2. 想定している「読者ターゲット」は？",
      options: [
        { text: "論理的な説明を好むビジネスパーソン", types: ["prep"] },
        { text: "活字が苦手な初心者・入門者", types: ["dialogue", "qa"] },
        { text: "悩みが深く、解決策を探している人", types: ["qa", "story"] },
        { text: "スキルを身につけたい実践派", types: ["workbook"] }
      ]
    },
    {
      question: "Q3. あなたが得意な「伝え方」は？",
      options: [
        { text: "結論から順序立てて話す", types: ["prep"] },
        { text: "エピソードや物語で語る", types: ["story"] },
        { text: "対話形式で優しく教える", types: ["dialogue"] },
        { text: "質問に端的に答える", types: ["qa"] }
      ]
    }
  ];

  const quizResultTypes: Record<string, { title: string; desc: string }> = {
    prep: { 
      title: "📝 説明文（PREP法）スタイル", 
      desc: "ビジネス書や実用書に最適。「結論→理由→具体例→結論」の順で構成することで、読者にストレスなく知識を伝えられます。" 
    },
    story: { 
      title: "📖 物語（ストーリーテリング）スタイル", 
      desc: "エッセイや体験談に最適。主人公（あなた）の挑戦や失敗、成功体験を描くことで、読者の感情を動かしファン化を促します。" 
    },
    dialogue: { 
      title: "💬 対話（会話）スタイル", 
      desc: "先生と生徒の会話形式で進めるスタイル。専門的な内容でも初心者にとって親しみやすく、サクサク読み進められます。" 
    },
    qa: { 
      title: "❓ Q&A（一問一答）スタイル", 
      desc: "「よくある質問」に答えていく形式。目次から知りたい情報だけを拾い読みできるため、忙しい読者に喜ばれます。" 
    },
    workbook: { 
      title: "✏️ ワークブック（実践）スタイル", 
      desc: "解説の後に「ワーク（問い）」を用意し、読者に書き込んでもらう形式。読むだけでなく行動を促すため、満足度が高いです。" 
    }
  };

  const handleQuizAnswer = (types: string[]) => {
    const newScores = { ...quizScores };
    types.forEach(type => {
      if (newScores[type as keyof typeof newScores] !== undefined) {
        newScores[type as keyof typeof newScores]++;
      }
    });
    setQuizScores(newScores);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 最高得点を見つける
      let maxType = 'prep';
      let maxScore = -1;
      Object.entries(newScores).forEach(([key, score]) => {
        if (score > maxScore) {
          maxScore = score;
          maxType = key;
        }
      });
      setQuizResult(maxType);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setQuizScores({ prep: 0, story: 0, dialogue: 0, qa: 0, workbook: 0 });
    setQuizResult(null);
  };

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

      {/* ヒーローセクション - 攻めたデザイン */}
      <section className="relative overflow-hidden min-h-screen flex items-center pt-20" 
        style={{
          background: 'linear-gradient(rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.92)), url(https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左側：コピー */}
            <div className="text-white space-y-6">
              <div className="inline-block bg-blue-600/30 border border-blue-400/50 rounded-full px-4 py-1 text-sm font-semibold backdrop-blur-sm text-blue-200 mb-2">
                <Crown className="inline-block mr-2 text-yellow-400" size={16} />
                50冊以上の出版実績を持つ開発者が設計
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">
                その知識、<br className="md:hidden" />眠らせるな。<br />
                <span className="text-yellow-400">稼ぐ資産</span>に<br className="md:hidden" />変えろ。
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                執筆不要。「AI × 売れる構成」で、<br className="hidden lg:block" />
                最短3日で<strong className="text-white border-b-2 border-yellow-400">「ランキング1位」を狙える著者</strong>へ。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href="#demo" 
                  className="bg-white text-blue-900 hover:bg-slate-100 text-lg font-bold px-8 py-4 rounded-full shadow-xl transform hover:-translate-y-1 transition text-center flex items-center justify-center gap-2"
                >
                  <PlayCircle size={20} className="text-blue-600" />
                  デモ動画を見る
                </a>
                <a 
                  href="#pricing" 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl transform hover:-translate-y-1 transition text-center flex items-center justify-center gap-2"
                >
                  プランを見る <ArrowRight size={20} />
                </a>
              </div>
              
              <p className="text-xs text-slate-400 mt-2">
                ✨ グループコンサル付きサポートプランあり
              </p>
            </div>

            {/* 右側：モックアップ画像とバッジ */}
            <div className="relative lg:h-auto flex justify-center">
              <div className="relative bg-white p-2 rounded-xl shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500 w-full max-w-md">
                <div className="bg-slate-100 rounded-lg overflow-hidden relative aspect-[4/3] flex flex-col">
                  {/* ブラウザヘッダー風 */}
                  <div className="bg-slate-800 h-8 flex items-center px-3 space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  {/* コンテンツ */}
                  <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
                    <div className="text-6xl text-blue-600 mb-4">
                      <CheckCircle size={64} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      出版準備が完了しました
                    </h3>
                    <p className="text-slate-500 text-sm">
                      ファイル形式: KDP最適化済 (Word/EPUB)
                    </p>
                    <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
                
                {/* 50冊実績バッジ */}
                <div className="absolute -top-6 -right-6 bg-yellow-400 text-slate-900 font-bold w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12 border-4 border-white z-20">
                  <span className="text-xs">出版実績</span>
                  <span className="text-3xl font-black">50<span className="text-base">冊超</span></span>
                </div>
                
                {/* ランキング1位バッジ */}
                <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 z-20 max-w-xs">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">開発者ノウハウ</p>
                    <p className="text-sm font-bold text-slate-800">
                      ランキング1位獲得ロジック搭載
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 無限スクロール（Marquee）セクション */}
      <section className="py-8 bg-white border-b border-slate-100 overflow-hidden">
        <div className="container mx-auto px-4 mb-4 text-center">
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            ALL IN ONE PUBLISHING TOOLS
          </p>
        </div>
        <div className="relative">
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 40s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-flex py-2">
              {[...toolsList, ...toolsList].map((tool, i) => (
                <div
                  key={i}
                  className="w-[180px] flex-shrink-0 mr-6 bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:transform hover:-translate-y-1 hover:shadow-lg hover:border-blue-400"
                >
                  <div className={`${tool.color} text-3xl mb-2`}>
                    <tool.icon size={28} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-700 text-center whitespace-normal">
                    {tool.label}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 権威性セクション */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                なぜ、多くのKindle本は「出しても売れない」のか？
              </h2>
              <p className="text-xl text-slate-600">
                それは、執筆ツールではなく<span className="text-red-600 font-bold border-b-2 border-red-200">「出版戦略」</span>が足りないからです。
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm relative">
              <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md relative flex items-center justify-center">
                    <Users size={64} className="text-slate-400" />
                  </div>
                  <p className="font-bold text-slate-900">開発者</p>
                  <div className="flex justify-center gap-1 text-yellow-400 text-xs mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">実績</span>
                    私の「売れる方程式」をすべてシステム化しました
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Crown className="text-yellow-500" size={16} /> 出版実績 50冊以上
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Trophy className="text-yellow-500" size={16} /> ランキング1位 多数獲得
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <TrendingUp className="text-yellow-500" size={16} /> 3年続くロングセラー作成
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Search className="text-yellow-500" size={16} /> Amazon内SEO完全攻略
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    「私自身、最初は苦労しました。しかし、50冊出す中で『売れる本の方程式』を見つけました。
                    Kindle出版メーカーは単なるAIライティングツールではありません。
                    <strong className="text-blue-700 bg-blue-50 px-1">ベストセラー作家の編集者が、あなたの隣にいるのと同じです。</strong>」
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ターゲット別タブセクション */}
      <section id="targets" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            あなたはどのタイプ？<br />目的別 活用法
          </h2>
          
          {/* タブボタン */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-5xl mx-auto border-b border-gray-200">
            <button
              onClick={() => setActiveTab('beginner')}
              className={`px-4 md:px-6 py-3 font-bold transition rounded-t-lg text-sm md:text-base border-b-3 ${
                activeTab === 'beginner'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-500 border-b-2 border-transparent hover:text-blue-600'
              }`}
            >
              <Sparkles className="inline-block mr-2" size={16} />
              Kindle初心者
            </button>
            <button
              onClick={() => setActiveTab('retry')}
              className={`px-4 md:px-6 py-3 font-bold transition rounded-t-lg text-sm md:text-base border-b-3 ${
                activeTab === 'retry'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-500 border-b-2 border-transparent hover:text-blue-600'
              }`}
            >
              <ArrowRight className="inline-block mr-2" size={16} />
              再挑戦・リベンジ
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 md:px-6 py-3 font-bold transition rounded-t-lg text-sm md:text-base border-b-3 ${
                activeTab === 'business'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-500 border-b-2 border-transparent hover:text-blue-600'
              }`}
            >
              <Users className="inline-block mr-2" size={16} />
              ビジネス・集客
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-4 md:px-6 py-3 font-bold transition rounded-t-lg text-sm md:text-base border-b-3 ${
                activeTab === 'revenue'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-500 border-b-2 border-transparent hover:text-blue-600'
              }`}
            >
              <TrendingUp className="inline-block mr-2" size={16} />
              収益化・副業
            </button>
          </div>

          <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
            {/* タブ1: Kindle初心者 */}
            {activeTab === 'beginner' && (
              <div className="flex flex-col md:flex-row gap-8 items-center h-full animate-fade-in">
                <div className="md:w-1/2">
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    ハードルは低く、夢は大きく
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    えっ、私がAmazonで<br />本を出せるの？
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    はい、本当です。知識ゼロ・執筆経験ゼロでも大丈夫。<br />
                    AIと一緒に、あなたの「趣味」や「経験」を世界に届けよう。<br />
                    難しいパソコン操作は一切不要。ガイド通りに進むだけで、Amazon作家デビューへの最短ルートが開けます。
                  </p>
                  <a href="#demo" className="text-blue-600 font-bold hover:underline text-sm">
                    デモ動画で簡単さを確認する <ArrowRight className="inline" size={16} />
                  </a>
                </div>
                <div className="md:w-1/2 h-64 md:h-80 rounded-xl overflow-hidden shadow-lg relative">
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="パソコンを見て喜ぶ女性" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <p className="text-white font-bold text-sm">「私にもできた！」が自信に変わる</p>
                  </div>
                </div>
              </div>
            )}

            {/* タブ2: 再挑戦・リベンジ */}
            {activeTab === 'retry' && (
              <div className="flex flex-col md:flex-row gap-8 items-center h-full animate-fade-in">
                <div className="md:w-1/2">
                  <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    失敗原因を特定
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    あなたの本が売れないのは、<br />中身のせいではありません。
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    足りなかったのは「売れる構成」と「Amazonの攻略法」でした。<br />
                    50冊の実績を持つプロの戦略で、眠っているその本をベストセラーに変えませんか？<br />
                    「リライト機能」と「SEO最適化」を通すだけで、埋もれていたあなたの本が、稼ぐ資産として蘇ります。
                  </p>
                  <a href="#features" className="text-blue-600 font-bold hover:underline text-sm">
                    リベンジ機能を見る <ArrowRight className="inline" size={16} />
                  </a>
                </div>
                <div className="md:w-1/2 h-64 md:h-80 rounded-xl overflow-hidden shadow-lg relative">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="データ分析と成長" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <p className="text-white font-bold text-sm">データに基づいた「売れる本」へ</p>
                  </div>
                </div>
              </div>
            )}

            {/* タブ3: ビジネス・集客 */}
            {activeTab === 'business' && (
              <div className="flex flex-col md:flex-row gap-8 items-center h-full animate-fade-in">
                <div className="md:w-1/2">
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    最強のオウンドメディア
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    広告費ゼロで、<br />見込み客が集まる「仕組み」を作れ。
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    Kindle出版は名刺代わりに「著書」を渡す時代です。<br />
                    「先生」と呼ばれるポジションを確立し、社会的信頼を劇的に高めるブランディング出版ツール。<br />
                    Amazonの巨大な集客力を利用して、濃いリストを自動で獲得。ビジネスを加速させる「24時間働く営業マン」を量産しよう。
                  </p>
                  <a href="#pricing" className="text-blue-600 font-bold hover:underline text-sm">
                    ビジネス向けプランを見る <ArrowRight className="inline" size={16} />
                  </a>
                </div>
                <div className="md:w-1/2 h-64 md:h-80 rounded-xl overflow-hidden shadow-lg relative">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="ビジネスミーティング" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <p className="text-white font-bold text-sm">信頼と権威性を手に入れる</p>
                  </div>
                </div>
              </div>
            )}

            {/* タブ4: 収益化・副業 */}
            {activeTab === 'revenue' && (
              <div className="flex flex-col md:flex-row gap-8 items-center h-full animate-fade-in">
                <div className="md:w-1/2">
                  <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    圧倒的な生産性
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    書く労力は1/10。<br />印税の柱は10倍に。
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    AIによる高速執筆 × シリーズ管理機能で、印税を生み出す「書籍群」を量産体制へ。<br />
                    市場調査・構成・執筆・表紙・SEO。すべての工程をシステム化し、あなたの作業コストを極限までゼロに近づけました。<br />
                    寝ている間もチャリン。Amazonという巨大市場にあなただけの不労所得エリアを構築しませんか？
                  </p>
                  <a href="#pricing" className="text-blue-600 font-bold hover:underline text-sm">
                    量産体制を整える <ArrowRight className="inline" size={16} />
                  </a>
                </div>
                <div className="md:w-1/2 h-64 md:h-80 rounded-xl overflow-hidden shadow-lg relative">
                  <img 
                    src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="成長する植物とお金" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <p className="text-white font-bold text-sm">資産として積み上がる印税収入</p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                その悩み、Kindle出版メーカーがすべて解決します
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 執筆スタイル診断クイズ */}
      <section id="diagnosis" className="py-20 bg-indigo-900 text-white relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">あなたに最適な「執筆スタイル」診断</h2>
            <p className="text-indigo-200">
              3つの質問に答えるだけで、あなたの本にベストな書き方（型）を提案します。
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-800 min-h-[450px] flex flex-col relative">
            {/* プログレスバー */}
            <div className="w-full bg-gray-200 h-2">
              <div 
                className="bg-indigo-500 h-2 transition-all duration-300"
                style={{ width: `${(currentQuestion / quizQuestions.length) * 100}%` }}
              ></div>
            </div>

            {/* 質問画面 */}
            {!quizResult && (
              <div className="p-8 md:p-12 flex-grow flex flex-col justify-center">
                <div className="animate-fade-in">
                  <span className="block text-center text-indigo-300 font-bold mb-4 tracking-widest text-xs">
                    QUESTION 0{currentQuestion + 1}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold mb-8 text-center text-gray-800">
                    {quizQuestions[currentQuestion].question}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {quizQuestions[currentQuestion].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(opt.types)}
                        className="bg-white border border-gray-200 p-4 rounded-xl text-left font-bold text-gray-700 transition flex items-center gap-3 hover:transform hover:-translate-y-1 hover:border-indigo-500 hover:bg-indigo-50"
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                          {idx + 1}
                        </div>
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 結果画面 */}
            {quizResult && (
              <div className="p-8 md:p-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">
                  <Lightbulb size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-500 mb-1">
                  あなたにおすすめの執筆スタイルは...
                </h3>
                <div className="text-3xl font-black text-indigo-600 mb-4">
                  {quizResultTypes[quizResult].title}
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 w-full text-left">
                  <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">
                    💡 このスタイルの特徴
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {quizResultTypes[quizResult].desc}
                  </p>
                </div>

                <a 
                  href="#pricing" 
                  className="block w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-lg shadow-lg transition transform hover:-translate-y-1 mb-4"
                >
                  このスタイルで執筆を開始する
                </a>
                <button 
                  onClick={resetQuiz}
                  className="text-gray-400 text-sm underline hover:text-gray-600 mt-4"
                >
                  もう一度診断する
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* デモ動画セクション */}
      <section id="demo" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              百聞は一見に如かず。<br />このスピード感を体験してください。
            </h2>
            <p className="text-slate-400">
              複雑な操作は一切ありません。動画で実際の出版フローを確認できます。
            </p>
          </div>

          {/* 動画プレースホルダー */}
          <div className="max-w-4xl mx-auto bg-black rounded-2xl shadow-2xl overflow-hidden border border-slate-700 aspect-video flex items-center justify-center relative group cursor-pointer mb-12">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <PlayCircle size={72} className="text-white/80 group-hover:text-white group-hover:scale-110 transition z-10" />
            <img 
              src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Demo Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              loading="lazy"
            />
            <span className="absolute bottom-6 left-6 text-sm font-bold bg-black/50 px-3 py-1 rounded">
              1分でわかる操作デモ
            </span>
          </div>
          
          <div className="mt-8 text-center bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
            <h3 className="font-bold text-xl mb-2">
              <Zap className="inline mr-2 text-blue-400" size={20} />
              無料デモ版をご用意しました
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              課金前に、実際のUIを触って操作感を確認できます。<br />
              （※デモ版では原稿のエクスポート機能等は制限されています）
            </p>
            <Link
              href="/kindle/new?mode=demo"
              className="inline-block bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-slate-200 transition"
            >
              デモ画面を触ってみる
            </Link>
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
              それがKindle出版メーカーの強みです。
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

      {/* 比較セクション - 3軸比較 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            圧倒的なコスパとタイパ
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="p-4 rounded-tl-lg font-medium">比較項目</th>
                  <th className="p-4 font-medium text-center">自力で執筆</th>
                  <th className="p-4 font-medium text-center">ライター外注/コンサル</th>
                  <th className="p-4 bg-blue-600 text-white font-bold text-center rounded-t-lg shadow-lg relative scale-105 origin-bottom">
                    Kindle出版メーカー
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-bold">費用</td>
                  <td className="p-4 text-center">0円</td>
                  <td className="p-4 text-center text-red-500 font-bold">30万円〜100万円</td>
                  <td className="p-4 text-center bg-blue-50 font-bold text-blue-700 border-x border-blue-100">
                    49,800円〜
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-bold">時間</td>
                  <td className="p-4 text-center">1ヶ月〜半年</td>
                  <td className="p-4 text-center">約1ヶ月</td>
                  <td className="p-4 text-center bg-blue-50 font-bold text-blue-700 border-x border-blue-100">
                    最短3日
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-bold">品質</td>
                  <td className="p-4 text-center text-sm">素人感が出る</td>
                  <td className="p-4 text-center text-sm">ライター次第</td>
                  <td className="p-4 text-center bg-blue-50 font-bold text-blue-700 border-x border-blue-100 text-sm">
                    プロ監修構成 × あなたの知見
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-bold">ノウハウ</td>
                  <td className="p-4 text-center text-sm">自分で調べる</td>
                  <td className="p-4 text-center text-sm">担当者による</td>
                  <td className="p-4 text-center bg-blue-50 font-bold text-blue-700 border-x border-blue-100 text-sm">
                    50冊出版の実績あり
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold rounded-bl-lg">ストレス</td>
                  <td className="p-4 text-center text-sm">孤独・挫折しやすい</td>
                  <td className="p-4 text-center text-sm">やり取りが面倒</td>
                  <td className="p-4 text-center bg-blue-50 font-bold text-blue-700 border-x border-blue-100 rounded-b-lg text-sm">
                    ゲーム感覚で楽しい
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 料金プラン - タブ切り替え式 */}
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
            <p className="text-lg text-gray-600 mb-8">
              すべてのプランで書籍数無制限・KDP形式エクスポート対応
            </p>

            {/* タブ切り替えボタン */}
            <div className="inline-flex bg-white rounded-full p-1 shadow-md">
              <button
                onClick={() => setPricingTab('monthly')}
                className={`px-6 py-3 rounded-full font-bold transition ${
                  pricingTab === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                月額プラン
              </button>
              <button
                onClick={() => setPricingTab('package')}
                className={`px-6 py-3 rounded-full font-bold transition ${
                  pricingTab === 'package'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                期間集中プラン
              </button>
            </div>
          </div>

          {/* 月額プランタブ */}
          {pricingTab === 'monthly' && (
            <div>
              <SubscriptionPlans 
                userEmail={user?.email}
                customPrices={prices || undefined}
                referralCode={referralCode}
              />
            </div>
          )}

          {/* 期間集中プランタブ */}
          {pricingTab === 'package' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {/* トライアルプラン */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <div className="mb-4">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    TRIAL
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">1ヶ月トライアル</h3>
                <p className="text-sm text-slate-500 mb-6">まずは1冊、確実に出版したい方へ</p>
                <div className="text-3xl font-bold text-slate-900 mb-6">
                  ¥49,800 <span className="text-sm font-normal text-slate-500">(税込)</span>
                </div>
                
                <a 
                  href="#contact" 
                  className="block w-full py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-lg text-center hover:bg-slate-200 transition mb-6"
                >
                  このプランを選択
                </a>

                <div className="space-y-3 text-sm text-slate-600 flex-grow">
                  <p className="font-bold text-slate-800 border-b pb-2 mb-3">搭載機能・サポート</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold">期間：1ヶ月間</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>AI：高速AIモデル (標準)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>書籍作成数：3冊まで</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Word出力：5回まで</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>各種マニュアル完備</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400 line-through">
                      <XCircle className="flex-shrink-0 mt-0.5" size={16} />
                      <span>グループコンサル (0回)</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400 line-through">
                      <XCircle className="flex-shrink-0 mt-0.5" size={16} />
                      <span>チャットサポート</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400 line-through">
                      <XCircle className="flex-shrink-0 mt-0.5" size={16} />
                      <span>個別コンサル</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* スタンダードプラン（人気） */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-yellow-400 relative flex flex-col transform md:-translate-y-4 z-10">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                  👑 一番人気
                </div>
                <div className="mb-4 mt-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    STANDARD
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">3ヶ月実践プラン</h3>
                <p className="text-sm text-slate-500 mb-6">複数冊出版し、集客導線を作りたい方</p>
                <div className="text-4xl font-bold text-blue-600 mb-6">
                  ¥99,800 <span className="text-sm font-normal text-slate-500">(税込)</span>
                </div>
                
                <a 
                  href="#contact" 
                  className="block w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg text-center hover:from-blue-700 hover:to-blue-800 transition shadow-md mb-8"
                >
                  今すぐ申し込む
                </a>

                <div className="space-y-3 text-sm text-slate-700 flex-grow">
                  <p className="font-bold text-slate-900 border-b pb-2 mb-3">搭載機能・サポート</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold">期間：3ヶ月間</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold text-blue-700">AI：執筆特化型AI (自然な文章)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>書籍作成数：10冊まで</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Word出力：20回まで</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>各種マニュアル完備</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold text-blue-600">グループコンサル (1回)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold text-blue-600">チャットサポート (無制限)</span></span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400 line-through">
                      <XCircle className="flex-shrink-0 mt-0.5" size={16} />
                      <span>個別コンサル</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* ビジネスプラン */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <div className="mb-4">
                  <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    BUSINESS
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">3ヶ月プロプラン</h3>
                <p className="text-sm text-slate-500 mb-6">出版をビジネスの柱にする本気の方へ</p>
                <div className="text-3xl font-bold text-slate-900 mb-6">
                  ¥199,800 <span className="text-sm font-normal text-slate-500">(税込)</span>
                </div>
                
                <a 
                  href="#contact" 
                  className="block w-full py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-lg text-center hover:bg-slate-200 transition mb-6"
                >
                  ビジネス利用について相談
                </a>

                <div className="space-y-3 text-sm text-slate-600 flex-grow">
                  <p className="font-bold text-slate-800 border-b pb-2 mb-3">搭載機能・サポート</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold">期間：3ヶ月間</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold text-blue-700">AI：最高峰AI + SEO特化</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>書籍作成数：<span className="font-bold text-slate-900">無制限</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Word出力：<span className="font-bold text-slate-900">無制限</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>各種マニュアル完備</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold text-blue-600">グループコンサル (3回)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold text-blue-600">チャットサポート (無制限)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
                      <span><span className="font-bold text-orange-500">個別コンサル (1回)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

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
                  Kindle出版メーカーを活用したビジネスパートナーを募集しています
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

      {/* CTA - 攻めたコピー */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
        ></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <BookOpen size={20} className="text-yellow-300" />
            <span className="font-bold">Kindle出版メーカー</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
            あなたの経験は、<br />
            誰かの役に立つ「宝物」です。
          </h2>
          
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            かつて、本を出すことは選ばれた人だけの特権でした。<br />
            しかし今は違います。「書くのが大変」という理由だけで、<br />
            その宝物を埋もれさせないでください。<br />
            私が50冊以上の出版で得たすべての知見を、このKindle出版メーカーに込めました。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kindle/new?mode=demo"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white text-xl font-bold px-12 py-5 rounded-full shadow-2xl transform hover:-translate-y-1 transition"
            >
              まずはデモ画面を触ってみる
            </Link>
          </div>

          <p className="mt-8 text-blue-300 text-sm">
            リスクなし。1分で実際の操作感を確認できます。
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

