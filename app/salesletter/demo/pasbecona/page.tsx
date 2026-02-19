import { Metadata } from 'next';
import PasbeconaDemoClient from './PasbeconaDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'PASBECONAの法則 セールスレターデモ',
  description: 'PASBECONAの法則に基づくセールスレターのデモページです。高額商品や情報商材に最適な、最も説得力の高い構成法。集客メーカーのセールスライターでお試しください。',
  keywords: ['PASBECONA セールスレター', 'PASBECONA テンプレート', 'セールスレター デモ', '高額商品 LP', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/pasbecona` },
  openGraph: {
    title: 'PASBECONAの法則 セールスレターデモ｜集客メーカー',
    description: 'PASBECONAの法則に基づくセールスレターのデモページです。高額商品や情報商材に最適な、最も説得力の高い構成法。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/pasbecona`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('PASBECONAの法則 セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PASBECONAの法則 セールスレターデモ｜集客メーカー',
    description: 'PASBECONAの法則に基づくセールスレターのデモページです。高額商品や情報商材に最適な、最も説得力の高い構成法。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <PasbeconaDemoClient />;
}
