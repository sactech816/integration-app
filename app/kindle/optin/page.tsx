import { Metadata } from 'next';
import KindleOptinClient from './KindleOptinClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'AIでKindle出版を無料体験 | Kindle出版メーカー',
  description: 'AIがあなたの本のタイトル・目次・1章分の原稿を自動生成。完全無料・クレジットカード不要で今すぐ始められます。',
  alternates: {
    canonical: `${siteUrl}/kindle/optin`,
  },
  openGraph: {
    title: 'AIでKindle出版を無料体験 | Kindle出版メーカー',
    description: 'AIが本のタイトル・目次・原稿を自動生成。完全無料で体験。',
    type: 'website',
    url: `${siteUrl}/kindle/optin`,
    siteName: '集客メーカー',
  },
};

export default function KindleOptinPage() {
  return <KindleOptinClient />;
}
