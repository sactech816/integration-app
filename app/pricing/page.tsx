import { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '料金プラン・Proプランのご案内',
  description: '集客メーカーのProプランで使える全機能を詳しく解説。AI優先利用・アクセス解析・HTMLダウンロード・埋め込みコード・コピーライト非表示など、ビジネスを加速する機能が月額3,980円で使い放題。',
  keywords: ['集客メーカー 料金', '料金プラン', 'Proプラン', '集客ツール', '集客メーカー 価格', 'プロプラン メリット'],
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: '料金プラン・Proプランのご案内｜集客メーカー',
    description: 'Proプランで使える全機能を詳しく解説。AI優先利用・アクセス解析・HTMLダウンロードなど、ビジネスを加速する機能が月額3,980円。',
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('Proプランのご案内')}&description=${encodeURIComponent('ビジネスを次のステージへ')}&type=default`, width: 1200, height: 630, alt: '料金プラン｜集客メーカー' }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '料金プラン・Proプランのご案内｜集客メーカー',
    description: 'Proプランで使える全機能を詳しく解説。ビジネスを加速する機能が月額3,980円で使い放題。',
    creator: '@syukaku_maker',
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
