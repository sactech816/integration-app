import { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '料金プラン',
  description: '集客メーカーの料金プラン。無料プランですべての基本機能をお試し。Proプランは月額3,980円で全機能が無制限。',
  keywords: ['集客メーカー 料金', '料金プラン', '無料 集客ツール', 'Pro プラン', '集客メーカー 価格'],
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: '料金プラン｜集客メーカー',
    description: '集客メーカーの料金プラン。無料プランですべての基本機能をお試し。Proプランは月額3,980円で全機能が無制限。',
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('わかりやすい料金プラン')}&description=${encodeURIComponent('無料プランですべての基本機能をお試し')}&type=default`, width: 1200, height: 630, alt: '料金プラン｜集客メーカー' }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '料金プラン｜集客メーカー',
    description: '集客メーカーの料金プラン。無料プランですべての基本機能をお試し。Proプランは月額3,980円で全機能が無制限。',
    creator: '@syukaku_maker',
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
