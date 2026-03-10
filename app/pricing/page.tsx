import { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '料金プラン・有料プランのご案内',
  description: '集客メーカーの有料プランで使える全機能を詳しく解説。AI利用・アクセス解析・HTMLダウンロード・埋め込みコード・コピーライト非表示など、ビジネスを加速する機能が月額1,980円から。',
  keywords: ['集客メーカー 料金', '料金プラン', '有料プラン', '集客ツール', '集客メーカー 価格', 'サブスク プラン'],
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: '料金プラン・有料プランのご案内｜集客メーカー',
    description: '有料プランで使える全機能を詳しく解説。AI利用・アクセス解析・HTMLダウンロードなど、ビジネスを加速する機能が月額1,980円から。',
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('有料プランのご案内')}&description=${encodeURIComponent('ビジネスを次のステージへ')}&type=default`, width: 1200, height: 630, alt: '料金プラン｜集客メーカー' }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '料金プラン・有料プランのご案内｜集客メーカー',
    description: '有料プランで使える全機能を詳しく解説。ビジネスを加速する機能が月額1,980円から。',
    creator: '@syukaku_maker',
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
