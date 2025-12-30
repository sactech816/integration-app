import { Metadata } from 'next';
import PrivacyPageClient from './PrivacyPageClient';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | 集客メーカー',
  description: '集客メーカーのプライバシーポリシー。個人情報の収集、利用目的、第三者提供、決済情報の取扱いについて説明しています。',
  openGraph: {
    title: 'プライバシーポリシー | 集客メーカー',
    description: '集客メーカーのプライバシーポリシー',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}



















