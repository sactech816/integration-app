import { Metadata } from 'next';
import HPActivatePageClient from './HPActivatePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ホームページ活性化｜AIチャットボット＆ガイドを既存HPに埋め込み｜集客メーカー',
  description: '既存のホームページ・LPに「AIコンシェルジュ」と「ステップガイド」を埋め込むだけで、動きのなかったサイトが24時間自動で接客・案内するサイトに変わります。コード1行で導入、無料から始められます。',
  keywords: [
    'ホームページ 活性化', 'HP 改善', 'AIチャットボット 埋め込み', 'チャットボット 無料',
    'Web接客ツール', 'サイト改善', 'コンバージョン率 向上', 'LP 改善',
    'オンボーディング ツール', 'ガイド 埋め込み', 'AI接客', '離脱率 改善',
    '集客メーカー', 'コンシェルジュ', 'ガイドメーカー',
  ],
  alternates: { canonical: `${siteUrl}/for/hp-activate` },
  openGraph: {
    title: 'ホームページ活性化｜AIチャットボット＆ガイドを既存HPに埋め込み',
    description: 'コード1行で、既存HPが24時間自動接客するサイトに。AIコンシェルジュ＆ステップガイドを無料導入。',
    url: `${siteUrl}/for/hp-activate`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('ホームページ活性化')}&description=${encodeURIComponent('AIチャットボット＆ガイドを既存HPに埋め込み')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ホームページ活性化｜AIコンシェルジュ＆ガイドを既存HPに',
    description: 'コード1行で導入。動きのないHPを24時間自動接客サイトに変える。',
  },
};

export default function HPActivatePage() {
  return <HPActivatePageClient />;
}
