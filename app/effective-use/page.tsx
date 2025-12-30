import { Metadata } from 'next';
import EffectiveUsePageClient from './EffectiveUsePageClient';

export const metadata: Metadata = {
  title: '効果的な活用法9選 | 集客メーカー',
  description: '診断クイズ・プロフィールLP・ビジネスLPを最大限に活かす効果的な活用法9選。SNS拡散、SEO対策、リード獲得、リアル店舗活用など、集客と売上につなげる具体的なアイデアを紹介。',
  keywords: ['集客', '活用法', 'SNS拡散', 'SEO対策', 'リード獲得', '診断クイズ', 'LP'],
  openGraph: {
    title: '効果的な活用法9選 | 集客メーカー',
    description: '診断クイズ・LP を最大限に活かす効果的な活用法。集客と売上につなげる具体的なアイデア。',
    type: 'article',
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '集客メーカーの効果的な活用法9選',
  description: '診断クイズ・プロフィールLP・ビジネスLPを最大限に活かし、集客と売上につなげるための具体的なアイデア',
  author: {
    '@type': 'Organization',
    name: '集客メーカー',
  },
  publisher: {
    '@type': 'Organization',
    name: '集客メーカー',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://example.com/effective-use',
  },
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

















