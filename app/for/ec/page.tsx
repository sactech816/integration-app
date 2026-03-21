import { Metadata } from 'next';
import EcPageClient from './EcPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'EC・物販・D2Cの方へ｜商品の魅力を伝え購入につなげる無料ツール｜集客メーカー',
  description: 'EC・物販・D2C事業者向け。セールスライターで売れる商品説明文をAI生成・サムネイルで商品画像を魅力的に・メルマガでリピート購入を促進。無料で使える集客ツール。',
  keywords: [
    'EC 集客', '物販 集客', 'D2C 集客', 'ネットショップ 集客',
    '商品説明文 AI', '商品ページ 作成', 'EC メルマガ',
    'D2C マーケティング', '物販 セールスライティング', 'ネットショップ リピート',
    '集客メーカー', 'サムネイル作成 無料', 'メルマガ 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/ec` },
  openGraph: {
    title: 'EC・物販・D2Cの方へ｜商品の魅力を伝え購入につなげる',
    description: 'セールスライター・サムネイル・メルマガで商品の魅力を最大限に伝え、購入・リピートにつなげる無料ツール。',
    url: `${siteUrl}/for/ec`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('EC・物販・D2Cの方へ')}&description=${encodeURIComponent('商品の魅力を伝え購入につなげる無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EC・物販・D2Cの方へ｜商品の魅力を伝え購入につなげる',
    description: 'セールスライター・サムネイル・メルマガを無料で。',
  },
};

export default function EcPage() {
  return <EcPageClient />;
}
