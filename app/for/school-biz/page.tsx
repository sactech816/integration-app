import { Metadata } from 'next';
import SchoolBizPageClient from './SchoolBizPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '教室・スクールの方へ｜体験から入会まで自然な流れを構築｜集客メーカー',
  description: '教室・スクール運営者向け。体験レッスン申込フォーム無料作成・出欠管理・スタンプカードで「体験から入会まで自然な流れ」を構築。料理教室・英会話教室・習い事の集客を仕組み化。',
  keywords: [
    '教室 集客', 'スクール 集客', '習い事 集客', '料理教室 集客', '英会話教室 集客',
    '体験レッスン 申込', '出欠管理 無料', 'スタンプカード 教室',
    '教室 入会率', 'スクール 生徒管理', '教室運営 ツール',
    '集客メーカー', '申込フォーム 無料', 'ガミフィケーション 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/school-biz` },
  openGraph: {
    title: '教室・スクールの方へ｜体験から入会まで自然な流れを構築',
    description: '申込フォーム・出欠管理・スタンプカードで体験レッスンから入会までの導線を無料で構築。',
    url: `${siteUrl}/for/school-biz`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('教室・スクールの方へ')}&description=${encodeURIComponent('体験から入会まで自然な流れを構築')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '教室・スクールの方へ｜体験から入会まで自然な流れを構築',
    description: '申込フォーム・出欠管理・スタンプカードを無料で。',
  },
};

export default function SchoolBizPage() {
  return <SchoolBizPageClient />;
}
