import { Metadata } from 'next';
import FranchisePageClient from './FranchisePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'フランチャイズ本部の方へ｜加盟店募集を仕組み化する無料ツール｜集客メーカー',
  description: 'フランチャイズ本部向け。ビジネスLP無料作成・ステップメール無料・申し込みフォーム無料で「加盟店募集を仕組み化」する集客の流れを構築。',
  keywords: [
    'フランチャイズ 加盟店募集', 'FC本部 集客', 'フランチャイズ LP',
    'フランチャイズ 説明会集客', '加盟店募集 ツール', 'FC募集 LP作成',
    'フランチャイズ ステップメール', '加盟希望者 フォロー',
    '集客メーカー', 'LP作成 無料', 'メール自動化 無料',
  ],
  alternates: { canonical: `${siteUrl}/for/franchise` },
  openGraph: {
    title: 'フランチャイズ本部の方へ｜加盟店募集を仕組み化',
    description: 'ビジネスLP・ステップメール・申し込みフォームで加盟店募集を仕組み化する無料ツール。',
    url: `${siteUrl}/for/franchise`,
    type: 'website',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('フランチャイズ本部の方へ')}&description=${encodeURIComponent('加盟店募集を仕組み化する無料ツール')}`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'フランチャイズ本部の方へ｜加盟店募集を仕組み化',
    description: 'ビジネスLP・ステップメール・申し込みフォームを無料で。',
  },
};

export default function FranchisePage() {
  return <FranchisePageClient />;
}
