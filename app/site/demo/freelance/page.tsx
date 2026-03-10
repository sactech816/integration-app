import { Metadata } from 'next';
import FreelanceDemoClient from './FreelanceDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'フリーランスサイトデモ｜マイサイトメーカー',
  description: 'フリーランス向けサイトのデモです。ポートフォリオ・スキル・料金・お問い合わせの構成をご覧いただけます。',
  alternates: { canonical: `${siteUrl}/site/demo/freelance` },
  openGraph: {
    title: 'フリーランスサイトデモ｜集客メーカー',
    description: 'フリーランス向けサイトのデモです。',
    url: `${siteUrl}/site/demo/freelance`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('フリーランスサイトデモ')}&type=mini-site`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'フリーランスサイトデモ｜集客メーカー',
    description: 'フリーランス向けサイトのデモです。',
  },
};

export default function Page() {
  return <FreelanceDemoClient />;
}
