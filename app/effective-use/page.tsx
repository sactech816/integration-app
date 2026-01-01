import { Metadata } from 'next';
import EffectiveUsePageClient from './EffectiveUsePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '効果的な活用法9選',
  description: '診断クイズ・プロフィールLP・ビジネスLPを最大限に活かす効果的な活用法9選。SNS拡散、SEO対策、リード獲得、リアル店舗活用など、集客と売上につなげる具体的なアイデアを紹介。成功事例から学ぶ実践的なノウハウ。',
  keywords: ['集客', '活用法', 'SNS拡散', 'SEO対策', 'リード獲得', '診断クイズ', 'LP', 'マーケティング戦略', '集客方法'],
  alternates: {
    canonical: `${siteUrl}/effective-use`,
  },
  openGraph: {
    title: '効果的な活用法9選 | 集客メーカー | 診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '診断クイズ・LP を最大限に活かす効果的な活用法。集客と売上につなげる具体的なアイデア。',
    type: 'article',
    url: `${siteUrl}/effective-use`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '集客メーカー 効果的な活用法',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '効果的な活用法9選 | 集客メーカー',
    description: '診断クイズ・LPで集客と売上を最大化する方法',
    images: [`${siteUrl}/og-image.png`],
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '集客メーカーの効果的な活用法9選',
  description: '診断クイズ・プロフィールLP・ビジネスLPを最大限に活かし、集客と売上につなげるための具体的なアイデア',
  image: `${siteUrl}/og-image.png`,
  author: {
    '@type': 'Organization',
    name: '集客メーカー',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: '集客メーカー',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteUrl}/effective-use`,
  },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function EffectiveUsePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EffectiveUsePageClient />
    </>
  );
}
















































