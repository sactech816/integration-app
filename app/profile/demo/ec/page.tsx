import { Metadata } from 'next';
import ProfileECDemoPage from './ECDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ECショップ プロフィールLPデモ',
  description: 'ECショップ・オンラインストア向けのプロフィールLPデモです。商品紹介、ブランドストーリー、購入リンクをまとめて表示できます。集客メーカーでお試しください。',
  keywords: ['ECショップ プロフィールLP', 'EC ホームページ デモ', 'オンラインストア LP サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/profile/demo/ec` },
  openGraph: {
    title: 'ECショップ プロフィールLPデモ｜集客メーカー',
    description: 'ECショップ・オンラインストア向けのプロフィールLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/profile/demo/ec`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('ECショップ プロフィールLPデモ')}&type=profile`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ECショップ プロフィールLPデモ｜集客メーカー',
    description: 'ECショップ・オンラインストア向けのプロフィールLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ProfileECDemoPage />;
}
