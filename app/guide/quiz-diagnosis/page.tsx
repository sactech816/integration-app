import { Metadata } from 'next';
import QuizDiagnosisGuideClient from './QuizDiagnosisGuideClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '診断・クイズ活用ガイド | 集客メーカー',
  description: '診断クイズ、Big Five性格診断、エンタメ診断の活用ガイド。リード獲得・SNS拡散に効果的な診断コンテンツの作り方を解説。',
  keywords: ['診断クイズ', 'Big Five', '性格診断', 'エンタメ診断', 'リード獲得', 'SNS拡散', 'AI自動生成'],
  alternates: { canonical: `${siteUrl}/guide/quiz-diagnosis` },
  openGraph: {
    title: '診断・クイズ活用ガイド | 集客メーカー',
    description: '診断クイズ・Big Five性格診断・エンタメ診断の3つのツール活用法。リード獲得とSNS拡散を最大化。',
    type: 'article',
    url: `${siteUrl}/guide/quiz-diagnosis`,
    siteName: '集客メーカー',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: '診断・クイズ活用ガイド' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '診断・クイズ 活用ガイド',
  description: '診断クイズ・Big Five性格診断・エンタメ診断の活用法',
  image: `${siteUrl}/og-image.png`,
  author: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  publisher: { '@type': 'Organization', name: '集客メーカー', url: siteUrl },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/guide/quiz-diagnosis` },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function QuizDiagnosisGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <QuizDiagnosisGuideClient />
    </>
  );
}
