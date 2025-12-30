import { Metadata } from 'next';
import LegalPageClient from './LegalPageClient';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | 集客メーカー',
  description: '集客メーカーの特定商取引法に基づく表記。販売事業者、代金支払い、返品ポリシー等の情報を掲載しています。',
  openGraph: {
    title: '特定商取引法に基づく表記 | 集客メーカー',
    description: '集客メーカーの特定商取引法に基づく表記',
    type: 'website',
  },
};

export default function LegalPage() {
  return <LegalPageClient />;
}



















