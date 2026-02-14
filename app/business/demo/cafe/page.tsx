import { Metadata } from 'next';
import BusinessCafeDemoPage from './CafeDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'カフェ ビジネスLPデモ',
  description: 'カフェ・飲食店向けのビジネスLPデモです。メニュー紹介、こだわり、お客様の声、アクセス情報などを魅力的に表示できます。集客メーカーでお試しください。',
  keywords: ['カフェ ビジネスLP', 'カフェ LP デモ', '飲食店 ランディングページ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/cafe` },
  openGraph: {
    title: 'カフェ ビジネスLPデモ｜集客メーカー',
    description: 'カフェ・飲食店向けのビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/cafe`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('カフェ ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'カフェ ビジネスLPデモ｜集客メーカー',
    description: 'カフェ・飲食店向けのビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <BusinessCafeDemoPage />;
}
