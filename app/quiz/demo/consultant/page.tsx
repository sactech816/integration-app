import { Metadata } from 'next';
import ConsultantDemoPage from './ConsultantDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コンサルタント診断クイズデモ',
  description: 'あなたのコンサルタントタイプを診断します。戦略型・実行型・共感型・分析型、あなたはどのタイプ？集客メーカーの診断クイズデモをお試しください。',
  keywords: ['コンサルタント 診断', 'コンサルタントタイプ診断', '診断クイズ デモ', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/quiz/demo/consultant` },
  openGraph: {
    title: 'コンサルタント診断クイズデモ｜集客メーカー',
    description: 'あなたのコンサルタントタイプを診断します。集客メーカーの診断クイズデモをお試しください。',
    url: `${siteUrl}/quiz/demo/consultant`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('コンサルタント診断クイズデモ')}&type=quiz`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コンサルタント診断クイズデモ｜集客メーカー',
    description: 'あなたのコンサルタントタイプを診断します。集客メーカーの診断クイズデモをお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ConsultantDemoPage />;
}
