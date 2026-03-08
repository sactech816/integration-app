import { Metadata } from 'next';
import DemoClient from './SeriesSeminarDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'セミナーシリーズデモ｜ウェビナーLPメーカー',
  description: 'セミナーシリーズ用のランディングページデモです。全3回のビジネス設計講座をテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
  keywords: ['ウェビナーLP デモ', 'ウェビナー テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/webinar/demo/series-seminar` },
  openGraph: {
    title: 'セミナーシリーズデモ｜集客メーカー',
    description: 'セミナーシリーズ用のランディングページデモです。全3回のビジネス設計講座をテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    url: `${siteUrl}/webinar/demo/series-seminar`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('セミナーシリーズデモ')}&type=webinar`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'セミナーシリーズデモ｜集客メーカー',
    description: 'セミナーシリーズ用のランディングページデモです。全3回のビジネス設計講座をテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <DemoClient />;
}
