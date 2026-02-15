import { Metadata } from 'next';
import KindleAgencyClient from './KindleAgencyClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'Kindle出版メーカー 代理店パートナー募集｜Kindle出版支援ビジネスを始めませんか',
  description: 'Kindle出版メーカーの代理店パートナーを募集中。お客様のKindle出版をサポートするビジネスを開始できます。高い報酬率と充実したサポート体制をご用意しています。',
  keywords: [
    'Kindle出版メーカー',
    'Kindle出版',
    '代理店',
    'パートナー',
    '副業',
    'ビジネス',
    '代理店募集',
    'アフィリエイト',
  ],
  alternates: {
    canonical: `${siteUrl}/kindle/agency`,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${siteUrl}/kindle/agency`,
    siteName: '集客メーカー',
    title: 'Kindle出版メーカー 代理店パートナー募集｜Kindle出版支援ビジネスを始めませんか',
    description: 'Kindle出版メーカーの代理店パートナーを募集中。お客様のKindle出版をサポートするビジネスを開始できます。',
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent('代理店パートナー募集')}&description=${encodeURIComponent('Kindle出版支援ビジネス')}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kindle出版メーカー 代理店パートナー募集｜Kindle出版支援ビジネスを始めませんか',
    description: 'Kindle出版メーカーの代理店パートナーを募集中。お客様のKindle出版をサポートするビジネスを開始できます。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('代理店パートナー募集')}&description=${encodeURIComponent('Kindle出版支援ビジネス')}`],
    creator: '@syukaku_maker',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function KindleAgencyPage() {
  return <KindleAgencyClient />;
}
