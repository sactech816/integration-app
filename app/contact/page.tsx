import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'お問い合わせ | 集客メーカー',
  description: '集客メーカーへのお問い合わせページ。機能へのご要望、不具合のご報告、その他ご質問はこちらからお送りください。',
  openGraph: {
    title: 'お問い合わせ | 集客メーカー',
    description: '集客メーカーへのお問い合わせはこちら',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}









































