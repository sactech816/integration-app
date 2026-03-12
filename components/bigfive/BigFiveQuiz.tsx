'use client';

import { useState, useCallback, useEffect } from 'react';
import { Question } from '@/lib/bigfive/questions';
import { ChevronLeft, ChevronRight, PartyPopper, Flame, Trophy, ArrowRight } from 'lucide-react';

interface MilestoneConfig {
  /** 何問目で表示するか（1-indexed） */
  at: number;
  /** タイトル */
  title: string;
  /** メッセージ */
  message: string;
  /** アイコンタイプ */
  icon: 'halfway' | 'milestone' | 'complete';
  /** ボタンテキスト */
  buttonText: string;
}

interface BigFiveQuizProps {
  questions: Question[];
  onComplete: (answers: Record<number, number>, durationSeconds: number) => void;
  /** マイルストーン設定（完了モーダルは自動で追加される） */
  milestones?: MilestoneConfig[];
  /** 完了モーダルのカスタマイズ */
  completionModal?: {
    title: string;
    message: string;
    buttonText: string;
  };
}

const SCALE_LABELS = [
  { value: 1, label: '全く当てはまらない', bg: 'bg-blue-100', text: 'text-blue-700' },
  { value: 2, label: 'あまり当てはまらない', bg: 'bg-sky-100', text: 'text-sky-700' },
  { value: 3, label: 'やや当てはまらない', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { value: 4, label: 'どちらでもない', bg: 'bg-gray-100', text: 'text-gray-600' },
  { value: 5, label: 'やや当てはまる', bg: 'bg-orange-100', text: 'text-orange-700' },
  { value: 6, label: 'かなり当てはまる', bg: 'bg-rose-100', text: 'text-rose-700' },
  { value: 7, label: '非常に当てはまる', bg: 'bg-red-100', text: 'text-red-700' },
];

// 質問切替時の背景色ローテーション（薄い色で変化を伝える）
const BG_ROTATION = [
  'bg-blue-50/40',
  'bg-purple-50/40',
  'bg-green-50/40',
  'bg-amber-50/40',
  'bg-rose-50/40',
];

const MILESTONE_ICONS = {
  halfway: Flame,
  milestone: PartyPopper,
  complete: Trophy,
};

const MILESTONE_GRADIENTS = {
  halfway: 'from-amber-500 to-orange-500',
  milestone: 'from-indigo-500 to-purple-500',
  complete: 'from-emerald-500 to-teal-500',
};

export default function BigFiveQuiz({ questions, onComplete, milestones = [], completionModal }: BigFiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [shownMilestones, setShownMilestones] = useState<Set<number>>(new Set());
  const [activeMilestone, setActiveMilestone] = useState<MilestoneConfig | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const safeIndex = Math.min(currentIndex, questions.length - 1);
  const currentQuestion = questions[safeIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const isLastQuestion = safeIndex === questions.length - 1;
  const allAnswered = answeredCount === questions.length;
  const unansweredCount = questions.length - answeredCount;

  if (!currentQuestion) return null;

  // マイルストーンチェック
  const checkMilestone = useCallback((newAnsweredCount: number) => {
    for (const ms of milestones) {
      if (newAnsweredCount === ms.at && !shownMilestones.has(ms.at)) {
        setShownMilestones(prev => new Set(prev).add(ms.at));
        setActiveMilestone(ms);
        return;
      }
    }
  }, [milestones, shownMilestones]);

  const handleAnswer = useCallback((value: number) => {
    const isNewAnswer = answers[currentQuestion.id] === undefined;
    setAnswers(prev => {
      const next = { ...prev, [currentQuestion.id]: value };
      return next;
    });

    // 新しい回答の場合のみマイルストーンチェック
    if (isNewAnswer) {
      const newCount = answeredCount + 1;
      // 全問完了チェック
      if (newCount === questions.length) {
        setTimeout(() => setShowCompletionModal(true), 400);
        return;
      }
      // マイルストーンチェック
      setTimeout(() => checkMilestone(newCount), 400);
    }

    // 自動で次の質問へ（最後の質問以外）
    if (!isLastQuestion) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  }, [currentQuestion.id, isLastQuestion, answeredCount, questions.length, answers, checkMilestone]);

  const handleSubmit = useCallback(() => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    onComplete(answers, duration);
  }, [answers, startTime, onComplete]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // モーダル表示中はキーボード無効
      if (activeMilestone || showCompletionModal) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 7) {
        handleAnswer(num);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnswer, currentIndex, questions.length, activeMilestone, showCompletionModal]);

  const bgColor = BG_ROTATION[safeIndex % BG_ROTATION.length];

  // マイルストーンモーダル
  const renderMilestoneModal = () => {
    if (!activeMilestone) return null;
    const Icon = MILESTONE_ICONS[activeMilestone.icon];
    const gradient = MILESTONE_GRADIENTS[activeMilestone.icon];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setActiveMilestone(null)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{activeMilestone.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{activeMilestone.message}</p>
          <button
            onClick={() => setActiveMilestone(null)}
            className={`px-8 py-3 bg-gradient-to-r ${gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto`}
          >
            {activeMilestone.buttonText}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // 完了モーダル
  const renderCompletionModal = () => {
    if (!showCompletionModal) return null;
    const cm = completionModal || {
      title: 'お疲れ様でした！',
      message: 'すべての質問に回答しました。診断結果を見てみましょう。',
      buttonText: '診断結果を見る',
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{cm.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{cm.message}</p>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            {cm.buttonText}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderMilestoneModal()}
      {renderCompletionModal()}

      <div className={`max-w-2xl mx-auto rounded-3xl p-4 sm:p-6 transition-colors duration-500 ${bgColor}`}>
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              質問 {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 質問カード */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 sm:p-8 mb-6">
          <p className="text-lg sm:text-xl font-semibold text-gray-900 text-center leading-relaxed mb-8">
            {currentQuestion.text}
          </p>

          {/* 7段階スケール */}
          <div className="space-y-3">
            {SCALE_LABELS.map(({ value, label, bg, text }) => {
              const isSelected = answers[currentQuestion.id] === value;
              return (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 text-left
                    ${isSelected
                      ? 'border-gray-400 bg-gray-100 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-white/80'
                    }`}
                >
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                    ${isSelected
                      ? 'bg-gray-600 text-white'
                      : `${bg} ${text}`
                    }`}>
                    {value}
                  </span>
                  <span className={`text-sm sm:text-base ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 未回答警告 */}
        {isLastQuestion && !allAnswered && answers[currentQuestion.id] !== undefined && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 text-center">
            まだ <span className="font-bold">{unansweredCount}問</span> 未回答の質問があります。戻って回答してください。
          </div>
        )}

        {/* ナビゲーション */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            前の質問
          </button>

          {allAnswered ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              診断結果を見る
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={isLastQuestion}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              次の質問
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* キーボードヒント */}
        <p className="text-center text-xs text-gray-400 mt-6 hidden sm:block">
          キーボードの 1〜7 キーでも回答できます。←→ キーで質問を移動できます。
        </p>
      </div>
    </>
  );
}
