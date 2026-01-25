'use client';

import React from 'react';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { Profile, generateBlockId } from '@/lib/types';

// 店舗ビジネスデモ（9ブロック）
const demoProfile: Profile = {
  id: 'demo-shop',
  slug: 'demo-shop',
  nickname: '店舗ビジネスデモ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
      animated: false,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
        name: 'スマイル整骨院',
        title: '地域密着型の整骨院',
        category: 'business',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'ようこそ',
        text: '腰痛・肩こり・スポーツ障害など、身体の不調でお悩みの方をサポートします。\n\n一人ひとりの症状に合わせた丁寧な施術で、健康な毎日をお手伝いします。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop',
        alt: '院内の様子',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'このような症状でお悩みではありませんか？',
        text: '✅ 慢性的な腰痛・肩こり\n✅ 交通事故によるケガ\n✅ スポーツでのケガ\n✅ 姿勢の悪さからくる不調',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '施術メニュー',
        text: '【保険診療】\n骨折、脱臼、捻挫、打撲、挫傷\n\n【自費診療】\n骨盤矯正、猫背矯正、美容鍼\n\n【スポーツコンディショニング】\nパフォーマンス向上、ケガ予防',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '院長からのメッセージ',
        text: '「痛みを我慢せず、早めにご相談ください。根本から改善するお手伝いをします」\n\n国家資格（柔道整復師）を持つスタッフが、責任を持って施術いたします。',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '営業時間・アクセス',
        text: '【営業時間】\n平日：9:00〜12:00 / 15:00〜20:00\n土曜：9:00〜14:00\n\n【定休日】日曜・祝日\n\n【アクセス】\n〇〇駅から徒歩5分\n駐車場3台完備',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '初回限定キャンペーン',
        text: '初回の方限定で、施術料20%OFF！\n\nLINE登録でさらに特典をプレゼント。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '📞 電話で予約', url: 'tel:000-0000-0000', style: 'primary' },
          { label: '📱 LINEで予約', url: 'https://lin.ee/example', style: '' },
          { label: '🌐 ホームページ', url: 'https://example.com', style: '' },
          { label: '📍 Googleマップ', url: 'https://maps.google.com', style: '' },
        ],
      },
    },
  ],
};

export default function ProfileShopDemoPage() {
  return <ProfileViewer profile={demoProfile} />;
}
