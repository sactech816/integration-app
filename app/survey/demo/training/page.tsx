'use client';

import React from 'react';
import SurveyPlayer from '@/components/survey/SurveyPlayer';

// 研修・講座評価アンケートデモ
const demoSurvey = {
  id: 5,
  slug: 'demo-training',
  title: '研修・講座評価アンケート',
  description: '研修内容と講師の評価を収集',
  creator_email: 'demo@makers.tokyo',
  questions: [
    {
      id: 'q1',
      type: 'rating' as const,
      text: '研修内容は期待に応えるものでしたか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q2',
      type: 'rating' as const,
      text: '講師の説明は分かりやすかったですか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q3',
      type: 'rating' as const,
      text: '研修で学んだ内容は実務に活かせそうですか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q4',
      type: 'choice' as const,
      text: '研修時間は適切でしたか？',
      required: true,
      options: ['短すぎる', 'やや短い', 'ちょうど良い', 'やや長い', '長すぎる'],
    },
    {
      id: 'q5',
      type: 'text' as const,
      text: '今後の研修で取り上げてほしいテーマや改善点があればお聞かせください',
      required: false,
    },
  ],
};

export default function SurveyTrainingDemoPage() {
  return <SurveyPlayer survey={demoSurvey} />;
}
