import { Metadata } from 'next';
import MarketingGuideClient from './MarketingGuideClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '集客・マーケティングガイド | 集客メーカー',
  description: '予約管理、出欠管理、アンケート、メルマガ、ステップメール、ファネル、LINE連携の活用ガイド。集客からリード育成まで一気通貫のマーケティング。',
  keywords: ['予約管理', 'メルマガ', 'ステップメール', 'ファネル', 'アンケート', 'LINE連携', '集客', 'マーケティング'],
  alternates: { canonical: `${siteUrl}/guide/marketing` },
  openGraph: {
    title: '集客・マーケティングガイド | 集客メーカー',
    description: '予約・メルマガ・ステップメール・ファネルなど7つのマーケティングツール活用法。',
    type: 'article',
    url: `${siteUrl}/guide/marketing`,
    siteName: '集客メーカー',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: '集客・マーケティングガイド' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '集客・マーケティング 活用ガイド',
  description: '予約・メルマガ・ステップメール・ファネルなど7つのマーケティングツール活用法',
  image: `${siteUrl}/og-image.png`,
  author: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  publisher: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/guide/marketing` },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function MarketingGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingGuideClient />
    </>
  );
}
