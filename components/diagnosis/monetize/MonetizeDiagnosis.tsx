'use client';

import React, { useState } from 'react';
import {
  Clock, Star, Rocket, User, Calendar, ArrowLeft, ArrowRight, Sparkles, Loader2
} from 'lucide-react';
import {
  DiagnosisAnswers, Big5Scores, TIPI_QUESTIONS, calculateBig5,
  STEP_QUESTIONS, DIAGNOSIS_STEPS, DiagnosisStep,
  MonetizeDiagnosisResult, MonetizeAnalysis,
  MOCK_ANALYSIS, MOCK_KINDLE_RESULTS, MOCK_COURSE_RESULTS, MOCK_CONSULTING_RESULTS,
  MOCK_SNS_RESULTS, MOCK_DIGITAL_RESULTS,
} from './types';
import { CommonAnalysisSection } from './results/CommonAnalysisSection';
import { MonetizeResultTabs } from './results/MonetizeResultTabs';
import { ShareButtons } from './results/ShareButtons';

interface MonetizeDiagnosisProps {
  userId?: string | null;
}

const STEP_ICONS = [Clock, Star, Rocket, User, Calendar];

const LOADING_MESSAGES = [
  'あなたの回答を読み取っています...',
  '性格特性を分析中...',
  'あなたの才能タイプを診断中...',
  'SWOT分析を生成中...',
  '最適な収益化ルートを探しています...',
  'Kindleテーマを提案中...',
  '講座プランを設計中...',
  'コンサルメニューを考案中...',
];

export const MonetizeDiagnosis: React.FC<MonetizeDiagnosisProps> = ({ userId }) => {
  const [step, setStep] = useState<DiagnosisStep>(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>({
    pastInvestment: '', immersion: '', strengths: '',
    expertise: '', futureChallenges: '', lifeMessage: '',
  });
  const [tipiAnswers, setTipiAnswers] = useState<number[]>(new Array(10).fill(0));
  const [big5Scores, setBig5Scores] = useState<Big5Scores | null>(null);
  const [birthday, setBirthday] = useState<{ year: string; month: string; day: string }>({
    year: '', month: '', day: '',
  });

  const [result, setResult] = useState<MonetizeDiagnosisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  const isTextStep = step >= 0 && step <= 2;
  const isBig5Step = step === 3;
  const isBirthdayStep = step === 4;
  const isResultView = result !== null && !isGenerating;

  const canProceed = () => {
    if (isTextStep) {
      const questions = STEP_QUESTIONS[step as 0 | 1 | 2];
      return questions.some(q => answers[q.id as keyof DiagnosisAnswers].trim() !== '');
    }
    if (isBig5Step) return true; // スキップ可
    if (isBirthdayStep) return true; // スキップ可
    return false;
  };

  const handleAnswerChange = (key: keyof DiagnosisAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleTipiAnswer = (index: number, value: number) => {
    setTipiAnswers(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleNext = () => {
    if (step === 2) {
      setStep(3); // Big5へ
    } else if (step === 3) {
      // Big5完了
      if (tipiAnswers.every(a => a > 0)) {
        setBig5Scores(calculateBig5(tipiAnswers));
      }
      setStep(4); // 生年月日へ
    } else if (step === 4) {
      handleGenerate();
    } else {
      setStep((step + 1) as DiagnosisStep);
    }
  };

  const handleSkipBig5 = () => {
    setBig5Scores(null);
    setStep(4);
  };

  const handleSkipBirthday = () => {
    setBirthday({ year: '', month: '', day: '' });
    handleGenerate();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setLoadingMessage(LOADING_MESSAGES[0]);

    const timers = LOADING_MESSAGES.slice(1).map((msg, i) =>
      setTimeout(() => setLoadingMessage(msg), (i + 1) * 2000)
    );

    try {
      const birthdayStr = birthday.year && birthday.month && birthday.day
        ? `${birthday.year}-${birthday.month.padStart(2, '0')}-${birthday.day.padStart(2, '0')}`
        : undefined;

      const response = await fetch('/api/diagnosis/monetize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          big5Scores,
          birthday: birthdayStr,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '診断に失敗しました');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '診断中にエラーが発生しました');
      // デモモード: APIエラー時はモックデータを表示
      setResult({
        id: 'demo-' + Date.now(),
        analysis: { ...MOCK_ANALYSIS, big5Scores: big5Scores || undefined },
        kindle: MOCK_KINDLE_RESULTS,
        course: MOCK_COURSE_RESULTS,
        consulting: MOCK_CONSULTING_RESULTS,
        sns: MOCK_SNS_RESULTS,
        digital: MOCK_DIGITAL_RESULTS,
      });
    } finally {
      timers.forEach(clearTimeout);
      setIsGenerating(false);
    }
  };

  // ======================================
  // ローディング画面
  // ======================================
  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-violet-100 animate-ping opacity-30" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">AIが診断中...</h3>
          <p className="text-violet-600 font-medium animate-pulse">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // ======================================
  // 結果画面
  // ======================================
  if (isResultView && result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">才能マネタイズ診断結果</h1>
          <p className="text-gray-600">あなたの才能を最大限に活かす収益化ルートを見つけました</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm text-center">
            ※ デモモードで表示しています（API接続エラー）
          </div>
        )}

        <CommonAnalysisSection analysis={result.analysis} />

        <ShareButtons analysis={result.analysis} />

        <MonetizeResultTabs
          result={result}
          userId={userId}
        />
      </div>
    );
  }

  // ======================================
  // 入力フロー
  // ======================================
  const currentStepInfo = DIAGNOSIS_STEPS[step];
  const StepIcon = STEP_ICONS[step];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {DIAGNOSIS_STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-violet-600 text-white shadow-md' :
                  isDone ? 'bg-violet-100 text-violet-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${
                  isActive ? 'text-violet-700 font-semibold' :
                  isDone ? 'text-violet-500' : 'text-gray-400'
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-violet-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* ステップヘッダー */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <StepIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">{currentStepInfo.title}</h2>
              <p className="text-violet-100 text-sm">{currentStepInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* テキスト質問ステップ (0, 1, 2) */}
          {isTextStep && (
            <div className="space-y-6">
              {STEP_QUESTIONS[step as 0 | 1 | 2].map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {q.label}
                  </label>
                  <textarea
                    value={answers[q.id as keyof DiagnosisAnswers]}
                    onChange={(e) => handleAnswerChange(q.id as keyof DiagnosisAnswers, e.target.value)}
                    placeholder={q.placeholder}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                  />
                  {q.examples.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.examples.map((ex, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const current = answers[q.id as keyof DiagnosisAnswers];
                            const newVal = current ? `${current}、${ex}` : ex;
                            handleAnswerChange(q.id as keyof DiagnosisAnswers, newVal);
                          }}
                          className="text-xs px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-all border border-violet-200"
                        >
                          + {ex}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Big5ステップ */}
          {isBig5Step && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                以下の10個の質問に直感で答えてください。性格特性に基づいた、より精度の高い診断ができます。
                <span className="text-violet-600 font-medium">（スキップも可能です）</span>
              </p>
              {TIPI_QUESTIONS.map((q, index) => (
                <div key={q.id} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    {index + 1}. {q.text}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs text-gray-500 w-16 text-right shrink-0">そう思わない</span>
                    {[1, 2, 3, 4, 5, 6, 7].map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleTipiAnswer(index, value)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-sm font-medium transition-all duration-200 ${
                          tipiAnswers[index] === value
                            ? 'bg-violet-600 text-white shadow-md scale-110'
                            : 'bg-white border border-gray-300 text-gray-600 hover:border-violet-400 hover:text-violet-600'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                    <span className="text-xs text-gray-500 w-16 shrink-0">そう思う</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 生年月日ステップ */}
          {isBirthdayStep && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                生年月日を入力すると、占い的な要素を加えた才能×運勢の分析ができます。
                <span className="text-violet-600 font-medium">（スキップも可能です）</span>
              </p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">年</label>
                  <select
                    value={birthday.year}
                    onChange={(e) => setBirthday(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="">選択</option>
                    {Array.from({ length: 80 }, (_, i) => 2010 - i).map(y => (
                      <option key={y} value={String(y)}>{y}年</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">月</label>
                  <select
                    value={birthday.month}
                    onChange={(e) => setBirthday(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="">選択</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={String(m)}>{m}月</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">日</label>
                  <select
                    value={birthday.day}
                    onChange={(e) => setBirthday(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  >
                    <option value="">選択</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={String(d)}>{d}日</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ナビゲーションボタン */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as DiagnosisStep)}
              className="flex items-center gap-2 px-5 py-3 text-gray-600 hover:text-gray-900 font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {/* Big5・生年月日のスキップボタン */}
            {isBig5Step && (
              <button
                type="button"
                onClick={handleSkipBig5}
                className="px-5 py-3 text-gray-500 hover:text-gray-700 font-medium transition-all"
              >
                スキップ
              </button>
            )}
            {isBirthdayStep && (
              <button
                type="button"
                onClick={handleSkipBirthday}
                className="px-5 py-3 text-gray-500 hover:text-gray-700 font-medium transition-all"
              >
                スキップ
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isBirthdayStep ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  診断する
                </>
              ) : (
                <>
                  次へ
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
