import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'エンタメ診断メーカー | 集客メーカー',
  description: 'AIと会話するだけで、楽しいエンタメ診断を簡単作成。どうぶつ占い、性格診断、脳内メーカーなど、SNSでバズる診断をすぐに作れます。',
  openGraph: {
    title: 'エンタメ診断メーカー',
    description: 'AIと会話するだけで、楽しいエンタメ診断を簡単作成',
  },
};

export default function EntertainmentCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
