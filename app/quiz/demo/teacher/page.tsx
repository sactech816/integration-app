import { Metadata } from 'next';
import TeacherDemoPage from './TeacherDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '講師タイプ診断デモ',
  description: 'あなたの講師としての強みとスタイルを診断します。コーチ型・ティーチャー型・ファシリテーター型・トレーナー型、あなたはどのタイプ？集客メーカーの診断クイズデモをお試しください。',
  keywords: ['講師タイプ診断', '診断クイズ デモ', '講師 強み診断', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/quiz/demo/teacher` },
  openGraph: {
    title: '講師タイプ診断デモ｜集客メーカー',
    description: 'あなたの講師としての強みとスタイルを診断します。集客メーカーの診断クイズデモをお試しください。',
    url: `${siteUrl}/quiz/demo/teacher`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('講師タイプ診断デモ')}&type=quiz`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '講師タイプ診断デモ｜集客メーカー',
    description: 'あなたの講師としての強みとスタイルを診断します。集客メーカーの診断クイズデモをお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <TeacherDemoPage />;
}
