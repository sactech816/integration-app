'use client';

import { useState, useCallback, useEffect } from 'react';
import { Question } from '@/lib/bigfive/questions';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BigFiveQuizProps {
  questions: Question[];
  onComplete: (answers: Record<number, number>, durationSeconds: number) => void;
}

const SCALE_LABELS = [
  { value: 1, label: '全く当てはまらない' },
  { value: 2, label: 'あまり当てはまらない' },
  { value: 3, label: 'やや当てはまらない' },
  { value: 4, label: 'どちらでもない' },
  { value: 5, label: 'やや当てはまる' },
  { value: 6, label: 'かなり当てはまる' },
  { value: 7, label: '非常に当てはまる' },
];

export default function BigFiveQuiz({ questions, onComplete }: BigFiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());

  const safeIndex = Math.min(currentIndex, questions.length - 1);
  const currentQuestion = questions[safeIndex];
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);
  const isLastQuestion = safeIndex === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  if (!currentQuestion) return null;

  const handleAnswer = useCallback((value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));

    // 自動で次の質問へ（最後の質問以外）
    if (!isLastQuestion) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  }, [currentQuestion.id, isLastQuestion]);

  const handleSubmit = useCallback(() => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    onComplete(answers, duration);
  }, [answers, startTime, onComplete]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [handleAnswer, currentIndex, questions.length]);

  return (
    <div className="max-w-2xl mx-auto">
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
          {SCALE_LABELS.map(({ value, label }) => {
            const isSelected = answers[currentQuestion.id] === value;
            return (
              <button
                key={value}
                onClick={() => handleAnswer(value)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 text-left
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                  {value}
                </span>
                <span className={`text-sm sm:text-base ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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

        {allAnswered && isLastQuestion ? (
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
  );
}
