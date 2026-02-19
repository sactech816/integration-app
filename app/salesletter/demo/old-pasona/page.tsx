import { Metadata } from 'next';
import OldPasonaDemoClient from './OldPasonaDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'PASONAの法則（旧型）セールスレターデモ',
  description: '旧PASONAの法則に基づくセールスレターのデモページです。問題を強調し緊急性を高める構成法。集客メーカーのセールスライターでお試しください。',
  keywords: ['PASONA 旧型 セールスレター', 'PASONA テンプレート', 'セールスレター デモ', '緊急性', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/old-pasona` },
  openGraph: {
    title: 'PASONAの法則（旧型）セールスレターデモ｜集客メーカー',
    description: '旧PASONAの法則に基づくセールスレターのデモページです。問題を強調し緊急性を高める構成法。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/old-pasona`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('PASONAの法則（旧型）セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PASONAの法則（旧型）セールスレターデモ｜集客メーカー',
    description: '旧PASONAの法則に基づくセールスレターのデモページです。問題を強調し緊急性を高める構成法。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <OldPasonaDemoClient />;
}
