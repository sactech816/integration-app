import { Metadata } from 'next';
import DemoClient from './RecordedSeminarDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '録画セミナー販売デモ｜ウェビナーLPメーカー',
  description: '録画セミナー販売用のランディングページデモです。Webマーケティング完全講座をテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
  keywords: ['ウェビナーLP デモ', 'ウェビナー テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/webinar/demo/recorded-seminar` },
  openGraph: {
    title: '録画セミナー販売デモ｜集客メーカー',
    description: '録画セミナー販売用のランディングページデモです。Webマーケティング完全講座をテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    url: `${siteUrl}/webinar/demo/recorded-seminar`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('録画セミナー販売デモ')}&type=webinar`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '録画セミナー販売デモ｜集客メーカー',
    description: '録画セミナー販売用のランディングページデモです。Webマーケティング完全講座をテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <DemoClient />;
}
