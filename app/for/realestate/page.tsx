import { Metadata } from 'next';
import RealestatePageClient from './RealestatePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '不動産・住宅会社の方へ｜内見予約が増える集客の仕組み｜集客メーカー',
  description: '不動産・住宅会社向け。物件診断クイズ・物件紹介LP・内見予約フォームで「物件の魅力を伝え、内見予約が自然に増える仕組み」を無料で構築。',
  keywords: [
    '不動産 集客', '住宅 集客', '内見 予約', '不動産 LP',
    '物件紹介 ページ', '不動産 ホームページ', '住宅会社 集客',
    '内見予約 自動化', '物件診断 クイズ', '不動産 マーケティング',
    '集客メーカー', 'LP作成 無料', '予約フォーム 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/realestate` },
  openGraph: {
    title: '不動産・住宅会社の方へ｜内見予約が増える集客の仕組み',
    description: '物件診断クイズ・物件紹介LP・内見予約フォームで内見予約が自然に増える仕組みを無料で。',
    url: `${siteUrl}/for/realestate`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('不動産・住宅会社の方へ')}&description=${encodeURIComponent('内見予約が増える集客の仕組み')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産・住宅会社の方へ｜内見予約が増える集客の仕組み',
    description: '物件診断クイズ・物件紹介LP・内見予約フォームを無料で。',
  },
};

export default function RealestatePage() {
  return <RealestatePageClient />;
}
