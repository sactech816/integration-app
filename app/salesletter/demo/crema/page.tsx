import { Metadata } from 'next';
import CremaDemoClient from './CremaDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'CREMAの法則 セールスレターデモ',
  description: 'CREMAの法則に基づくセールスレターのデモページです。短い文章で効果的に行動を促す構成法。集客メーカーのセールスライターでお試しください。',
  keywords: ['CREMA セールスレター', 'CREMA テンプレート', 'SNS広告 LP', 'メルマガ', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/crema` },
  openGraph: {
    title: 'CREMAの法則 セールスレターデモ｜集客メーカー',
    description: 'CREMAの法則に基づくセールスレターのデモページです。短い文章で効果的に行動を促す構成法。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/crema`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('CREMAの法則 セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CREMAの法則 セールスレターデモ｜集客メーカー',
    description: 'CREMAの法則に基づくセールスレターのデモページです。短い文章で効果的に行動を促す構成法。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <CremaDemoClient />;
}
