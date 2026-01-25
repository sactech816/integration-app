'use client';

import React from 'react';
import SurveyPlayer from '@/components/survey/SurveyPlayer';

// 顧客満足度調査デモ
const demoSurvey = {
  id: 1,
  slug: 'demo-customer-satisfaction',
  title: '顧客満足度調査',
  description: 'サービス・商品への満足度を測定するアンケート',
  creator_email: 'demo@makers.tokyo',
  questions: [
    {
      id: 'q1',
      type: 'rating' as const,
      text: '当社のサービス全体にどの程度満足していますか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q2',
      type: 'rating' as const,
      text: 'スタッフの対応にどの程度満足していますか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q3',
      type: 'rating' as const,
      text: '商品・サービスの品質にどの程度満足していますか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q4',
      type: 'choice' as const,
      text: '今後も当社のサービスを利用したいと思いますか？',
      required: true,
      options: ['ぜひ利用したい', 'おそらく利用する', 'どちらとも言えない', 'あまり利用したくない', '利用しない'],
    },
    {
      id: 'q5',
      type: 'text' as const,
      text: '改善してほしい点やご意見があればお聞かせください',
      required: false,
    },
  ],
};

export default function SurveyCustomerSatisfactionDemoPage() {
  return <SurveyPlayer survey={demoSurvey} />;
}
