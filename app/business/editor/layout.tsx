import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ビジネスLPメーカー | ランディングページを簡単作成',
  description: '商品・サービスのランディングページを無料で作成。CV最適化されたテンプレートでプロ品質のLPが簡単に完成。AI Flyer機能搭載。',
  keywords: ['ビジネスLP', 'ランディングページ作成', 'LP作成ツール', 'LP作成無料', 'セールスページ', 'コンバージョン最適化'],
  openGraph: {
    title: 'ビジネスLPメーカー | ランディングページを簡単作成',
    description: '商品・サービスのランディングページを無料で作成。CV最適化されたテンプレートですぐに始められます。',
    url: `${siteUrl}/business/editor`,
    type: 'website',
  },
};

// 構造化データ - SoftwareApplication
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ビジネスLPメーカー',
  description: '商品・サービスのランディングページを無料で作成できるツール。CV最適化されたテンプレートでプロ品質のLPが簡単に完成。',
  url: `${siteUrl}/business/editor`,
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
    'AI Flyer機能',
    'CV最適化テンプレート',
    '料金表作成',
    'FAQ作成',
    'お問い合わせフォーム',
    'レスポンシブデザイン',
  ],
};

export default function BusinessEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {children}
    </>
  );
}
