import { Metadata } from 'next';
import SurveyCustomerSatisfactionDemoPage from './CustomerSatisfactionDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '顧客満足度アンケートデモ',
  description: '顧客満足度調査のアンケートデモです。サービス全体の満足度、スタッフの対応、品質評価など、効果的な満足度調査を体験できます。集客メーカーでお試しください。',
  keywords: ['顧客満足度 アンケート', '満足度調査 デモ', 'CS調査 テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/survey/demo/customer-satisfaction` },
  openGraph: {
    title: '顧客満足度アンケートデモ｜集客メーカー',
    description: '顧客満足度調査のアンケートデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/survey/demo/customer-satisfaction`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('顧客満足度アンケートデモ')}&type=survey`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '顧客満足度アンケートデモ｜集客メーカー',
    description: '顧客満足度調査のアンケートデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <SurveyCustomerSatisfactionDemoPage />;
}
