import { Metadata } from 'next';
import SurveyEventSeminarDemoPage from './EventSeminarDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'イベント・セミナーアンケートデモ',
  description: 'イベント・セミナー後のアンケートデモです。満足度、内容の理解度、今後の参加意向など、イベント改善に役立つフィードバックを収集できます。集客メーカーでお試しください。',
  keywords: ['イベント アンケート', 'セミナー アンケート デモ', 'イベント フィードバック テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/survey/demo/event-seminar` },
  openGraph: {
    title: 'イベント・セミナーアンケートデモ｜集客メーカー',
    description: 'イベント・セミナー後のアンケートデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/survey/demo/event-seminar`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('イベント・セミナーアンケートデモ')}&type=survey`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'イベント・セミナーアンケートデモ｜集客メーカー',
    description: 'イベント・セミナー後のアンケートデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <SurveyEventSeminarDemoPage />;
}
