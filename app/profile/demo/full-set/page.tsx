'use client';

import React from 'react';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { Profile, generateBlockId } from '@/lib/types';

// フルセットデモ（15ブロック）
const demoProfile: Profile = {
  id: 'demo-full-set',
  slug: 'demo-full-set',
  nickname: 'フルセットデモ',
  settings: {
    theme: {
      gradient: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
      animated: true,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
        name: '山田 花子',
        title: 'Webマーケティングコンサルタント',
        category: 'business',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'はじめまして',
        text: 'Web集客のプロフェッショナルとして、中小企業の成長をサポートしています。\n\n「売上を上げたいけど、何から始めれば...」そんなお悩みを一緒に解決します。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '📧 お問い合わせ', url: 'https://example.com/contact', style: '' },
          { label: '📝 無料相談を予約', url: 'https://example.com/booking', style: 'primary' },
          { label: '📱 LINE公式アカウント', url: 'https://lin.ee/example', style: '' },
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
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'このような方をサポートしています',
        text: '✅ Web集客に力を入れたい経営者\n✅ SNSで効果的に情報発信したい方\n✅ オンライン販売を始めたい事業者\n✅ ブランディングを強化したい方',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
        alt: 'Web集客イメージ',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'サービス内容',
        text: '【Webマーケティングコンサルティング】\nSEO対策、SNS運用、広告運用など、総合的なWeb集客をサポート\n\n【セミナー・講演】\n企業研修や講演会で、最新のWebマーケティング手法をお伝えします',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'gallery',
      data: {
        items: [
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop', caption: 'セミナー風景' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', caption: 'ミーティング' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop', caption: 'オフィス' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '実績',
        text: '✨ 支援企業数：100社以上\n✨ セミナー参加者：累計3,000名\n✨ 売上3倍達成の事例多数',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'お客様の声',
        text: '「3ヶ月で問い合わせが5倍になりました！」\n- 飲食店経営 A様\n\n「SNS運用のコツが分かり、フォロワーが急増しました」\n- EC事業者 B様',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'プロフィール',
        text: '大学卒業後、Web制作会社に勤務。\n独立後は中小企業のWeb集客を支援。\n\n【保有資格】\n・Webマーケティング検定\n・Googleアナリティクス認定資格',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '🐦 Twitter/X', url: 'https://x.com', style: '' },
          { label: '📷 Instagram', url: 'https://instagram.com', style: '' },
          { label: '💼 Facebook', url: 'https://facebook.com', style: '' },
          { label: '🎬 YouTube', url: 'https://youtube.com', style: '' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'まずはお気軽にご相談ください',
        text: '無料相談では、あなたのビジネスに最適な集客戦略をご提案します。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '📝 無料相談を予約する', url: 'https://example.com/booking', style: 'primary' },
          { label: '📧 メールでお問い合わせ', url: 'https://example.com/contact', style: '' },
        ],
      },
    },
  ],
};

export default function ProfileFullSetDemoPage() {
  return <ProfileViewer profile={demoProfile} />;
}
