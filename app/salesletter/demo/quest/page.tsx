import { Metadata } from 'next';
import QuestDemoClient from './QuestDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'QUESTの法則 セールスレターデモ',
  description: 'QUESTの法則に基づくセールスレターのデモページです。ストーリーテリングで感情に訴えかけ行動を促す構成法。集客メーカーのセールスライターでお試しください。',
  keywords: ['QUEST セールスレター', 'QUEST テンプレート', 'セールスレター デモ', 'ストーリーテリング', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/quest` },
  openGraph: {
    title: 'QUESTの法則 セールスレターデモ｜集客メーカー',
    description: 'QUESTの法則に基づくセールスレターのデモページです。ストーリーテリングで感情に訴えかけ行動を促す構成法。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/quest`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('QUESTの法則 セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QUESTの法則 セールスレターデモ｜集客メーカー',
    description: 'QUESTの法則に基づくセールスレターのデモページです。ストーリーテリングで感情に訴えかけ行動を促す構成法。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <QuestDemoClient />;
}
