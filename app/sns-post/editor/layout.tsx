import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SNS投稿メーカー | 集客メーカー',
  description: 'AIでSNS投稿を簡単作成。X(Twitter)、Instagram、Threads対応。テキスト・ハッシュタグを自動生成。',
};

export default function SNSPostEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
