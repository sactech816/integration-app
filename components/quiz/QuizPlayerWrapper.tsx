'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import QuizPlayer from './QuizPlayer';
import { Quiz } from '@/lib/types';
import { saveAnalytics } from '@/app/actions/analytics';

interface QuizPlayerWrapperProps {
  quiz: Quiz;
}

const QuizPlayerWrapper: React.FC<QuizPlayerWrapperProps> = ({ quiz }) => {
  const viewTrackedRef = useRef(false);
  const completionTrackedRef = useRef(false);

  // ページビューをトラッキング
  useEffect(() => {
    if (!quiz.slug || quiz.slug === 'demo' || viewTrackedRef.current) return;
    
    viewTrackedRef.current = true;
    saveAnalytics(quiz.slug, 'quiz', 'view');
  }, [quiz.slug]);

  // クイズ完了時のトラッキング
  const handleQuizComplete = useCallback((resultType?: string) => {
    if (!quiz.slug || quiz.slug === 'demo' || completionTrackedRef.current) return;
    
    completionTrackedRef.current = true;
    saveAnalytics(quiz.slug, 'quiz', 'completion', { resultType });
  }, [quiz.slug]);

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <QuizPlayer 
      quiz={quiz} 
      onBack={handleBack} 
      onComplete={handleQuizComplete}
    />
  );
};

export default QuizPlayerWrapper;








