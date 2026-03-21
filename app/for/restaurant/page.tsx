import { Metadata } from 'next';
import RestaurantPageClient from './RestaurantPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '飲食店・カフェの方へ｜来店のきっかけとリピートを仕組み化｜集客メーカー',
  description: '飲食店・カフェオーナー向け。予約フォーム無料作成・スタンプカード・来店後アンケートで「来店のきっかけとリピートを仕組み化」する集客ツール。',
  keywords: [
    '飲食店 集客', 'カフェ 集客', 'レストラン 集客', '飲食 リピーター',
    '飲食店 予約フォーム', 'カフェ スタンプカード', '飲食店 アンケート',
    '飲食 リピート施策', '飲食店 集客ツール', 'カフェ 集客 無料',
    '集客メーカー', '予約フォーム 無料', 'ガミフィケーション 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/restaurant` },
  openGraph: {
    title: '飲食店・カフェの方へ｜来店のきっかけとリピートを仕組み化',
    description: '予約フォーム・スタンプカード・アンケートで来店促進とリピート化を無料で。',
    url: `${siteUrl}/for/restaurant`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('飲食店・カフェの方へ')}&description=${encodeURIComponent('来店のきっかけとリピートを仕組み化')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '飲食店・カフェの方へ｜来店のきっかけとリピートを仕組み化',
    description: '予約フォーム・スタンプカード・アンケートを無料で。',
  },
};

export default function RestaurantPage() {
  return <RestaurantPageClient />;
}
