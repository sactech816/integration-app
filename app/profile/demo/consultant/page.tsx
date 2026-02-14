import { Metadata } from 'next';
import ProfileConsultantDemoPage from './ConsultantDemoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'コンサルタント プロフィールLPデモ',
  description: 'コンサルタント向けのプロフィールLPデモです。専門分野、実績、料金、お問い合わせ先をまとめて表示できます。集客メーカーでお試しください。',
  keywords: ['コンサルタント プロフィールLP', 'コンサルタント ホームページ デモ', 'コンサル LP サンプル', '集客メーカー'],
  alternates: { canonical: `${siteUrl}/profile/demo/consultant` },
  openGraph: {
    title: 'コンサルタント プロフィールLPデモ｜集客メーカー',
    description: 'コンサルタント向けのプロフィールLPデモです。集客メーカーでお試しください。',
    url: `${siteUrl}/profile/demo/consultant`,
    images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent('コンサルタント プロフィールLPデモ')}&type=profile`, width: 1200, height: 630 }],
    locale: 'ja_JP',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'コンサルタント プロフィールLPデモ｜集客メーカー',
    description: 'コンサルタント向けのプロフィールLPデモです。集客メーカーでお試しください。',
    creator: '@syukaku_maker',
  },
};

export default function Page() {
  return <ProfileConsultantDemoPage />;
}
