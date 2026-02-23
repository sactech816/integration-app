'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: 'Q1. あなたの主なビジネス（活動）は？',
    options: [
      { text: '個人でサービス提供（コーチ、ヨガ等）', type: 'freelance' },
      { text: 'お店を経営している', type: 'shop' },
      { text: 'SNS発信・アフィリエイト', type: 'influencer' },
      { text: 'Webマーケティング・制作', type: 'marketer' },
    ],
  },
  {
    id: 2,
    question: 'Q2. 今、一番解決したい悩みは？',
    options: [
      { text: '予約調整やメール対応が面倒...', type: 'freelance' },
      { text: '集客したい・ファンを増やしたい！', type: 'influencer' },
      { text: 'リピーターを増やしたい', type: 'shop' },
      { text: 'LPを素早く作りたい・検証したい', type: 'marketer' },
    ],
  },
  {
    id: 3,
    question: 'Q3. パソコン操作は得意ですか？',
    options: [
      { text: '苦手。スマホで完結したい', type: 'shop' },
      { text: '普通。文字入力くらいなら', type: 'freelance' },
      { text: '得意。こだわりたい', type: 'marketer' },
      { text: '画像加工なら得意', type: 'influencer' },
    ],
  },
];

const results: Record<string, { title: string; desc: string }> = {
  freelance: {
    title: 'プロフィールメーカー ＋ 予約メーカー ＋ アンケートメーカー',
    desc: '事務作業を自動化したいあなたに最適。名刺代わりのプロフィールページに予約機能をつけ、日程調整の手間をゼロに。アンケートで顧客の声を自動収集しましょう。',
  },
  shop: {
    title: '診断クイズメーカー ＋ ガチャ/スタンプラリー ＋ LPメーカー',
    desc: 'お店の集客には「エンタメ」が効きます。診断クイズやガチャでお客様を楽しませ、スタンプラリーでリピーターを育成。結果画面でクーポンを配布して来店を促しましょう。',
  },
  influencer: {
    title: '診断クイズメーカー ＋ プロフィールメーカー ＋ 福引き/スクラッチ',
    desc: 'フォロワーとの距離を縮める「遊べるプロフィール」がおすすめ。福引きやスクラッチでキャンペーンを盛り上げ、診断結果に合わせておすすめ商品を紹介すると収益化も加速します。',
  },
  marketer: {
    title: 'LPメーカー ＋ セールスライター ＋ 診断クイズメーカー',
    desc: 'スピーディーな検証が必要なあなたには、テンプレートで即作成できるLPとAI文章生成のセールスライターが最適。診断コンテンツをLPに埋め込むのもCVR向上に効果的です。',
  },
};

export default function DiagnosisSection() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    freelance: 0,
    shop: 0,
    influencer: 0,
    marketer: 0,
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
    setScores({ freelance: 0, shop: 0, influencer: 0, marketer: 0 });
    setShowResult(false);
  };

  const getWinnerType = (): string => {
    const entries = Object.entries(scores);
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const handleCreateClick = () => {
    document
      .getElementById('create-section-services')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <div className="grid grid-cols-1 gap-4">
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
                {opt.text}
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
            {results[getWinnerType()].title}
          </div>
          <div
            className="p-6 rounded-2xl border mb-8 w-full text-left"
            style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}
          >
            <h4
              className="font-bold mb-2 border-b pb-2"
              style={{ color: '#5d4037', borderColor: '#ffedd5' }}
            >
              なぜこれがおすすめ？
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {results[getWinnerType()].desc}
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="block w-full md:w-auto text-white font-bold py-4 px-12 rounded-full shadow-lg transition transform hover:-translate-y-1 mb-4"
            style={{ backgroundColor: '#f97316' }}
          >
            このテンプレートで作成する（無料）
          </button>
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
