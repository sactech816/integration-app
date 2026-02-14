import { Metadata } from 'next';
import SurveyProductServiceDemoPage from './ProductServiceDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '商品・サービスアンケートデモ',
  description: '商品・サービスに関するアンケートデモです。利用頻度、満足度、改善要望など、商品開発やサービス改善に役立つフィードバックを収集できます。集客メーカーでお試しください。',
  keywords: ['商品 アンケート', 'サービス アンケート デモ', '商品調査 テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/survey/demo/product-service` },
  openGraph: {
    title: '商品・サービスアンケートデモ｜集客メーカー',
    description: '商品・サービスに関するアンケートデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/survey/demo/product-service`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('商品・サービスアンケートデモ')}&type=survey`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '商品・サービスアンケートデモ｜集客メーカー',
    description: '商品・サービスに関するアンケートデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <SurveyProductServiceDemoPage />;
}
