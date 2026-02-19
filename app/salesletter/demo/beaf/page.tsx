import { Metadata } from 'next';
import BeafDemoClient from './BeafDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'BEAFの法則 セールスレターデモ',
  description: 'BEAFの法則に基づくセールスレターのデモページです。ECサイトの商品説明に最適化された構成法。集客メーカーのセールスライターでお試しください。',
  keywords: ['BEAF セールスレター', 'BEAF テンプレート', 'EC 商品説明', '物販 LP', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/beaf` },
  openGraph: {
    title: 'BEAFの法則 セールスレターデモ｜集客メーカー',
    description: 'BEAFの法則に基づくセールスレターのデモページです。ECサイトの商品説明に最適化された構成法。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/beaf`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('BEAFの法則 セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BEAFの法則 セールスレターデモ｜集客メーカー',
    description: 'BEAFの法則に基づくセールスレターのデモページです。ECサイトの商品説明に最適化された構成法。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <BeafDemoClient />;
}
