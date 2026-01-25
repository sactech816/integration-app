'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// QUEST法則デモ（シンプル版）
const demoLP: BusinessLP = {
  id: 'demo-quest',
  slug: 'demo-quest',
  title: '英語コーチング｜ENGLISH MASTER',
  description: 'QUEST法則に基づくビジネスLP',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: '3ヶ月で\nビジネス英語をマスター',
        subheadline: 'あなた専属のコーチが徹底サポート',
        ctaText: '無料カウンセリングを予約',
        ctaUrl: '#counseling',
        backgroundColor: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: 'プログラムの特徴',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '👤',
            title: '専属コーチ',
            description: 'あなただけの学習プランを作成',
          },
          {
            id: generateBlockId(),
            icon: '📊',
            title: '科学的メソッド',
            description: '第二言語習得理論に基づく学習',
          },
          {
            id: generateBlockId(),
            icon: '💬',
            title: '毎日サポート',
            description: 'LINEで質問し放題',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今なら入会金50,000円が無料',
        description: '無料カウンセリングで最適なプランをご提案',
        buttonText: 'カウンセリングを予約する',
        buttonUrl: '#counseling',
        backgroundGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      },
    },
  ],
};

export default function BusinessQuestDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
