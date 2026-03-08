'use client';

import React from 'react';
import WebinarViewer from '@/components/webinar/WebinarViewer';
import { WebinarLP, generateBlockId } from '@/lib/types';

const demoLP: WebinarLP = {
  id: 'demo-series-seminar',
  slug: 'demo-series-seminar',
  title: 'セミナーシリーズデモ',
  description: 'ビジネス設計・集中講座 - 全3回シリーズ',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #064e3b, #065f46, #047857, #065f46)',
      animated: true,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: '全3回で完全マスター\nビジネス設計・集中講座',
        subheadline: 'ステップバイステップで確実にスキルアップ',
        ctaText: 'シリーズに申し込む',
        ctaUrl: '#register',
        backgroundColor: 'linear-gradient(-45deg, #064e3b, #065f46, #047857, #065f46)',
      },
    },
    {
      id: generateBlockId(),
      type: 'youtube',
      data: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    },
    {
      id: generateBlockId(),
      type: 'agenda',
      data: {
        title: '全3回の講座内容',
        items: [
          { title: '第1回: ビジネスモデル設計', description: 'あなたの強みを活かした収益モデルの構築。ワークシート付き。' },
          { title: '第2回: 集客の仕組みづくり', description: 'SNS・広告・紹介の3チャネルを使った集客システム' },
          { title: '第3回: セールス＆自動化', description: '成約率を高めるセールストークと業務自動化の実践' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'speaker',
      data: {
        name: '伊藤 恵子',
        title: 'ビジネスプランナー / 起業家',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
        bio: '起業支援歴8年、100名以上の起業家を育成。自身も3つの事業を経営する実践派。「行動するための設計図」を提供するのがモットー。',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '受講の流れ',
        text: '1. お申し込み後、受講案内メールをお届け\n2. 各回の動画を順番に視聴（各90分）\n3. ワークシートに取り組み、実践\n4. 専用フォームで質問・相談\n5. 全3回修了後、修了証を発行',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'countdown',
      data: {
        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        title: '第1回開催まで',
        expiredText: '次回の開催をお待ちください',
        backgroundColor: '#047857',
        expiredAction: 'text',
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: 'シリーズ講座に申し込む',
        description: '全3回セットで特別価格。早期申込で20%OFF。',
        buttonText: '今すぐ申し込む',
        buttonUrl: '#',
        backgroundGradient: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '途中から参加できますか？',
            answer: 'はい、各回のアーカイブ動画をご用意しています。途中参加でも安心です。',
          },
          {
            id: generateBlockId(),
            question: '個別の質問はできますか？',
            answer: '各回終了後に質問フォームをご用意しています。講師が直接回答いたします。',
          },
          {
            id: generateBlockId(),
            question: '1回だけの参加は可能ですか？',
            answer: 'セット受講を推奨しますが、各回の単体受講も可能です。',
          },
        ],
      },
    },
  ],
};

export default function SeriesSeminarDemoClient() {
  return <WebinarViewer lp={demoLP} />;
}
