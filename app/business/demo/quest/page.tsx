import { Metadata } from 'next';
import BusinessQuestDemoPage from './QuestDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'QUEST ビジネスLPデモ',
  description: 'QUESTフォーミュラ（Qualify・Understand・Educate・Stimulate・Transition）に基づくビジネスLPデモです。ターゲット絞り込みから行動喚起まで、効果的なLP構成を体験できます。',
  keywords: ['QUEST フォーミュラ LP', 'ビジネスLP デモ', 'QUEST ランディングページ', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/quest` },
  openGraph: {
    title: 'QUEST ビジネスLPデモ｜集客メーカー',
    description: 'QUESTフォーミュラに基づくビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/quest`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('QUEST ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QUEST ビジネスLPデモ｜集客メーカー',
    description: 'QUESTフォーミュラに基づくビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <BusinessQuestDemoPage />;
}
