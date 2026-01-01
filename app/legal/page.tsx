import { Metadata } from 'next';
import LegalPageClient from './LegalPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
  description: '集客メーカーの特定商取引法に基づく表記。販売事業者、代金支払い、返品ポリシー等の情報を掲載しています。',
  keywords: ['特定商取引法', '特商法', '販売事業者', '返品ポリシー'],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/legal`,
  },
  openGraph: {
    title: '特定商取引法に基づく表記 | 集客メーカー',
    description: '集客メーカーの特定商取引法に基づく表記',
    type: 'website',
    url: `${siteUrl}/legal`,
  },
};

export default function LegalPage() {
  return <LegalPageClient />;
}
















































