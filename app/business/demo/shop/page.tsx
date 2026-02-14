import { Metadata } from 'next';
import BusinessShopDemoPage from './ShopDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ショップ ビジネスLPデモ',
  description: 'ショップ・店舗向けのビジネスLPデモです。商品紹介、特徴、料金、お客様の声、アクセスなどを効果的に表示できます。集客メーカーでお試しください。',
  keywords: ['ショップ ビジネスLP', 'ショップ LP デモ', '店舗 ランディングページ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/shop` },
  openGraph: {
    title: 'ショップ ビジネスLPデモ｜集客メーカー',
    description: 'ショップ・店舗向けのビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/shop`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('ショップ ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ショップ ビジネスLPデモ｜集客メーカー',
    description: 'ショップ・店舗向けのビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <BusinessShopDemoPage />;
}
