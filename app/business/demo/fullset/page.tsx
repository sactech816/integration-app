import { Metadata } from 'next';
import BusinessFullsetDemoPage from './FullsetDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'フルセット ビジネスLPデモ',
  description: '全ブロックを活用したフルセットのビジネスLPデモです。ヒーロー、特徴、料金、お客様の声、FAQ、CTAなど全機能を確認できます。集客メーカーでお試しください。',
  keywords: ['ビジネスLP フルセット', 'ビジネスLP 全機能 デモ', 'ランディングページ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/fullset` },
  openGraph: {
    title: 'フルセット ビジネスLPデモ｜集客メーカー',
    description: '全ブロックを活用したフルセットのビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/fullset`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('フルセット ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'フルセット ビジネスLPデモ｜集客メーカー',
    description: '全ブロックを活用したフルセットのビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <BusinessFullsetDemoPage />;
}
