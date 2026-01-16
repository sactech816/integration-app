import { Metadata } from 'next';
import ToolsPageClient from './ToolsPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '無料集客ツール一覧｜診断クイズ・アンケート・予約システムなど',
  description: '集客メーカーで使える無料ツール一覧。診断クイズメーカー、アンケート作成、予約システム、プロフィールLP、ビジネスLP、ゲーミフィケーションツールなど、あらゆる集客ツールが無料で使えます。',
  keywords: [
    '無料ツール',
    '集客ツール一覧',
    '診断クイズメーカー',
    'アンケート作成ツール',
    '予約システム',
    'プロフィールLP',
    'ビジネスLP',
    'マーケティングツール',
    '無料診断メーカー',
    '無料アンケートツール',
    '予約システム無料',
  ],
  alternates: {
    canonical: `${siteUrl}/tools`,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${siteUrl}/tools`,
    siteName: '集客メーカー',
    title: '無料集客ツール一覧｜診断クイズ・アンケート・予約システムなど',
    description: '集客メーカーで使える無料ツール一覧。診断クイズメーカー、アンケート作成、予約システムなど、あらゆる集客ツールが無料で使えます。',
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent('無料集客ツール一覧')}&description=${encodeURIComponent('診断クイズ・アンケート・予約システムなど')}`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '無料集客ツール一覧｜診断クイズ・アンケート・予約システムなど',
    description: '集客メーカーで使える無料ツール一覧。診断クイズメーカー、アンケート作成、予約システムなど、あらゆる集客ツールが無料で使えます。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('無料集客ツール一覧')}&description=${encodeURIComponent('診断クイズ・アンケート・予約システムなど')}`],
    creator: '@syukaku_maker',
  },
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
