import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.makers.tokyo';

export const metadata: Metadata = {
  title: '診断クイズメーカー | AIで診断クイズを簡単作成',
  description: '性格診断、適職診断、心理テスト、検定クイズ、占いなどをAIが自動生成。質問と結果を入力するだけで本格的な診断コンテンツが完成。無料で今すぐ始められます。',
  keywords: ['診断クイズ', '診断クイズ作成', '性格診断作成', '心理テスト作成', 'AI診断', '無料診断ツール'],
  openGraph: {
    title: '診断クイズメーカー | AIで診断クイズを簡単作成',
    description: '性格診断、適職診断、心理テスト、検定クイズ、占いなどをAIが自動生成。無料で今すぐ始められます。',
    url: `${siteUrl}/quiz/editor`,
    type: 'website',
  },
};

// 構造化データ - SoftwareApplication
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '診断クイズメーカー',
  description: 'AIを使って性格診断、適職診断、心理テスト、検定クイズ、占いなどの診断コンテンツを簡単に作成できる無料ツール',
  url: `${siteUrl}/quiz/editor`,
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
    'AI自動生成',
    '性格診断作成',
    '適職診断作成',
    '心理テスト作成',
    '検定クイズ作成',
    '占い作成',
    'SNSシェア機能',
    'アクセス解析',
  ],
};

export default function QuizEditorLayout({
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
