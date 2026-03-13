import { Metadata } from 'next';
import CoachPageClient from './CoachPageClient';

export const metadata: Metadata = {
  title: 'コーチ・コンサル・講師の方へ｜集客メーカー',
  description: 'コーチ・コンサルタント・講師向け。「実力」を正しく伝え、予約が自然に入る仕組みを無料構築。ウェビナーLP・ステップメール・予約フォームで見込み客を育てます。',
};

export default function CoachPage() {
  return <CoachPageClient />;
}
