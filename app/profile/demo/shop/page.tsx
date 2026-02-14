import { Metadata } from 'next';
import ProfileShopDemoPage from './ShopDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ショップ プロフィールLPデモ',
  description: 'ショップ・店舗向けのプロフィールLPデモです。店舗情報、商品紹介、営業時間、アクセスなどをまとめて表示できます。集客メーカーでお試しください。',
  keywords: ['ショップ プロフィールLP', 'ショップ ホームページ デモ', '店舗 LP サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/profile/demo/shop` },
  openGraph: {
    title: 'ショップ プロフィールLPデモ｜集客メーカー',
    description: 'ショップ・店舗向けのプロフィールLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/profile/demo/shop`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('ショップ プロフィールLPデモ')}&type=profile`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ショップ プロフィールLPデモ｜集客メーカー',
    description: 'ショップ・店舗向けのプロフィールLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ProfileShopDemoPage />;
}
