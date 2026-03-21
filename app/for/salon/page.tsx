import { Metadata } from 'next';
import SalonPageClient from './SalonPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'サロン・美容室の方へ｜リピーター増＆口コミ集客の無料ツール｜集客メーカー',
  description: 'サロン・美容室・ネイルサロン・エステ向け。診断クイズで来店きっかけ作り・ガミフィケーションでリピート促進・予約フォームで24時間自動受付。無料で始められます。',
  keywords: [
    'サロン 集客', '美容室 集客', 'ネイルサロン 集客', 'エステ 集客', 'リピーター 増やす',
    'サロン リピート率', '美容室 口コミ', 'サロン 予約 無料', 'スタンプラリー サロン',
    '診断クイズ 美容', '集客メーカー', 'サロン集客 ツール 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/salon` },
  openGraph: {
    title: 'サロン・美容室の方へ｜リピーター増＆口コミ集客',
    description: '診断クイズ・ガミフィケーション・予約フォームでリピーターが増え、口コミが自然に広がる仕組みを無料で。',
    url: `${siteUrl}/for/salon`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('サロン・美容室の方へ')}&description=${encodeURIComponent('リピーター増＆口コミ集客の無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サロン・美容室の方へ｜リピーター増＆口コミ集客',
    description: '診断クイズ・ガミフィケーション・予約フォームを無料で。',
  },
};

export default function SalonPage() {
  return <SalonPageClient />;
}
