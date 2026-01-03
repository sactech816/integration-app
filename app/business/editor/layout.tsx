import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'ビジネスLPエディタ',
  description: '商品・サービスの魅力を効果的にアピールするビジネスLP作成エディタ。CV最適化されたテンプレート、料金表、FAQ、お問い合わせフォーム機能を搭載。',
  keywords: ['ビジネスLP作成', 'ランディングページエディタ', 'LP作成ツール', 'セールスページ作成', 'CV最適化'],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/business/editor`,
  },
  openGraph: {
    title: 'ビジネスLPエディタ | 集客メーカー',
    description: 'CV最適化されたビジネスLPを簡単作成',
    type: 'website',
    url: `${siteUrl}/business/editor`,
  },
};

export default function BusinessEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
























