import { Metadata } from 'next';
import AisasDemoClient from './AisasDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'AISAS/AISCEAS セールスレターデモ',
  description: 'AISAS/AISCEASモデルに基づくセールスレターのデモページです。インターネット時代の消費者行動に最適化。集客メーカーのセールスライターでお試しください。',
  keywords: ['AISAS セールスレター', 'AISCEAS テンプレート', 'Webマーケティング', 'SNSマーケティング', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/aisas` },
  openGraph: {
    title: 'AISAS/AISCEAS セールスレターデモ｜集客メーカー',
    description: 'AISAS/AISCEASモデルに基づくセールスレターのデモページです。インターネット時代の消費者行動に最適化。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/aisas`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('AISAS/AISCEAS セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AISAS/AISCEAS セールスレターデモ｜集客メーカー',
    description: 'AISAS/AISCEASモデルに基づくセールスレターのデモページです。インターネット時代の消費者行動に最適化。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <AisasDemoClient />;
}
