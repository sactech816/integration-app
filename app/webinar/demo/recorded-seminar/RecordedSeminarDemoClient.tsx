'use client';

import React from 'react';
import WebinarViewer from '@/components/webinar/WebinarViewer';
import { WebinarLP, generateBlockId } from '@/lib/types';

const demoLP: WebinarLP = {
  id: 'demo-recorded-seminar',
  slug: 'demo-recorded-seminar',
  title: '録画セミナー販売デモ',
  description: 'Webマーケティング完全講座 - いつでも視聴可能',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)',
      animated: true,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero_fullwidth',
      data: {
        headline: '今すぐ視聴できる\nWebマーケティング完全講座',
        subheadline: 'いつでも・どこでも・何度でも。あなたのペースで学べる',
        ctaText: '講座の詳細を見る',
        ctaUrl: '#cta',
        backgroundColor: 'linear-gradient(-45deg, #1e3a5f, #2d5a87, #3d7ab0, #2d5a87)',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'こんなお悩みありませんか？',
        text: '・ 集客に時間とお金ばかりかかって成果が出ない\n・ 何から始めればいいか分からない\n・ セミナーに通う時間が取れない\n・ 独学では限界を感じている\n・ 実績のある人から直接学びたい',
        align: 'left',
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
        title: '講座内容（全5時間）',
        items: [
          { title: 'Chapter 1: マーケティングの全体像', description: 'ビジネスモデルの設計とターゲット分析' },
          { title: 'Chapter 2: SNS集客の実践テクニック', description: 'Instagram・X・YouTubeの具体的な運用方法' },
          { title: 'Chapter 3: LP・セールスファネルの構築', description: '売れるランディングページの作り方' },
          { title: 'Chapter 4: メルマガ・LINE戦略', description: '見込み客の育成と自動化の仕組み' },
          { title: '特典: 実践テンプレート集', description: 'すぐに使える30種類のテンプレートをプレゼント' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'speaker',
      data: {
        name: '鈴木 一郎',
        title: 'Webマーケティングコンサルタント',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces',
        bio: 'Webマーケティング歴15年。大手企業から個人事業主まで1000件以上のコンサルティング実績。年商1億円を超えるクライアントを多数輩出。「難しいことを簡単に」をモットーに、実践的な内容をお伝えします。',
      },
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: '高橋 あゆみ',
            role: 'オンラインスクール経営',
            comment: '何度も見返せるので理解が深まりました。受講後3ヶ月で売上が2倍に。',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
          },
          {
            id: generateBlockId(),
            name: '中村 大輔',
            role: 'ECサイト運営',
            comment: '通勤中にスマホで視聴して、効率的に学べました。テンプレートが実践的で最高です。',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'delayed_cta',
      data: {
        title: '期間限定の特別価格',
        buttonText: '今すぐ申し込む（特別価格）',
        buttonUrl: '#',
        delaySeconds: 30,
        buttonColor: '#2563eb',
        buttonTextColor: '#ffffff',
        borderRadius: 'lg',
        shadow: 'lg',
        animation: 'pulse',
        size: 'lg',
      },
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '視聴期限はありますか？',
            answer: 'ご購入から1年間、何度でも視聴いただけます。',
          },
          {
            id: generateBlockId(),
            question: '返金保証はありますか？',
            answer: '14日間の返金保証をご用意しています。内容に満足いただけない場合は全額返金いたします。',
          },
          {
            id: generateBlockId(),
            question: 'スマートフォンでも視聴できますか？',
            answer: 'はい、PC・スマートフォン・タブレットすべてに対応しています。',
          },
        ],
      },
    },
  ],
};

export default function RecordedSeminarDemoClient() {
  return <WebinarViewer lp={demoLP} />;
}
