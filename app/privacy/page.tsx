import { Metadata } from 'next';
import PrivacyPageClient from './PrivacyPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: '集客メーカーのプライバシーポリシー。個人情報の収集、利用目的、第三者提供、決済情報の取扱いについて説明しています。安心してご利用いただくための情報保護方針。',
  keywords: ['プライバシーポリシー', '個人情報保護', '利用規約', 'データ保護'],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'プライバシーポリシー | 集客メーカー',
    description: '集客メーカーのプライバシーポリシー',
    type: 'website',
    url: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
















































