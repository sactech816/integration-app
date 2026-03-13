import { Metadata } from 'next';
import BusinessPageClient from './BusinessPageClient';

export const metadata: Metadata = {
  title: '法人・チームの方へ｜集客メーカー',
  description: '中小企業・スタートアップ・チーム向け。マーケティング基盤を一元化。LP・ファネル・アンケート・ステップメールで集客から成約まで統合管理。',
};

export default function BusinessPage() {
  return <BusinessPageClient />;
}
