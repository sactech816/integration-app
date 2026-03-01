import { Metadata } from 'next';
import KindleFreeTrialClient from './KindleFreeTrialClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Kindle出版メーカー 無料体験 | 集客メーカー',
  description: 'Kindle出版メーカーを無料で体験。AIでタイトル・目次・ターゲット設定を作成し、1章分の執筆まで試せます。',
  alternates: {
    canonical: `${siteUrl}/kindle/free-trial`,
  },
  openGraph: {
    title: 'Kindle出版メーカー 無料体験',
    description: 'AIでKindle出版を体験。タイトルから1章の執筆まで無料で試せます。',
    type: 'website',
    url: `${siteUrl}/kindle/free-trial`,
    siteName: '集客メーカー',
  },
};

export default function KindleFreeTrialPage() {
  return <KindleFreeTrialClient />;
}
