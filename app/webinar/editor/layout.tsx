import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ウェビナーLPメーカー | ウェビナーランディングページを簡単作成',
  description: 'ウェビナー・オンラインセミナー専用のランディングページを無料で作成。動画埋め込み・カウントダウン・時間制御CTA搭載。',
  keywords: ['ウェビナーLP', 'オンラインセミナー', 'ランディングページ作成', 'ウェビナー作成ツール'],
  openGraph: {
    title: 'ウェビナーLPメーカー | ウェビナーランディングページを簡単作成',
    description: 'ウェビナー・オンラインセミナー専用のランディングページを無料で作成。動画埋め込み・カウントダウン・時間制御CTA搭載。',
    url: `${siteUrl}/webinar/editor`,
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ウェビナーLPメーカー',
  description: 'ウェビナー・オンラインセミナー専用のランディングページを無料で作成できるツール。',
  url: `${siteUrl}/webinar/editor`,
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
    '動画埋め込み（YouTube/Vimeo）',
    'カウントダウンタイマー',
    '時間制御CTA',
    '講師紹介セクション',
    'レスポンシブデザイン',
  ],
};

export default function WebinarEditorLayout({
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
