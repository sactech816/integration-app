import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'サービスを応援する',
  description: '集客メーカーの開発・運営を応援いただける方への寄付・支援ページです。皆様のご支援がサービスの継続・改善に役立ちます。',
  keywords: ['寄付', '支援', '応援', 'サポート', '開発支援', 'クラウドファンディング'],
  alternates: {
    canonical: `${siteUrl}/donation`,
  },
  openGraph: {
    title: 'サービスを応援する | 集客メーカー',
    description: '集客メーカーの開発・運営を応援いただける方への支援ページ',
    type: 'website',
    url: `${siteUrl}/donation`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '集客メーカー 応援・支援',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サービスを応援する | 集客メーカー',
    description: '開発・運営を応援いただける方への支援ページ',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function DonationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}














































