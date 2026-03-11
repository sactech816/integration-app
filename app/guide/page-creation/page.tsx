import { Metadata } from 'next';
import PageCreationGuideClient from './PageCreationGuideClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'LP・ページ作成ガイド | 集客メーカー',
  description: 'プロフィールLP、ビジネスLP、ウェビナーLP、ガイドメーカー、ホームページメーカー、申し込みフォームの活用ガイド。AIで簡単にプロ品質のランディングページを作成する方法を解説。',
  keywords: ['LP作成', 'プロフィールLP', 'ビジネスLP', 'ウェビナーLP', 'ホームページ', 'ガイドメーカー', '申し込みフォーム', 'AI自動生成'],
  alternates: { canonical: `${siteUrl}/guide/page-creation` },
  openGraph: {
    title: 'LP・ページ作成ガイド | 集客メーカー',
    description: 'AIで簡単にプロ品質のLP・ページを作成。プロフィールLP・ビジネスLP・ウェビナーLPなど6つのツール活用法。',
    type: 'article',
    url: `${siteUrl}/guide/page-creation`,
    siteName: '集客メーカー',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'LP・ページ作成ガイド' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'LP・ページ作成 活用ガイド',
  description: 'プロフィールLP、ビジネスLP、ウェビナーLPなど6つのページ作成ツールの活用法',
  image: `${siteUrl}/og-image.png`,
  author: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  publisher: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/guide/page-creation` },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function PageCreationGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageCreationGuideClient />
    </>
  );
}
