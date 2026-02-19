import { Metadata } from 'next';
import CoachDemoClient from './CoachDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コーチ・講師 ビジネスLPデモ',
  description: 'コーチ・講師向けのビジネスLPデモです。メソッド紹介、お客様の声、LINE登録など効果的に表示できます。集客メーカーでお試しください。',
  keywords: ['コーチ ビジネスLP', 'コーチ LP デモ', '講師 ランディングページ サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/coach` },
  openGraph: {
    title: 'コーチ・講師 ビジネスLPデモ｜集客メーカー',
    description: 'コーチ・講師向けのビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/coach`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('コーチ・講師 ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コーチ・講師 ビジネスLPデモ｜集客メーカー',
    description: 'コーチ・講師向けのビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <CoachDemoClient />;
}
