import { Metadata } from 'next';
import AnnouncementsPageClient from './AnnouncementsPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'お知らせ',
  description: '集客メーカーからのお知らせ・更新情報をご確認いただけます。新機能リリース、アップデート情報、メンテナンス情報などを掲載しています。診断クイズ・プロフィールLP・ビジネスLP作成ツールの最新情報をチェック。',
  keywords: ['集客メーカー', 'お知らせ', '更新情報', '新機能', 'アップデート', 'メンテナンス'],
  alternates: {
    canonical: `${siteUrl}/announcements`,
  },
  openGraph: {
    title: 'お知らせ | 集客メーカー | 診断クイズ・プロフィールLP・ビジネスLPが簡単作成',
    description: '集客メーカーからのお知らせ・更新情報をご確認いただけます。新機能リリース、アップデート情報を掲載。',
    type: 'website',
    url: `${siteUrl}/announcements`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '集客メーカー お知らせ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'お知らせ | 集客メーカー',
    description: '集客メーカーからのお知らせ・更新情報',
    images: [`${siteUrl}/og-image.png`],
  },
};

// 構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'お知らせ',
  description: '集客メーカーからのお知らせ・更新情報',
  url: `${siteUrl}/announcements`,
  isPartOf: {
    '@type': 'WebSite',
    name: '集客メーカー',
    url: siteUrl,
  },
};

export default function AnnouncementsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnnouncementsPageClient />
    </>
  );
}















































