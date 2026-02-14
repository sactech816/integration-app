import { Metadata } from 'next';
import SurveyTrainingDemoPage from './TrainingDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '研修アンケートデモ',
  description: '研修・トレーニング後のアンケートデモです。研修内容の理解度、講師の評価、実務への活用度など、研修改善に役立つフィードバックを収集できます。集客メーカーでお試しください。',
  keywords: ['研修 アンケート', 'トレーニング アンケート デモ', '研修評価 テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/survey/demo/training` },
  openGraph: {
    title: '研修アンケートデモ｜集客メーカー',
    description: '研修・トレーニング後のアンケートデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/survey/demo/training`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('研修アンケートデモ')}&type=survey`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '研修アンケートデモ｜集客メーカー',
    description: '研修・トレーニング後のアンケートデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <SurveyTrainingDemoPage />;
}
