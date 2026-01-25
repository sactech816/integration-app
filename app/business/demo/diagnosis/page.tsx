'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// 診断コンテンツデモ（シンプル版）
const demoLP: BusinessLP = {
  id: 'demo-diagnosis',
  slug: 'demo-diagnosis',
  title: 'あなたに最適な副業診断｜オンラインスクール',
  description: '診断を軸にした興味喚起型LP',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'あなたに最適な\n副業は？',
        subheadline: '3分の診断で、あなたにぴったりの副業が分かります',
        ctaText: '今すぐ診断する',
        ctaUrl: '#quiz',
        backgroundColor: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '診断で分かること',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '🎯',
            title: 'あなたのタイプ',
            description: 'スキル・経験・性格から分析',
          },
          {
            id: generateBlockId(),
            icon: '💡',
            title: '最適な副業',
            description: 'あなたに合った副業を提案',
          },
          {
            id: generateBlockId(),
            icon: '📚',
            title: '始め方',
            description: '具体的なスタートガイド',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '無料診断を受ける',
        description: 'あなたに最適な副業を見つけましょう',
        buttonText: '3分で診断スタート',
        buttonUrl: '#quiz',
        backgroundGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      },
    },
  ],
};

export default function BusinessDiagnosisDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
