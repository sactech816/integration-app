'use client';

import React, { useEffect, useRef } from 'react';
import QuizPlayer from './QuizPlayer';
import { Quiz } from '@/lib/types';
import { saveAnalytics } from '@/app/actions/analytics';

interface QuizPlayerWrapperProps {
  quiz: Quiz;
}

const QuizPlayerWrapper: React.FC<QuizPlayerWrapperProps> = ({ quiz }) => {
  const viewTrackedRef = useRef(false);

  // ページビューをトラッキング
  useEffect(() => {
    if (!quiz.slug || quiz.slug === 'demo' || viewTrackedRef.current) return;
    
    viewTrackedRef.current = true;
    saveAnalytics(quiz.slug, 'quiz', 'view');
  }, [quiz.slug]);

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <QuizPlayer 
      quiz={quiz} 
      onBack={handleBack} 
    />
  );
};

export default QuizPlayerWrapper;








