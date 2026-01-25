'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// PASONA法則デモ（シンプル版）
const demoLP: BusinessLP = {
  id: 'demo-pasona',
  slug: 'demo-pasona',
  title: 'Webマーケティング完全攻略講座',
  description: 'PASONA法則に基づくビジネスLP',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'Web集客で\n売上3倍を実現',
        subheadline: '3ヶ月で成果が出る実践型オンライン講座',
        ctaText: '無料説明会に参加する',
        ctaUrl: '#contact',
        backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '講座の特徴',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '📚',
            title: '実践的カリキュラム',
            description: '現場で使える具体的なノウハウ',
          },
          {
            id: generateBlockId(),
            icon: '👨‍🏫',
            title: '現役プロが指導',
            description: '実績豊富な講師陣がサポート',
          },
          {
            id: generateBlockId(),
            icon: '💯',
            title: '満足度98%',
            description: '受講生から高い評価',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今だけ特別価格',
        description: '通常価格298,000円 → 今なら198,000円',
        buttonText: '無料説明会に申し込む',
        buttonUrl: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      },
    },
  ],
};

export default function BusinessPasonaDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
