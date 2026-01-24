import { Metadata } from 'next';
import EffectiveUseClient from './EffectiveUseClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'ゲーミフィケーションの効果的な利用方法 | 集客メーカー',
  description: 'スタンプラリー、ログインボーナス、ガチャ、スロットなど7つのゲーミフィケーション機能を効果的に活用する方法を解説。ユーザーエンゲージメントを高め、リピート訪問を促進するための具体的なアイデアを紹介します。',
  keywords: ['ゲーミフィケーション', 'スタンプラリー', 'ログインボーナス', 'ガチャ', 'ポイント', 'エンゲージメント', '集客', 'リテンション'],
  alternates: {
    canonical: `${siteUrl}/gamification/effective-use`,
  },
  openGraph: {
    title: 'ゲーミフィケーションの効果的な利用方法 | 集客メーカー',
    description: 'スタンプラリー、ログインボーナス、ガチャなど7つの機能でユーザーエンゲージメントを最大化',
    type: 'article',
    url: `${siteUrl}/gamification/effective-use`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '集客メーカー ゲーミフィケーション活用法',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ゲーミフィケーションの効果的な利用方法 | 集客メーカー',
    description: '7つのゲーム機能でユーザーエンゲージメントを最大化',
    images: [`${siteUrl}/og-image.png`],
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'ゲーミフィケーションの効果的な利用方法',
  description: 'スタンプラリー、ログインボーナス、ガチャなど7つのゲーミフィケーション機能を効果的に活用する方法',
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
    '@id': `${siteUrl}/gamification/effective-use`,
  },
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function GamificationEffectiveUsePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EffectiveUseClient />
    </>
  );
}
