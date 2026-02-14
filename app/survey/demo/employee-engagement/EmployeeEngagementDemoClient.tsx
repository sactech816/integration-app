'use client';

import React from 'react';
import SurveyPlayer from '@/components/survey/SurveyPlayer';

// 従業員エンゲージメント調査デモ
const demoSurvey = {
  id: 6,
  slug: 'demo-employee-engagement',
  title: '従業員エンゲージメント調査',
  description: '職場環境と働きがいを匿名で調査',
  creator_email: 'demo@makers.tokyo',
  questions: [
    {
      id: 'q1',
      type: 'rating' as const,
      text: '現在の職場にどの程度満足していますか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q2',
      type: 'rating' as const,
      text: '仕事にやりがいを感じていますか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q3',
      type: 'rating' as const,
      text: '上司や同僚とのコミュニケーションは円滑ですか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q4',
      type: 'choice' as const,
      text: '今後もこの会社で働き続けたいと思いますか？',
      required: true,
      options: ['ぜひ働き続けたい', 'おそらく働き続ける', 'どちらとも言えない', '機会があれば転職したい', '転職を考えている'],
    },
    {
      id: 'q5',
      type: 'text' as const,
      text: '職場環境の改善に向けたご意見・ご要望があればお聞かせください（匿名）',
      required: false,
    },
  ],
};

export default function SurveyEmployeeEngagementDemoPage() {
  return <SurveyPlayer survey={demoSurvey} />;
}
