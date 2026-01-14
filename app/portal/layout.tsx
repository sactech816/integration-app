import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'ポータル - みんなの作品',
  description: '集客メーカーで作成された診断クイズ・プロフィールLP・ビジネスLPをチェック。ユーザーが作成した様々なコンテンツからインスピレーションを得て、あなたも素敵なコンテンツを作成しましょう。',
  keywords: ['ポータル', '作品一覧', '診断クイズ一覧', 'プロフィールLP一覧', 'サンプル', '事例', 'インスピレーション'],
  alternates: {
    canonical: `${siteUrl}/portal`,
  },
  openGraph: {
    title: 'ポータル - みんなの作品 | 集客メーカー',
    description: '集客メーカーで作成された診断クイズ・プロフィールLP・ビジネスLPをチェック',
    type: 'website',
    url: `${siteUrl}/portal`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '集客メーカー ポータル',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ポータル - みんなの作品 | 集客メーカー',
    description: 'ユーザーが作成した診断クイズ・LP一覧',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}






















































