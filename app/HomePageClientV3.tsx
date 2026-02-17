'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ServiceSelector from '@/components/shared/ServiceSelector';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import FeedbackModal from '@/components/shared/FeedbackModal';
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
  Share2,
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
  BookOpen,
  MessageSquareHeart,
} from 'lucide-react';
import { setUserId } from '@/lib/gtag';

// V3: V2内容 + KindleLPV4風デザイン + 構成改修版

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

  // 統計カウント
  const [totalCounts, setTotalCounts] = useState<Record<string, number>>({
    all: 0, quiz: 0, profile: 0, business: 0, survey: 0,
    booking: 0, attendance: 0, salesletter: 0, gamification: 0,
  });

  // 診断ツール用のstate
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    freelance: 0, shop: 0, influencer: 0, marketer: 0
  });
  const [showResult, setShowResult] = useState(false);

  // タブ切り替え用のstate
  const [activeTab, setActiveTab] = useState('tab-freelance');

  // プロプランモーダル用のstate
  const [showProPlanModal, setShowProPlanModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // トップに戻るボタン用のstate
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ご意見箱モーダル用のstate
  const [showFeedback, setShowFeedback] = useState(false);

  // 統計カウント取得（ポータルと同じ方式）
  const fetchTotalCounts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('content_creation_counts')
        .select('content_type, total_count');
      if (error) { console.error('Count fetch error:', error); return; }
      if (data) {
        const counts = data.reduce((acc, row) => {
          acc[row.content_type] = row.total_count;
          return acc;
        }, {} as Record<string, number>);
        setTotalCounts({
          all: Object.values(counts).reduce((a, b) => a + b, 0),
          quiz: counts.quiz || 0,
          profile: counts.profile || 0,
          business: counts.lp || 0,
          survey: counts.survey || 0,
          booking: counts.booking || 0,
          attendance: counts.attendance || 0,
          salesletter: counts.salesletter || 0,
          gamification: counts.game || 0,
        });
      }
    } catch (error) { console.error('Count fetch error:', error); }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        supabase.auth.onAuthStateChange((_event, session) => {
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
              ...q, type: 'quiz' as const, views_count: q.views_count || 0,
            })));
          }
        } catch (error) { console.error('Failed to fetch popular contents:', error); }
      }
      setIsLoading(false);
    };
    init();
    fetchTotalCounts();
  }, [fetchTotalCounts]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleLogout = async () => {
    if (supabase) { await supabase.auth.signOut(); setUser(null); }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') { window.location.href = '/'; }
    else if (page === 'create') { document.getElementById('create-section-services')?.scrollIntoView({ behavior: 'smooth' }); }
    else if (page === 'diagnosis') { document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' }); }
    else { window.location.href = `/${page}`; }
  };

  const handleServiceSelect = (service: string) => navigateTo(`${service}/editor`);

  // 診断ツール
  const questions = [
    { id: 1, question: "Q1. あなたの主なビジネス（活動）は？", options: [
      { text: "個人でサービス提供（コーチ、ヨガ等）", type: "freelance" },
      { text: "お店を経営している", type: "shop" },
      { text: "SNS発信・アフィリエイト", type: "influencer" },
      { text: "Webマーケティング・制作", type: "marketer" }
    ]},
    { id: 2, question: "Q2. 今、一番解決したい悩みは？", options: [
      { text: "予約調整やメール対応が面倒...", type: "freelance" },
      { text: "集客したい・ファンを増やしたい！", type: "influencer" },
      { text: "リピーターを増やしたい", type: "shop" },
      { text: "LPを素早く作りたい・検証したい", type: "marketer" }
    ]},
    { id: 3, question: "Q3. パソコン操作は得意ですか？", options: [
      { text: "苦手。スマホで完結したい", type: "shop" },
      { text: "普通。文字入力くらいなら", type: "freelance" },
      { text: "得意。こだわりたい", type: "marketer" },
      { text: "画像加工なら得意", type: "influencer" }
    ]}
  ];

  const results = {
    freelance: { title: "プロフィールメーカー ＋ 予約メーカー ＋ アンケートメーカー", desc: "事務作業を自動化したいあなたに最適。名刺代わりのプロフィールページに予約機能をつけ、日程調整の手間をゼロに。アンケートで顧客の声を自動収集しましょう。" },
    shop: { title: "診断クイズメーカー ＋ ガチャ/スタンプラリー ＋ LPメーカー", desc: "お店の集客には「エンタメ」が効きます。診断クイズやガチャでお客様を楽しませ、スタンプラリーでリピーターを育成。結果画面でクーポンを配布して来店を促しましょう。" },
    influencer: { title: "診断クイズメーカー ＋ プロフィールメーカー ＋ 福引き/スクラッチ", desc: "フォロワーとの距離を縮める「遊べるプロフィール」がおすすめ。福引きやスクラッチでキャンペーンを盛り上げ、診断結果に合わせておすすめ商品を紹介すると収益化も加速します。" },
    marketer: { title: "LPメーカー ＋ セールスライター ＋ 診断クイズメーカー", desc: "スピーディーな検証が必要なあなたには、テンプレートで即作成できるLPとAI文章生成のセールスライターが最適。診断コンテンツをLPに埋め込むのもCVR向上に効果的です。" }
  };

  const handleAnswer = (type: string) => {
    setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));
    if (currentQuestion < questions.length - 1) { setCurrentQuestion(prev => prev + 1); }
    else { setShowResult(true); }
  };

  const resetQuiz = () => { setCurrentQuestion(0); setScores({ freelance: 0, shop: 0, influencer: 0, marketer: 0 }); setShowResult(false); };

  const getWinnerType = (): keyof typeof results => {
    const entries = Object.entries(scores) as [keyof typeof results, number][];
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  // プロプラン決済処理
  const handleProPlanCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const email = user?.email;
      const referralCode = getReferralCode();
      if (referralCode && email) {
        try {
          await fetch('/api/affiliate/pending', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, referralCode, service: 'makers', planTier: 'pro', planPeriod: 'monthly', userId: (user as { id?: string })?.id || null }),
          });
        } catch (err) { console.warn('⚠️ Failed to save pending affiliate:', err); }
      }
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'makers_pro_monthly', userId: (user as { id?: string })?.id || null, email: email || null }),
      });
      const data = await response.json();
      if (data.url) { window.location.href = data.url; }
      else if (data.error) { throw new Error(data.error); }
      else { alert('決済ページの準備中です。しばらくお待ちください。'); }
    } catch (error) { console.error('決済エラー:', error); alert('決済の開始に失敗しました。もう一度お試しください。'); }
    finally { setIsProcessingPayment(false); }
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
      <Suspense fallback={null}><AffiliateTracker serviceType="makers" /></Suspense>
      <AnnouncementBanner serviceType="all" />

      <style>{`
        @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scrollRight { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .marquee-left { animation: scrollLeft 30s linear infinite; }
        .marquee-left:hover { animation-play-state: paused; }
        .marquee-right { animation: scrollRight 40s linear infinite; }
        .marquee-right:hover { animation-play-state: paused; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} onNavigate={navigateTo} />

      {/* プロプランモーダル */}
      {showProPlanModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 text-white px-6 py-5 flex justify-between items-center z-10 rounded-t-3xl" style={{ backgroundColor: '#f97316' }}>
              <div className="flex items-center gap-3"><Crown size={24} /><h3 className="font-bold text-xl">プロプラン</h3></div>
              <button onClick={() => setShowProPlanModal(false)} className="text-white/80 hover:text-white transition p-1"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-black" style={{ color: '#5d4037' }}>¥3,980<span className="text-lg font-normal text-gray-500">/月</span></div>
                <p className="text-sm text-gray-500 mt-1">税込 / いつでも解約可能</p>
              </div>
              <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#fffbf0' }}>
                <h4 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5d4037' }}>
                  <Sparkles size={18} style={{ color: '#f97316' }} />プロプランで使える機能
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
                      <span className={`text-sm ${item.highlight ? 'font-bold' : ''}`} style={{ color: '#5d4037' }}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {!user && (
                <div className="border rounded-2xl p-4 mb-6" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <p className="text-sm" style={{ color: '#5d4037' }}><span className="font-bold">💡 ヒント：</span>ログインすると、購入履歴がアカウントに紐付けられます。</p>
                  <button onClick={() => { setShowProPlanModal(false); setShowAuth(true); }} className="mt-2 text-sm font-bold hover:underline" style={{ color: '#f97316' }}>ログイン / 新規登録はこちら →</button>
                </div>
              )}
              <button onClick={handleProPlanCheckout} disabled={isProcessingPayment}
                className="w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transform"
                style={{ backgroundColor: '#f97316' }}>
                {isProcessingPayment ? (<><Loader2 className="animate-spin" size={20} />処理中...</>) : (<><CreditCard size={20} />決済ページへ進む<ExternalLink size={16} /></>)}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">Stripeによる安全な決済処理。カード情報は当サイトに保存されません。</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== 1. Hero Section ========== */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', opacity: 0.08 }}></div>
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" style={{ backgroundColor: '#ffedd5' }}></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-1.5 px-5 rounded-full bg-white text-sm font-bold mb-6 tracking-wide border-2 shadow-sm" style={{ color: '#f97316', borderColor: '#f97316' }}>
            🔰 パソコン苦手でも大丈夫！ ずっと0円
          </span>
          <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }}>
            無料で、いろんなツールが<br />
            <span style={{ color: '#f97316' }}>カンタンに作れる！</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            <span className="font-bold" style={{ color: '#f97316' }}>診断クイズ</span>、
            <span className="font-bold" style={{ color: '#f97316' }}>プロフィール</span>、
            <span className="font-bold" style={{ color: '#f97316' }}>ランディングページ</span>、<br />
            アンケート、予約システム、出欠確認、ゲーム、Kindle出版まで...。<br />
            あなたのアイデア次第で、使い方は無限大！
          </p>

          {/* メインCTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button onClick={() => navigateTo('create')}
              className="w-full sm:w-auto text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#f97316' }}>
              <Sparkles size={20} />今すぐ何か作る！
            </button>
            <button onClick={() => navigateTo('portal')}
              className="w-full sm:w-auto text-lg font-bold py-4 px-10 rounded-full shadow-sm transition transform hover:-translate-y-1 flex items-center justify-center gap-2 bg-white border-2"
              style={{ color: '#5d4037', borderColor: '#ffedd5' }}>
              <LayoutGrid size={20} />みんなの作品を見る
            </button>
          </div>

          {/* サブリンク */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
            <button onClick={() => setShowAuth(true)} className="hover:underline transition" style={{ color: '#f97316' }}>ログイン</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => navigateTo('create')} className="hover:underline transition" style={{ color: '#f97316' }}>ツール一覧</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => navigateTo('diagnosis')} className="hover:underline transition" style={{ color: '#f97316' }}>無料診断</button>
          </div>
        </div>
      </section>

      {/* ========== 2. 統計バー ========== */}
      <section className="py-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black">{totalCounts.all.toLocaleString()}</div>
              <div className="text-xs sm:text-sm opacity-80">総作品数</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/30"></div>
            {[
              { label: 'クイズ', count: totalCounts.quiz },
              { label: 'プロフィール', count: totalCounts.profile },
              { label: 'LP', count: totalCounts.business },
              { label: 'アンケート', count: totalCounts.survey },
              { label: '予約', count: totalCounts.booking },
              { label: '出欠', count: totalCounts.attendance },
              { label: 'セールス', count: totalCounts.salesletter },
              { label: 'ゲーム', count: totalCounts.gamification },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-lg sm:text-xl font-bold">{item.count.toLocaleString()}</div>
                <div className="text-xs opacity-80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 3. 無限スクロール2段 ========== */}
      {/* 上段: テキストバッジ（左スクロール） */}
      <section className="py-3 overflow-hidden border-b" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
        <div className="relative">
          <div className="marquee-left inline-flex py-2">
            {[...Array(2)].flatMap((_, setIdx) =>
              ['ずっと0円', 'テンプレート豊富', 'プログラミング不要', 'クレカ登録なし', '商用利用OK', 'スマホで完結', 'AI自動生成', 'SNS拡散設計'].map((text, i) => (
                <div key={`${setIdx}-${i}`} className="flex-shrink-0 mx-4 flex items-center gap-2">
                  <Check size={16} style={{ color: '#f97316' }} />
                  <span className="font-bold text-sm whitespace-nowrap" style={{ color: '#5d4037' }}>{text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 下段: ツールアイコン（右スクロール） */}
      <section className="py-4 overflow-hidden border-b" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)', borderColor: '#ffedd5' }}>
        <div className="relative">
          <div className="marquee-right inline-flex py-2">
            {[...Array(2)].flatMap((_, setIdx) =>
              [
                { icon: Sparkles, text: "診断クイズ", color: "text-pink-500" },
                { icon: FileText, text: "アンケート", color: "text-teal-500" },
                { icon: Users, text: "出欠表", color: "text-purple-500" },
                { icon: Calendar, text: "予約", color: "text-blue-500" },
                { icon: UserCircle, text: "プロフィール", color: "text-emerald-500" },
                { icon: Building2, text: "LP", color: "text-amber-500" },
                { icon: PenTool, text: "セールスライター", color: "text-rose-500" },
                { icon: Gift, text: "福引き", color: "text-pink-500" },
                { icon: Gamepad2, text: "ガチャ", color: "text-purple-500" },
                { icon: Star, text: "スロット", color: "text-yellow-500" },
                { icon: Ticket, text: "スクラッチ", color: "text-cyan-500" },
                { icon: Stamp, text: "スタンプラリー", color: "text-green-500" },
                { icon: BookOpen, text: "Kindle出版", color: "text-orange-500" },
              ].map((tool, i) => (
                <div key={`${setIdx}-${i}`} className="w-[160px] flex-shrink-0 bg-white border border-orange-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mx-2">
                  <div className={`${tool.color} mb-1`}><tool.icon size={28} /></div>
                  <h3 className="font-bold text-xs" style={{ color: '#5d4037' }}>{tool.text}</h3>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ========== 4. 何を作りますか？（ツール選択）========== */}
      <section id="create-section-services" className="py-20 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>何を作りますか？</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">目的に合わせて最適なコンテンツタイプを選んでね！</p>
          </div>

          <ServiceSelector onSelect={handleServiceSelect} variant="cards" showDescription={true} />

          <p className="text-center text-sm text-gray-500 mt-6">
            迷ったら、下にある「<button onClick={() => navigateTo('diagnosis')} className="font-bold hover:underline" style={{ color: '#f97316' }}>診断</button>」を試してみてね 👇
          </p>
        </div>
      </section>

      {/* ========== 5. Gallery（イラスト風）========== */}
      <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>こんな素敵なページが作れちゃう</h2>
            <p className="text-gray-600">デザインのセンスはいりません！テンプレートを選ぶだけ。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1: 美容・サロン */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden hover:-translate-y-2 transition duration-300">
              <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: '#fce7f3' }}>
                <span className="text-7xl">💅</span>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#ec4899', backgroundColor: '#fce7f3' }}>美容・サロン</span>
                <h4 className="font-bold text-lg mt-3 mb-1" style={{ color: '#5d4037' }}>予約もできるページ</h4>
                <p className="text-sm text-gray-500">おしゃれなサロンさんに人気！</p>
              </div>
            </div>

            {/* Card 2: 先生・コーチ */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden hover:-translate-y-2 transition duration-300">
              <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                <span className="text-7xl">👩‍🏫</span>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#2563eb', backgroundColor: '#dbeafe' }}>先生・コーチ</span>
                <h4 className="font-bold text-lg mt-3 mb-1" style={{ color: '#5d4037' }}>信頼プロフィール</h4>
                <p className="text-sm text-gray-500">経歴や実績をしっかりアピール</p>
              </div>
            </div>

            {/* Card 3: 飲食・お店 */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden hover:-translate-y-2 transition duration-300">
              <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: '#fef9c3' }}>
                <span className="text-7xl">🍔</span>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#ca8a04', backgroundColor: '#fef9c3' }}>飲食・お店</span>
                <h4 className="font-bold text-lg mt-3 mb-1" style={{ color: '#5d4037' }}>クーポン付き診断</h4>
                <p className="text-sm text-gray-500">お客さんが楽しめる仕掛け！</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button onClick={() => navigateTo('portal')} className="font-bold border-b-2 transition inline-flex items-center gap-2" style={{ color: '#f97316', borderColor: '#f97316' }}>
              もっと他のデザインを見る 👉
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ========== 6. 診断ツール ========== */}
      <section id="diagnosis" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>あなたに最適なツール診断</h2>
            <p className="text-gray-600">3つの質問に答えるだけで、今の課題を解決するツールセットを提案します。</p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden min-h-[450px] flex flex-col relative border-4" style={{ borderColor: '#ffedd5' }}>
            <div className="w-full h-2" style={{ backgroundColor: '#ffedd5' }}>
              <div className="h-2 transition-all duration-300" style={{ backgroundColor: '#f97316', width: `${(showResult ? questions.length : currentQuestion) / questions.length * 100}%` }}></div>
            </div>

            {!showResult ? (
              <div className="p-8 md:p-12 flex-grow flex flex-col justify-center animate-fade-in" key={currentQuestion}>
                <h3 className="text-xl md:text-2xl font-bold mb-8 text-center" style={{ color: '#5d4037' }}>{questions[currentQuestion].question}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {questions[currentQuestion].options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt.type)}
                      className="border-2 border-orange-100 p-4 rounded-2xl text-left font-bold hover:-translate-y-1 transition-all flex items-center gap-3 bg-white shadow-sm" style={{ color: '#5d4037' }}>
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#fed7aa', color: '#f97316' }}>{idx + 1}</div>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}><Sparkles size={40} /></div>
                <h3 className="text-lg font-bold text-gray-500 mb-1">あなたにおすすめの構成は...</h3>
                <div className="text-2xl md:text-3xl font-black mb-6" style={{ color: '#f97316' }}>{results[getWinnerType()].title}</div>
                <div className="p-6 rounded-2xl border mb-8 w-full text-left" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <h4 className="font-bold mb-2 border-b pb-2" style={{ color: '#5d4037', borderColor: '#ffedd5' }}>💡 なぜこれがおすすめ？</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{results[getWinnerType()].desc}</p>
                </div>
                <button onClick={() => navigateTo('create')} className="block w-full md:w-auto text-white font-bold py-4 px-12 rounded-full shadow-lg transition transform hover:-translate-y-1 mb-4" style={{ backgroundColor: '#f97316' }}>
                  このテンプレートで作成する（無料）
                </button>
                <button onClick={resetQuiz} className="text-sm underline text-gray-400 hover:text-gray-600">もう一度診断する</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 7. 3つの力 Features ========== */}
      <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>ビジネスを加速させる「3つの力」</h2>
            <p className="text-gray-600">必要なのは「機能の多さ」ではなく「成果につながる流れ」です。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-orange-50 hover:shadow-lg transition group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}><TrendingUp size={28} /></div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【集客】知ってもらう</h3>
              <p className="text-sm font-bold mb-4 tracking-wider" style={{ color: '#f97316' }}>プロフィール / LP / セールスライター</p>
              <p className="text-gray-600 text-sm">テンプレートを選ぶだけで、名刺代わりのWebページが完成。AIが売れる文章を自動生成。SNS拡散設計でオーガニックな集客を実現。</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border-2 shadow-lg transform md:-translate-y-4 relative group" style={{ borderColor: '#f97316' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">差別化ポイント！</div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}><Gamepad2 size={28} /></div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【接客】ファンにする</h3>
              <p className="text-sm font-bold mb-4 tracking-wider" style={{ color: '#f97316' }}>診断クイズ / ガチャ / 福引き / スクラッチ等</p>
              <p className="text-gray-600 text-sm">「あなたは何タイプ？」診断クイズやガチャ、スタンプラリーなどの遊べるコンテンツで、お客様との距離を縮めます。</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-orange-50 hover:shadow-lg transition group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}><Calendar size={28} /></div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#5d4037' }}>【成約】スムーズに繋がる</h3>
              <p className="text-sm font-bold mb-4 tracking-wider" style={{ color: '#f97316' }}>予約 / アンケート / 出欠表</p>
              <p className="text-gray-600 text-sm">面倒な日程調整の往復メールは不要。予約受付から顧客の声の収集、イベントの出欠管理まで自動化し、チャンスを逃しません。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 8. 活用レシピタブ ========== */}
      <section className="py-24 bg-white border-y" style={{ borderColor: '#ffedd5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>あなたの「やりたいこと」別、活用レシピ</h2>
            <p className="text-gray-600">タブを切り替えて、実際の使い方を見てみましょう。</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {[
                { id: 'tab-freelance', label: '👤 フリーランス' },
                { id: 'tab-shop', label: '🏪 店舗・教室' },
                { id: 'tab-influencer', label: '📱 インフルエンサー' },
                { id: 'tab-marketer', label: '💼 マーケター' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="px-6 py-3 rounded-full font-bold transition"
                  style={activeTab === tab.id ? { backgroundColor: '#f97316', color: 'white' } : { backgroundColor: 'white', color: '#5d4037', border: '1px solid #ffedd5' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-lg border-2 p-8 md:p-12 min-h-[300px]" style={{ borderColor: '#ffedd5' }}>
              {activeTab === 'tab-freelance' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>👤 フリーランス（コーチ・ヨガ講師・コンサル等）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">「プロフィールメーカー」で実績・経歴を魅力的に紹介し、「予約メーカー」で日程調整の手間をゼロに。「セールスライター」でAIが売れる文章を自動生成。</p>
                  <div className="border-l-8 p-4 rounded-xl mb-6" style={{ backgroundColor: '#fffbf0', borderColor: '#f97316' }}>
                    <p className="text-sm font-bold" style={{ color: '#f97316' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>・オンライン相談の事前ヒアリングをアンケートで自動化<br />・セミナー後のフォローアップクイズでエンゲージメント向上</p>
                  </div>
                  {/* 事例 */}
                  <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 text-white rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f97316' }}><UserCircle size={24} /></div>
                      <div>
                        <h4 className="font-bold" style={{ color: '#5d4037' }}>キャリアコーチ × プロフィールLP</h4>
                        <p className="text-sm text-gray-600 mt-1">プロフィールに「予約機能」を統合し、<span className="font-bold" style={{ color: '#f97316' }}>事務作業が週10時間削減</span>。空いた時間を本業に充てられるように。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'tab-shop' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>🏪 店舗・教室（飲食店・美容室・スクール等）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">「診断クイズメーカー」でお客様を楽しませながら、結果ページに「おすすめメニュー」や「クーポン」を表示。「ガチャ」「福引き」「スクラッチ」でキャンペーンを盛り上げ。</p>
                  <div className="border-l-8 p-4 rounded-xl mb-6" style={{ backgroundColor: '#fffbf0', borderColor: '#ec4899' }}>
                    <p className="text-sm font-bold" style={{ color: '#ec4899' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>・来店スタンプラリーで「リピーター特典」を自動配布<br />・ガチャやスロットで景品抽選イベントを開催<br />・お客様の声をアンケートで収集してGoogleレビュー誘導</p>
                  </div>
                  <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 text-white rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f97316' }}><Sparkles size={24} /></div>
                      <div>
                        <h4 className="font-bold" style={{ color: '#5d4037' }}>エステサロン × 診断クイズ</h4>
                        <p className="text-sm text-gray-600 mt-1">「美肌ケア診断」を公式LINEで配信し、<span className="font-bold" style={{ color: '#f97316' }}>診断実施者の42%が予約ページへ遷移</span>。従来のクーポン配布より高い反応率。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'tab-influencer' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>📱 インフルエンサー（SNS発信者・アフィリエイター）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">「プロフィールメーカー」に全SNSのリンクを集約し、「診断クイズメーカー」でフォロワーとの距離を縮める。「福引き」「スクラッチ」でキャンペーンを盛り上げ。</p>
                  <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#8b5cf6' }}>
                    <p className="text-sm font-bold" style={{ color: '#8b5cf6' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>・「あなたは何タイプ？」診断でエンゲージメント率アップ<br />・福引きやスクラッチでプレゼント企画を開催<br />・診断結果に応じてアフィリエイト商品をレコメンド</p>
                  </div>
                </div>
              )}
              {activeTab === 'tab-marketer' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#f97316' }}>💼 マーケター（Web制作・広告運用者）</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">「LPメーカー」をテンプレートで即作成、A/Bテストも簡単。「セールスライター」でAIが売れるコピーを自動生成。「診断コンテンツ」をLPに埋め込んでCVR改善。</p>
                  <div className="border-l-8 p-4 rounded-xl" style={{ backgroundColor: '#fffbf0', borderColor: '#2563eb' }}>
                    <p className="text-sm font-bold" style={{ color: '#2563eb' }}>✅ こんな使い方も：</p>
                    <p className="text-sm mt-1" style={{ color: '#5d4037' }}>・セールスライターでLP文章を自動生成<br />・クライアント向けにアンケートフォームを一元管理<br />・リード獲得用の診断LPを量産してテストマーケティング</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== 9. 3ステップ ========== */}
      <section className="py-24" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>使い方はシンプル</h2>
            <p className="text-gray-600">パソコンが苦手でも大丈夫。3ステップで完成します。</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#f97316' }}>1</div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>テンプレートを選ぶ</h3>
                <p className="text-sm text-gray-600">業種や目的に合わせて、豊富なテンプレートから選択。デザインの知識は不要です。</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#ec4899' }}>2</div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>文字と画像を変える</h3>
                <p className="text-sm text-gray-600">あなたのビジネス内容に合わせて、テキストや画像を差し替えるだけ。直感的に編集できます。</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#84cc16' }}>3</div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>公開してシェア</h3>
                <p className="text-sm text-gray-600">あなた専用のURLが発行されます。SNSや名刺に載せて、すぐに集客スタート！</p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <button onClick={() => setShowAuth(true)} className="text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl transition transform hover:-translate-y-1 inline-flex items-center gap-2" style={{ backgroundColor: '#f97316' }}>
                <Sparkles size={20} />無料で始める（30秒で登録完了）
              </button>
              <p className="text-xs text-gray-500 mt-3">※ クレジットカード登録不要</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 10. 比較表 ========== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#5d4037' }}>こんな「ツール迷子」になっていませんか？</h2>
              <p className="text-gray-600">あれもこれも契約して、管理画面を行き来する日々はもう終わりです。</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg border-2 overflow-hidden" style={{ borderColor: '#ffedd5' }}>
              <div className="grid grid-cols-2 text-center">
                <div className="p-6 border-b border-r" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}><h3 className="font-bold text-gray-500">これまでの運用</h3></div>
                <div className="p-6 border-b text-white" style={{ backgroundColor: '#f97316', borderColor: '#ffedd5' }}><h3 className="font-bold">Makersの運用</h3></div>
                <div className="p-8 border-b border-r flex flex-col items-center justify-center gap-2" style={{ borderColor: '#ffedd5' }}>
                  <Layers size={40} className="text-gray-300" /><div className="font-bold text-gray-600">バラバラのツール</div><div className="text-xs text-gray-400">HP・予約・フォーム...<br />3つ以上の管理画面</div>
                </div>
                <div className="p-8 border-b flex flex-col items-center justify-center gap-2" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <Check size={40} style={{ color: '#f97316' }} /><div className="font-bold" style={{ color: '#5d4037' }}>これ1つで完結</div><div className="text-xs" style={{ color: '#f97316' }}>すべての機能が<br />ひとつの管理画面に</div>
                </div>
                <div className="p-8 border-r flex flex-col items-center justify-center gap-2" style={{ borderColor: '#ffedd5' }}>
                  <TrendingUp size={40} className="text-gray-300" /><div className="font-bold text-gray-600">月額 ¥10,000~</div><div className="text-xs text-gray-400">ツールの数だけ<br />コストがかさむ</div>
                </div>
                <div className="p-8 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: '#fffbf0' }}>
                  <Sparkles size={40} style={{ color: '#f97316' }} /><div className="font-bold text-2xl" style={{ color: '#5d4037' }}>¥0</div><div className="text-xs" style={{ color: '#f97316' }}>ずっと無料<br />追加費用なし</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 11. 料金プラン ========== */}
      <section id="create-section" className="py-24 border-t" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
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
                <div className="mt-1"><span className="text-3xl font-bold" style={{ color: '#5d4037' }}>¥0</span><span className="text-xs text-gray-500">/ 回</span></div>
              </div>
              <p className="text-xs text-gray-500 mb-6 text-center">登録なしで、今すぐお試し作成。<br />※保存はされません</p>
              <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>新規作成（全13種）</span><Check size={16} style={{ color: '#84cc16' }} /></li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>ポータル掲載</span><Check size={16} style={{ color: '#84cc16' }} /></li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>URL発行</span><Check size={16} style={{ color: '#84cc16' }} /></li>
                {['編集・更新','アフィリエイト','アクセス解析','AI利用','ゲーミフィケーション','HTMLダウンロード','埋め込みコード','コピーライト非表示','各種セミナー','グループコンサル'].map(f => (
                  <li key={f} className="flex items-center justify-between text-sm font-bold text-gray-400"><span>{f}</span><span className="text-gray-300">×</span></li>
                ))}
              </ul>
              <button onClick={() => navigateTo('create')} className="block w-full py-3 px-4 font-bold text-center rounded-2xl transition text-sm" style={{ backgroundColor: '#fffbf0', color: '#5d4037' }}>登録せず試す</button>
            </div>

            {/* フリープラン */}
            <div className="border-4 rounded-3xl p-6 flex flex-col bg-white shadow-xl" style={{ borderColor: '#f97316' }}>
              <div className="mb-4 text-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}>標準</span>
                <h3 className="text-xl font-bold mt-2" style={{ color: '#f97316' }}>フリープラン</h3>
                <div className="mt-1"><span className="text-3xl font-bold" style={{ color: '#5d4037' }}>¥0</span><span className="text-xs text-gray-500">/ 月</span></div>
              </div>
              <p className="text-xs mb-6 text-center font-bold" style={{ color: '#5d4037' }}>30秒でできるアカウント登録だけでOK！<br />ずっと無料で使い放題。</p>
              <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>新規作成（全13種）</span><Check size={16} style={{ color: '#f97316' }} /></li>
                {['ポータル掲載','URL発行','編集・更新','アフィリエイト'].map(f => (
                  <li key={f} className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>{f}</span><Check size={16} style={{ color: '#f97316' }} /></li>
                ))}
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>AI利用</span><span className="text-xs" style={{ color: '#f97316' }}>回数制限</span></li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>ゲーミフィケーション</span><span className="text-xs" style={{ color: '#f97316' }}>回数制限</span></li>
                {['アクセス解析','HTMLダウンロード','埋め込みコード','コピーライト非表示','各種セミナー','グループコンサル'].map(f => (
                  <li key={f} className="flex items-center justify-between text-sm font-bold text-gray-400"><span>{f}</span><span className="text-gray-300">×</span></li>
                ))}
              </ul>
              <button onClick={() => setShowAuth(true)} className="block w-full py-3 px-4 text-white font-bold text-center rounded-2xl transition text-sm shadow-md hover:-translate-y-1 transform" style={{ backgroundColor: '#f97316' }}>無料で登録する</button>
            </div>

            {/* プロプラン */}
            <div className="border-2 border-purple-200 rounded-3xl p-6 flex flex-col hover:shadow-lg transition" style={{ backgroundColor: '#fffbf0' }}>
              <div className="mb-4 text-center">
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">ビジネス向け</span>
                <h3 className="text-xl font-bold text-purple-800 mt-2">プロプラン</h3>
                <div className="mt-1"><span className="text-3xl font-bold" style={{ color: '#5d4037' }}>¥3,980</span><span className="text-xs text-gray-500">/ 月</span></div>
              </div>
              <p className="text-xs text-gray-600 mb-6 text-center">本格的なビジネス運用に。<br />制限なしで使い放題。</p>
              <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>新規作成（全13種）</span><Check size={16} className="text-purple-500" /></li>
                {['ポータル掲載','URL発行','編集・更新','アフィリエイト','アクセス解析'].map(f => (
                  <li key={f} className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>{f}</span><Check size={16} className="text-purple-500" /></li>
                ))}
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>AI利用</span><span className="text-xs text-purple-500">優先</span></li>
                <li className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>ゲーミフィケーション</span><span className="text-xs text-purple-500">無制限</span></li>
                {['HTMLダウンロード','埋め込みコード','コピーライト非表示','各種セミナー','グループコンサル'].map(f => (
                  <li key={f} className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}><span>{f}</span><Check size={16} className="text-purple-500" /></li>
                ))}
              </ul>
              <button onClick={() => setShowProPlanModal(true)} className="block w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-center rounded-2xl transition text-sm shadow-md hover:-translate-y-1 transform">プロプランに申し込む</button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 12. FAQ ========== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>よくある質問</h2>
            <p className="text-gray-600">不安や疑問を解消してから、始めましょう。</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'Q. 本当に無料で使えますか？追加料金はかかりませんか？', a: 'はい、フリープランは永久無料です。クレジットカード登録も不要。診断クイズ、プロフィールLP、予約機能（月30件まで）などが追加料金なしで使えます。プロプランにアップグレードする際も、いつでも解約可能です。' },
              { q: 'Q. パソコンが苦手でも使えますか？', a: '大丈夫です。テンプレートを選んで文字を変えるだけなので、パソコン操作に自信がない方でも直感的に使えます。スマホからでも編集可能です。' },
              { q: 'Q. 他のツールからの乗り換えは簡単ですか？', a: 'はい、とても簡単です。既存のWebページやGoogleフォームの内容をコピー＆ペーストするだけで移行できます。' },
              { q: 'Q. 商用利用は可能ですか？', a: 'もちろんです。フリープラン・プロプランともに商用利用が可能です。サロン集客、コンサルティング営業、アフィリエイト、クライアントワークなど、あらゆるビジネスシーンでご利用いただけます。' },
              { q: 'Q. 作成したページは、どこで公開されますか？', a: 'makers.tokyo/あなたのID というURLで公開されます。このリンクをSNSのプロフィール、名刺、チラシなどに掲載してご利用ください。' },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-orange-50 bg-white">
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                    <span>{faq.q}</span><span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#ffedd5' }}>{faq.a}</div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 13. 人気コンテンツ ========== */}
      {popularContents.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#fffbf0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#f97316' }}>
                <TrendingUp size={20} /><span className="font-bold">人気コンテンツ</span>
              </div>
              <h2 className="text-3xl font-black mb-4" style={{ color: '#5d4037' }}>みんなが楽しんでいる診断クイズ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularContents.slice(0, 3).map((content, index) => (
                <a key={content.id} href={`/${content.type}/${content.slug}`}
                  className="group rounded-3xl border-2 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: 'white', borderColor: '#ffedd5' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                        : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                        : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                    }`}>{index + 1}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600"><Eye size={16} /><span className="font-bold">{content.views_count.toLocaleString()}</span></div>
                  </div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f97316' }}><Sparkles size={24} className="text-white" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2" style={{ color: '#5d4037' }}>{content.title}</h3>
                      {content.description && <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center pt-4 border-t" style={{ borderColor: '#ffedd5' }}>
                    <span className="text-sm font-bold flex items-center gap-1" style={{ color: '#f97316' }}>診断を受ける<ArrowRight size={16} /></span>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="/portal?tab=quiz" className="inline-flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-full border-2 transition-all" style={{ color: '#f97316', borderColor: '#f97316' }}>
                <LayoutGrid size={20} />もっと見る
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ========== 14. Final CTA ========== */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#f97316' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white">
            あなたのビジネスを、<br />もっと「楽しく」「楽に」。
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-orange-100">
            集客メーカー (Makers) は、あなたの「やりたいこと」を実現するためのツールです。<br />まずは無料で試してみませんか？
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <button onClick={() => setShowAuth(true)} className="w-full sm:w-auto bg-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2" style={{ color: '#f97316' }}>
              <Sparkles size={20} />無料で始める
            </button>
            <button onClick={() => navigateTo('diagnosis')} className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white/10 text-white text-lg font-bold py-4 px-12 rounded-full transition transform hover:-translate-y-1">
              診断から始める
            </button>
          </div>
          <p className="text-sm text-orange-100">※ 登録は30秒で完了 / クレジットカード不要 / いつでも無料で使えます</p>
        </div>
      </section>

      {/* ========== 15. 開発支援 ========== */}
      <section className="py-16" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-sm mb-3" style={{ color: '#b08050' }}>☕ ひとりで開発しています</p>
          <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#5d4037' }}>
            集客メーカーの開発を応援しませんか？
          </h3>
          <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#8d6e63' }}>
            集客メーカーは個人開発で運営しています。<br />
            「便利だな」と感じていただけたら、<br className="sm:hidden" />
            開発を続けるための応援をいただけるととても励みになります。
          </p>
          <a
            href="https://makers.tokyo/donation"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border-2"
            style={{ color: '#f97316', borderColor: '#fed7aa', backgroundColor: '#fff7ed' }}
          >
            <Gift size={18} />開発を応援する
          </a>
        </div>
      </section>

      {/* ご意見箱モーダル */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        user={user as { email?: string; id?: string } | null}
        onLoginRequest={() => { setShowFeedback(false); setShowAuth(true); }}
      />

      {/* フローティングボタン群 */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={() => user ? setShowFeedback(true) : setShowAuth(true)}
            className="w-12 h-12 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
            aria-label="ご意見箱"
          >
            <MessageSquareHeart size={22} />
          </button>
          <button onClick={scrollToTop} className="w-12 h-12 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: '#f97316' }} aria-label="トップに戻る"><ArrowUp size={24} /></button>
        </div>
      )}

      <Footer setPage={navigateTo} onCreate={(service) => service && navigateTo(`${service}/editor`)} user={user} setShowAuth={setShowAuth} />
    </div>
  );
}
