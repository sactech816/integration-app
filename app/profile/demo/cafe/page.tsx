'use client';

import React from 'react';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { Profile, generateBlockId } from '@/lib/types';

// カフェ・飲食店デモ（9ブロック）
const demoProfile: Profile = {
  id: 'demo-cafe',
  slug: 'demo-cafe',
  nickname: 'カフェ・飲食店デモ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #eab308 0%, #fbbf24 100%)',
      animated: false,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
        name: 'カフェ ソレイユ',
        title: '心も体も温まるカフェ',
        category: 'personal',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'ようこそ',
        text: '自家焙煎のコーヒーと、手作りスイーツが自慢の小さなカフェです。\n\nゆったりとした時間を、美味しいコーヒーとともにお過ごしください。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'gallery',
      data: {
        items: [
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop', caption: '店内の様子' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', caption: 'コーヒー' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', caption: 'スイーツ' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop', caption: 'ランチ' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'おすすめメニュー',
        text: '☕ ブレンドコーヒー ¥500\n☕ カフェラテ ¥600\n🍰 本日のケーキ ¥600\n🍴 日替わりランチ ¥980',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '当店のこだわり',
        text: '✨ 自家焙煎の新鮮なコーヒー豆\n✨ 地元食材を使用した手作りスイーツ\n✨ 落ち着いた雰囲気の店内\n✨ Wi-Fi・電源完備',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'お客様の声',
        text: '「コーヒーが本当に美味しい！」\n「居心地が良くて長居してしまいます」\n「ランチのボリュームに感動しました」',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '営業時間',
        text: '【営業時間】\n平日：10:00〜18:00\n土日祝：10:00〜19:00\n\n【定休日】火曜日\n\n【アクセス】\n〇〇駅から徒歩3分',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'イベント情報',
        text: '毎月第2土曜日は「ジャズライブ」開催中！\n\n最新情報はInstagramでチェック！',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '📱 Instagram', url: 'https://instagram.com', style: 'primary' },
          { label: '📍 Googleマップ', url: 'https://maps.google.com', style: '' },
          { label: '📞 電話する', url: 'tel:000-0000-0000', style: '' },
          { label: '📧 お問い合わせ', url: 'https://example.com/contact', style: '' },
        ],
      },
    },
  ],
};

export default function ProfileCafeDemoPage() {
  return <ProfileViewer profile={demoProfile} />;
}
