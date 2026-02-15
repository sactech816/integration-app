'use client';

import React, { useState } from 'react';
import {
  Clock, Star, Rocket, Sparkles, ArrowLeft, ArrowRight, Check, Loader2, ChevronRight, Search, Lightbulb, User, Pencil, Info
} from 'lucide-react';
import {
  DiagnosisAnswers, ThemeSuggestion, DiagnosisAnalysis, Big5Scores,
  TIPI_QUESTIONS, calculateBig5,
  MOCK_THEME_SUGGESTIONS, MOCK_DIAGNOSIS_ANALYSIS, MOCK_BIG5_SCORES, MOCK_ADDITIONAL_THEMES,
  demoDelay
} from './types';
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

// プログレスバー用のステップ定義（Big5 + テキスト3ステップ）
const PROGRESS_STEPS = [
  { title: '性格診断', icon: User },
  ...DIAGNOSIS_STEPS.map(s => ({ title: s.title, icon: s.icon })),
];

export const Step0Discovery: React.FC<Step0DiscoveryProps> = ({
  onComplete,
  onCancel,
  isDemo = false,
}) => {
  const [diagnosisStep, setDiagnosisStep] = useState(0);

  // Big5 性格診断
  const [tipiAnswers, setTipiAnswers] = useState<number[]>(new Array(10).fill(0));
  const [big5Scores, setBig5Scores] = useState<Big5Scores | null>(null);

  // テキスト質問
  const [answers, setAnswers] = useState<DiagnosisAnswers>({
    pastInvestment: '',
    immersion: '',
    strengths: '',
    expertise: '',
    futureChallenges: '',
    lifeMessage: '',
  });

  // 結果
  const [themeSuggestions, setThemeSuggestions] = useState<ThemeSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<DiagnosisAnalysis | null>(null);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);
  const [selectedThemeText, setSelectedThemeText] = useState('');
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  // 追加テーマ
  const [hasRequestedMore, setHasRequestedMore] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  // ステップ計算
  const BIG5_STEP = 0;
  const TEXT_STEP_OFFSET = 1;
  const totalQuestionSteps = DIAGNOSIS_STEPS.length + 1; // Big5 + 3テキスト = 4
  const isResultStep = diagnosisStep === totalQuestionSteps;
  const isBig5Step = diagnosisStep === BIG5_STEP;
  const isTextStep = diagnosisStep >= TEXT_STEP_OFFSET && diagnosisStep < totalQuestionSteps;
  const textStepIndex = diagnosisStep - TEXT_STEP_OFFSET;
  const currentStepData = isTextStep ? DIAGNOSIS_STEPS[textStepIndex] : null;

  const canProceedFromCurrentStep = () => {
    if (isResultStep) return selectedThemeIndex !== null && selectedThemeText.trim() !== '';
    if (isBig5Step) return tipiAnswers.every(a => a > 0);
    if (isTextStep) {
      const step = DIAGNOSIS_STEPS[textStepIndex];
      return step.questions.some(q => answers[q.key].trim() !== '');
    }
    return false;
  };

  const handleAnswerChange = (key: keyof DiagnosisAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleTipiAnswer = (questionIndex: number, value: number) => {
    setTipiAnswers(prev => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const handleGenerateThemes = async () => {
    setIsGenerating(true);
    setError('');
    setLoadingMessage('あなたの回答を読み取っています...');

    const messages = [
      { delay: 2000, text: '性格特性を分析中...' },
      { delay: 4000, text: 'あなたの著者タイプを診断中...' },
      { delay: 6000, text: 'SWOT分析を生成中...' },
      { delay: 8000, text: '最適なテーマを探しています...' },
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
        body: JSON.stringify({ answers, big5Scores }),
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

  const handleGenerateMoreThemes = async () => {
    setIsGeneratingMore(true);
    setError('');

    try {
      if (isDemo) {
        await demoDelay(1500);
        setThemeSuggestions(prev => [...prev, ...MOCK_ADDITIONAL_THEMES]);
        setHasRequestedMore(true);
        return;
      }

      const response = await fetch('/api/kdl/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          big5Scores,
          existingThemes: themeSuggestions.map(t => t.theme),
          count: 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '追加テーマ生成に失敗しました');
      }

      const data = await response.json();
      setThemeSuggestions(prev => [...prev, ...data.themes]);
      setHasRequestedMore(true);
    } catch (err: any) {
      setError(err.message || '追加テーマ生成中にエラーが発生しました');
      setHasRequestedMore(true); // エラー時も再試行不可
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleNext = async () => {
    if (isBig5Step) {
      const scores = calculateBig5(tipiAnswers);
      setBig5Scores(scores);
      setDiagnosisStep(1);
    } else if (diagnosisStep < totalQuestionSteps - 1) {
      setDiagnosisStep(diagnosisStep + 1);
    } else if (diagnosisStep === totalQuestionSteps - 1) {
      setDiagnosisStep(totalQuestionSteps);
      await handleGenerateThemes();
    }
  };

  const handleBack = () => {
    if (diagnosisStep > 0) {
      if (isResultStep) {
        setThemeSuggestions([]);
        setAnalysis(null);
        setSelectedThemeIndex(null);
        setSelectedThemeText('');
        setIsEditingTheme(false);
        setError('');
        setHasRequestedMore(false);
      }
      setDiagnosisStep(diagnosisStep - 1);
    } else {
      onCancel();
    }
  };

  const handleSelectTheme = () => {
    if (selectedThemeText.trim()) {
      onComplete(selectedThemeText);
    }
  };

  const handleThemeCardClick = (index: number, theme: string) => {
    setSelectedThemeIndex(index);
    setSelectedThemeText(theme);
    setIsEditingTheme(false);
  };

  return (
    <div className="space-y-6">
      {/* ミニプログレスバー */}
      <div className="flex items-center justify-center gap-0">
        {PROGRESS_STEPS.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                index === diagnosisStep && !isResultStep
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110'
                  : index < diagnosisStep || isResultStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
              }`}>
                {index < diagnosisStep || isResultStep ? (
                  <Check size={16} />
                ) : (
                  <step.icon size={16} />
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block max-w-[70px] text-center leading-tight ${
                index === diagnosisStep && !isResultStep ? 'text-amber-600' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
            {index < PROGRESS_STEPS.length - 1 && (
              <div className={`w-6 sm:w-10 h-1 mx-0.5 rounded-full transition-all mt-[-20px] sm:mt-[-28px] ${
                index < diagnosisStep || isResultStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
        {/* 結果ステップのインジケーター */}
        <div className={`w-6 sm:w-10 h-1 mx-0.5 rounded-full transition-all mt-[-20px] sm:mt-[-28px] ${
          isResultStep ? 'bg-green-500' : 'bg-gray-200'
        }`} />
        <div className="flex flex-col items-center gap-1.5">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
            isResultStep
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-110'
              : 'bg-gray-200 text-gray-400'
          }`}>
            <Sparkles size={16} />
          </div>
          <span className={`text-xs font-medium hidden sm:block max-w-[70px] text-center leading-tight ${
            isResultStep ? 'text-amber-600' : 'text-gray-400'
          }`}>
            テーマ提案
          </span>
        </div>
      </div>

      {/* Big5 性格診断ステップ */}
      {isBig5Step && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <User className="text-amber-500" size={24} />
              あなたの性格タイプ診断
            </h2>
            <p className="text-gray-600 text-sm">
              以下の10の質問に直感で答えてください。あなたの性格特性を科学的に分析します。
            </p>
          </div>

          {/* アドバイスボックス */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <div className="bg-blue-100 p-1.5 rounded-lg h-fit flex-shrink-0">
              <Lightbulb className="text-blue-600" size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">回答のコツ</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                深く考えず、直感的に「自分はこういう人間だ」と思う程度を選んでください。正解も不正解もありません。
              </p>
            </div>
          </div>

          {/* スケール凡例 */}
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>1: 全く違う</span>
            <span>4: どちらでもない</span>
            <span>7: 強くそう思う</span>
          </div>

          {/* 10問 */}
          <div className="space-y-5">
            {TIPI_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {idx + 1}. 自分は「{q.text}」
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleTipiAnswer(idx, val)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                        tipiAnswers[idx] === val
                          ? 'bg-amber-500 text-white scale-110 shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 進捗表示 */}
          <div className="text-center">
            <span className="text-sm text-gray-400">
              {tipiAnswers.filter(a => a > 0).length} / 10 問回答済み
            </span>
          </div>
        </div>
      )}

      {/* テキスト質問ステップ */}
      {isTextStep && currentStepData && (
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

          {error && !isGeneratingMore && (
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
                  あなたの性格特性と回答をAIが総合的に分析しました。
                </p>
              </div>
              <DiagnosisAnalysisSection analysis={analysis} big5Scores={big5Scores} />
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

              {/* テーマは後で変更可能の注記 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-700">
                  テーマは次のステップでも自由に編集できます。まずは気になるテーマを選んでみましょう。
                </p>
              </div>

              {themeSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleThemeCardClick(index, suggestion.theme)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    selectedThemeIndex === index
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

                      {/* テーマ編集 */}
                      {selectedThemeIndex === index && isEditingTheme ? (
                        <div onClick={(e) => e.stopPropagation()} className="mb-2">
                          <textarea
                            value={selectedThemeText}
                            onChange={(e) => setSelectedThemeText(e.target.value)}
                            className="w-full border-2 border-amber-300 rounded-lg p-2 text-sm font-bold text-gray-900 focus:border-amber-500 outline-none resize-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setIsEditingTheme(false); }}
                              className="text-xs bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-colors"
                            >
                              確定
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedThemeText(suggestion.theme);
                                setIsEditingTheme(false);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              元に戻す
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {selectedThemeIndex === index ? selectedThemeText : suggestion.theme}
                          </h4>
                          {selectedThemeIndex === index && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingTheme(true);
                              }}
                              className="text-amber-600 hover:text-amber-700 p-1 flex-shrink-0"
                              title="テーマを編集"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                        </div>
                      )}

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
                    {selectedThemeIndex === index && !isEditingTheme && (
                      <div className="bg-amber-500 text-white p-1 rounded-full flex-shrink-0">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* さらに5つ提案ボタン */}
              {!hasRequestedMore && (
                <button
                  onClick={handleGenerateMoreThemes}
                  disabled={isGeneratingMore}
                  className="w-full border-2 border-dashed border-amber-300 rounded-xl p-4 text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {isGeneratingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      追加テーマを生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      さらに5つのテーマを提案してもらう
                    </>
                  )}
                </button>
              )}

              {/* 追加テーマ生成時のエラー */}
              {error && isGeneratingMore && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              )}
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
            disabled={selectedThemeIndex === null || !selectedThemeText.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              selectedThemeIndex !== null && selectedThemeText.trim()
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
