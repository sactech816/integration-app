import { Metadata } from 'next';
import BusinessPasonaDemoPage from './PasonaDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'PASONA法則 ビジネスLPデモ',
  description: 'PASONA法則（Problem・Affinity・Solution・Offer・Narrowing・Action）に基づくビジネスLPデモです。問題提起から行動喚起まで、効果的なLP構成を体験できます。',
  keywords: ['PASONA法則 LP', 'ビジネスLP デモ', 'PASONA ランディングページ', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/business/demo/pasona` },
  openGraph: {
    title: 'PASONA法則 ビジネスLPデモ｜集客メーカー',
    description: 'PASONA法則に基づくビジネスLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/business/demo/pasona`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('PASONA法則 ビジネスLPデモ')}&type=business`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PASONA法則 ビジネスLPデモ｜集客メーカー',
    description: 'PASONA法則に基づくビジネスLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <BusinessPasonaDemoPage />;
}
