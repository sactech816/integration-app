import { Metadata } from 'next';

export type UGCType = 'quiz' | 'profile' | 'business' | 'survey' | 'salesletter';

interface UGCMetadataInput {
  title: string;
  description: string;
  type: UGCType;
  slug: string;
  imageUrl?: string | null;
  keywords?: string[];
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
    keywords: [...config.defaultKeywords, ...(input.keywords || [])],
    alternates: { canonical },
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
