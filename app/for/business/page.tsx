import { Metadata } from 'next';
import BusinessPageClient from './BusinessPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: '法人・チームの方へ｜マーケティング基盤を一元化する無料ツール｜集客メーカー',
  description: '中小企業・スタートアップ・チーム向け。LP作成無料・アンケート無料・ステップメール無料・ファネル構築無料で集客から成約まで統合管理。複数ツールの月額費用を大幅削減。',
  keywords: [
    '法人 マーケティングツール', '中小企業 集客', 'マーケティング 一元管理',
    'LP作成 無料', 'アンケート 無料', 'ステップメール 無料', 'ファネル 無料',
    '集客メーカー', 'マーケティングオートメーション', 'チーム 集客ツール',
    'Googleフォーム 代替', 'Wix 代替', 'メール配信 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/business` },
  openGraph: {
    title: '法人・チームの方へ｜マーケティング基盤を一元化',
    description: 'LP・アンケート・ステップメール・ファネルを一元管理。複数ツールの月額費用を大幅削減。',
    url: `${siteUrl}/for/business`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('法人・チームの方へ')}&description=${encodeURIComponent('マーケティング基盤を一元化する無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: '法人・チームの方へ｜マーケティング基盤を一元化',
    description: 'LP・アンケート・ステップメール・ファネルを一元管理。月額費用を大幅削減。',
  },
};

export default function BusinessPage() {
  return <BusinessPageClient />;
}
