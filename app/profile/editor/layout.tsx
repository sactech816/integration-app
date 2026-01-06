import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.makers.tokyo';

export const metadata: Metadata = {
  title: 'プロフィールメーカー | リンクまとめページを簡単作成',
  description: 'SNSプロフィールに最適なリンクまとめページを無料で作成。おしゃれなテンプレートで自己紹介ページが簡単に完成。lit.link代替ツール。',
  keywords: ['プロフィールLP', 'リンクまとめ', 'lit.link代替', 'プロフィールサイト', 'リンクインビオ', 'SNSリンク'],
  openGraph: {
    title: 'プロフィールメーカー | リンクまとめページを簡単作成',
    description: 'SNSプロフィールに最適なリンクまとめページを無料で作成。おしゃれなテンプレートですぐに始められます。',
    url: `${siteUrl}/profile/editor`,
    type: 'website',
  },
};

// 構造化データ - SoftwareApplication
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'プロフィールメーカー',
  description: 'SNSプロフィールに最適なリンクまとめページを無料で作成できるツール。おしゃれなテンプレートで自己紹介ページが簡単に完成。',
  url: `${siteUrl}/profile/editor`,
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
    'ブロック形式エディター',
    'おしゃれなテンプレート',
    'LINE公式アカウント連携',
    'YouTube埋め込み',
    'SNSリンク設定',
    'カスタムデザイン',
  ],
};

export default function ProfileEditorLayout({
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
