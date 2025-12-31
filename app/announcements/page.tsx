import { Metadata } from 'next';
import AnnouncementsPageClient from './AnnouncementsPageClient';

export const metadata: Metadata = {
  title: 'お知らせ | 集客メーカー',
  description: '集客メーカーからのお知らせ・更新情報をご確認いただけます。新機能、メンテナンス情報などを掲載しています。',
  openGraph: {
    title: 'お知らせ | 集客メーカー',
    description: '集客メーカーからのお知らせ・更新情報',
    type: 'website',
  },
};

export default function AnnouncementsPage() {
  return <AnnouncementsPageClient />;
}








































