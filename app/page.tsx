import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '集客メーカー｜診断クイズ・プロフィールLP・ビジネスLPが簡単作成。SNS拡散・SEO対策で集客を加速',
  description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策であなたのビジネスに顧客を引き寄せる集客ツール。無料で今すぐ始められます。',
  keywords: [
    '集客メーカー',
    '集客ツール',
    '診断クイズ',
    '診断クイズ作成',
    '診断コンテンツ',
    '性格診断作成',
    'プロフィールLP',
    'プロフィールサイト',
    'リンクまとめ',
    'ビジネスLP',
    'ランディングページ作成',
    'LP作成ツール',
    'LP作成無料',
    'AI自動生成',
    'AIツール',
    'SNS集客',
    'SEO対策',
    'リード獲得',
    '見込み客獲得',
    '無料ツール',
    'マーケティングツール',
    'コンテンツマーケティング',
    'lit.link代替',
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: '集客メーカー｜診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策で集客を加速。無料で今すぐ始められます。',
    url: siteUrl,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('診断クイズ・プロフィールLP・ビジネスLPを簡単作成')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '集客メーカー｜診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策で集客を加速。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('診断クイズ・プロフィールLP・ビジネスLPを簡単作成')}`],
  },
};

// 構造化データ - SoftwareApplication（トップページ用）
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '集客メーカー',
  description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成できる無料の集客ツール。SNS拡散・SEO対策で顧客を引き寄せるコンテンツを作成。',
  url: siteUrl,
  applicationCategory: 'WebApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  creator: {
    '@type': 'Organization',
    name: '集客メーカー',
    url: siteUrl,
  },
  featureList: [
    '診断クイズ作成',
    'プロフィールLP作成',
    'ビジネスLP作成',
    'AI自動生成',
    'SNSシェア機能',
    'SEO対策',
    'アクセス解析',
    '無料利用可能',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '100',
  },
};

// 構造化データ - WebApplication（より詳細な情報）
const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '集客メーカー',
  url: siteUrl,
  description: '診断クイズ、プロフィールLP、ビジネスLPをAIで簡単作成。SNS拡散・SEO対策で集客を加速する無料ツール。',
  applicationCategory: 'BusinessApplication',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '1.0',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
  },
};

// 構造化データ - ItemList（提供サービス一覧）
const serviceListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '集客メーカーのサービス一覧',
  description: '集客メーカーで作成できるコンテンツタイプ',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '診断クイズメーカー',
      description: '性格診断、適職診断、心理テスト、検定クイズ、占いなどをAIで自動生成',
      url: `${siteUrl}/quiz/editor`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'プロフィールメーカー',
      description: 'SNSプロフィールに最適なリンクまとめページを作成。lit.link代替ツール',
      url: `${siteUrl}/profile/editor`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'ビジネスLPメーカー',
      description: '商品・サービスのランディングページを無料で作成。CV最適化テンプレート搭載',
      url: `${siteUrl}/business/editor`,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* 構造化データ - SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {/* 構造化データ - WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      {/* 構造化データ - ItemList（サービス一覧） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceListSchema) }}
      />
      <HomePageClient />
    </>
  );
}

