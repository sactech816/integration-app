import { Metadata } from 'next';
import StartupPageClient from './StartupPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'これから起業・副業を始める方へ｜無料で集客の仕組みを作る｜集客メーカー',
  description: '起業準備中・副業を始めたい方向け。プロフィールLP・診断クイズ・SNS投稿メーカーを無料で使って、今日からあなたのビジネスを始めましょう。',
  keywords: [
    '起業 準備', '副業 始め方', '起業 集客', '無料 LP作成',
    'プロフィールLP', '診断クイズ 無料', 'SNS投稿 自動生成',
    '集客メーカー', '起業 ツール', '副業 集客',
  ],
  alternates: { canonical: `${siteUrl}/for/startup` },
  openGraph: {
    title: 'これから起業・副業を始める方へ｜集客の仕組みを無料で',
    description: 'プロフィールLP・診断クイズ・SNS投稿メーカーで今日からビジネスを始めよう。',
    url: `${siteUrl}/for/startup`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('これから起業・副業を始める方へ')}&description=${encodeURIComponent('無料で集客の仕組みを作る')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'これから起業・副業を始める方へ｜集客の仕組みを無料で',
    description: 'プロフィールLP・診断クイズ・SNS投稿メーカーを無料で。',
  },
};

export default function StartupPage() {
  return <StartupPageClient />;
}
