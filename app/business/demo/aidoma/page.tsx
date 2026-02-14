import { Metadata } from 'next';
import BusinessAidomaDemoPage from './AidomaDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'AIDOMA ビジネスLPデモ',
  description: 'AIDOMA法則（Attention・Interest・Desire・Objection・Motive・Action）に基づくビジネスLPデモです。注意喚起から行動喚起まで、効果的なLP構成を体験できます。',
  keywords: ['AIDOMA法則 LP', 'ビジネスLP デモ', 'AIDOMA ランディングページ', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/aidoma` },
  openGraph: {
    title: 'AIDOMA ビジネスLPデモ｜集客メーカー',
    description: 'AIDOMA法則に基づくビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/aidoma`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('AIDOMA ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIDOMA ビジネスLPデモ｜集客メーカー',
    description: 'AIDOMA法則に基づくビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <BusinessAidomaDemoPage />;
}
