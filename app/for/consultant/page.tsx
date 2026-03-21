import { Metadata } from 'next';
import ConsultantPageClient from './ConsultantPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コンサルタント・コーチの方へ｜専門性で選ばれる集客の仕組み｜集客メーカー',
  description: 'コンサルタント・コーチ・講師向け。診断クイズで見込み客の課題を可視化し、ファネルで体験→本契約の導線を構築。専門性を伝え、相談予約が自然に入る仕組みを無料で。',
  keywords: [
    'コンサルタント 集客', 'コーチング 集客', '講師 集客', 'コンサル 見込み客',
    '診断クイズ 集客', 'ファネル 無料', 'ステップメール 無料',
    'コンサル 予約', '高額商品 売り方', 'コンサルタント 集客ツール',
    '集客メーカー', '集客 自動化', 'メルマガ 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/consultant` },
  openGraph: {
    title: 'コンサルタント・コーチの方へ｜専門性で選ばれる集客の仕組み',
    description: '診断クイズ・ファネル・ステップメールで専門性を伝え、相談予約が自然に入る仕組みを無料で。',
    url: `${siteUrl}/for/consultant`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('コンサルタント・コーチの方へ')}&description=${encodeURIComponent('専門性で選ばれる集客の仕組み')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コンサルタント・コーチの方へ｜専門性で選ばれる集客の仕組み',
    description: '診断クイズ・ファネル・ステップメールを無料で。',
  },
};

export default function ConsultantPage() {
  return <ConsultantPageClient />;
}
