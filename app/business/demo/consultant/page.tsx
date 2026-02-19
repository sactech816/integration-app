import { Metadata } from 'next';
import ConsultantDemoClient from './ConsultantDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コンサルタント・士業 ビジネスLPデモ',
  description: 'コンサルタント・士業向けのビジネスLPデモです。実績紹介、サービス内容、料金プランを効果的に掲載できます。集客メーカーでお試しください。',
  keywords: ['コンサルタント ビジネスLP', 'コンサルタント LP デモ', '士業 ランディングページ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/consultant` },
  openGraph: {
    title: 'コンサルタント・士業 ビジネスLPデモ｜集客メーカー',
    description: 'コンサルタント・士業向けのビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/consultant`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('コンサルタント・士業 ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コンサルタント・士業 ビジネスLPデモ｜集客メーカー',
    description: 'コンサルタント・士業向けのビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ConsultantDemoClient />;
}
