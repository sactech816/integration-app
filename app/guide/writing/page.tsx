import { Metadata } from 'next';
import WritingGuideClient from './WritingGuideClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'ライティング・制作ガイド | 集客メーカー',
  description: 'セールスライター、サムネイルメーカー、SNS投稿メーカー、Kindle出版メーカー、ネタ発掘の活用ガイド。AIで効率的にコンテンツを制作する方法。',
  keywords: ['セールスライター', 'サムネイル', 'SNS投稿', 'Kindle出版', 'ネタ発掘', 'AIライティング', 'コンテンツ制作'],
  alternates: { canonical: `${siteUrl}/guide/writing` },
  openGraph: {
    title: 'ライティング・制作ガイド | 集客メーカー',
    description: 'セールスライター・サムネイル・SNS投稿・Kindle出版など5つの制作ツール活用法。',
    type: 'article',
    url: `${siteUrl}/guide/writing`,
    siteName: '集客メーカー',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'ライティング・制作ガイド' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'ライティング・制作 活用ガイド',
  description: 'セールスライター・サムネイル・SNS投稿・Kindle出版・ネタ発掘の活用法',
  image: `${siteUrl}/og-image.png`,
  author: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  publisher: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/guide/writing` },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function WritingGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WritingGuideClient />
    </>
  );
}
