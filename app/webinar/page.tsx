import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'ウェビナーLPメーカー | 集客メーカー',
  description: 'ウェビナー・オンラインセミナー専用のランディングページを無料で作成。動画埋め込み・カウントダウン・時間制御CTA搭載。',
};

export default function WebinarPage() {
  redirect('/webinar/editor');
}
