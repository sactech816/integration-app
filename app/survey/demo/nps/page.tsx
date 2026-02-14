import { Metadata } from 'next';
import SurveyNPSDemoPage from './NPSDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'NPSアンケートデモ',
  description: 'NPS（ネットプロモータースコア）アンケートのデモです。顧客ロイヤルティを数値化し、推奨度を測定できます。集客メーカーでお試しください。',
  keywords: ['NPS アンケート', 'ネットプロモータースコア デモ', 'NPS 調査 テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/survey/demo/nps` },
  openGraph: {
    title: 'NPSアンケートデモ｜集客メーカー',
    description: 'NPS（ネットプロモータースコア）アンケートのデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/survey/demo/nps`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('NPSアンケートデモ')}&type=survey`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPSアンケートデモ｜集客メーカー',
    description: 'NPS（ネットプロモータースコア）アンケートのデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <SurveyNPSDemoPage />;
}
