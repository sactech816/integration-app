import { Metadata } from 'next';
import StarterPageClient from './StarterPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'これから起業する方へ｜無料の集客ツールで始める起業準備｜集客メーカー',
  description: '起業準備中・副業を始めたい方向け。プロフィールLP無料作成・診断クイズ無料作成・SNS投稿自動生成で「あなたを知ってもらう仕組み」をテンプレートから簡単作成。クレカ不要・ずっと無料。',
  keywords: [
    '起業 集客', '起業準備 ツール', '起業 無料ツール', '副業 集客',
    'プロフィールLP 無料', '診断クイズ 無料作成', 'SNS投稿 自動生成',
    '集客メーカー', '起業 はじめ方', 'LP作成 無料', 'ランディングページ 無料',
    'フリーランス 集客', '個人事業主 集客ツール',
  ],
  alternates: { canonical: `${siteUrl}/for/starter` },
  openGraph: {
    title: 'これから起業する方へ｜無料の集客ツールで始める起業準備',
    description: 'プロフィールLP・診断クイズ・SNS投稿で「自分を知ってもらう仕組み」をつくろう。テンプレートを選ぶだけで今日から始められます。',
    url: `${siteUrl}/for/starter`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('これから起業する方へ')}&description=${encodeURIComponent('無料の集客ツールで始める起業準備')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'これから起業する方へ｜無料の集客ツールで始める起業準備',
    description: 'プロフィールLP・診断クイズ・SNS投稿で「自分を知ってもらう仕組み」を無料で。',
  },
};

export default function StarterPage() {
  return <StarterPageClient />;
}
