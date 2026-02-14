import { Metadata } from 'next';
import ShopDemoPage from './ShopDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ショップ向け診断クイズデモ',
  description: 'ショップ・店舗向けの診断クイズデモです。お客様の好みやタイプを診断して、最適な商品やサービスを提案できます。集客メーカーの診断クイズをお試しください。',
  keywords: ['ショップ 診断クイズ', '店舗 診断 デモ', 'お客様タイプ診断', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/quiz/demo/shop` },
  openGraph: {
    title: 'ショップ向け診断クイズデモ｜集客メーカー',
    description: 'ショップ・店舗向けの診断クイズデモです。集客メーカーの診断クイズをお試しください。',
    url: `${siteUrl}/quiz/demo/shop`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('ショップ向け診断クイズデモ')}&type=quiz`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ショップ向け診断クイズデモ｜集客メーカー',
    description: 'ショップ・店舗向けの診断クイズデモです。集客メーカーの診断クイズをお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ShopDemoPage />;
}
