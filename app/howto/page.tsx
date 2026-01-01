import { Metadata } from 'next';
import HowToPageClient from './HowToPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '使い方・機能一覧',
  description: '集客メーカーの使い方ガイド。診断クイズ・プロフィールLP・ビジネスLPの作成方法、機能一覧、料金プランをご紹介します。AI自動生成で簡単にプロ品質のコンテンツが作れます。初心者でも安心の分かりやすい解説。',
  keywords: ['集客メーカー', '使い方', '機能一覧', '診断クイズ作成', 'LP作成', 'AI自動生成', 'チュートリアル', 'ガイド'],
  alternates: {
    canonical: `${siteUrl}/howto`,
  },
  openGraph: {
    title: '使い方・機能一覧 | 集客メーカー | 診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。使い方ガイドと機能一覧。',
    type: 'website',
    url: `${siteUrl}/howto`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '集客メーカー 使い方ガイド',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '使い方・機能一覧 | 集客メーカー',
    description: '診断クイズ・LP作成の使い方を分かりやすく解説',
    images: [`${siteUrl}/og-image.png`],
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '集客メーカーの使い方',
  description: '診断クイズ・プロフィールLP・ビジネスLPの作成方法をステップバイステップで解説',
  image: `${siteUrl}/og-image.png`,
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'コンテンツタイプを選択',
      text: '診断クイズ、プロフィールLP、ビジネスLPから作成するコンテンツを選びます',
      url: `${siteUrl}/howto#step1`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'AI自動生成またはテンプレート選択',
      text: 'テーマを入力してAI自動生成、またはテンプレートから選択して作成開始',
      url: `${siteUrl}/howto#step2`,
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'カスタマイズ',
      text: 'エディタでデザイン、コンテンツ、CTAボタンなどをカスタマイズ',
      url: `${siteUrl}/howto#step3`,
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '公開・シェア',
      text: '保存するとURLが自動発行。SNSでシェアして集客開始',
      url: `${siteUrl}/howto#step4`,
    },
  ],
  totalTime: 'PT5M',
  tool: ['Webブラウザ', 'インターネット接続'],
  supply: [],
};

export default function HowToPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HowToPageClient />
    </>
  );
}
















































