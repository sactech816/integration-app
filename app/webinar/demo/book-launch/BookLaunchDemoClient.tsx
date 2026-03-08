'use client';

import React from 'react';
import WebinarViewer from '@/components/webinar/WebinarViewer';
import { WebinarLP, generateBlockId } from '@/lib/types';

const demoLP: WebinarLP = {
  id: 'demo-book-launch',
  slug: 'demo-book-launch',
  title: '出版記念セミナーデモ',
  description: '出版記念特別オンラインセミナー',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #9f1239, #be123c, #e11d48, #be123c)',
      animated: true,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'hero',
      data: {
        headline: '出版記念\n特別オンラインセミナー',
        subheadline: 'ベストセラー著者が語る「成功する習慣」の作り方',
        ctaText: '参加を申し込む',
        ctaUrl: '#register',
        backgroundColor: 'linear-gradient(-45deg, #9f1239, #be123c, #e11d48, #be123c)',
      },
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=500&fit=crop',
        caption: '新刊「成功する人の7つの習慣」好評発売中',
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
      type: 'speaker',
      data: {
        name: '木村 直人',
        title: 'ベストセラー作家 / ビジネスコーチ',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
        bio: '著書10冊、累計50万部突破のベストセラー作家。最新刊「成功する人の7つの習慣」はAmazon総合1位を記録。15年間のコーチング経験を活かし、実践的な内容をお届けします。',
      },
    },
    {
      id: generateBlockId(),
      type: 'agenda',
      data: {
        title: 'トークテーマ',
        items: [
          { title: 'なぜ「習慣」が人生を変えるのか', description: '科学的根拠に基づく習慣化のメカニズム' },
          { title: '本には書けなかった3つの裏話', description: 'セミナー参加者だけの特別エピソード' },
          { title: '質疑応答＆サイン会のご案内', description: '読者からの質問にライブで回答' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'countdown',
      data: {
        targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        title: '開催まであと',
        expiredText: 'アーカイブ視聴をお申し込みください',
        backgroundColor: '#be123c',
        expiredAction: 'text',
      },
    },
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '出版記念セミナーに参加する',
        description: '書籍購入者は無料で参加いただけます',
        buttonText: '参加を申し込む',
        buttonUrl: '#',
        backgroundGradient: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)',
      },
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '書籍を購入していなくても参加できますか？',
            answer: 'はい、どなたでもご参加いただけます。当日の書籍購入特典もご用意しています。',
          },
          {
            id: generateBlockId(),
            question: 'サイン本はもらえますか？',
            answer: '先着50名様にサイン本をお送りします。',
          },
          {
            id: generateBlockId(),
            question: 'セミナー中に質問できますか？',
            answer: 'はい、Q&Aセッションを設けていますのでお気軽にご質問ください。',
          },
        ],
      },
    },
  ],
};

export default function BookLaunchDemoClient() {
  return <WebinarViewer lp={demoLP} />;
}
