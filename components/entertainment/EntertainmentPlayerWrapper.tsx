'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import EntertainmentResultView from './EntertainmentResultView';
import { Quiz, QuizResult } from '@/lib/types';
import { saveAnalytics } from '@/app/actions/analytics';
import { calculateResult } from '@/lib/utils';

interface EntertainmentPlayerWrapperProps {
  quiz: Quiz;
}

const EntertainmentPlayerWrapper: React.FC<EntertainmentPlayerWrapperProps> = ({ quiz }) => {
  const viewTrackedRef = useRef(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showCustomResult, setShowCustomResult] = useState(false);

  useEffect(() => {
    if (!quiz.slug || viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    saveAnalytics(quiz.slug, 'entertainment_quiz', 'view');
  }, [quiz.slug]);

  const handleBack = () => {
    if (showCustomResult) {
      setShowCustomResult(false);
      setResult(null);
    } else {
      window.location.href = '/';
    }
  };

  const handleRetry = useCallback(() => {
    setShowCustomResult(false);
    setResult(null);
  }, []);

  // エンタメ診断の場合はカスタム結果画面を表示
  if (showCustomResult && result) {
    return (
      <EntertainmentResultView
        quiz={quiz}
        result={result}
        onRetry={handleRetry}
        onBack={handleBack}
      />
    );
  }

  return (
    <QuizPlayer
      quiz={quiz}
      onBack={handleBack}
      onResult={(quizResult: QuizResult) => {
        setResult(quizResult);
        setShowCustomResult(true);
      }}
    />
  );
};

export default EntertainmentPlayerWrapper;
