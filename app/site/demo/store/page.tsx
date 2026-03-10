import { Metadata } from 'next';
import StoreDemoClient from './StoreDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '店舗サイトデモ｜マイサイトメーカー',
  description: '店舗向けサイトのデモです。メニュー・アクセス・お問い合わせが揃った複数ページ構成をご覧いただけます。',
  alternates: { canonical: `${siteUrl}/site/demo/store` },
  openGraph: {
    title: '店舗サイトデモ｜集客メーカー',
    description: '店舗向けサイトのデモです。メニュー・アクセス・お問い合わせが揃った複数ページ構成をご覧いただけます。',
    url: `${siteUrl}/site/demo/store`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('店舗サイトデモ')}&type=mini-site`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '店舗サイトデモ｜集客メーカー',
    description: '店舗向けサイトのデモです。メニュー・アクセス・お問い合わせが揃った複数ページ構成をご覧いただけます。',
  },
};

export default function Page() {
  return <StoreDemoClient />;
}
