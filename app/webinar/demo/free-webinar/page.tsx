import { Metadata } from 'next';
import DemoClient from './FreeWebinarDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '無料ウェビナー集客デモ｜ウェビナーLPメーカー',
  description: '無料ウェビナー集客用のランディングページデモです。SNS集客セミナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
  keywords: ['ウェビナーLP デモ', 'ウェビナー テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/webinar/demo/free-webinar` },
  openGraph: {
    title: '無料ウェビナー集客デモ｜集客メーカー',
    description: '無料ウェビナー集客用のランディングページデモです。SNS集客セミナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    url: `${siteUrl}/webinar/demo/free-webinar`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('無料ウェビナー集客デモ')}&type=webinar`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '無料ウェビナー集客デモ｜集客メーカー',
    description: '無料ウェビナー集客用のランディングページデモです。SNS集客セミナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <DemoClient />;
}
