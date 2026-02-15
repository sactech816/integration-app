'use client';

import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

// V2: セミナーLP版
export default function KindleLPClient() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // 診断クイズ用のState
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{ title: string; desc: string; kdl: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      // 認証状態を取得
      if (supabase) {
        supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
        });
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }

      // アフィリエイト紹介コードを取得（Cookieから）
      getReferralCode();
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
      question: "セミナーで一番聞いてみたいお話はどれですか？",
      options: [
        { text: "AIとおしゃべりして本を作る「ラクチンな方法」", type: "system" },
        { text: "初心者でもAmazonで1位になれる「ヒミツの作戦」", type: "marketing" }
      ]
    }
  ];

  // クイズ結果のタイプ
  const getQuizResult = (answers: string[]) => {
    if (answers.includes('business')) {
      return {
        title: "【お仕事の先生】スタイル 👩‍🏫",
        desc: "あなたは出版を「名刺」や「チラシ」の代わりにすることで、あなたのお教室やサロンに、素敵なファンを引き寄せることができます。Amazonにお店を出すような感覚で本を作ってみましょう！",
        kdl: "セミナーでは『3つ目のヒミツ：新しいご縁の作り方』にぜひご注目ください。本を読んでくれた方が、自然とあなたのお客さんになるやさしい仕組みを解説します。"
      };
    } else if (answers.includes('stock')) {
      return {
        title: "【資産リサイクル】スタイル ♻️",
        desc: "あなたはすでに「売れる本のタネ」をたくさん持っています。ゼロから書く必要はありません。Kindle出版メーカーのAIアシスタントが、過去のブログやメモをきれいに整理して、あっという間に本にしてくれますよ。",
        kdl: "セミナーでは『1つ目のヒミツ：AIを使った本の作り方』のデモ画面をお見逃しなく！あなたの過去の文章が、どんな風に本に変わるかイメージが湧くはずです。"
      };
    } else {
      return {
        title: "【想いを届けるエッセイスト】スタイル 📖",
        desc: "「文章が苦手」「書くネタがない」という方でも大丈夫。最新のAIは「あなたの中にある想いをやさしく引き出す」のがとっても得意です。おしゃべりするだけで、あなたらしい本が仕上がります。",
        kdl: "セミナーでは『2つ目のヒミツ：ベストセラーの法則』に注目。無名の初心者さんでも、ちゃんと読者さんに本が届く作戦をわかりやすくお伝えします。"
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
      q: '文章を書いたことがない初心者でも参加して大丈夫ですか？',
      a: 'はい、もちろん大歓迎です！本セミナーでお伝えするAIシステムは、まさに「文章を書くのが苦手な人」のために開発されました。ゼロからどうやって本を作っていくのか、具体的なイメージが湧いてワクワクするはずです。',
    },
    {
      q: 'スマホやタブレットでも受講できますか？',
      a: 'はい、Zoomが使える端末であれば可能です。ただ、セミナーの中でシステムの画面をお見せする時間がありますので、見やすいパソコンや大きめのタブレットでのご参加をおすすめしております。',
    },
    {
      q: 'あとで無理な勧誘をされませんか？',
      a: 'セミナーの後半で、本気で出版を目指す方向けにKindle出版メーカーの有料プランのご案内はさせていただきます。ですが、無理な勧誘等は一切いたしませんので、「まずは話を聞いてみたい」という方も安心してご参加くださいね。',
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
        setUser={setUser} 
        onNavigate={navigateTo}
      />

      {/* Top Banner */}
      <div className="bg-orange-500 text-white text-xs md:text-sm py-3 text-center font-bold tracking-wider px-4 shadow-sm">
        🎁 【期間限定】通常5,000円のセミナーが、今だけ無料でご参加いただけます♪
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
              誰でも作家になれる「新しい本の作り方」を、無料でお伝えします。
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
              <div className="absolute top-0 right-0 text-xs font-bold px-4 py-2 rounded-bl-xl shadow-sm" style={{ backgroundColor: '#facc15', color: '#5d4037' }}>
                ✨ 期間限定 無料 ✨
              </div>
              <h2 className="text-2xl font-bold mb-4 mt-2" style={{ color: '#5d4037' }}>やさしいKindle出版・体験セミナー</h2>
              <p className="text-gray-500 text-sm mb-6">
                おうちから参加できるオンライン(Zoom)開催<br />
                参加費：<s>5,000円</s> → <span className="font-bold text-xl ml-2" style={{ color: '#f97316' }}>無料</span>
              </p>
              <a
                href="#schedule"
                className="block w-full font-bold text-lg md:text-xl py-4 md:py-5 rounded-2xl transition-all shadow-md transform hover:-translate-y-1"
                style={{ backgroundColor: '#f97316', color: 'white' }}
              >
                無料でセミナーに参加する
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
              {/* やさしいイメージのビジュアル */}
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

      {/* Seminar Content */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mt-4 mb-6" style={{ color: '#5d4037' }}>
              無料体験セミナーでお伝えする<br />「3つのヒミツ」
            </h2>
            <p className="text-gray-600">システムの中身と、読まれる本を作るコツをわかりやすく解説します。</p>
          </div>

          <div className="grid gap-8">
            {/* Secret 1 */}
            <div className="p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-8 items-center border border-orange-50 transition hover:-translate-y-1" style={{ backgroundColor: '#fffbf0' }}>
              <div className="w-full md:w-1/3 text-center">
                <div className="font-black text-6xl opacity-30 mb-2" style={{ color: '#f97316' }}>01</div>
                <h3 className="text-xl font-bold" style={{ color: '#5d4037' }}>
                  最短2日で完成！？<br />AIを使ったラクチンな<br />本の作り方
                </h3>
              </div>
              <div className="w-full md:w-2/3 text-gray-600 text-sm leading-relaxed">
                <p>
                  あなたの経験や想いを、スラスラ読まれる「本の構成」にする方法を解説します。<br />
                  さらに、Kindle出版メーカーに搭載された「AIアシスタント」を使い、あなたが質問に答えるだけで、AIがあっという間に原稿を書き上げていく様子を、実際の画面でお見せします。
                </p>
              </div>
            </div>

            {/* Secret 2 */}
            <div className="p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-8 items-center border border-orange-50 transition hover:-translate-y-1" style={{ backgroundColor: '#fffbf0' }}>
              <div className="w-full md:w-1/3 text-center">
                <div className="font-black text-6xl opacity-30 mb-2" style={{ color: '#f97316' }}>02</div>
                <h3 className="text-xl font-bold" style={{ color: '#5d4037' }}>
                  無名でも読まれる！<br />ベストセラーの法則
                </h3>
              </div>
              <div className="w-full md:w-2/3 text-gray-600 text-sm leading-relaxed">
                <p>
                  ただ出版するだけでは、Amazonのたくさんある本の中に埋もれてしまいます。<br />
                  初めての出版でも98%以上の確率で「Amazonランキング1位（ベストセラー）」を獲得している、誰でもできるカンタンな攻略法と、本をたくさんの人に知ってもらうためのヒミツを公開します。
                </p>
              </div>
            </div>

            {/* Secret 3 */}
            <div className="p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-8 items-center border border-orange-50 transition hover:-translate-y-1" style={{ backgroundColor: '#fffbf0' }}>
              <div className="w-full md:w-1/3 text-center">
                <div className="font-black text-6xl opacity-40 mb-2" style={{ color: '#facc15' }}>03</div>
                <h3 className="text-xl font-bold" style={{ color: '#5d4037' }}>
                  出版から広がる<br />新しいご縁とお仕事の<br />作り方
                </h3>
              </div>
              <div className="w-full md:w-2/3 text-gray-600 text-sm leading-relaxed">
                <p>
                  出版して「あー、楽しかった！」で終わってはもったいないです。本を「最強の自己紹介ツール」として使い、あなたのファンを作ったり、新しいお仕事（カウンセリングやハンドメイドの販売など）に繋げていくための、やさしい仕組みの作り方を解説します。
                </p>
              </div>
            </div>
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
            {/* User 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 relative mt-6">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">👩‍🏫</div>
              <div className="text-xl text-center mt-4 mb-4" style={{ color: '#facc15' }}>★★★★★</div>
              <h3 className="font-bold text-base mb-3 text-center" style={{ color: '#5d4037' }}>「28冊も出版できました」</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                システムのおかげで「書く」ハードルがぐっと下がり、自分のノウハウを次々とシリーズ化して出版できました。Amazonでの信頼が高まり、本業への問い合わせが急増しています。
              </p>
              <p className="text-xs font-bold text-gray-500 text-right">— お仕事コンサルタント M様</p>
            </div>
            {/* User 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 relative mt-6">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">💆‍♀️</div>
              <div className="text-xl text-center mt-4 mb-4" style={{ color: '#facc15' }}>★★★★★</div>
              <h3 className="font-bold text-base mb-3 text-center" style={{ color: '#5d4037' }}>「初めての出版で1位に」</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                文章を書くのが苦手でしたが、AIのインタビューに答えるだけで本が完成しました。出版後、雑誌からの取材依頼や、新しいお客様とのご縁がたくさん舞い込みました。
              </p>
              <p className="text-xs font-bold text-gray-500 text-right">— セラピスト Y様</p>
            </div>
            {/* User 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 relative mt-6">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">📖</div>
              <div className="text-xl text-center mt-4 mb-4" style={{ color: '#facc15' }}>★★★★★</div>
              <h3 className="font-bold text-base mb-3 text-center" style={{ color: '#5d4037' }}>「レビュー1,200件超え」</h3>
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                投稿サイトでは全く読まれなかった私の物語が、セミナーで教わった作戦に沿ってKindleで出版した途端、本当にたくさんの読者さんに届くようになりました。
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
              あなたにぴったりの<br />「出版スタイル」プチ診断✨
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
                  <p className="text-sm font-bold mb-2" style={{ color: '#f97316' }}>セミナーでおすすめの注目ポイント:</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{quizResult.kdl}</p>
                </div>

                <a
                  href="#schedule"
                  className="inline-block px-10 py-4 font-bold transition shadow-md rounded-full transform hover:-translate-y-1"
                  style={{ backgroundColor: '#f97316', color: 'white' }}
                >
                  無料セミナーで詳しく聞く
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Schedule & CTA */}
      <section id="schedule" className="py-24 relative overflow-hidden border-t border-orange-100" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border-4 shadow-lg" style={{ borderColor: '#ffedd5' }}>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>
                無料オンラインセミナー<br />開催スケジュール
              </h2>
              <p className="text-gray-600 text-sm">
                各日程、定員になり次第しめきらせていただきます。<br />※ 全てオンライン（Zoom）開催・約2.5時間を予定しています。
              </p>
            </div>

            <div className="rounded-2xl p-4 md:p-6 mb-10 h-64 overflow-y-auto border border-orange-100" style={{ backgroundColor: '#fffbf0' }}>
              <ul className="space-y-3 text-center text-base md:text-lg font-medium" style={{ color: '#5d4037' }}>
                <li className="p-3 bg-gray-100 text-gray-400 rounded-xl cursor-default flex justify-center items-center gap-2">
                  2026年 2月15日 (日) 19:00〜 <span className="bg-gray-300 text-white text-xs px-2 py-1 rounded">満席</span>
                </li>
                <li className="p-3 bg-white hover:bg-orange-50 border border-orange-100 rounded-xl transition cursor-default">
                  2026年 2月18日 (水) 19:00〜
                </li>
                <li className="p-3 bg-white hover:bg-orange-50 border border-orange-100 rounded-xl transition cursor-default">
                  2026年 2月22日 (日) 10:00〜
                </li>
                <li className="p-3 bg-white hover:bg-orange-50 border border-orange-100 rounded-xl transition cursor-default">
                  2026年 2月25日 (水) 19:00〜
                </li>
                <li className="p-3 bg-white hover:bg-orange-50 border border-orange-100 rounded-xl transition cursor-default">
                  2026年 3月01日 (日) 19:00〜
                </li>
                <li className="p-3 bg-white hover:bg-orange-50 border border-orange-100 rounded-xl transition cursor-default">
                  2026年 3月05日 (木) 19:00〜
                </li>
                <li className="p-3 bg-white hover:bg-orange-50 border border-orange-100 rounded-xl transition cursor-default">
                  2026年 3月14日 (土) 14:00〜
                </li>
              </ul>
            </div>

            <div className="text-center">
              <p className="font-bold mb-4 text-lg" style={{ color: '#f97316' }}>通常 5,000円 → 今だけ 完全無料🎁</p>
              <a
                href="#"
                className="inline-block w-full font-bold text-xl py-5 rounded-2xl transition-all shadow-md transform hover:-translate-y-1"
                style={{ backgroundColor: '#f97316', color: 'white' }}
              >
                ご希望の日程を選んで予約する
              </a>
              <p className="text-xs text-gray-500 mt-4">※ 同業者の方のご参加はご遠慮いただいております。</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: '#5d4037' }}>
            初心者さんの「よくあるご質問」
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

      <Footer 
        setPage={navigateTo}
        onCreate={() => {}}
        user={user}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

