import { Metadata } from 'next';
import SdsDemoClient from './SdsDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'SDS法 セールスレターデモ',
  description: 'SDS法に基づくセールスレターのデモページです。シンプルに要点を伝える構成法。集客メーカーのセールスライターでお試しください。',
  keywords: ['SDS法 セールスレター', 'SDS テンプレート', 'ニュース 構成', 'プレスリリース', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/sds` },
  openGraph: {
    title: 'SDS法 セールスレターデモ｜集客メーカー',
    description: 'SDS法に基づくセールスレターのデモページです。シンプルに要点を伝える構成法。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/sds`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('SDS法 セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SDS法 セールスレターデモ｜集客メーカー',
    description: 'SDS法に基づくセールスレターのデモページです。シンプルに要点を伝える構成法。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <SdsDemoClient />;
}
