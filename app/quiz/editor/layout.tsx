import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '診断クイズエディタ',
  description: 'AI自動生成機能を搭載した診断クイズエディタ。性格診断、適職診断、心理テスト、検定クイズ、占いなど、様々なタイプの診断コンテンツを簡単に作成できます。',
  keywords: ['診断クイズ作成', 'クイズエディタ', 'AI自動生成', '性格診断作成', '適職診断作成', '心理テスト作成'],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/quiz/editor`,
  },
  openGraph: {
    title: '診断クイズエディタ | 集客メーカー',
    description: 'AI自動生成機能で診断クイズを簡単作成',
    type: 'website',
    url: `${siteUrl}/quiz/editor`,
  },
};

export default function QuizEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
























