import { Metadata } from 'next';
import KindleAuthorDemoPage from './KindleAuthorDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'Kindle著者タイプ診断デモ',
  description: 'あなたのKindle著者タイプを診断します。どんなジャンル・スタイルの本が向いているか発見できます。集客メーカーの診断クイズデモをお試しください。',
  keywords: ['Kindle著者 診断', 'Kindle出版 タイプ診断', '著者タイプ診断 デモ', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/quiz/demo/kindle-author` },
  openGraph: {
    title: 'Kindle著者タイプ診断デモ｜集客メーカー',
    description: 'あなたのKindle著者タイプを診断します。集客メーカーの診断クイズデモをお試しください。',
    url: `${siteUrl}/quiz/demo/kindle-author`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('Kindle著者タイプ診断デモ')}&type=quiz`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kindle著者タイプ診断デモ｜集客メーカー',
    description: 'あなたのKindle著者タイプを診断します。集客メーカーの診断クイズデモをお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <KindleAuthorDemoPage />;
}
