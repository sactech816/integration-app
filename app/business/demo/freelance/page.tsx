import { Metadata } from 'next';
import FreelanceDemoClient from './FreelanceDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'フリーランス ビジネスLPデモ',
  description: 'フリーランス向けのビジネスLPデモです。ポートフォリオ、サービス内容、料金、制作の流れなどを効果的に表示できます。集客メーカーでお試しください。',
  keywords: ['フリーランス ビジネスLP', 'フリーランス LP デモ', 'ポートフォリオ ランディングページ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/freelance` },
  openGraph: {
    title: 'フリーランス ビジネスLPデモ｜集客メーカー',
    description: 'フリーランス向けのビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/freelance`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('フリーランス ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'フリーランス ビジネスLPデモ｜集客メーカー',
    description: 'フリーランス向けのビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <FreelanceDemoClient />;
}
