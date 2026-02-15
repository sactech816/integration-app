'use client';

import React, { useState } from 'react';
import {
  Clock, Star, Rocket, Sparkles, ArrowLeft, ArrowRight, Check, Loader2, ChevronRight, Search, Lightbulb
} from 'lucide-react';
import { DiagnosisAnswers, ThemeSuggestion, DiagnosisAnalysis, MOCK_THEME_SUGGESTIONS, MOCK_DIAGNOSIS_ANALYSIS, demoDelay } from './types';
import { DiagnosisAnalysisSection } from './DiagnosisAnalysisSection';

interface Step0DiscoveryProps {
  onComplete: (theme: string) => void;
  onCancel: () => void;
  isDemo?: boolean;
}

interface ExampleCard {
  label: string;
  icon: string;
  values: Partial<Record<keyof DiagnosisAnswers, string>>;
}

const DIAGNOSIS_STEPS = [
  {
    title: '過去の自分を振り返る',
    description: 'これまでの人生で情熱を注いできたことを思い出しましょう。',
    icon: Clock,
    advice: '「好きなこと」「長く続けてきたこと」にはあなただけの視点が隠れています。仕事でなくてもOK！趣味や日常の行動も立派なネタの種です。',
    questions: [
      {
        key: 'pastInvestment' as const,
        label: '一番、時間やお金を使ってきたことは何ですか？',
        placeholder: '例: 料理、読書、プログラミング、旅行、ゲーム、子育て...',
        hint: '趣味、習い事、仕事など、ジャンルを問わず思いつくものを書いてください。',
      },
      {
        key: 'immersion' as const,
        label: '時間を忘れるほど没頭してしまうこと、ついやってしまうことは？',
        placeholder: '例: ネットで調べもの、DIY、筋トレ、SNSでの情報発信...',
        hint: '「気づいたら何時間も経っていた」という体験を思い出してください。',
      },
    ],
    examples: [
      {
        label: '会社員',
        icon: '💼',
        values: {
          pastInvestment: '営業のスキルアップに10年以上投資。セミナー参加、ビジネス書を年50冊。',
          immersion: '顧客の課題を分析して提案資料を作ること。休日も気になる業界ニュースを追いかけてしまう。',
        },
      },
      {
        label: '主婦・主夫',
        icon: '🏠',
        values: {
          pastInvestment: '子育てと料理に15年。離乳食から受験対策まで。節約レシピの研究にもハマった。',
          immersion: 'レシピの開発と写真撮影。SNSに料理写真を載せること。100均グッズで収納を工夫すること。',
        },
      },
      {
        label: 'フリーランス',
        icon: '💻',
        values: {
          pastInvestment: 'Webデザインとプログラミングの独学に5年。Udemyやオンライン教材に相当課金。',
          immersion: '新しいツールやフレームワークを試すこと。ポートフォリオサイトの改善を永遠にやってしまう。',
        },
      },
    ] as ExampleCard[],
  },
  {
    title: 'あなたの強み・特技',
    description: 'あなただからこそ書ける内容を見つけましょう。',
    icon: Star,
    advice: '自分では「普通」と思っていることが、実は他の人にとっては貴重な知識だったりします。友人や同僚に「あなたの強みは？」と聞いてみるのも手です。',
    questions: [
      {
        key: 'strengths' as const,
        label: '自分が得意としていること、人に褒められることは？',
        placeholder: '例: 文章を書くこと、人に教えること、整理整頓、分析...',
        hint: '「すごいね」「上手だね」と言われた経験から探してみましょう。',
      },
      {
        key: 'expertise' as const,
        label: 'あなたは詳しいが、一般の人には理解しにくい専門知識やスキルはありますか？',
        placeholder: '例: 確定申告の知識、Webデザイン、心理学、栄養学...',
        hint: '仕事や趣味で身につけた、人に説明すると「へぇ〜」と言われる知識です。',
      },
    ],
    examples: [
      {
        label: '営業職',
        icon: '🤝',
        values: {
          strengths: '初対面の人と打ち解けること。相手の悩みを引き出すヒアリング力。',
          expertise: 'BtoBの提案営業ノウハウ。決裁者を動かすプレゼン構成の作り方。',
        },
      },
      {
        label: '子育て経験者',
        icon: '👶',
        values: {
          strengths: '子どもの気持ちを汲み取ること。限られた時間で効率よく家事をこなす段取り力。',
          expertise: '発達障害の子どもへの接し方。自治体の子育て支援制度を使い倒す方法。',
        },
      },
      {
        label: '趣味人',
        icon: '🎯',
        values: {
          strengths: '写真撮影とレタッチ。SNSでフォロワーを増やすコツ。',
          expertise: 'カメラの設定や構図の理論。RAW現像の技術。安い機材でプロっぽく撮る方法。',
        },
      },
    ] as ExampleCard[],
  },
  {
    title: '未来への挑戦',
    description: 'これからやりたいこと・伝えたいことを考えましょう。',
    icon: Rocket,
    advice: '挑戦の「過程」を本にする方法もあります（プロセスエコノミー）。完璧な結果がなくても「ゼロから始めるリアルな記録」に共感する読者は多いです。',
    questions: [
      {
        key: 'futureChallenges' as const,
        label: 'これから挑戦したいこと、学びたいことは？',
        placeholder: '例: 海外移住、起業、新しい言語の習得、健康的な生活...',
        hint: '今はまだ経験がなくてもOK。挑戦の過程そのものがコンテンツになります。',
      },
      {
        key: 'lifeMessage' as const,
        label: '人生で成し遂げたいこと、世の中に伝えたいメッセージは？',
        placeholder: '例: もっと自由な働き方を広めたい、子育ての悩みを減らしたい...',
        hint: 'あなたの経験から誰かの役に立てること、共感を呼べることを考えてみましょう。',
      },
    ],
    examples: [
      {
        label: '副業・独立志望',
        icon: '🚀',
        values: {
          futureChallenges: '副業で月10万円を達成したい。ゆくゆくはフリーランスとして独立したい。',
          lifeMessage: '会社員でも自分の力で稼げるようになれば、人生の選択肢が広がるということを伝えたい。',
        },
      },
      {
        label: '健康・ライフスタイル',
        icon: '🌿',
        values: {
          futureChallenges: '40代からの体力づくり。ストレスを溜めない生活習慣を確立したい。',
          lifeMessage: '健康は最大の資産。無理なく続けられる方法を広めたい。',
        },
      },
      {
        label: '学び直し',
        icon: '📚',
        values: {
          futureChallenges: 'プログラミングを学んでキャリアチェンジしたい。英語を使える仕事がしたい。',
          lifeMessage: '何歳からでも学び直しはできる。遅すぎるなんてことはないと伝えたい。',
        },
      },
    ] as ExampleCard[],
  },
];

export const Step0Discovery: React.FC<Step0DiscoveryProps> = ({
  onComplete,
  onCancel,
  isDemo = false,
}) => {
  const [diagnosisStep, setDiagnosisStep] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>({
    pastInvestment: '',
    immersion: '',
    strengths: '',
    expertise: '',
    futureChallenges: '',
    lifeMessage: '',
  });
  const [themeSuggestions, setThemeSuggestions] = useState<ThemeSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<DiagnosisAnalysis | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  const totalQuestionSteps = DIAGNOSIS_STEPS.length;
  const isResultStep = diagnosisStep === totalQuestionSteps;

  const currentStepData = !isResultStep ? DIAGNOSIS_STEPS[diagnosisStep] : null;

  const canProceedFromCurrentStep = () => {
    if (isResultStep) return selectedTheme !== '';
    const step = DIAGNOSIS_STEPS[diagnosisStep];
    return step.questions.some(q => answers[q.key].trim() !== '');
  };

  const handleAnswerChange = (key: keyof DiagnosisAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateThemes = async () => {
    setIsGenerating(true);
    setError('');
    setLoadingMessage('あなたの回答を読み取っています...');

    // ローディングメッセージを段階的に変更
    const messages = [
      { delay: 2000, text: 'あなたの著者タイプを診断中...' },
      { delay: 4000, text: 'SWOT分析を生成中...' },
      { delay: 6000, text: '最適なテーマを探しています...' },
    ];
    const timers = messages.map(m =>
      setTimeout(() => setLoadingMessage(m.text), m.delay)
    );

    try {
      if (isDemo) {
        await demoDelay(2000);
        setAnalysis(MOCK_DIAGNOSIS_ANALYSIS);
        setThemeSuggestions(MOCK_THEME_SUGGESTIONS);
        return;
      }

      const response = await fetch('/api/kdl/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テーマ生成に失敗しました');
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
      setThemeSuggestions(data.themes);
    } catch (err: any) {
      setError(err.message || 'テーマ生成中にエラーが発生しました');
    } finally {
      timers.forEach(clearTimeout);
      setIsGenerating(false);
    }
  };

  const handleNext = async () => {
    if (diagnosisStep < totalQuestionSteps - 1) {
      setDiagnosisStep(diagnosisStep + 1);
    } else if (diagnosisStep === totalQuestionSteps - 1) {
      // 最後の質問ステップ → 結果ステップへ
      setDiagnosisStep(totalQuestionSteps);
      await handleGenerateThemes();
    }
  };

  const handleBack = () => {
    if (diagnosisStep > 0) {
      setDiagnosisStep(diagnosisStep - 1);
      if (isResultStep) {
        setThemeSuggestions([]);
        setAnalysis(null);
        setSelectedTheme('');
        setError('');
      }
    } else {
      onCancel();
    }
  };

  const handleSelectTheme = () => {
    if (selectedTheme) {
      onComplete(selectedTheme);
    }
  };

  return (
    <div className="space-y-6">
      {/* ミニプログレスバー */}
      <div className="flex items-center justify-center gap-0">
        {DIAGNOSIS_STEPS.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                index === diagnosisStep && !isResultStep
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110'
                  : index < diagnosisStep || isResultStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
              }`}>
                {index < diagnosisStep || isResultStep ? (
                  <Check size={18} />
                ) : (
                  <step.icon size={18} />
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block max-w-[80px] text-center leading-tight ${
                index === diagnosisStep && !isResultStep ? 'text-amber-600' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
            {index < DIAGNOSIS_STEPS.length - 1 && (
              <div className={`w-8 sm:w-12 h-1 mx-1 rounded-full transition-all mt-[-20px] sm:mt-[-28px] ${
                index < diagnosisStep || isResultStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
        {/* 結果ステップのインジケーター */}
        <div className={`w-8 sm:w-12 h-1 mx-1 rounded-full transition-all mt-[-20px] sm:mt-[-28px] ${
          isResultStep ? 'bg-green-500' : 'bg-gray-200'
        }`} />
        <div className="flex flex-col items-center gap-1.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isResultStep
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110'
              : 'bg-gray-200 text-gray-400'
          }`}>
            <Sparkles size={18} />
          </div>
          <span className={`text-xs font-medium hidden sm:block max-w-[80px] text-center leading-tight ${
            isResultStep ? 'text-amber-600' : 'text-gray-400'
          }`}>
            テーマ提案
          </span>
        </div>
      </div>

      {/* 質問ステップ */}
      {!isResultStep && currentStepData && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <currentStepData.icon className="text-amber-500" size={24} />
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 text-sm">{currentStepData.description}</p>
          </div>

          {/* アドバイスボックス */}
          {currentStepData.advice && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <div className="bg-amber-100 p-1.5 rounded-lg h-fit flex-shrink-0">
                <Lightbulb className="text-amber-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 mb-1">考え方のヒント</p>
                <p className="text-sm text-amber-700 leading-relaxed">{currentStepData.advice}</p>
              </div>
            </div>
          )}

          {currentStepData.questions.map((question) => (
            <div key={question.key} className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                {question.label}
              </label>
              {question.hint && (
                <p className="text-xs text-gray-500">{question.hint}</p>
              )}
              <textarea
                value={answers[question.key]}
                onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                placeholder={question.placeholder}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
                rows={3}
              />
            </div>
          ))}

          {/* 入力例カード */}
          {currentStepData.examples && currentStepData.examples.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Lightbulb size={12} />
                入力例（クリックで入力できます）
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentStepData.examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      // 各質問のvalueをanswersにセット
                      const newAnswers = { ...answers };
                      for (const [key, value] of Object.entries(example.values)) {
                        newAnswers[key as keyof DiagnosisAnswers] = value as string;
                      }
                      setAnswers(newAnswers);
                    }}
                    className="text-left border-2 border-gray-200 rounded-xl p-3 hover:border-amber-300 hover:bg-amber-25 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{example.icon}</span>
                      <span className="font-bold text-sm text-gray-900">{example.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {Object.values(example.values)[0]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 結果ステップ */}
      {isResultStep && (
        <div className="space-y-6 animate-fade-in">
          {/* ローディング */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <Loader2 className="animate-spin text-amber-500" size={40} />
                <Sparkles className="absolute -top-1 -right-1 text-orange-400 animate-pulse" size={16} />
              </div>
              <p className="text-gray-600 font-medium">{loadingMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={handleGenerateThemes}
                className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium underline"
              >
                再試行する
              </button>
            </div>
          )}

          {/* 分析セクション */}
          {!isGenerating && analysis && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Search className="text-amber-500" size={24} />
                  あなたの著者診断結果
                </h2>
                <p className="text-gray-600 text-sm">
                  あなたの回答をAIが分析しました。
                </p>
              </div>
              <DiagnosisAnalysisSection analysis={analysis} />
              <div className="border-t-2 border-amber-200 my-2" />
            </>
          )}

          {/* テーマ提案 */}
          {!isGenerating && themeSuggestions.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={24} />
                  AIがあなたにぴったりのテーマを提案します
                </h2>
                <p className="text-gray-600 text-sm">
                  気になるテーマを1つ選んでください。
                </p>
              </div>
              {themeSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTheme(suggestion.theme)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    selectedTheme === suggestion.theme
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          テーマ案 {index + 1}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{suggestion.theme}</h4>
                      <div className="space-y-1.5">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700">想定読者: </span>
                          {suggestion.targetReader}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">おすすめの理由: </span>
                          {suggestion.reason}
                        </p>
                      </div>
                    </div>
                    {selectedTheme === suggestion.theme && (
                      <div className="bg-amber-500 text-white p-1 rounded-full flex-shrink-0">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ナビゲーション */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft size={18} />
          {diagnosisStep === 0 ? 'Step1に戻る' : '戻る'}
        </button>

        <span className="text-sm text-gray-400">
          {isResultStep ? 'テーマを選択してください' : `質問 ${diagnosisStep + 1} / ${totalQuestionSteps}`}
        </span>

        {isResultStep ? (
          <button
            onClick={handleSelectTheme}
            disabled={!selectedTheme}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              selectedTheme
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            このテーマで始める
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceedFromCurrentStep()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              canProceedFromCurrentStep()
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {diagnosisStep === totalQuestionSteps - 1 ? (
              <>
                <Search size={18} />
                AIにテーマを提案してもらう
              </>
            ) : (
              <>
                次へ
                <ArrowRight size={18} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Step0Discovery;
