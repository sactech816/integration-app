import { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '料金プラン — ゲスト・フリー・スタンダード・ビジネス・プレミアム',
  description: '集客メーカーの料金プランを比較。フリープランはずっと無料で全ツール利用可能。AI機能・メルマガ・ファネル・ゲーミフィケーションなど、ビジネスの成長に合わせてプランをアップグレード。',
  keywords: ['集客メーカー 料金', '料金プラン', '無料 集客ツール', '集客メーカー 価格', 'フリープラン', 'ビジネスプラン'],
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: '料金プラン｜集客メーカー',
    description: 'フリープランはずっと無料。AI機能・メルマガ・ファネルなど、成長に合わせてアップグレード。月額¥1,980〜。',
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('料金プラン')}&description=${encodeURIComponent('無料から始めて、ビジネスに合わせてアップグレード')}&type=default`, width: 1200, height: 630, alt: '料金プラン｜集客メーカー' }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '料金プラン｜集客メーカー',
    description: 'フリープランはずっと無料。AI・メルマガ・ファネルなど月額¥1,980〜でアップグレード。',
    creator: '@syukaku_maker',
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
