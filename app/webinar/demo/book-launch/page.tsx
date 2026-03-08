import { Metadata } from 'next';
import DemoClient from './BookLaunchDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '出版記念セミナーデモ｜ウェビナーLPメーカー',
  description: '出版記念セミナー用のランディングページデモです。ベストセラー著者の特別セミナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
  keywords: ['ウェビナーLP デモ', 'ウェビナー テンプレート', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/webinar/demo/book-launch` },
  openGraph: {
    title: '出版記念セミナーデモ｜集客メーカー',
    description: '出版記念セミナー用のランディングページデモです。ベストセラー著者の特別セミナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    url: `${siteUrl}/webinar/demo/book-launch`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('出版記念セミナーデモ')}&type=webinar`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: '出版記念セミナーデモ｜集客メーカー',
    description: '出版記念セミナー用のランディングページデモです。ベストセラー著者の特別セミナーをテーマにしたLP構成をご覧いただけます。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <DemoClient />;
}
