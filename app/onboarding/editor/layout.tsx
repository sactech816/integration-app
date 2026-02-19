import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'はじめかたメーカー | 埋め込み可能なガイドを簡単作成',
  description: 'サイトに埋め込めるはじめかたガイドを簡単に作成。ページ分割、アイコン、グラデーション、トリガー設定に対応。iframe・JSスニペットで外部サイトにも設置可能。',
  keywords: ['はじめかたガイド', 'ガイド作成', 'ウェルカムガイド', 'チュートリアル', '埋め込みガイド', 'ユーザーガイド'],
  openGraph: {
    title: 'はじめかたメーカー | 埋め込み可能なガイドを簡単作成',
    description: 'サイトに埋め込めるはじめかたガイドを簡単に作成。無料で今すぐ始められます。',
    url: `${siteUrl}/onboarding/editor`,
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'はじめかたメーカー',
  description: 'サイトに埋め込めるはじめかたガイドを簡単に作成できる無料ツール。外部サイトへの埋め込みにも対応。',
  url: `${siteUrl}/onboarding/editor`,
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
    'マルチページモーダル',
    'アイコンカスタマイズ',
    'グラデーションデザイン',
    'トリガー設定',
    'iframe埋め込み',
    'JavaScriptスニペット',
    'SNSシェア機能',
  ],
};

export default function OnboardingEditorLayout({
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
