import { Metadata } from 'next';
import MonetizationGuideClient from './MonetizationGuideClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '収益化・販売ガイド | 集客メーカー',
  description: 'ゲーミフィケーション、スキルマーケット、アフィリエイトの活用ガイド。集客メーカーで収益化する方法を解説。ポイント制・クーポン・スキル出品・アフィリエイト報酬の仕組み。',
  keywords: ['ゲーミフィケーション', 'スキルマーケット', 'アフィリエイト', '収益化', 'ポイント制', 'クーポン'],
  alternates: { canonical: `${siteUrl}/guide/monetization` },
  openGraph: {
    title: '収益化・販売ガイド | 集客メーカー',
    description: 'ゲーミフィケーション・スキルマーケット・アフィリエイトの3つの収益化ツール活用法。',
    type: 'article',
    url: `${siteUrl}/guide/monetization`,
    siteName: '集客メーカー',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: '収益化・販売ガイド' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '収益化・販売 活用ガイド',
  description: 'ゲーミフィケーション・スキルマーケット・アフィリエイトの活用法',
  image: `${siteUrl}/og-image.png`,
  author: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  publisher: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/guide/monetization` },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function MonetizationGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MonetizationGuideClient />
    </>
  );
}
