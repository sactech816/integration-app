import { Metadata } from 'next';
import FreelancePageClient from './FreelancePageClient';

export const metadata: Metadata = {
  title: 'フリーランス・SNS発信者の方へ｜集客メーカー',
  description: 'フリーランス・個人事業主・SNS発信者向け。フォロワーを「お客様」に変える仕組みを無料で構築。プロフィールLP・診断クイズ・予約フォームの組み合わせで自然に予約が入る流れを。',
};

export default function FreelancePage() {
  return <FreelancePageClient />;
}
