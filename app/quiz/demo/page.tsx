'use client';

import React from 'react';
import QuizPlayer from '@/components/quiz/QuizPlayer';

// デモ用のサンプルクイズ
const demoQuiz = {
  id: 0,
  slug: 'demo',
  title: 'あなたの性格タイプ診断',
  description: 'いくつかの質問に答えて、あなたの性格タイプを診断しましょう！',
  category: '性格診断',
  color: '#6366f1',
  mode: 'diagnosis' as const,
  layout: 'card' as const,
  questions: [
    {
      id: 'q1',
      text: '休日の過ごし方として、最も好きなのは？',
      options: [
        { text: '友人とワイワイ過ごす', score: { A: 3, B: 0, C: 1 } },
        { text: '一人でゆっくり読書や映画', score: { A: 0, B: 3, C: 1 } },
        { text: '新しい場所を探検する', score: { A: 1, B: 1, C: 3 } },
      ],
    },
    {
      id: 'q2',
      text: '問題に直面したとき、あなたはどうする？',
      options: [
        { text: 'まず誰かに相談する', score: { A: 3, B: 0, C: 1 } },
        { text: 'じっくり考えて自分で解決策を探す', score: { A: 0, B: 3, C: 1 } },
        { text: 'とりあえず行動してみる', score: { A: 1, B: 0, C: 3 } },
      ],
    },
    {
      id: 'q3',
      text: '理想の仕事環境は？',
      options: [
        { text: 'チームで協力しながら進める環境', score: { A: 3, B: 0, C: 1 } },
        { text: '集中できる静かな環境', score: { A: 0, B: 3, C: 1 } },
        { text: '変化が多く刺激的な環境', score: { A: 1, B: 1, C: 3 } },
      ],
    },
  ],
  results: [
    {
      type: 'A',
      title: '社交的リーダータイプ',
      description: 'あなたは人との繋がりを大切にし、チームを引っ張っていく力があります。コミュニケーション能力が高く、周囲を明るくする存在です。',
    },
    {
      type: 'B',
      title: '思考派アナリストタイプ',
      description: 'あなたは物事を深く考え、論理的に分析する力に長けています。一人で集中して取り組むことで、質の高い成果を出せる人です。',
    },
    {
      type: 'C',
      title: '冒険家クリエイタータイプ',
      description: 'あなたは新しいことへの好奇心が強く、行動力があります。固定観念にとらわれず、独創的なアイデアを生み出せる人です。',
    },
  ],
};

export default function QuizDemoPage() {
  const handleBack = () => {
    window.location.href = '/';
  };

  return <QuizPlayer quiz={demoQuiz} onBack={handleBack} />;
}
