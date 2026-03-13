import { Metadata } from 'next';
import CoachPageClient from './CoachPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コーチ・コンサル・講師の方へ｜セミナー集客・予約を自動化する無料ツール｜集客メーカー',
  description: 'コーチ・コンサルタント・講師向け。ウェビナーLP無料作成・ステップメール無料・予約フォーム無料で「実力を正しく伝え、予約が自然に入る仕組み」を構築。',
  keywords: [
    'コーチ 集客', 'コンサル 集客', '講師 集客', 'セミナー集客 無料',
    'ウェビナーLP 無料作成', 'ステップメール 無料', '予約フォーム 無料',
    'セミナー告知 ツール', '個別相談 予約', 'コーチング 集客ツール',
    '集客メーカー', 'LP作成 無料', 'メール自動化 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/coach` },
  openGraph: {
    title: 'コーチ・コンサル・講師の方へ｜セミナー集客を自動化',
    description: 'ウェビナーLP・ステップメール・予約フォームで信頼を育て、予約が自然に入る仕組みを無料で。',
    url: `${siteUrl}/for/coach`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('コーチ・コンサル・講師の方へ')}&description=${encodeURIComponent('セミナー集客・予約を自動化する無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コーチ・コンサル・講師の方へ｜セミナー集客を自動化',
    description: 'ウェビナーLP・ステップメール・予約フォームを無料で。',
  },
};

export default function CoachPage() {
  return <CoachPageClient />;
}
