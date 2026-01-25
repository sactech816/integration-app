'use client';

import React from 'react';
import ProfileViewer from '@/components/profile/ProfileViewer';
import { Profile, generateBlockId } from '@/lib/types';

// コーチ・講師デモ（8ブロック）
const demoProfile: Profile = {
  id: 'demo-coach',
  slug: 'demo-coach',
  nickname: 'コーチ・講師デモ',
  settings: {
    theme: {
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      animated: false,
    },
  },
  content: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
        name: '佐藤 美咲',
        title: 'ライフコーチ / キャリアアドバイザー',
        category: 'personal',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'あなたの可能性を引き出します',
        text: '「自分らしく生きたい」「もっと成長したい」\nそんな想いを持つあなたをサポートします。\n\n一人ひとりに寄り添い、あなたの中にある答えを一緒に見つけていきましょう。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'このような方をサポートしています',
        text: '✅ キャリアの方向性に悩んでいる\n✅ 自分の強みが分からない\n✅ ワークライフバランスを改善したい\n✅ 目標を達成したい',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'コーチングメニュー',
        text: '【個別セッション】\n60分 × 月4回\nあなたのペースで目標達成をサポート\n\n【グループコーチング】\n90分 × 月2回\n仲間と一緒に学び成長する',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'クライアントの変化',
        text: '「転職活動で理想の仕事に出会えました！」\n- 30代女性\n\n「起業する勇気が持てました」\n- 40代男性\n\n「自分に自信が持てるようになりました」\n- 20代女性',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'プロフィール',
        text: '大手企業で人事・採用を10年経験後、独立。\n延べ500名以上のキャリア支援実績。\n\n【資格】\n・国際コーチング連盟認定コーチ（ICF）\n・キャリアコンサルタント',
        align: 'left',
      },
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '体験セッションのご案内',
        text: '初めての方限定で、60分の体験セッションを無料で提供しています。\n\nまずはお気軽にお試しください。',
        align: 'center',
      },
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '🎁 無料体験セッションを予約', url: 'https://example.com/trial', style: 'primary' },
          { label: '📱 LINE公式アカウント', url: 'https://lin.ee/example', style: '' },
          { label: '📝 お問い合わせ', url: 'https://example.com/contact', style: '' },
        ],
      },
    },
  ],
};

export default function ProfileCoachDemoPage() {
  return <ProfileViewer profile={demoProfile} />;
}
