import { Metadata } from 'next';
import PrepDemoClient from './PrepDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'PREP法 セールスレターデモ',
  description: 'PREP法に基づくセールスレターのデモページです。論理的で説得力のある文章構成の基本形。集客メーカーのセールスライターでお試しください。',
  keywords: ['PREP法 セールスレター', 'PREP テンプレート', 'ブログ記事 構成', 'ビジネス文書', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/prep` },
  openGraph: {
    title: 'PREP法 セールスレターデモ｜集客メーカー',
    description: 'PREP法に基づくセールスレターのデモページです。論理的で説得力のある文章構成の基本形。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/prep`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('PREP法 セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PREP法 セールスレターデモ｜集客メーカー',
    description: 'PREP法に基づくセールスレターのデモページです。論理的で説得力のある文章構成の基本形。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <PrepDemoClient />;
}
