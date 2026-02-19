import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'オンボーディングモーダルメーカー | 埋め込み可能なモーダルを簡単作成',
  description: 'サイトに埋め込めるオンボーディングモーダルを簡単に作成。ページ分割、アイコン、グラデーション、トリガー設定に対応。iframe・JSスニペットで外部サイトにも設置可能。',
  keywords: ['オンボーディング', 'モーダル作成', 'ウェルカムモーダル', 'チュートリアル', '埋め込みモーダル', 'ユーザーガイド'],
  openGraph: {
    title: 'オンボーディングモーダルメーカー | 埋め込み可能なモーダルを簡単作成',
    description: 'サイトに埋め込めるオンボーディングモーダルを簡単に作成。無料で今すぐ始められます。',
    url: `${siteUrl}/onboarding/editor`,
    type: 'website',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'オンボーディングモーダルメーカー',
  description: 'サイトに埋め込めるオンボーディングモーダルを簡単に作成できる無料ツール。外部サイトへの埋め込みにも対応。',
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
