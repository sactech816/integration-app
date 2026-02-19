'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Check } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

// V4: V2デザイン（温かみのあるオレンジ基調）+ V3料金プラン・決済フロー

// プラン定義（LP専用の期間集中プラン）
type LPPlanType = 'trial' | 'standard' | 'business';
interface LPPlan {
  id: LPPlanType;
  name: string;
  price: number;
  period: string;
  description: string;
}

const LP_PLANS: Record<LPPlanType, LPPlan> = {
  trial: {
    id: 'trial',
    name: '30日トライアル',
    price: 49800,
    period: '30日',
    description: '記念に1冊作ってみたい方へ',
  },
  standard: {
    id: 'standard',
    name: '90日スタンダード',
    price: 99800,
    period: '90日',
    description: '副業として印税を得たい方へ',
  },
  business: {
    id: 'business',
    name: '120日プレミアム',
    price: 198000,
    period: '120日',
    description: '本格的に出版を始めたい方へ',
  },
};

// LP専用プランのUnivaPayリンク（直接指定）
const LP_UNIVAPAY_LINKS: Record<LPPlanType, string> = {
  trial: 'https://univa.cc/FGpLA1',
  standard: 'https://univa.cc/E13YDx',
  business: 'https://univa.cc/6yL6zc',
};

export default function KindleLPClient() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  // 診断クイズ用のState
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{ title: string; desc: string; kdl: string } | null>(null);

  // 決済フロー用のState
  const [selectedLPPlan, setSelectedLPPlan] = useState<LPPlanType | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ? { email: session.user.email, id: session.user.id } : null);
        });
        subscription = sub;
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ? { email: session.user.email, id: session.user.id } : null);
      }
      getReferralCode();
    };
    init();

    return () => {
      subscription?.unsubscribe();
    };
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

  // プラン選択
  const handlePlanSelect = (planType: LPPlanType) => {
    setSelectedLPPlan(planType);
    setCheckoutError('');
    if (user?.email && !checkoutEmail) {
      setCheckoutEmail(user.email);
    }
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 決済実行
  const handleCheckout = async () => {
    if (!selectedLPPlan) {
      setCheckoutError('プランを選択してください');
      return;
    }
    if (!checkoutEmail || !checkoutEmail.includes('@')) {
      setCheckoutError('有効なメールアドレスを入力してください');
      return;
    }

    const univaPayLink = LP_UNIVAPAY_LINKS[selectedLPPlan];
    if (!univaPayLink) {
      setCheckoutError('決済リンクが設定されていません。お問い合わせください。');
      return;
    }

    setIsProcessing(true);
    setCheckoutError('');

    const refCode = getReferralCode();
    if (refCode) {
      try {
        await fetch('/api/affiliate/pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: checkoutEmail,
            referralCode: refCode,
            service: 'kdl',
            planTier: selectedLPPlan,
          }),
        });
      } catch (err) {
        console.warn('Failed to save pending affiliate:', err);
      }
    }

    const params = new URLSearchParams({ email: checkoutEmail });
    window.location.href = `${univaPayLink}?${params.toString()}`;
  };

  // クイズのデータ
  const quizQuestions = [
    {
      question: "出版を通して、一番叶えたい夢はなんですか？",
      options: [
        { text: "自分の経験や想いを形にして、誰かに届けたい", type: "author" },
        { text: "自分のお仕事（教室やサロンなど）を知ってもらいたい", type: "business" },
        { text: "毎月少しでも、お小遣い（印税）が入ったら嬉しい", type: "income" }
      ]
    },
    {
      question: "今の「書くネタ」の状況はどんな感じですか？",
      options: [
        { text: "過去のブログやメモなど、素材がたくさんある", type: "stock" },
        { text: "アイデアはあるけど、文章にまとめるのが苦手", type: "idea" },
        { text: "まだ何もないので、一緒にテーマから考えてほしい", type: "zero" }
      ]
    },
    {
      question: "出版で一番気になるのはどれですか？",
      options: [
        { text: "AIを使って楽に本を作る方法", type: "system" },
        { text: "初心者でもAmazonで1位になれるコツ", type: "marketing" }
      ]
    }
  ];

  const getQuizResult = (answers: string[]) => {
    if (answers.includes('business')) {
      return {
        title: "【お仕事の先生】スタイル",
        desc: "あなたは出版を「名刺」や「チラシ」の代わりにすることで、あなたのお教室やサロンに、素敵なファンを引き寄せることができます。Amazonにお店を出すような感覚で本を作ってみましょう！",
        kdl: "90日スタンダードプランなら、LINEグループでの質問やグループセッションで、出版×集客の作戦をしっかりサポートします。"
      };
    } else if (answers.includes('stock')) {
      return {
        title: "【資産リサイクル】スタイル",
        desc: "あなたはすでに「売れる本のタネ」をたくさん持っています。ゼロから書く必要はありません。Kindle出版メーカーのAIアシスタントが、過去のブログやメモをきれいに整理して、あっという間に本にしてくれますよ。",
        kdl: "まずは30日トライアルで1冊作ってみるのがおすすめ。すでに素材があるあなたなら、短期間でも十分に出版できます。"
      };
    } else {
      return {
        title: "【想いを届けるエッセイスト】スタイル",
        desc: "「文章が苦手」「書くネタがない」という方でも大丈夫。最新のAIは「あなたの中にある想いをやさしく引き出す」のがとっても得意です。おしゃべりするだけで、あなたらしい本が仕上がります。",
        kdl: "90日スタンダードプランなら、AIの高性能モデルと充実サポートで、じっくり納得のいく1冊を作れます。"
      };
    }
  };

  const handleQuizAnswer = (type: string) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = getQuizResult(newAnswers);
      setQuizResult(result);
    }
  };

  // FAQ
  const faqs = [
    {
      q: 'パソコンが本当に苦手なんですが大丈夫ですか？',
      a: '大丈夫です！文字入力ができれば問題ありません。専門用語を使わない動画マニュアルもありますし、スタンダードプランならチャットでいつでも質問できます。',
    },
    {
      q: 'AIが書いた本の著作権は誰のものですか？',
      a: 'あなたのものです。AIはあくまで執筆を「手伝う」ツールですので、出版された本の権利や印税はすべてあなたのものになります。',
    },
    {
      q: '追加料金はかかりませんか？',
      a: 'かかりません。表示されているプラン料金のみでご利用いただけます。出版自体（Amazonへの登録）も無料です。',
    },
    {
      q: '自分なんかに書けるネタがあるか不安です。',
      a: 'ほとんどの方がそう仰いますが、必ずあります！AIとおしゃべりすることで「あ、これなら書けるかも」というテーマがきっと見つかります。まずは無料デモで試してみてください。',
    },
  ];

  return (
    <div className="min-h-screen" style={{
      fontFamily: "'Zen Maru Gothic', sans-serif",
      backgroundColor: '#fffbf0',
      color: '#5d4037',
      lineHeight: '2.0'
    }}>
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
        setUser={(u) => setUser(u ? { email: u.email, id: u.id } : null)}
        onNavigate={navigateTo}
      />

      {/* Top Banner */}
      <div className="bg-orange-500 text-white text-xs md:text-sm py-3 text-center font-bold tracking-wider px-4 shadow-sm">
        🎁 【期間限定】サポート品質維持のため、毎月5名様までの限定募集です
      </div>

      {/* Hero Section */}
      <header className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
        {/* ドット背景 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#f97316 1.5px, transparent 1.5px)',
            backgroundSize: '30px 30px',
            opacity: 0.1
          }}
        ></div>

        {/* ふんわりした背景色 */}
        <div
          className="absolute top-0 left-1/2 w-[600px] h-[600px] rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{ backgroundColor: '#ffedd5' }}
        ></div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="animate-fade-in">
            <div className="inline-block bg-white border-2 px-5 py-1.5 rounded-full text-sm font-bold mb-6 shadow-sm" style={{ borderColor: '#f97316', color: '#f97316' }}>
              🔰 パソコンが苦手・文章が書けなくても大丈夫
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-8" style={{ color: '#5d4037' }}>
              「いつか本を出したい」<br />
              その夢、<span style={{ color: '#f97316' }}>AIのやさしいサポート</span>で<br />
              叶えてみませんか？
            </h1>
          </div>

          <div className="animate-fade-in delay-200">
            <p className="text-base md:text-lg text-gray-600 mb-10 leading-loose font-medium max-w-2xl mx-auto">
              Amazonの便利な仕組みと、最新のAIアシスタント「Kindle出版メーカー」を使えば、<br />
              無名の個人でも、<span className="font-bold" style={{ background: 'linear-gradient(transparent 60%, #fef08a 60%)' }}>在庫ゼロ・費用ゼロ</span>で本が出版できます。<br />
              誰でも作家になれる「新しい本の作り方」を、ぜひ体験してください。
            </p>

            {/* Stats Badges */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <div className="bg-white border border-orange-100 px-6 py-3 rounded-full flex items-center justify-center gap-3 shadow-sm">
                <span className="text-xl">🌟</span>
                <span className="font-bold text-sm" style={{ color: '#5d4037' }}>ベストセラー獲得率 98.7%</span>
              </div>
              <div className="bg-white border border-orange-100 px-6 py-3 rounded-full flex items-center justify-center gap-3 shadow-sm">
                <span className="text-xl">⏱️</span>
                <span className="font-bold text-sm" style={{ color: '#5d4037' }}>AIとおしゃべりして最短2日で完成</span>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-white border-4 p-6 md:p-10 rounded-3xl max-w-2xl mx-auto shadow-lg relative overflow-hidden" style={{ borderColor: '#ffedd5' }}>
              <h2 className="text-2xl font-bold mb-4 mt-2" style={{ color: '#5d4037' }}>あなたに合ったプランで、今すぐ始めましょう</h2>
              <p className="text-gray-500 text-sm mb-6">
                AIがあなたの出版をフルサポート。<br />
                追加料金なし・<span className="font-bold text-base ml-1" style={{ color: '#f97316' }}>49,800円〜</span>で作家デビュー
              </p>
              <a
                href="#pricing"
                className="block w-full font-bold text-lg md:text-xl py-4 md:py-5 rounded-2xl transition-all shadow-md transform hover:-translate-y-1"
                style={{ backgroundColor: '#f97316', color: 'white' }}
              >
                料金プランを見る
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Pain Points (やさしいトーン) */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mt-4 mb-6" style={{ color: '#5d4037' }}>
              「本を出してみたい」<br />
              そう願いながら、立ち止まっていませんか？
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-warm p-8 md:p-10 rounded-3xl text-center border border-orange-50" style={{ backgroundColor: '#fffbf0' }}>
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>毎日ブログを書いても...</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-left">
                noteやブログ、SNSに一生懸命投稿しても、あっという間に流されてしまい、読まれなくなってしまって悲しい。
              </p>
            </div>
            <div className="bg-warm p-8 md:p-10 rounded-3xl text-center border border-orange-50" style={{ backgroundColor: '#fffbf0' }}>
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#5d4037' }}>出版社の賞に応募しても...</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-left">
                何ヶ月もかけて書き上げた原稿をコンテストに出しても、お返事すら来ないまま、日の目を見ずに終わってしまう。
              </p>
            </div>
            <div className="bg-warm p-8 md:p-10 rounded-3xl md:col-span-2 text-center border border-orange-50 flex flex-col md:flex-row items-center gap-6" style={{ backgroundColor: '#fffbf0' }}>
              <div className="text-5xl md:w-1/4">💸</div>
              <div className="md:w-3/4 text-left">
                <h3 className="font-bold text-lg mb-3 text-red-500">高額な「自費出版」のワナ</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  出版社から「あなたの本を出しましょう」と声がかかっても、実は数百万円かかる自費出版の営業だった。お金を払って本を作っても、おうちに在庫のダンボールが積まれるだけ...。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-xl md:text-2xl font-bold leading-loose" style={{ color: '#5d4037' }}>
              でも、まだ諦めたくないですよね。<br />
              そんなあなたに知ってほしい<span className="font-bold" style={{ background: 'linear-gradient(transparent 60%, #fef08a 60%)' }}>「やさしい出版の道」</span>があります。
            </p>
          </div>
        </div>
      </section>

      {/* Solution: Amazon & AI (わかりやすく) */}
      <section className="py-24 border-y border-orange-100 relative overflow-hidden" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <span className="font-bold tracking-widest text-sm uppercase bg-white border px-3 py-1 rounded-full" style={{ color: '#84cc16', borderColor: '#84cc16' }}>
                New Style
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-8 leading-tight" style={{ color: '#5d4037' }}>
                Amazon × AIアシスタント<br />
                誰でも作家になれる時代へ
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
                Amazonの「電子書籍（Kindle）」と「注文が入ってから印刷する仕組み（POD）」のおかげで、<strong style={{ color: '#f97316' }}>誰でも、無料で、在庫を抱えずに</strong>世界中に本を出版できるようになりました。
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                さらに、私たちが開発した出版サポートAI<strong style={{ color: '#f97316' }}>「Kindle出版メーカー」</strong>を使えば、「何を書けばいいの？」「文章が苦手…」という悩みも解決！AIと楽しくおしゃべりするだけで、<strong className="font-bold" style={{ color: '#5d4037', background: 'linear-gradient(transparent 60%, #fef08a 60%)' }}>最短2日で本が完成</strong>します。
              </p>
              <ul className="space-y-4 font-bold bg-white p-6 rounded-2xl shadow-sm" style={{ color: '#5d4037' }}>
                <li className="flex items-center gap-3"><span className="text-xl" style={{ color: '#84cc16' }}>🌱</span> 費用ゼロ・在庫の心配ゼロ</li>
                <li className="flex items-center gap-3"><span className="text-xl" style={{ color: '#84cc16' }}>🌱</span> AIがあなたの想いをきれいな文章に</li>
                <li className="flex items-center gap-3"><span className="text-xl" style={{ color: '#84cc16' }}>🌱</span> 企画書なしで、今日から書き始められる</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-8 rounded-3xl shadow-lg border-2 text-center relative" style={{ borderColor: '#ffedd5' }}>
                <div className="absolute -top-6 -right-6 text-6xl transform rotate-12">✨</div>
                <h3 className="font-bold text-xl mb-6 border-b-2 border-dashed border-orange-200 pb-4" style={{ color: '#5d4037' }}>
                  AIアシスタントのお仕事
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl flex items-center gap-4 text-left" style={{ backgroundColor: '#fffbf0' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fed7aa', color: '#f97316' }}>1</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#5d4037' }}>やさしくインタビュー</p>
                      <p className="text-xs text-gray-500">あなたの経験や想いを引き出します</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl flex items-center gap-4 text-left" style={{ backgroundColor: '#fffbf0' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fed7aa', color: '#f97316' }}>2</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#5d4037' }}>目次をしっかり組み立て</p>
                      <p className="text-xs text-gray-500">読者が読みやすい順番をご提案します</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl flex items-center gap-4 text-left" style={{ backgroundColor: '#fffbf0' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fed7aa', color: '#f97316' }}>3</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#5d4037' }}>下書きをスピーディに作成</p>
                      <p className="text-xs text-gray-500">あなたはAIが書いた文章を手直しするだけ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (V3から移植、V2デザインに合わせて調整) */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mt-4 mb-6" style={{ color: '#5d4037' }}>
              圧倒的なコスパとタイパ
            </h2>
            <p className="text-gray-600">他の方法と比べてみてください。</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-orange-100">
              <thead>
                <tr style={{ backgroundColor: '#fffbf0' }} className="text-gray-600">
                  <th className="p-4 font-bold">比較項目</th>
                  <th className="p-4 font-medium text-center">自分ひとりで</th>
                  <th className="p-4 font-medium text-center">高額スクール</th>
                  <th className="p-4 font-bold text-center text-lg text-white" style={{ backgroundColor: '#f97316' }}>Kindle出版メーカー (当サービス)</th>
                </tr>
              </thead>
              <tbody style={{ color: '#5d4037' }}>
                <tr className="border-b border-orange-50">
                  <td className="p-4 font-bold" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)' }}>かかる費用</td>
                  <td className="p-4 text-center">0円</td>
                  <td className="p-4 text-center text-red-500 font-bold">30万円〜</td>
                  <td className="p-4 text-center font-bold text-xl border-x-2 border-orange-100" style={{ backgroundColor: '#fffbf0', color: '#f97316' }}>49,800円〜</td>
                </tr>
                <tr className="border-b border-orange-50">
                  <td className="p-4 font-bold" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)' }}>かかる時間</td>
                  <td className="p-4 text-center">半年以上...</td>
                  <td className="p-4 text-center">1〜2ヶ月</td>
                  <td className="p-4 text-center font-bold border-x-2 border-orange-100" style={{ backgroundColor: '#fffbf0', color: '#f97316' }}>最短3日！</td>
                </tr>
                <tr className="border-b border-orange-50">
                  <td className="p-4 font-bold" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)' }}>パソコンスキル</td>
                  <td className="p-4 text-center text-sm">かなり必要<br />(Word設定など)</td>
                  <td className="p-4 text-center text-sm">ある程度必要</td>
                  <td className="p-4 text-center font-bold border-x-2 border-orange-100 text-sm" style={{ backgroundColor: '#fffbf0', color: '#f97316' }}>文字入力ができればOK</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)' }}>大変さ</td>
                  <td className="p-4 text-center text-sm">挫折しやすい</td>
                  <td className="p-4 text-center text-sm">課題が多い</td>
                  <td className="p-4 text-center font-bold border-x-2 border-orange-100 text-sm" style={{ backgroundColor: '#fffbf0', color: '#f97316' }}>質問に答えるだけで楽しい</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-y" style={{ backgroundColor: 'rgba(255, 237, 213, 0.3)', borderColor: '#ffedd5' }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="font-bold tracking-widest text-sm uppercase bg-white border px-4 py-1 rounded-full" style={{ color: '#f97316', borderColor: '#f97316' }}>
              Voices
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4" style={{ color: '#5d4037' }}>
              「私にもできた！」<br />受講生さんの喜びの声
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 relative mt-6">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">👩‍🏫</div>
              <div className="text-xl text-center mt-4 mb-4" style={{ color: '#facc15' }}>★★★★★</div>
              <h3 className="font-bold text-base mb-3 text-center" style={{ color: '#5d4037' }}>「28冊も出版できました」</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                システムのおかげで「書く」ハードルがぐっと下がり、自分のノウハウを次々とシリーズ化して出版できました。Amazonでの信頼が高まり、本業への問い合わせが急増しています。
              </p>
              <p className="text-xs font-bold text-gray-500 text-right">— お仕事コンサルタント M様</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 relative mt-6">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">💆‍♀️</div>
              <div className="text-xl text-center mt-4 mb-4" style={{ color: '#facc15' }}>★★★★★</div>
              <h3 className="font-bold text-base mb-3 text-center" style={{ color: '#5d4037' }}>「初めての出版で1位に」</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                文章を書くのが苦手でしたが、AIのインタビューに答えるだけで本が完成しました。出版後、雑誌からの取材依頼や、新しいお客様とのご縁がたくさん舞い込みました。
              </p>
              <p className="text-xs font-bold text-gray-500 text-right">— セラピスト Y様</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 relative mt-6">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">📖</div>
              <div className="text-xl text-center mt-4 mb-4" style={{ color: '#facc15' }}>★★★★★</div>
              <h3 className="font-bold text-base mb-3 text-center" style={{ color: '#5d4037' }}>「レビュー1,200件超え」</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                投稿サイトでは全く読まれなかった私の物語が、教わった作戦に沿ってKindleで出版した途端、本当にたくさんの読者さんに届くようになりました。
              </p>
              <p className="text-xs font-bold text-gray-500 text-right">— 小説家 K様</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">※ 個人の感想であり、成果をお約束するものではありません。</p>
        </div>
      </section>

      {/* Diagnosis Section */}
      <section id="diagnosis" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-4" style={{ color: '#5d4037' }}>
              あなたにぴったりの<br />「出版スタイル」プチ診断
            </h2>
            <p className="text-gray-600 text-sm md:text-base">3つの質問に答えるだけで、あなたがどんな本を書くと上手くいくか診断します。</p>
          </div>

          <div className="bg-warm p-8 md:p-12 shadow-sm relative min-h-[400px] flex items-center justify-center rounded-3xl border-4" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
            {/* Start Screen */}
            {!quizStarted && !quizResult && (
              <div className="text-center w-full animate-fade-in">
                <div className="text-6xl mb-6" style={{ color: '#f97316' }}>🔍</div>
                <h3 className="text-xl font-bold mb-8" style={{ color: '#5d4037' }}>AI出版スタイル・チェック</h3>
                <button
                  onClick={() => setQuizStarted(true)}
                  className="px-10 py-4 font-bold rounded-full transition-all shadow-md transform hover:-translate-y-1"
                  style={{ backgroundColor: '#f97316', color: 'white' }}
                >
                  診断をはじめる
                </button>
              </div>
            )}

            {/* Question Screen */}
            {quizStarted && !quizResult && (
              <div className="w-full max-w-2xl text-center animate-fade-in">
                <div className="mb-6 flex justify-center">
                  <span className="bg-white border-2 text-sm font-bold px-4 py-1.5 rounded-full" style={{ color: '#f97316', borderColor: '#ffedd5' }}>
                    質問 {currentQuestion + 1} / 3
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-10 leading-relaxed" style={{ color: '#5d4037' }}>
                  {quizQuestions[currentQuestion].question}
                </h3>
                <div className="flex flex-col gap-3">
                  {quizQuestions[currentQuestion].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(opt.type)}
                      className="w-full text-left p-4 md:p-5 border-2 border-orange-100 hover:border-primary font-bold transition-all rounded-2xl bg-white shadow-sm"
                      style={{ color: '#5d4037' }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result Screen */}
            {quizResult && (
              <div className="w-full max-w-2xl text-center animate-fade-in">
                <p className="text-xs font-bold tracking-widest mb-4 bg-white inline-block px-3 py-1 rounded-full border" style={{ color: '#f97316', borderColor: '#ffedd5' }}>
                  診断結果
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#5d4037' }}>{quizResult.title}</h2>
                <p className="text-gray-600 mb-8 leading-loose text-sm md:text-base">{quizResult.desc}</p>

                <div className="bg-white p-6 border-l-8 text-left mb-8 rounded-xl shadow-sm" style={{ borderColor: '#f97316' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: '#f97316' }}>おすすめプランのポイント:</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{quizResult.kdl}</p>
                </div>

                <a
                  href="#pricing"
                  className="inline-block px-10 py-4 font-bold transition shadow-md rounded-full transform hover:-translate-y-1"
                  style={{ backgroundColor: '#f97316', color: 'white' }}
                >
                  料金プランを見る
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section (V3から移植、V2デザインに合わせて調整) */}
      <section id="pricing" className="py-24 relative overflow-hidden border-t border-orange-100" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: '#5d4037' }}>
              あなたに合ったプランを選んでください
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              まずは1冊作ってみたい方も、しっかり収益化したい方も。<br />
              追加料金なしで始められます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plan 1: 30日トライアル */}
            <div className="bg-white w-full rounded-3xl shadow-lg overflow-hidden border-4 border-orange-100 hover:shadow-xl transition duration-300 flex flex-col">
              <div className="py-3 font-bold text-center" style={{ backgroundColor: '#ffedd5', color: '#5d4037' }}>まずはお試し</div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>30日トライアル</h3>
                <p className="text-sm text-gray-500 mb-4">記念に1冊作ってみたい方へ</p>
                <div className="text-3xl font-extrabold mb-6" style={{ color: '#5d4037' }}>¥49,800 <span className="text-sm font-normal text-gray-400">（税込）</span></div>

                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> システム利用（30日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 本を１冊作れます</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> AI利用（10回/日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> AIモデル（標準）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版準備ガイド</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 初心者向けマニュアル</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> Wordエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> EPUBエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版用キーワード提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版用カテゴリ提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> 出版用の書籍紹介文作成</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#84cc16' }} /> LINE招待（閲覧）</li>
                  <li className="flex items-center gap-2 text-gray-300">× アフィリエイト機能</li>
                  <li className="flex items-center gap-2 text-gray-300">× オプション割引</li>
                  <li className="flex items-center gap-2 text-gray-300">× もくもく会</li>
                  <li className="flex items-center gap-2 text-gray-300">× グループセッション</li>
                  <li className="flex items-center gap-2 text-gray-300">× 個別セッション</li>
                </ul>

                <button
                  onClick={() => handlePlanSelect('trial')}
                  className={`block w-full font-bold py-4 rounded-2xl shadow-md transition text-center ${
                    selectedLPPlan === 'trial'
                      ? 'text-white'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{ backgroundColor: selectedLPPlan === 'trial' ? '#84cc16' : '#a1a1aa' }}
                >
                  {selectedLPPlan === 'trial' ? '✓ 選択中' : 'このプランで始める'}
                </button>
              </div>
            </div>

            {/* Plan 2: 90日スタンダード (Featured) */}
            <div className="bg-white w-full rounded-3xl shadow-xl overflow-hidden border-4 relative flex flex-col md:scale-105 md:z-10" style={{ borderColor: '#f97316' }}>
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">人気No.1</div>
              <div className="py-3 font-bold text-center text-white" style={{ backgroundColor: '#f97316' }}>しっかりサポート</div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>90日スタンダード</h3>
                <p className="text-sm text-gray-500 mb-4">副業として印税を得たい方へ</p>
                <div className="text-3xl font-extrabold mb-6" style={{ color: '#f97316' }}>¥99,800 <span className="text-sm font-normal text-gray-400">（税込）</span></div>

                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2 font-bold p-1 rounded" style={{ backgroundColor: '#fffbf0' }}><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> システム利用（90日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 本を３冊まで作成可</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> AI利用（20回/日）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> AIモデル（高性能）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版準備ガイド</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 初心者向けマニュアル</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> Wordエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> EPUBエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版用キーワード提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版用カテゴリ提案</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> 出版用の書籍紹介文作成</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> LINE招待（質問可）</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> アフィリエイト機能</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> オプション割引</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> もくもく会</li>
                  <li className="flex items-center gap-2"><Check className="flex-shrink-0" size={16} style={{ color: '#f97316' }} /> グループセッション</li>
                  <li className="flex items-center gap-2 text-gray-300">× 個別セッション</li>
                </ul>

                <button
                  onClick={() => handlePlanSelect('standard')}
                  className={`block w-full font-bold py-4 rounded-2xl shadow-lg transition text-center text-white ${
                    selectedLPPlan === 'standard' ? '' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: selectedLPPlan === 'standard' ? '#84cc16' : '#f97316' }}
                >
                  {selectedLPPlan === 'standard' ? '✓ 選択中' : '今すぐ作家デビューする'}
                </button>
              </div>
            </div>

            {/* Plan 3: 120日プレミアム */}
            <div className="bg-white w-full rounded-3xl shadow-lg overflow-hidden border-4 border-purple-200 hover:shadow-xl transition duration-300 flex flex-col">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 font-bold text-center">本格派向け</div>
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>120日プレミアム</h3>
                <p className="text-sm text-gray-500 mb-4">本格的に出版を始めたい方へ</p>
                <div className="text-3xl font-extrabold text-purple-600 mb-6">¥198,000 <span className="text-sm font-normal text-gray-400">（税込）</span></div>

                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2 font-bold bg-purple-50 p-1 rounded"><Check className="text-purple-500 flex-shrink-0" size={16} /> システム利用（120日）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 本を１０冊まで作成可</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> AI利用（50回/日）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> AIモデル（最高性能）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版準備ガイド</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 初心者向けマニュアル</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> Wordエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> EPUBエクスポート</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版用キーワード提案</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版用カテゴリ提案</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 出版用の書籍紹介文作成</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> LINE招待（質問可）</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> アフィリエイト機能</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> オプション割引</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> もくもく会</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> グループセッション参加</li>
                  <li className="flex items-center gap-2"><Check className="text-purple-500 flex-shrink-0" size={16} /> 個別セッション</li>
                </ul>

                <button
                  onClick={() => handlePlanSelect('business')}
                  className={`block w-full font-bold py-4 rounded-2xl shadow-lg transition text-center text-white ${
                    selectedLPPlan === 'business' ? '' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: selectedLPPlan === 'business' ? '#84cc16' : undefined, backgroundImage: selectedLPPlan === 'business' ? undefined : 'linear-gradient(to right, #8b5cf6, #6366f1)' }}
                >
                  {selectedLPPlan === 'business' ? '✓ 選択中' : 'プレミアムプランで始める'}
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-8">※ サポート品質維持のため、毎月5名様までの限定募集です</p>

          {/* メールアドレス入力 & 決済ボタン */}
          {selectedLPPlan && (
            <div id="checkout-form" className="max-w-md mx-auto mt-10">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-4" style={{ borderColor: '#ffedd5' }}>
                <h3 className="text-lg font-bold mb-1 text-center" style={{ color: '#5d4037' }}>
                  {LP_PLANS[selectedLPPlan].name}プラン
                </h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  ¥{LP_PLANS[selectedLPPlan].price.toLocaleString()}（税込）/ {LP_PLANS[selectedLPPlan].period}
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#5d4037' }}>
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                    style={{ color: '#5d4037' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    決済完了の通知とアカウント情報をお送りします
                  </p>
                </div>

                {checkoutError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {checkoutError}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-white shadow-md hover:-translate-y-1 transform'
                  }`}
                  style={isProcessing ? undefined : { backgroundColor: '#f97316' }}
                >
                  {isProcessing ? '処理中...' : '決済に進む'}
                </button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  お支払いはUnivaPayで安全に処理されます
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: '#5d4037' }}>
            よくあるご質問
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-orange-50" style={{ backgroundColor: '#fffbf0' }}>
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-bold select-none list-none" style={{ color: '#5d4037' }}>
                    {faq.q}
                    <span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-orange-100 pt-4 bg-white">
                    {faq.a}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-orange-100" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#5d4037' }}>
            あなたの人生経験は、<br />誰かの「教科書」になる。
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            「いつか本を出したい」<br />
            その夢を、今日叶えませんか？
          </p>
          <a
            href="#pricing"
            className="inline-block font-bold text-xl px-12 py-5 rounded-full shadow-lg transition transform hover:-translate-y-1 text-white"
            style={{ backgroundColor: '#f97316' }}
          >
            料金プランを見る
          </a>
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
