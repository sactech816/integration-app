'use client';

import React from 'react';
import SurveyPlayer from '@/components/survey/SurveyPlayer';

// 商品・サービス改善アンケートデモ
const demoSurvey = {
  id: 4,
  slug: 'demo-product-service',
  title: '商品・サービス改善アンケート',
  description: '改善に向けた具体的なフィードバックを収集',
  creator_email: 'demo@makers.tokyo',
  questions: [
    {
      id: 'q1',
      type: 'choice' as const,
      text: '現在ご利用中の商品・サービスはどれですか？',
      required: true,
      options: ['商品A', '商品B', '商品C', 'サービスD', 'サービスE', 'その他'],
    },
    {
      id: 'q2',
      type: 'rating' as const,
      text: '現在の商品・サービスにどの程度満足していますか？',
      required: true,
      options: ['1', '2', '3', '4', '5'],
    },
    {
      id: 'q3',
      type: 'choice' as const,
      text: '改善してほしい点はどれですか？（複数選択可）',
      required: true,
      options: ['機能・性能', 'デザイン', '価格', '使いやすさ', 'サポート体制', 'その他'],
    },
    {
      id: 'q4',
      type: 'text' as const,
      text: '具体的にどのような改善を望みますか？',
      required: true,
    },
    {
      id: 'q5',
      type: 'choice' as const,
      text: '今後、新機能が追加された場合、利用したいですか？',
      required: true,
      options: ['ぜひ利用したい', 'おそらく利用する', 'どちらとも言えない', 'あまり利用したくない', '利用しない'],
    },
  ],
};

export default function SurveyProductServiceDemoPage() {
  return <SurveyPlayer survey={demoSurvey} />;
}
