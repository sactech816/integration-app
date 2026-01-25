'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// 店舗ビジネスデモ（シンプル版）
const demoLP: BusinessLP = {
  id: 'demo-shop',
  slug: 'demo-shop',
  title: '地域No.1整骨院｜スマイル整骨院',
  description: '腰痛・肩こり・スポーツ障害でお悩みの方へ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'つらい痛み、\n諦めていませんか？',
        subheadline: '根本から改善する施術で、健康な毎日を取り戻しましょう',
        ctaText: '今すぐ予約する',
        ctaUrl: '#contact',
        backgroundColor: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '選ばれる3つの理由',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '👨‍⚕️',
            title: '国家資格保有',
            description: '柔道整復師の国家資格を持つプロが施術',
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: '根本改善',
            description: '痛みの原因を特定し、根本から改善',
          },
          {
            id: generateBlockId(),
            icon: '⏰',
            title: '夜20時まで営業',
            description: '仕事帰りでも通いやすい',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '初回限定キャンペーン',
        description: '通常8,000円 → 初回3,980円',
        buttonText: '今すぐ予約する',
        buttonUrl: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      },
    },
  ],
};

export default function BusinessShopDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
