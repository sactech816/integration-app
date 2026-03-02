import { Metadata } from 'next';
import KindleUpgradeClient from './KindleUpgradeClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'プランをアップグレード | Kindle出版メーカー',
  description: 'Kindle出版メーカーの有料プランで全機能を解放。Word/EPUB出力、表紙作成、LP生成、AI回数拡張など。',
  alternates: {
    canonical: `${siteUrl}/kindle/upgrade`,
  },
};

export default function KindleUpgradePage() {
  return <KindleUpgradeClient />;
}
