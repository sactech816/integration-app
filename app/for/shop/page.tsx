import { Metadata } from 'next';
import ShopPageClient from './ShopPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '店舗・教室・サロンの方へ｜リピーター増＆口コミ集客の無料ツール｜集客メーカー',
  description: '店舗・教室・サロンオーナー向け。診断クイズ無料作成・ガチャ無料・スタンプラリー無料・予約フォーム無料でリピーターが増え、口コミが自然に広がる仕組みを構築。',
  keywords: [
    '店舗 集客', 'サロン 集客', '教室 集客', 'リピーター 増やす',
    '口コミ 集客', 'ガチャ 無料', 'スタンプラリー 無料', '診断クイズ 無料作成',
    '予約フォーム 無料', '来店促進 ツール', '集客メーカー',
    '美容室 集客', 'ネイルサロン 集客', '飲食店 集客',
  ],
  alternates: { canonical: `${siteUrl}/for/shop` },
  openGraph: {
    title: '店舗・教室・サロンの方へ｜リピーター増＆口コミ集客の無料ツール',
    description: '診断クイズ・ガチャ・スタンプラリー・予約フォームでリピーターが増え、口コミが広がる仕組みを無料で。',
    url: `${siteUrl}/for/shop`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('店舗・教室・サロンの方へ')}&description=${encodeURIComponent('リピーター増＆口コミ集客の無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '店舗・教室・サロンの方へ｜リピーター増＆口コミ集客',
    description: '診断クイズ・ガチャ・スタンプラリー・予約フォームを無料で。',
  },
};

export default function ShopPage() {
  return <ShopPageClient />;
}
