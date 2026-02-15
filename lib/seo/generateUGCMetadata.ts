import { Metadata } from 'next';

export type UGCType = 'quiz' | 'profile' | 'business' | 'survey' | 'salesletter'
  | 'gacha' | 'fukubiki' | 'scratch' | 'slot' | 'stamp-rally' | 'login-bonus'
  | 'booking' | 'kindle' | 'point-quiz' | 'arcade' | 'attendance';

interface UGCMetadataInput {
  title: string;
  description: string;
  type: UGCType;
  slug: string;
  imageUrl?: string | null;
  keywords?: string[];
  noindex?: boolean;
}

const TYPE_CONFIG: Record<UGCType, { pathPrefix: string; label: string; defaultKeywords: string[] }> = {
  quiz: {
    pathPrefix: 'quiz',
    label: '診断クイズ',
    defaultKeywords: ['診断クイズ', '性格診断', '心理テスト', '無料診断'],
  },
  profile: {
    pathPrefix: 'profile',
    label: 'プロフィールLP',
    defaultKeywords: ['プロフィール', 'リンクまとめ', 'プロフィールサイト'],
  },
  business: {
    pathPrefix: 'business',
    label: 'ビジネスLP',
    defaultKeywords: ['ランディングページ', 'LP', 'ビジネスLP'],
  },
  survey: {
    pathPrefix: 'survey',
    label: 'アンケート',
    defaultKeywords: ['アンケート', 'アンケート作成', 'フィードバック'],
  },
  salesletter: {
    pathPrefix: 's',
    label: 'セールスレター',
    defaultKeywords: ['セールスレター', 'LP'],
  },
  gacha: {
    pathPrefix: 'gacha',
    label: 'ガチャ',
    defaultKeywords: ['ガチャ', 'オンラインガチャ', 'デジタルガチャ', '集客ツール'],
  },
  fukubiki: {
    pathPrefix: 'fukubiki',
    label: '福引き',
    defaultKeywords: ['福引き', 'デジタル福引き', '抽選', 'オンライン抽選'],
  },
  scratch: {
    pathPrefix: 'scratch',
    label: 'スクラッチ',
    defaultKeywords: ['スクラッチ', 'デジタルスクラッチ', 'スクラッチくじ'],
  },
  slot: {
    pathPrefix: 'slot',
    label: 'スロット',
    defaultKeywords: ['スロット', 'デジタルスロット', 'オンラインスロット'],
  },
  'stamp-rally': {
    pathPrefix: 'stamp-rally',
    label: 'スタンプラリー',
    defaultKeywords: ['スタンプラリー', 'デジタルスタンプラリー', 'ポイントカード'],
  },
  'login-bonus': {
    pathPrefix: 'login-bonus',
    label: 'ログインボーナス',
    defaultKeywords: ['ログインボーナス', '来店ポイント', 'リピート集客'],
  },
  'point-quiz': {
    pathPrefix: 'point-quiz',
    label: 'ポイントクイズ',
    defaultKeywords: ['ポイントクイズ', 'クイズゲーム', 'ポイント獲得'],
  },
  arcade: {
    pathPrefix: 'arcade',
    label: 'アーケード',
    defaultKeywords: ['アーケードゲーム', 'ミニゲーム', 'ブラウザゲーム'],
  },
  booking: {
    pathPrefix: 'booking',
    label: '予約',
    defaultKeywords: ['予約システム', 'オンライン予約', '予約受付'],
  },
  kindle: {
    pathPrefix: 'kindle',
    label: 'Kindle出版',
    defaultKeywords: ['Kindle出版', 'KDP', '電子書籍'],
  },
  attendance: {
    pathPrefix: 'attendance',
    label: '出席管理',
    defaultKeywords: ['出席管理', '出欠確認', 'イベント管理'],
  },
};

export function generateUGCMetadata(input: UGCMetadataInput): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const config = TYPE_CONFIG[input.type];
  const ogImage = input.imageUrl ||
    `${siteUrl}/api/og?title=${encodeURIComponent(input.title)}&type=${input.type}`;
  const canonical = `${siteUrl}/${config.pathPrefix}/${input.slug}`;
  const description = input.description || `${input.title} - ${config.label}`;

  return {
    title: input.title,
    description,
    keywords: [...config.defaultKeywords, ...(input.keywords || []), '集客メーカー'],
    alternates: { canonical },
    ...(input.noindex && {
      robots: { index: false, follow: true },
    }),
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: canonical,
      siteName: '集客メーカー',
      title: input.title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description,
      images: [ogImage],
      creator: '@syukaku_maker',
    },
  };
}
