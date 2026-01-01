import { Metadata } from 'next';
import SellingContentPageClient from './SellingContentPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '売れるコンテンツの作り方',
  description: '思わず行動したくなる「売れるコンテンツ」の鉄板ロジック。ターゲット設定、キャッチコピー、CTA設計、心理トリガーを押さえた効果的なコンテンツの作り方を解説。コンバージョン率を高めるための実践ノウハウを公開。',
  keywords: ['売れるコンテンツ', 'コピーライティング', 'CTA', 'マーケティング', '心理学', 'LP作成', 'コンバージョン', 'セールスライティング'],
  alternates: {
    canonical: `${siteUrl}/selling-content`,
  },
  openGraph: {
    title: '売れるコンテンツの作り方 | 集客メーカー | 診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '思わず行動したくなる「売れるコンテンツ」の鉄板ロジック。心理トリガーを押さえた効果的な作り方。',
    type: 'article',
    url: `${siteUrl}/selling-content`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '売れるコンテンツの作り方',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '売れるコンテンツの作り方 | 集客メーカー',
    description: '心理トリガーを押さえた売れるコンテンツの作り方',
    images: [`${siteUrl}/og-image.png`],
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '売れるコンテンツの作り方 - 鉄板ロジック9選',
  description: '人が動く心理トリガーを押さえた、効果的なコンテンツの作り方を伝授',
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
    '@id': `${siteUrl}/selling-content`,
  },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
  articleSection: 'マーケティング',
  keywords: ['コピーライティング', 'CTA', '心理学', 'マーケティング'],
};

export default function SellingContentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SellingContentPageClient />
    </>
  );
}
















































