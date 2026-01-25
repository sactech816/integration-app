import { Metadata } from 'next';
import KindleLPRenewalClient from './KindleLPRenewalClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'キンドルダイレクトライト（KDL）継続プラン | 集客メーカー',
  description: '月額プランで継続的にKindle出版をサポート。書籍数無制限・KDP形式エクスポート対応。継続利用でさらに多くの本を出版しましょう。',
  keywords: ['Kindle出版', 'KDP', 'AI執筆', '月額プラン', '継続プラン', 'KDL'],
  robots: {
    index: false,  // 継続顧客専用ページのため検索エンジンには非表示
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/kindle/lp-renewal`,
  },
  openGraph: {
    title: 'キンドルダイレクトライト（KDL）継続プラン',
    description: '月額プランで継続的にKindle出版をサポート',
    type: 'website',
    url: `${siteUrl}/kindle/lp-renewal`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-kindle-lp.png`,
        width: 1200,
        height: 630,
        alt: 'キンドルダイレクトライト（KDL）継続プラン',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'キンドルダイレクトライト（KDL）継続プラン',
    description: '月額プランで継続的にKindle出版をサポート',
    images: [`${siteUrl}/og-kindle-lp.png`],
  },
};

export default function KindleLPRenewalPage() {
  return <KindleLPRenewalClient />;
}
