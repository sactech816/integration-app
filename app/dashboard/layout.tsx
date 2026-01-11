import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'マイページ',
  description: '集客メーカーのマイページ。作成した診断クイズ・プロフィールLP・ビジネスLPの管理、アクセス解析の確認、コンテンツの編集が行えます。',
  keywords: ['マイページ', 'ダッシュボード', '管理画面', 'アクセス解析', 'コンテンツ管理'],
  robots: {
    index: false, // ダッシュボードは個人情報が含まれるためインデックスしない
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/dashboard`,
  },
  openGraph: {
    title: 'マイページ | 集客メーカー',
    description: '作成したコンテンツの管理とアクセス解析',
    type: 'website',
    url: `${siteUrl}/dashboard`,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}














































