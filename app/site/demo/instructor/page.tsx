import { Metadata } from 'next';
import InstructorDemoClient from './InstructorDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '講師・コンサルサイトデモ｜マイサイトメーカー',
  description: '講師・コンサルタント向けサイトのデモです。プロフィール・サービス・実績・お問い合わせの構成をご覧いただけます。',
  alternates: { canonical: `${siteUrl}/site/demo/instructor` },
  openGraph: {
    title: '講師・コンサルサイトデモ｜集客メーカー',
    description: '講師・コンサルタント向けサイトのデモです。',
    url: `${siteUrl}/site/demo/instructor`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('講師・コンサルサイトデモ')}&type=mini-site`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '講師・コンサルサイトデモ｜集客メーカー',
    description: '講師・コンサルタント向けサイトのデモです。',
  },
};

export default function Page() {
  return <InstructorDemoClient />;
}
