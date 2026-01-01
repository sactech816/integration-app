import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: '集客メーカーへのお問い合わせページ。機能へのご要望、不具合のご報告、その他ご質問はこちらからお送りください。診断クイズ・プロフィールLP・ビジネスLP作成に関するサポートもお気軽にどうぞ。',
  keywords: ['お問い合わせ', 'サポート', '質問', '要望', 'バグ報告', '集客メーカー'],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'お問い合わせ | 集客メーカー | 診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '集客メーカーへのお問い合わせはこちら。機能のご要望や不具合報告を受け付けています。',
    type: 'website',
    url: `${siteUrl}/contact`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '集客メーカー お問い合わせ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'お問い合わせ | 集客メーカー',
    description: '集客メーカーへのお問い合わせ',
    images: [`${siteUrl}/og-image.png`],
  },
};

// 構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'お問い合わせ',
  description: '集客メーカーへのお問い合わせページ',
  url: `${siteUrl}/contact`,
  mainEntity: {
    '@type': 'Organization',
    name: '集客メーカー',
    url: siteUrl,
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPageClient />
    </>
  );
}
















































