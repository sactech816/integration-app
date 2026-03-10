'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: 'Q1. あなたの主なビジネス（活動）は？',
    options: [
      { text: 'これから起業・副業を始める', type: 'startup' },
      { text: 'コーチ・コンサル・1対1サービス', type: 'coach' },
      { text: 'セミナー・講座・イベント開催', type: 'seminar' },
      { text: 'Kindle・教材・デジタル商品の販売', type: 'content' },
      { text: 'EC・物販（楽天・Amazon等）', type: 'ec' },
      { text: 'SNS発信・インフルエンサー', type: 'sns' },
    ],
  },
  {
    id: 2,
    question: 'Q2. 今、一番解決したい悩みは？',
    options: [
      { text: '何から始めればいいかわからない', type: 'startup' },
      { text: '予約調整やメール対応が面倒...', type: 'coach' },
      { text: 'イベントの集客・運営を効率化したい', type: 'seminar' },
      { text: '売れる商品ページを作りたい', type: 'content' },
      { text: '売れ筋商品・キーワードを調べたい', type: 'ec' },
      { text: 'フォロワーを増やして収益化したい', type: 'sns' },
    ],
  },
  {
    id: 3,
    question: 'Q3. SNSは活用していますか？',
    options: [
      { text: 'これから始めたい', type: 'startup' },
      { text: 'たまに投稿する程度', type: 'coach' },
      { text: 'イベント告知によく使う', type: 'seminar' },
      { text: '商品紹介に活用している', type: 'content' },
      { text: '広告・販促で使っている', type: 'ec' },
      { text: '毎日発信している', type: 'sns' },
    ],
  },
  {
    id: 4,
    question: 'Q4. パソコン操作は得意ですか？',
    options: [
      { text: '苦手。スマホで完結したい', type: 'startup' },
      { text: '普通。文字入力くらいなら', type: 'coach' },
      { text: '得意。こだわりたい', type: 'ec' },
      { text: '画像加工なら得意', type: 'sns' },
    ],
  },
];

type ResultType = {
  title: string;
  desc: string;
  tools: { name: string; href: string }[];
};

const results: Record<string, ResultType> = {
  startup: {
    title: 'プロフィール ＋ 診断クイズ ＋ ガイドメーカー',
    desc: 'まずは自分を知ってもらうプロフィールページと、見込み客の興味を引く診断クイズから。ガイドメーカーで「はじめかた」を案内すれば、信頼感もアップします。',
    tools: [
      { name: 'プロフィールメーカー', href: '/profile' },
      { name: '診断クイズメーカー', href: '/quiz' },
      { name: 'ガイドメーカー', href: '/onboarding' },
    ],
  },
  coach: {
    title: 'プロフィール ＋ 予約メーカー ＋ セールスライター',
    desc: '実績をアピールするプロフィールに予約機能を連携。AIセールスライターでサービス紹介文も自動生成。日程調整の手間をゼロにして本業に集中しましょう。',
    tools: [
      { name: 'プロフィールメーカー', href: '/profile' },
      { name: '予約メーカー', href: '/booking' },
      { name: 'セールスライター', href: '/salesletter' },
    ],
  },
  seminar: {
    title: 'ウェビナーLP ＋ 予約メーカー ＋ アンケートメーカー',
    desc: 'セミナー告知LPで参加者を募り、予約機能で申し込みを自動受付。終了後はアンケートでフィードバックを収集。集客から運営まで一気通貫で効率化できます。',
    tools: [
      { name: 'ウェビナーLPメーカー', href: '/webinar' },
      { name: '予約メーカー', href: '/booking' },
      { name: 'アンケートメーカー', href: '/survey' },
    ],
  },
  content: {
    title: 'LPメーカー ＋ セールスライター ＋ ファネルメーカー',
    desc: '商品紹介LPをテンプレートで即作成し、AIが売れる文章を生成。ファネルで集客から販売までを自動化すれば、コンテンツ制作に集中できます。',
    tools: [
      { name: 'LPメーカー', href: '/business' },
      { name: 'セールスライター', href: '/salesletter' },
      { name: 'ファネルメーカー', href: '/funnel' },
    ],
  },
  ec: {
    title: '楽天リサーチ ＋ LPメーカー ＋ メルマガメーカー',
    desc: 'まずはリサーチで売れ筋商品・キーワードを把握。商品紹介LPで訴求力を高め、メルマガでリピート購入を促進。データドリブンな販売戦略を実現します。',
    tools: [
      { name: '楽天リサーチ', href: '/rakuten-research' },
      { name: 'LPメーカー', href: '/business' },
      { name: 'メルマガメーカー', href: '/newsletter' },
    ],
  },
  sns: {
    title: 'エンタメ診断 ＋ プロフィール ＋ ゲーミフィケーション',
    desc: 'バズる診断コンテンツでフォロワーを増やし、プロフィールページで「あなたは何者？」をしっかり伝える。ガチャや福引きでエンゲージメントをさらにアップ。',
    tools: [
      { name: 'エンタメ診断メーカー', href: '/entertainment' },
      { name: 'プロフィールメーカー', href: '/profile' },
      { name: 'ゲーミフィケーション', href: '/gamification' },
    ],
  },
};

export default function DiagnosisSection() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    startup: 0,
    coach: 0,
    seminar: 0,
    content: 0,
    ec: 0,
    sns: 0,
  });
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (type: string) => {
    setScores((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScores({ startup: 0, coach: 0, seminar: 0, content: 0, ec: 0, sns: 0 });
    setShowResult(false);
  };

  const getWinnerType = (): string => {
    const entries = Object.entries(scores);
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const winnerResult = showResult ? results[getWinnerType()] : null;

  return (
    <div
      className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden min-h-[450px] flex flex-col relative border-4"
      style={{ borderColor: '#ffedd5' }}
    >
      <div className="w-full h-2" style={{ backgroundColor: '#ffedd5' }}>
        <div
          className="h-2 transition-all duration-300"
          style={{
            backgroundColor: '#f97316',
            width: `${((showResult ? questions.length : currentQuestion) / questions.length) * 100}%`,
          }}
        ></div>
      </div>

      {!showResult ? (
        <div
          className="p-8 md:p-12 flex-grow flex flex-col justify-center animate-fade-in"
          key={currentQuestion}
        >
          <h3
            className="text-xl md:text-2xl font-bold mb-8 text-center"
            style={{ color: '#5d4037' }}
          >
            {questions[currentQuestion].question}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.type)}
                className="border-2 border-orange-100 p-4 rounded-2xl text-left font-bold hover:-translate-y-1 transition-all flex items-center gap-3 bg-white shadow-sm"
                style={{ color: '#5d4037' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: '#fed7aa', color: '#f97316' }}
                >
                  {idx + 1}
                </div>
                <span className="text-sm">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 md:p-12 flex flex-col items-center text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
            style={{ backgroundColor: '#ffedd5', color: '#f97316' }}
          >
            <Sparkles size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-500 mb-1">
            あなたにおすすめの構成は...
          </h3>
          <div
            className="text-2xl md:text-3xl font-black mb-6"
            style={{ color: '#f97316' }}
          >
            {winnerResult?.title}
          </div>
          <div
            className="p-6 rounded-2xl border mb-6 w-full text-left"
            style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}
          >
            <h4
              className="font-bold mb-2 border-b pb-2"
              style={{ color: '#5d4037', borderColor: '#ffedd5' }}
            >
              なぜこれがおすすめ？
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {winnerResult?.desc}
            </p>
          </div>

          {/* ツール別リンク */}
          <div className="w-full space-y-3 mb-8">
            {winnerResult?.tools.map((tool, idx) => (
              <a
                key={idx}
                href={tool.href}
                className="flex items-center justify-between bg-white border-2 border-orange-100 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <span className="font-bold text-sm" style={{ color: '#5d4037' }}>
                  {tool.name}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all" style={{ color: '#f97316' }}>
                  詳しく見る <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>

          <button
            onClick={resetQuiz}
            className="text-sm underline text-gray-400 hover:text-gray-600"
          >
            もう一度診断する
          </button>
        </div>
      )}
    </div>
  );
}
