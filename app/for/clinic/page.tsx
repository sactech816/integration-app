import { Metadata } from 'next';
import ClinicPageClient from './ClinicPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'クリニック・治療院の方へ｜患者さんに選ばれる集客の仕組み｜集客メーカー',
  description: 'クリニック・治療院・整骨院・歯科医院向け。症状チェック診断・院紹介ページ・予約フォームで「患者さんの不安を安心に変え、来院につなげる仕組み」を無料で構築。',
  keywords: [
    'クリニック 集客', '治療院 集客', '整骨院 集客', '歯科 集客', '医院 集客',
    '患者 集客', '来院促進', '症状チェック 診断', '院紹介ページ 無料',
    '予約フォーム 無料', 'クリニック LP', '治療院 ホームページ',
    '集客メーカー', 'LP作成 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/clinic` },
  openGraph: {
    title: 'クリニック・治療院の方へ｜患者さんに選ばれる集客の仕組み',
    description: '症状チェック診断・院紹介ページ・予約フォームで患者さんの不安を安心に変え、来院につなげる仕組みを無料で。',
    url: `${siteUrl}/for/clinic`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('クリニック・治療院の方へ')}&description=${encodeURIComponent('患者さんに選ばれる集客の仕組み')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'クリニック・治療院の方へ｜患者さんに選ばれる集客の仕組み',
    description: '症状チェック診断・院紹介ページ・予約フォームを無料で。',
  },
};

export default function ClinicPage() {
  return <ClinicPageClient />;
}
