'use client';

import React from 'react';
import WebinarViewer from '@/components/webinar/WebinarViewer';
import { WebinarLP, generateBlockId } from '@/lib/types';

const demoLP: WebinarLP = {
  id: 'demo-free-webinar',
  slug: 'demo-free-webinar',
  title: '無料ウェビナー集客デモ',
  description: 'SNS集客の教科書 - 無料オンラインセミナー',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #2d1b69, #4c1d95, #6d28d9, #4c1d95)',
      animated: true,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: '【無料オンラインセミナー】\nSNS集客の教科書',
        subheadline: 'たった30日で月商100万円を達成した秘密を公開',
        ctaText: '無料で参加する',
        ctaUrl: '#register',
        backgroundColor: 'linear-gradient(-45deg, #2d1b69, #4c1d95, #6d28d9, #4c1d95)',
      },
    },
    {
      id: generateBlockId(),
      type: 'countdown',
      data: {
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        title: '開催まであと',
        expiredText: 'アーカイブ視聴可能',
        backgroundColor: '#7c3aed',
        expiredAction: 'text',
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
        title: 'このウェビナーで学べること',
        items: [
          { title: 'SNSで見込み客を自動集客する3つのステップ', description: '実績のあるフレームワークを初公開' },
          { title: 'フォロワー0から始める収益化の仕組み', description: 'ツールとワークフローを具体的に紹介' },
          { title: '明日から使えるコンテンツ戦略テンプレート', description: '参加者限定の特典シートをプレゼント' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'speaker',
      data: {
        name: '山田 太郎',
        title: 'SNSマーケティングコンサルタント',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
        bio: 'SNSマーケティング歴10年。これまでに500社以上の企業のSNS戦略を支援。著書「SNS集客の教科書」はAmazonベストセラー1位を獲得。わかりやすい解説と実践的なアドバイスが好評。',
      },
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: '佐藤 美咲',
            role: '個人サロン経営',
            comment: '具体的なステップが明確で、セミナー翌日から実践できました。3ヶ月でフォロワーが5倍に！',
            imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          },
          {
            id: generateBlockId(),
            name: '田中 健一',
            role: 'フリーランスデザイナー',
            comment: '無料でここまで教えてもらえるとは驚きでした。すぐに成果が出たので有料講座にも申し込みました。',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
          },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: '無料で参加する',
        buttonText: '今すぐ申し込む',
      },
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '参加費はかかりますか？',
            answer: 'いいえ、完全無料でご参加いただけます。',
          },
          {
            id: generateBlockId(),
            question: 'アーカイブ視聴はできますか？',
            answer: 'はい、申し込みいただいた方にアーカイブURLをお送りします。',
          },
          {
            id: generateBlockId(),
            question: '初心者でも大丈夫ですか？',
            answer: 'はい、ゼロから始める方にも分かりやすい内容です。専門用語も丁寧に解説します。',
          },
        ],
      },
    },
  ],
};

export default function FreeWebinarDemoClient() {
  return <WebinarViewer lp={demoLP} />;
}
