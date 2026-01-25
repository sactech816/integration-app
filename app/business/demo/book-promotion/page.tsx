'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// 書籍プロモーションデモ（シンプル版）
const demoLP: BusinessLP = {
  id: 'demo-book-promotion',
  slug: 'demo-book-promotion',
  title: '最強のWeb集客術｜Amazonベストセラー',
  description: '書籍プロモーション特化型LP',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'Amazonランキング\n1位獲得',
        subheadline: '10万部突破！Web集客の決定版',
        ctaText: '今すぐ購入する',
        ctaUrl: 'https://amazon.co.jp',
        backgroundColor: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: 'この本で学べること',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '📈',
            title: 'SNS戦略',
            description: 'フォロワー1万人達成メソッド',
          },
          {
            id: generateBlockId(),
            icon: '💰',
            title: '売上UP術',
            description: 'CV率を3倍にする方法',
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: '実践ノウハウ',
            description: '明日から使える具体策',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '期間限定キャンペーン',
        description: 'Amazonで購入して特典動画をゲット',
        buttonText: 'Amazonで購入する',
        buttonUrl: 'https://amazon.co.jp',
        backgroundGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      },
    },
  ],
};

export default function BusinessBookPromotionDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
