'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  User,
  Building2,
  Store,
  Eye,
  Users,
  TrendingUp,
  Settings,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// Q1の選択肢
const situations = [
  {
    id: 'starting',
    label: 'これから始める',
    sub: '起業準備中・副業を始めたい',
    icon: Rocket,
    color: '#f59e0b',
    bgColor: '#fef3c7',
  },
  {
    id: 'solo',
    label: 'ひとりでやっている',
    sub: 'フリーランス・個人事業主',
    icon: User,
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  {
    id: 'team',
    label: 'チーム・法人で運営',
    sub: '企業・組織・スタートアップ',
    icon: Building2,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
  },
  {
    id: 'shop',
    label: '店舗・教室を持っている',
    sub: 'サロン・スクール・実店舗',
    icon: Store,
    color: '#10b981',
    bgColor: '#d1fae5',
  },
];

// Q2の選択肢
const goals = [
  {
    id: 'awareness',
    label: '認知を広げたい',
    sub: 'まず知ってもらいたい',
    icon: Eye,
    color: '#f59e0b',
  },
  {
    id: 'leads',
    label: '見込み客を集めたい',
    sub: 'リードを増やしたい',
    icon: Users,
    color: '#3b82f6',
  },
  {
    id: 'sales',
    label: '売上を伸ばしたい',
    sub: '成約率・単価を上げたい',
    icon: TrendingUp,
    color: '#10b981',
  },
  {
    id: 'automate',
    label: '業務を仕組み化したい',
    sub: '自動化・効率化',
    icon: Settings,
    color: '#8b5cf6',
  },
];

// Q1×Q2 → ペルソナ振り分けマップ
const routeMap: Record<string, Record<string, string>> = {
  starting: {
    awareness: '/for/starter',
    leads: '/for/starter',
    sales: '/for/creator',
    automate: '/for/creator',
  },
  solo: {
    awareness: '/for/freelance',
    leads: '/for/coach',
    sales: '/for/creator',
    automate: '/for/coach',
  },
  team: {
    awareness: '/for/business',
    leads: '/for/business',
    sales: '/for/business',
    automate: '/for/business',
  },
  shop: {
    awareness: '/for/shop',
    leads: '/for/shop',
    sales: '/for/shop',
    automate: '/for/shop',
  },
};

// 結果表示用メッセージ
const resultMessages: Record<string, { title: string; description: string; color: string }> = {
  '/for/starter': {
    title: 'まずは「自分を知ってもらう仕組み」から',
    description: '起業の第一歩は、あなたの想いを伝えるページと、見込み客との接点づくり。テンプレートを選ぶだけで、今日から始められます。',
    color: '#f59e0b',
  },
  '/for/freelance': {
    title: 'フォロワーを「お客様」に変える仕組み',
    description: 'SNSで発信しているだけでは、売上にはつながりません。あなたの魅力を伝え、自然に予約が入る流れをつくりましょう。',
    color: '#3b82f6',
  },
  '/for/coach': {
    title: '「実力」を正しく伝え、予約が自然に入る',
    description: 'コーチ・コンサルの集客は「信頼」がすべて。あなたの専門性を可視化し、見込み客を育て、予約につなげる仕組みを。',
    color: '#6366f1',
  },
  '/for/creator': {
    title: '見込み客を育て、商品が売れ続ける仕組み',
    description: '良い商品をつくるだけでは売れません。見込み客との関係を育て、「欲しい」と思ったタイミングで届ける流れが必要です。',
    color: '#ec4899',
  },
  '/for/shop': {
    title: 'リピーターが増え、口コミが自然に広がる',
    description: '来店してくれたお客様が「また来たい」「友達にも教えたい」と思う体験をつくることが、最強の集客です。',
    color: '#10b981',
  },
  '/for/business': {
    title: 'マーケティング基盤を一元化する',
    description: '複数のツールを行き来するのはもう終わり。集客から成約まで、チームで使える統合プラットフォームを。',
    color: '#8b5cf6',
  },
};

export default function FlowChartNav() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Q1, 1: Q2, 2: result
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToStep = (nextStep: number) => {
    setAnimateIn(false);
    setTimeout(() => {
      setStep(nextStep);
      setAnimateIn(true);
      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 200);
  };

  const handleSituationSelect = (id: string) => {
    setSelectedSituation(id);
    setTimeout(() => goToStep(1), 300);
  };

  const handleGoalSelect = (id: string) => {
    setSelectedGoal(id);
    if (selectedSituation) {
      const path = routeMap[selectedSituation][id];
      setResultPath(path);
      setTimeout(() => goToStep(2), 300);
    }
  };

  const handleReset = () => {
    setSelectedSituation(null);
    setSelectedGoal(null);
    setResultPath(null);
    goToStep(0);
  };

  const result = resultPath ? resultMessages[resultPath] : null;

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[0, 1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= s
                  ? 'bg-orange-500 text-white shadow-lg scale-110'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {s === 2 ? <Sparkles size={18} /> : s + 1}
            </div>
            {s < 2 && (
              <div
                className={`w-12 sm:w-20 h-1 rounded-full transition-all duration-500 ${
                  step > s ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* コンテンツ */}
      <div
        className={`transition-all duration-300 ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Q1 */}
        {step === 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-center mb-2" style={{ color: '#5d4037' }}>
              あなたの状況に近いのは？
            </h3>
            <p className="text-center text-gray-500 text-sm mb-8">
              ぴったりの集客の型をご提案します
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {situations.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedSituation === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSituationSelect(item.id)}
                    className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                      isSelected
                        ? 'border-orange-500 shadow-lg -translate-y-1'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    style={{ backgroundColor: isSelected ? item.bgColor : 'white' }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: item.bgColor, color: item.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="font-bold text-lg" style={{ color: '#5d4037' }}>
                      {item.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{item.sub}</div>
                    <ChevronRight
                      size={20}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-orange-500 transition-colors"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Q2 */}
        {step === 1 && (
          <div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-orange-500 transition mb-4 flex items-center gap-1"
            >
              ← 最初からやり直す
            </button>
            <h3 className="text-xl sm:text-2xl font-black text-center mb-2" style={{ color: '#5d4037' }}>
              一番実現したいことは？
            </h3>
            <p className="text-center text-gray-500 text-sm mb-8">
              今もっとも優先したい課題を選んでください
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedGoal === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleGoalSelect(item.id)}
                    className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                      isSelected
                        ? 'border-orange-500 shadow-lg -translate-y-1'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    style={{ backgroundColor: isSelected ? '#fff7ed' : 'white' }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="font-bold text-lg" style={{ color: '#5d4037' }}>
                      {item.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{item.sub}</div>
                    <ChevronRight
                      size={20}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-orange-500 transition-colors"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 結果 */}
        {step === 2 && result && resultPath && (
          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-orange-500 transition mb-6 flex items-center gap-1 mx-auto"
            >
              ← 最初からやり直す
            </button>

            <div
              className="relative rounded-3xl p-8 sm:p-12 border-2 overflow-hidden"
              style={{
                borderColor: result.color,
                background: `linear-gradient(135deg, white 0%, ${result.color}08 100%)`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: result.color }}
              />
              <div
                className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: result.color }}
              />

              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6"
                  style={{ backgroundColor: `${result.color}15`, color: result.color }}
                >
                  <Sparkles size={16} />
                  あなたにおすすめの集客の型
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-black mb-4 leading-tight"
                  style={{ color: '#5d4037' }}
                >
                  {result.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
                  {result.description}
                </p>

                <button
                  onClick={() => router.push(resultPath)}
                  className="inline-flex items-center gap-3 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ backgroundColor: result.color }}
                >
                  詳しく見る
                  <ArrowRight size={20} />
                </button>

                <p className="text-xs text-gray-400 mt-4">
                  ※ 無料で詳しいガイドをご覧いただけます
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
