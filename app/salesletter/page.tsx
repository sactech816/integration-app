import { redirect } from 'next/navigation';

// セールスレターのダッシュボードはメインダッシュボードに統合されています
export default function SalesLetterPage() {
  redirect('/dashboard?view=salesletter');
}
