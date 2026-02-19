import { ThumbnailTemplate, ThumbnailStyleCategory, ThumbnailPlatformCategory } from './types';
import { youtubeImpactTemplates } from './youtube-impact';
import { youtubeMinimalTemplates } from './youtube-minimal';
import { youtubePopTemplates } from './youtube-pop';
import { youtubeProfessionalTemplates } from './youtube-professional';
import { instagramPostTemplates } from './instagram-post';
import { instagramStoryTemplates } from './instagram-story';
import { twitterTemplates } from './twitter';
import { threadsTemplates } from './threads';
import { bannerTemplates } from './banner';

// 全テンプレート（14種）
export const thumbnailTemplates: ThumbnailTemplate[] = [
  ...youtubeImpactTemplates,
  ...youtubeMinimalTemplates,
  ...youtubePopTemplates,
  ...youtubeProfessionalTemplates,
  ...instagramPostTemplates,
  ...instagramStoryTemplates,
  ...twitterTemplates,
  ...threadsTemplates,
  ...bannerTemplates,
];

export const getTemplatesByPlatform = (platform: ThumbnailPlatformCategory): ThumbnailTemplate[] => {
  return thumbnailTemplates.filter(t => t.platformCategory === platform);
};

export const getTemplatesByStyle = (style: ThumbnailStyleCategory): ThumbnailTemplate[] => {
  return thumbnailTemplates.filter(t => t.styleCategory === style);
};

export const getTemplateById = (id: string): ThumbnailTemplate | undefined => {
  return thumbnailTemplates.find(t => t.id === id);
};

// プラットフォームカテゴリ定義
export const PLATFORM_CATEGORIES = [
  { id: 'youtube' as const, label: 'YouTube', aspectRatio: '16:9', icon: 'Youtube' },
  { id: 'instagram_post' as const, label: 'Instagram 投稿', aspectRatio: '1:1', icon: 'Instagram' },
  { id: 'instagram_story' as const, label: 'Instagram ストーリー', aspectRatio: '9:16', icon: 'Instagram' },
  { id: 'twitter' as const, label: 'X / Twitter', aspectRatio: '16:9', icon: 'Twitter' },
  { id: 'threads' as const, label: 'Threads', aspectRatio: '1:1', icon: 'MessageCircle' },
  { id: 'banner' as const, label: '汎用バナー', aspectRatio: '16:9', icon: 'Image' },
];

// スタイルカテゴリ定義
export const STYLE_CATEGORIES = [
  { id: 'impact' as const, label: 'インパクト系', description: '目を引く大胆なデザイン' },
  { id: 'minimal' as const, label: 'ミニマル系', description: 'シンプルで洗練されたデザイン' },
  { id: 'pop' as const, label: 'ポップ系', description: '明るく楽しいデザイン' },
  { id: 'professional' as const, label: 'プロフェッショナル系', description: 'ビジネス向け上品なデザイン' },
  { id: 'emotional' as const, label: 'エモーショナル系', description: '感情に訴えるデザイン' },
];

export type { ThumbnailTemplate, ThumbnailStyleCategory, ThumbnailPlatformCategory };
