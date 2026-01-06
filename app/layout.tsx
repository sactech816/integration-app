import type { Metadata } from "next";
import { Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '集客メーカー';
const siteTitle = '集客メーカー｜診断クイズ・プロフィールLP・ビジネスLPが簡単作成。SNS拡散・SEO対策で集客を加速';
const siteDescription = '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策であなたのビジネスに顧客を引き寄せる集客ツール。無料で今すぐ始められます。';

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | 集客メーカー | 診断クイズ・プロフィールLP・ビジネスLPが簡単作成`,
  },
  description: siteDescription,
  keywords: [
    '集客メーカー',
    '集客ツール',
    '診断クイズ',
    '診断クイズ作成',
    '性格診断作成',
    'プロフィールLP',
    'プロフィールサイト',
    'ビジネスLP',
    'ランディングページ作成',
    'LP作成ツール',
    'LP作成無料',
    'AI自動生成',
    'AIツール',
    'SNS集客',
    'SEO対策',
    'リード獲得',
    '見込み客獲得',
    '無料ツール',
    'マーケティングツール',
    'コンテンツマーケティング',
    'リンクまとめ',
    'lit.link代替',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName: siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('診断クイズ・プロフィールLP・ビジネスLPを簡単作成')}`,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('集客メーカー')}&description=${encodeURIComponent('診断クイズ・プロフィールLP・ビジネスLPを簡単作成')}`],
    creator: '@syukaku_maker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.svg',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 構造化データ - Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '集客メーカー',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成できる無料集客ツール',
    sameAs: [
      // ソーシャルメディアのURLがあれば追加
    ],
  };

  // 構造化データ - WebSite
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '集客メーカー',
    url: siteUrl,
    description: '診断クイズ・プロフィールLP・ビジネスLPをAIで簡単作成。SNS拡散・SEO対策で集客を加速',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/portal?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ja">
      <head>
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        
        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${notoSansJP.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
