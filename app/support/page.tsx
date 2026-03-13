import { Suspense } from 'react';
import { Metadata } from 'next';
import SupportPageClient from './SupportPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'サポートパック｜プロと一緒に集客の仕組みを構築｜集客メーカー',
  description: 'ひとりで悩まない。プロのサポートつきで、集客の仕組みを最短で構築。セミナー集客・コンテンツ販売・店舗集客・起業スタートなど、あなたに合ったパックをご用意。',
  keywords: [
    'サポートパック', '集客支援', '起業サポート', 'LP作成代行',
    '集客コンサル', '集客メーカー サポート', 'マーケティング支援',
  ],
  alternates: { canonical: `${siteUrl}/support` },
  openGraph: {
    title: 'サポートパック｜プロと一緒に集客の仕組みを構築',
    description: 'ひとりで悩まない。プロのサポートつきで、集客の仕組みを最短で構築。',
    url: `${siteUrl}/support`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('サポートパック')}&description=${encodeURIComponent('プロと一緒に集客の仕組みを最短で構築')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サポートパック｜プロと一緒に集客の仕組みを構築',
    description: 'ひとりで悩まない。プロのサポートつきで集客の仕組みを最短で構築。',
  },
};

export default function SupportPage() {
  return (
    <Suspense>
      <SupportPageClient />
    </Suspense>
  );
}
