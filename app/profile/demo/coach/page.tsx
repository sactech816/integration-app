import { Metadata } from 'next';
import ProfileCoachDemoPage from './CoachDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コーチ プロフィールLPデモ',
  description: 'コーチ・講師向けのプロフィールLPデモです。自己紹介、サービス内容、実績、お客様の声をまとめて表示できます。集客メーカーでお試しください。',
  keywords: ['コーチ プロフィールLP', 'コーチ ホームページ デモ', '講師 LP サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/profile/demo/coach` },
  openGraph: {
    title: 'コーチ プロフィールLPデモ｜集客メーカー',
    description: 'コーチ・講師向けのプロフィールLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/profile/demo/coach`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('コーチ プロフィールLPデモ')}&type=profile`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コーチ プロフィールLPデモ｜集客メーカー',
    description: 'コーチ・講師向けのプロフィールLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ProfileCoachDemoPage />;
}
