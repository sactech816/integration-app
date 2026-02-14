import { Metadata } from 'next';
import SurveyEmployeeEngagementDemoPage from './EmployeeEngagementDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '従業員エンゲージメントアンケートデモ',
  description: '従業員エンゲージメント調査のアンケートデモです。職場環境、モチベーション、帰属意識など、組織の健全性を測定できます。集客メーカーでお試しください。',
  keywords: ['従業員エンゲージメント アンケート', 'エンゲージメント調査 デモ', '社員満足度調査 テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/survey/demo/employee-engagement` },
  openGraph: {
    title: '従業員エンゲージメントアンケートデモ｜集客メーカー',
    description: '従業員エンゲージメント調査のアンケートデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/survey/demo/employee-engagement`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('従業員エンゲージメントアンケートデモ')}&type=survey`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '従業員エンゲージメントアンケートデモ｜集客メーカー',
    description: '従業員エンゲージメント調査のアンケートデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <SurveyEmployeeEngagementDemoPage />;
}
