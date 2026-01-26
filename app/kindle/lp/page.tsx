import { Metadata } from 'next';
// バージョン切り替え: 下記のいずれかのコメントを外してください
// import KindleLPClient from './KindleLPClient';        // オリジナル（バックアップ）
// import KindleLPClient from './KindleLPClientV1';      // V1: 新規顧客向けパターン1（期間集中プランのみ）
// import KindleLPClient from './KindleLPClientV2';      // V2: 新規顧客向けパターン2（期間集中プランのみ・A/Bテスト用）
import KindleLPClient from './KindleLPClientV3';         // V3: 提供されたLP内容ベース（シンプルヘッダー＋KDLフッター＋スクロールトップボタン）

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'キンドルダイレクトライト（KDL） - AIでKindle出版を簡単に | 集客メーカー',
  description: 'AIがあなたのKindle出版をフルサポート。目次作成から執筆、出版準備まで、すべてをナビゲート。専門知識不要で誰でも作家デビュー。月額プランで何冊でも執筆可能。',
  keywords: ['Kindle出版', 'KDP', 'AI執筆', '電子書籍', '副業', '印税収入', '自己出版', 'セルフパブリッシング', 'KDL', 'キンドルダイレクトライト'],
  alternates: {
    canonical: `${siteUrl}/kindle/lp`,
  },
  openGraph: {
    title: 'キンドルダイレクトライト（KDL） - AIでKindle出版を簡単に',
    description: 'AIがあなたのKindle出版をフルサポート。目次作成から執筆、出版準備まで。',
    type: 'website',
    url: `${siteUrl}/kindle/lp`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/og-kindle-lp.png`,
        width: 1200,
        height: 630,
        alt: 'キンドルダイレクトライト（KDL）',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'キンドルダイレクトライト（KDL） - AIでKindle出版を簡単に',
    description: 'AIがあなたのKindle出版をフルサポート',
    images: [`${siteUrl}/og-kindle-lp.png`],
  },
};

// 構造化データ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'キンドルダイレクトライト（KDL）',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AIがあなたのKindle出版をフルサポート。目次作成から執筆、出版準備まで、すべてをナビゲート。',
  url: `${siteUrl}/kindle/lp`,
  offers: [
    {
      '@type': 'Offer',
      price: '2980',
      priceCurrency: 'JPY',
      description: 'ライトプラン（月額）',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      price: '4980',
      priceCurrency: 'JPY',
      description: 'スタンダードプラン（月額）',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      price: '9800',
      priceCurrency: 'JPY',
      description: 'プロプラン（月額）',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      price: '29800',
      priceCurrency: 'JPY',
      description: 'ビジネスプラン（月額）',
      availability: 'https://schema.org/InStock',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: '集客メーカー',
    url: siteUrl,
  },
  featureList: [
    'AIによる目次自動生成',
    'AI執筆サポート',
    'Kindle出版ガイド',
    '複数書籍管理',
    'ワンクリック原稿エクスポート',
  ],
};

export default function KindleLPPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KindleLPClient />
    </>
  );
}


