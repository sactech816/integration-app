'use client';

import React from 'react';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { Profile, generateBlockId } from '@/lib/types';

// 物販・ECデモ（8ブロック）
const demoProfile: Profile = {
  id: 'demo-ec',
  slug: 'demo-ec',
  nickname: '物販・ECデモ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      animated: false,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop',
        name: 'Happy Shop',
        title: 'ハンドメイドアクセサリー専門店',
        category: 'business',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'ようこそ',
        text: '一つひとつ心を込めて作るハンドメイドアクセサリー。\n\nあなたの日常に、小さな幸せと輝きをお届けします。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'gallery',
      data: {
        items: [
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', caption: '商品1' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', caption: '商品2' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', caption: '商品3' },
          { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', caption: '商品4' },
        ],
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '商品の特徴',
        text: '✨ すべて一点もの\n✨ 肌に優しい素材使用\n✨ ギフトラッピング無料\n✨ 全国送料無料（5,000円以上）',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'お客様の声',
        text: '「とても可愛くて、毎日つけています！」\n- 20代女性\n\n「プレゼントしたら喜んでもらえました」\n- 30代男性',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'ショップ情報',
        text: '【営業時間】\n10:00〜18:00\n\n【定休日】\n日曜・祝日\n\n【お支払い方法】\nクレジットカード、銀行振込、代引き',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '最新情報はSNSで',
        text: '新作情報やセール情報を随時配信中！\nフォローしてお得な情報をゲットしてください。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '🛍️ オンラインショップ', url: 'https://example.com/shop', style: 'primary' },
          { label: '📷 Instagram', url: 'https://instagram.com', style: '' },
          { label: '📱 LINE公式アカウント', url: 'https://lin.ee/example', style: '' },
          { label: '📧 お問い合わせ', url: 'https://example.com/contact', style: '' },
        ],
      },
    },
  ],
};

export default function ProfileECDemoPage() {
  return <ProfileViewer profile={demoProfile} />;
}
