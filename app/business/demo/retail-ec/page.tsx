import { Metadata } from 'next';
import RetailEcDemoClient from './RetailEcDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '物販・EC ビジネスLPデモ',
  description: '物販・EC向けのビジネスLPデモです。商品のこだわり、お客様の声、ショップリンクなどを効果的に表示できます。集客メーカーでお試しください。',
  keywords: ['物販 ビジネスLP', 'EC LP デモ', 'ハンドメイド ランディングページ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/retail-ec` },
  openGraph: {
    title: '物販・EC ビジネスLPデモ｜集客メーカー',
    description: '物販・EC向けのビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/retail-ec`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('物販・EC ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '物販・EC ビジネスLPデモ｜集客メーカー',
    description: '物販・EC向けのビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <RetailEcDemoClient />;
}
