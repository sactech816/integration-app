import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kindle出版メーカー',
  description: 'AIでKindle出版を簡単に。文章力も専門知識も不要。あなたの経験を本にしましょう。',
};

export default function KindleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
