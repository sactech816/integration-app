import { Metadata } from 'next';
import DemoClient from './ProductDemoDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'プロダクトデモデモ｜ウェビナーLPメーカー',
  description: 'プロダクトデモ用のランディングページデモです。SaaSプロダクトのデモウェビナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
  keywords: ['ウェビナーLP デモ', 'ウェビナー テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/webinar/demo/product-demo` },
  openGraph: {
    title: 'プロダクトデモデモ｜集客メーカー',
    description: 'プロダクトデモ用のランディングページデモです。SaaSプロダクトのデモウェビナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    url: `${siteUrl}/webinar/demo/product-demo`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('プロダクトデモデモ')}&type=webinar`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プロダクトデモデモ｜集客メーカー',
    description: 'プロダクトデモ用のランディングページデモです。SaaSプロダクトのデモウェビナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <DemoClient />;
}
