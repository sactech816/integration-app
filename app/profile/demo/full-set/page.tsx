import { Metadata } from 'next';
import ProfileFullSetDemoPage from './FullSetDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'フルセット プロフィールLPデモ',
  description: '全ブロックを活用したフルセットのプロフィールLPデモです。ヘッダー、自己紹介、ギャラリー、サービス、お客様の声、リンクなど全機能を確認できます。集客メーカーでお試しください。',
  keywords: ['プロフィールLP フルセット', 'プロフィールLP 全機能 デモ', 'リンクまとめ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/profile/demo/full-set` },
  openGraph: {
    title: 'フルセット プロフィールLPデモ｜集客メーカー',
    description: '全ブロックを活用したフルセットのプロフィールLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/profile/demo/full-set`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('フルセット プロフィールLPデモ')}&type=profile`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'フルセット プロフィールLPデモ｜集客メーカー',
    description: '全ブロックを活用したフルセットのプロフィールLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ProfileFullSetDemoPage />;
}
