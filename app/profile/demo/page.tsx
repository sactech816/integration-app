'use client';

import React from 'react';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { Profile, generateBlockId } from '@/lib/types';

const demoProfile: Profile = {
  id: 'demo',
  slug: 'demo',
  nickname: 'デモプロフィール',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      animated: true,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
        name: '山田 太郎',
        title: 'Webデザイナー / UIデザイナー',
        category: 'business',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '自己紹介',
        text: '東京を拠点に活動するWebデザイナーです。\nユーザー体験を大切にしたデザインを心がけています。\n\nお気軽にお問い合わせください！',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: 'Portfolio', url: 'https://example.com', style: '' },
          { label: 'Twitter / X', url: 'https://x.com', style: '' },
          { label: 'Instagram', url: 'https://instagram.com', style: '' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'youtube',
      data: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    },
  ],
};

export default function ProfileDemoPage() {
  return <ProfileViewer profile={demoProfile} />;
}
