import { Metadata } from 'next';
import NewPasonaDemoClient from './NewPasonaDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '新PASONAの法則 セールスレターデモ',
  description: '新PASONAの法則に基づくセールスレターのデモページです。親近感を軸に自然な購買行動を促す現代のスタンダードな構成法。集客メーカーのセールスライターでお試しください。',
  keywords: ['新PASONA セールスレター', 'PASONA テンプレート', 'セールスレター デモ', 'コピーライティング 法則', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/new-pasona` },
  openGraph: {
    title: '新PASONAの法則 セールスレターデモ｜集客メーカー',
    description: '新PASONAの法則に基づくセールスレターのデモページです。親近感を軸に自然な購買行動を促す現代のスタンダードな構成法。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/new-pasona`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('新PASONAの法則 セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '新PASONAの法則 セールスレターデモ｜集客メーカー',
    description: '新PASONAの法則に基づくセールスレターのデモページです。親近感を軸に自然な購買行動を促す現代のスタンダードな構成法。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <NewPasonaDemoClient />;
}
