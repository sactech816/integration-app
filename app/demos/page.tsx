import { Metadata } from 'next';
import DemosPageClient from './DemosPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'デモ一覧｜各ツールのテンプレートを実際に体験',
  description: '診断クイズ、プロフィールLP、ビジネスLP、アンケート、セールスライターの各種テンプレートのデモをご覧いただけます。実際の動作を確認してから作成できます。',
  keywords: [
    'デモ',
    'テンプレート',
    'サンプル',
    '診断クイズ デモ',
    'プロフィールLP デモ',
    'ビジネスLP デモ',
    'アンケート デモ',
    'セールスライター テンプレート',
    'セールスレター テンプレート',
    '集客ツール デモ',
  ],
  alternates: {
    canonical: `${siteUrl}/demos`,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${siteUrl}/demos`,
    siteName: '集客メーカー',
    title: 'デモ一覧｜各ツールのテンプレートを実際に体験',
    description: '診断クイズ、プロフィールLP、ビジネスLP、アンケート、セールスライターの各種テンプレートのデモをご覧いただけます。',
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent('デモ一覧')}&description=${encodeURIComponent('各ツールのテンプレートを体験')}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'デモ一覧｜各ツールのテンプレートを実際に体験',
    description: '診断クイズ、プロフィールLP、ビジネスLP、アンケート、セールスライターの各種テンプレートのデモをご覧いただけます。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('デモ一覧')}&description=${encodeURIComponent('各ツールのテンプレートを体験')}`],
    creator: '@syukaku_maker',
  },
};

export default function DemosPage() {
  return <DemosPageClient />;
}
