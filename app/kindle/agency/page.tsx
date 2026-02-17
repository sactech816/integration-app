import { Metadata } from 'next';
import KindleAgencyClient from './KindleAgencyClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'Kindle出版メーカー 代理店パートナー募集｜Kindle出版支援ビジネスで新たな収益の柱を',
  description: 'AIを活用したKindle出版システム「KDL」の代理店パートナーを10社限定で募集中。専門知識ゼロでも出版プロデューサーに。高利益率＆セット販売で高単価パッケージ化を実現します。',
  keywords: [
    'Kindle出版メーカー',
    'Kindle出版',
    '代理店',
    'パートナー',
    '出版プロデューサー',
    'ビジネス',
    '代理店募集',
    'KDL',
    'AI出版',
  ],
  alternates: {
    canonical: `${siteUrl}/kindle/agency`,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${siteUrl}/kindle/agency`,
    siteName: '集客メーカー',
    title: 'Kindle出版メーカー 代理店パートナー募集｜Kindle出版支援ビジネスで新たな収益の柱を',
    description: 'AIを活用したKindle出版システム「KDL」の代理店パートナーを10社限定で募集中。高利益率＆セット販売で高単価パッケージ化を実現。',
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
    title: 'Kindle出版メーカー 代理店パートナー募集｜Kindle出版支援ビジネスで新たな収益の柱を',
    description: 'AIを活用したKindle出版システム「KDL」の代理店パートナーを10社限定で募集中。高利益率＆セット販売で高単価パッケージ化を実現。',
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
