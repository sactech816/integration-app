import { Metadata } from 'next';
import FreelancePageClient from './FreelancePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'フリーランス・SNS発信者の方へ｜フォロワーをお客様に変える無料ツール｜集客メーカー',
  description: 'フリーランス・個人事業主・SNS発信者向け。プロフィールLP無料作成・診断クイズ無料作成・予約フォーム無料でフォロワーを「お客様」に変える仕組みを構築。lit.link代替にも。',
  keywords: [
    'フリーランス 集客', 'SNS 集客ツール', 'フォロワー 顧客化',
    'プロフィールLP 無料', 'lit.link 代替', '診断クイズ 無料作成',
    '予約フォーム 無料', '個人事業主 集客', 'Instagram 集客',
    '集客メーカー', 'LP作成 無料', 'リンクまとめ 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/freelance` },
  openGraph: {
    title: 'フリーランス・SNS発信者の方へ｜フォロワーをお客様に変える',
    description: 'プロフィールLP・診断クイズ・予約フォームで、SNSの発信力を売上に変える仕組みを無料で。',
    url: `${siteUrl}/for/freelance`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('フリーランス・SNS発信者の方へ')}&description=${encodeURIComponent('フォロワーをお客様に変える無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'フリーランス・SNS発信者の方へ｜フォロワーをお客様に変える',
    description: 'プロフィールLP・診断クイズ・予約フォームを無料で。SNSの発信力を売上に。',
  },
};

export default function FreelancePage() {
  return <FreelancePageClient />;
}
