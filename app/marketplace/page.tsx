import { Metadata } from 'next';
import MarketplacePageClient from '@/components/marketplace/MarketplacePageClient';

export const metadata: Metadata = {
  title: 'スキルマーケット | 集客メーカー',
  description:
    'LP作成・診断クイズ・デザインなど、集客メーカーのプロに依頼できるスキルマーケット。ビジネスの集客・コンテンツ制作をプロに委託してビジネスを加速させましょう。',
  keywords: ['スキルマーケット', 'LP制作', '診断クイズ制作', 'デザイン', 'プロに依頼', 'フリーランス', '集客'],
  openGraph: {
    title: 'スキルマーケット | 集客メーカー',
    description: 'LP・診断クイズ・デザインなど集客のプロに依頼できるマーケット。ビジネスを加速させましょう。',
    type: 'website',
    url: 'https://makers.tokyo/marketplace',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スキルマーケット | 集客メーカー',
    description: 'LP・診断クイズ・デザインなど集客のプロに依頼できるマーケット。',
  },
  alternates: { canonical: 'https://makers.tokyo/marketplace' },
};

export default function MarketplacePage() {
  return <MarketplacePageClient />;
}
