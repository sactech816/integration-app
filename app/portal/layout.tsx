import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export const metadata: Metadata = {
  title: 'ポータル - みんなの作品 | 診断クイズ・プロフィールLP・ビジネスLP一覧',
  description: '集客メーカーで作成された診断クイズ・プロフィールLP・ビジネスLP・アンケート・セールスレターをチェック。ユーザーが作成した様々なコンテンツからインスピレーションを得て、あなたも素敵なコンテンツを作成しましょう。',
  keywords: [
    'ポータル', '作品一覧', '診断クイズ一覧', 'プロフィールLP一覧', 'ビジネスLP一覧',
    'アンケート一覧', 'サンプル', '事例', 'インスピレーション', '集客メーカー',
    '無料診断', 'プロフィールサイト', 'ランディングページ',
  ],
  alternates: {
    canonical: `${siteUrl}/portal`,
  },
  openGraph: {
    title: 'ポータル - みんなの作品 | 集客メーカー',
    description: '集客メーカーで作成された診断クイズ・プロフィールLP・ビジネスLPをチェック。人気コンテンツやおすすめ作品を発見しよう。',
    type: 'website',
    url: `${siteUrl}/portal`,
    siteName: '集客メーカー',
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent('みんなの作品ポータル')}&description=${encodeURIComponent('診断クイズ・LP・アンケートの人気コンテンツを探す')}`,
        width: 1200,
        height: 630,
        alt: '集客メーカー ポータル',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ポータル - みんなの作品 | 集客メーカー',
    description: 'ユーザーが作成した診断クイズ・LP一覧。人気ランキングやおすすめコンテンツを探す。',
    images: [`${siteUrl}/api/og?title=${encodeURIComponent('みんなの作品ポータル')}&description=${encodeURIComponent('診断クイズ・LP・アンケートの人気コンテンツを探す')}`],
    creator: '@syukaku_maker',
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 構造化データ - CollectionPage
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'みんなの作品ポータル',
    description: '集客メーカーで作成された診断クイズ・プロフィールLP・ビジネスLP・アンケートのコレクション',
    url: `${siteUrl}/portal`,
    isPartOf: {
      '@type': 'WebSite',
      name: '集客メーカー',
      url: siteUrl,
    },
    about: {
      '@type': 'Thing',
      name: '集客ツールで作成されたユーザーコンテンツ',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'コンテンツカテゴリ',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '診断クイズ',
          url: `${siteUrl}/portal?tab=quiz`,
          description: 'AIで簡単に作成できる性格診断・心理テスト・タイプ診断クイズ',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'プロフィールLP',
          url: `${siteUrl}/portal?tab=profile`,
          description: 'SNSリンクをまとめたプロフィールページ・リンクまとめサイト',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'ビジネスLP',
          url: `${siteUrl}/portal?tab=business`,
          description: '商品・サービスを紹介するランディングページ',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'アンケート',
          url: `${siteUrl}/portal?tab=survey`,
          description: '顧客満足度調査・イベントアンケート・フィードバック収集',
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: 'セールスレター',
          url: `${siteUrl}/portal?tab=salesletter`,
          description: '商品やサービスの販売・告知用セールスレター',
        },
        {
          '@type': 'ListItem',
          position: 6,
          name: 'ゲーミフィケーション',
          url: `${siteUrl}/portal?tab=gamification`,
          description: 'ガチャ・福引き・スクラッチ・スロットなどの集客ゲーム',
        },
      ],
    },
  };

  // 構造化データ - BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'ポータル',
        item: `${siteUrl}/portal`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
