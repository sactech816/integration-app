import { Metadata } from 'next';
import ProfileCafeDemoPage from './CafeDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'カフェ プロフィールLPデモ',
  description: 'カフェ・飲食店向けのプロフィールLPデモです。メニュー紹介、店舗写真ギャラリー、営業時間、SNSリンクなどを魅力的に表示できます。集客メーカーでお試しください。',
  keywords: ['カフェ プロフィールLP', 'カフェ ホームページ デモ', '飲食店 LP サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/profile/demo/cafe` },
  openGraph: {
    title: 'カフェ プロフィールLPデモ｜集客メーカー',
    description: 'カフェ・飲食店向けのプロフィールLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/profile/demo/cafe`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('カフェ プロフィールLPデモ')}&type=profile`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'カフェ プロフィールLPデモ｜集客メーカー',
    description: 'カフェ・飲食店向けのプロフィールLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ProfileCafeDemoPage />;
}
