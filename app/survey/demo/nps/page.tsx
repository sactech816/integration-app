'use client';

import React from 'react';
import SurveyPlayer from '@/components/survey/SurveyPlayer';

// NPS（推奨度）調査デモ
const demoSurvey = {
  id: 3,
  slug: 'demo-nps',
  title: 'NPS（推奨度）調査',
  description: '友人に薦める可能性を測定',
  creator_email: 'demo@makers.tokyo',
  questions: [
    {
      id: 'q1',
      type: 'rating' as const,
      text: '当社のサービスを友人や同僚に薦める可能性はどの程度ですか？（0=全く薦めない、10=非常に薦める）',
      required: true,
      options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    },
    {
      id: 'q2',
      type: 'text' as const,
      text: 'そのスコアをつけた理由を教えてください',
      required: true,
    },
    {
      id: 'q3',
      type: 'choice' as const,
      text: '当社のサービスで最も評価している点は何ですか？',
      required: true,
      options: ['商品・サービスの品質', '価格', 'スタッフの対応', 'アフターサポート', 'ブランドイメージ', 'その他'],
    },
    {
      id: 'q4',
      type: 'text' as const,
      text: '当社のサービスをより良くするためのご提案があればお聞かせください',
      required: false,
    },
  ],
};

export default function SurveyNPSDemoPage() {
  return <SurveyPlayer survey={demoSurvey} />;
}
