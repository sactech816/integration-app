import { Metadata } from 'next';
import ShigyouPageClient from './ShigyouPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '士業の方へ（税理士・行政書士・社労士）｜信頼と専門性で選ばれる集客ツール｜集客メーカー',
  description: '税理士・行政書士・社労士・司法書士向け。診断クイズで見込み客を獲得し、プロフィールLPで専門性を可視化、メルマガで信頼を育てて相談予約につなげる仕組みを無料で構築。',
  keywords: [
    '士業 集客', '税理士 集客', '行政書士 集客', '社労士 集客',
    '司法書士 集客', '士業 ホームページ', '士業 マーケティング',
    '税理士 顧問先 獲得', '行政書士 問い合わせ', '士業 診断クイズ',
    '集客メーカー', 'LP作成 無料', 'メルマガ 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/shigyou` },
  openGraph: {
    title: '士業の方へ（税理士・行政書士・社労士）｜信頼と専門性で選ばれる集客',
    description: '診断クイズ・プロフィールLP・メルマガで、専門性を可視化し相談予約を自動化。',
    url: `${siteUrl}/for/shigyou`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('士業の方へ（税理士・行政書士・社労士）')}&description=${encodeURIComponent('信頼と専門性で選ばれる集客ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '士業の方へ（税理士・行政書士・社労士）｜信頼と専門性で選ばれる集客',
    description: '診断クイズ・プロフィールLP・メルマガを無料で。',
  },
};

export default function ShigyouPage() {
  return <ShigyouPageClient />;
}
