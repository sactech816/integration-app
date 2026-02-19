import { Metadata } from 'next';
import AidmaDemoClient from './AidmaDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'AIDMA/AIDCAS セールスレターデモ',
  description: 'AIDMA/AIDCASモデルに基づくセールスレターのデモページです。古典的な消費者行動モデルで購買心理を理解。集客メーカーのセールスライターでお試しください。',
  keywords: ['AIDMA セールスレター', 'AIDCAS テンプレート', 'ブランディング', '認知拡大', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/salesletter/demo/aidma` },
  openGraph: {
    title: 'AIDMA/AIDCAS セールスレターデモ｜集客メーカー',
    description: 'AIDMA/AIDCASモデルに基づくセールスレターのデモページです。古典的な消費者行動モデルで購買心理を理解。集客メーカーのセールスライターでお試しください。',
    url: `${siteUrl}/salesletter/demo/aidma`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('AIDMA/AIDCAS セールスレターデモ')}&type=salesletter`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIDMA/AIDCAS セールスレターデモ｜集客メーカー',
    description: 'AIDMA/AIDCASモデルに基づくセールスレターのデモページです。古典的な消費者行動モデルで購買心理を理解。集客メーカーのセールスライターでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <AidmaDemoClient />;
}
