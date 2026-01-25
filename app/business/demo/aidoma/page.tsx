'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

// AIDOMA法則デモ（シンプル版）
const demoLP: BusinessLP = {
  id: 'demo-aidoma',
  slug: 'demo-aidoma',
  title: 'プロ仕様の動画編集ソフト｜VideoMaster Pro',
  description: 'AIDOMA法則に基づくビジネスLP',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'プロ級の動画を\n誰でも簡単に',
        subheadline: 'AI搭載の次世代動画編集ソフト',
        ctaText: '無料トライアルを始める',
        ctaUrl: '#trial',
        backgroundColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '主な機能',
        columns: 3,
        items: [
          {
            id: generateBlockId(),
            icon: '🤖',
            title: 'AI自動編集',
            description: '面倒な作業を自動化',
          },
          {
            id: generateBlockId(),
            icon: '🎨',
            title: '豊富なテンプレート',
            description: '1,000種類以上のエフェクト',
          },
          {
            id: generateBlockId(),
            icon: '⚡',
            title: '高速レンダリング',
            description: '従来の3倍の速度で書き出し',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '30日間無料トライアル',
        description: 'すべての機能を無料でお試しいただけます',
        buttonText: '今すぐ始める',
        buttonUrl: '#trial',
        backgroundGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      },
    },
  ],
};

export default function BusinessAidomaDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
