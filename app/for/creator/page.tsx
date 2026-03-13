import { Metadata } from 'next';
import CreatorPageClient from './CreatorPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コンテンツ販売・Kindle著者の方へ｜商品が売れ続ける仕組みを無料構築｜集客メーカー',
  description: 'コンテンツ販売者・Kindle著者・情報発信者向け。セールスライター無料・ファネル構築無料・メルマガ無料で見込み客を育て、商品が売れ続ける仕組みを自動化。',
  keywords: [
    'コンテンツ販売 集客', 'Kindle 集客', '情報商材 集客', 'セールスレター 無料作成',
    'ファネル構築 無料', 'メルマガ 無料', 'セールスライター AI',
    'LP作成 無料', '集客メーカー', 'オンライン講座 集客',
    'コンテンツマーケティング ツール', 'メール配信 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/creator` },
  openGraph: {
    title: 'コンテンツ販売・Kindle著者の方へ｜売れ続ける仕組みを無料構築',
    description: 'セールスライター・ファネル・メルマガで、見込み客を育て商品が売れ続ける仕組みを無料で。',
    url: `${siteUrl}/for/creator`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('コンテンツ販売・Kindle著者の方へ')}&description=${encodeURIComponent('売れ続ける仕組みを無料構築')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コンテンツ販売・Kindle著者の方へ｜売れ続ける仕組みを無料構築',
    description: 'セールスライター・ファネル・メルマガを無料で。自動で売れる流れを。',
  },
};

export default function CreatorPage() {
  return <CreatorPageClient />;
}
