'use client';

import React from 'react';
import BusinessViewer from '@/components/business/BusinessViewer';
import { BusinessLP, generateBlockId } from '@/lib/types';

const demoLP: BusinessLP = {
  id: 'demo',
  slug: 'demo',
  title: 'Webマーケティング支援サービス',
  description: 'あなたのビジネスをデジタルで加速させます',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #f59e0b, #fbbf24, #fcd34d, #fbbf24)',
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: 'あなたのビジネスを\nデジタルで加速',
        subheadline: 'Webマーケティングの力で、売上アップを実現します',
        ctaText: '無料相談を予約する',
        ctaUrl: '#contact',
        backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
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
            icon: '🚀',
            title: '圧倒的な実績',
            description: '100社以上の支援実績で培ったノウハウを提供',
          },
          {
            id: generateBlockId(),
            icon: '💡',
            title: 'オーダーメイド戦略',
            description: 'あなたのビジネスに最適な施策を設計',
          },
          {
            id: generateBlockId(),
            icon: '📊',
            title: '成果にコミット',
            description: '数値で見える化し、継続的に改善',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: '田中様',
            role: 'EC事業 経営者',
            comment: '導入から3ヶ月で売上が2倍になりました。プロに任せて本当に良かったです。',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
          },
          {
            id: generateBlockId(),
            name: '佐藤様',
            role: 'コンサルタント',
            comment: 'SNSからの問い合わせが10倍に。集客の悩みが解消されました。',
            imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'pricing',
      data: {
        plans: [
          {
            id: generateBlockId(),
            title: 'スタータープラン',
            price: '月額 50,000円',
            features: ['月1回のコンサル', 'SNS運用代行', 'レポート作成'],
            isRecommended: false,
          },
          {
            id: generateBlockId(),
            title: 'スタンダードプラン',
            price: '月額 100,000円',
            features: ['月2回のコンサル', 'SNS運用代行', '広告運用', 'LP制作'],
            isRecommended: true,
          },
          {
            id: generateBlockId(),
            title: 'プレミアムプラン',
            price: '月額 200,000円',
            features: ['週1回のコンサル', 'フルサポート', '広告運用', 'LP制作', '動画制作'],
            isRecommended: false,
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '最短でどれくらいで成果が出ますか？',
            answer: '業種や施策によりますが、早い場合は1ヶ月で成果が見え始めます。',
          },
          {
            id: generateBlockId(),
            question: '契約期間の縛りはありますか？',
            answer: '最低契約期間は3ヶ月です。その後は月単位で継続・解約を選べます。',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今すぐ無料相談',
        description: 'まずはお気軽にご相談ください。あなたのビジネスに最適なプランをご提案します。',
        buttonText: '無料相談を予約する',
        buttonUrl: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      },
    },
  ],
};

export default function BusinessDemoPage() {
  return <BusinessViewer lp={demoLP} />;
}
