import { Metadata } from 'next';
import KindlePageClient from './KindlePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'Kindle出版スタートキット｜書く・出す・売るを全部ここで｜集客メーカー',
  description: 'Kindle出版をまるごとサポート。AI執筆・表紙デザイン・販促ページまで、本を書いて売るために必要なツールがすべて無料で揃います。',
  keywords: [
    'Kindle出版 ツール', 'Kindle 執筆 AI', 'Kindle 表紙 デザイン', 'Kindle出版メーカー',
    'Kindle 無料ツール', 'Kindle 販促', 'セルフパブリッシング',
    '電子書籍 出版', 'Kindle 集客', '集客メーカー',
    'Kindle 表紙メーカー', 'サムネイル 無料作成',
  ],
  alternates: { canonical: `${siteUrl}/for/kindle` },
  openGraph: {
    title: 'Kindle出版スタートキット｜書く・出す・売るを全部ここで',
    description: 'AI執筆・表紙デザイン・販促ページまで。Kindle出版に必要なすべてを無料で。',
    url: `${siteUrl}/for/kindle`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('Kindle出版スタートキット')}&description=${encodeURIComponent('書く・出す・売るを全部ここで')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kindle出版スタートキット｜書く・出す・売るを全部ここで',
    description: 'AI執筆・表紙デザイン・販促まで。Kindle出版を無料でまるごとサポート。',
  },
};

export default function KindlePage() {
  return <KindlePageClient />;
}
