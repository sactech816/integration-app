'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// カフェ・飲食店デモ（シンプル版）
const demoLP: BusinessLP = {
  id: 'demo-cafe',
  slug: 'demo-cafe',
  title: 'カフェ ソレイユ｜自家焙煎コーヒーと手作りスイーツ',
  description: '心も体も温まる、くつろぎのカフェ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'ゆったりとした時間を、\n美味しいコーヒーとともに',
        subheadline: '自家焙煎のコーヒーと手作りスイーツが自慢の小さなカフェです',
        ctaText: 'メニューを見る',
        ctaUrl: '#menu',
        backgroundColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '当店のこだわり',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '☕',
            title: '自家焙煎コーヒー',
            description: '新鮮な豆を店内で焙煎',
          },
          {
            id: generateBlockId(),
            icon: '🍰',
            title: '手作りスイーツ',
            description: '地元食材を使用した日替わりケーキ',
          },
          {
            id: generateBlockId(),
            icon: '📶',
            title: 'Wi-Fi・電源完備',
            description: '落ち着いた雰囲気でゆったり過ごせます',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '営業時間',
        description: '平日 10:00〜18:00 / 土日祝 10:00〜19:00（定休日:火曜日）',
        buttonText: 'アクセス・お問い合わせ',
        buttonUrl: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
      },
    },
  ],
};

export default function BusinessCafeDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
