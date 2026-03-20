import { ThumbnailTemplate, ThumbnailStyleCategory, ThumbnailPlatformCategory } from './types';
import { youtubeImpactTemplates } from './youtube-impact';
import { youtubeMinimalTemplates } from './youtube-minimal';
import { youtubePopTemplates } from './youtube-pop';
import { youtubeProfessionalTemplates } from './youtube-professional';
import { youtubeEmotionalTemplates } from './youtube-emotional';
import { instagramPostTemplates } from './instagram-post';
import { instagramPostExtraTemplates } from './instagram-post-extra';
import { instagramStoryTemplates } from './instagram-story';
import { instagramStoryExtraTemplates } from './instagram-story-extra';
import { twitterTemplates } from './twitter';
import { threadsTemplates } from './threads';
import { bannerTemplates } from './banner';
import { tiktokTemplates } from './tiktok';
import { noteBlogTemplates } from './note-blog';

// 全テンプレート（28種）
export const thumbnailTemplates: ThumbnailTemplate[] = [
  ...youtubeImpactTemplates,
  ...youtubeMinimalTemplates,
  ...youtubePopTemplates,
  ...youtubeProfessionalTemplates,
  ...youtubeEmotionalTemplates,
  ...instagramPostTemplates,
  ...instagramPostExtraTemplates,
  ...instagramStoryTemplates,
  ...instagramStoryExtraTemplates,
  ...twitterTemplates,
  ...threadsTemplates,
  ...bannerTemplates,
  ...tiktokTemplates,
  ...noteBlogTemplates,
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
  { id: 'tiktok' as const, label: 'TikTok', aspectRatio: '9:16', icon: 'Youtube' },
  { id: 'note_blog' as const, label: 'note / ブログ', aspectRatio: '16:9', icon: 'Image' },
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

// テンプレート背景画像のパスを取得
export const getTemplateImagePath = (templateId: string, themeId: string): string => {
  return `/templates/thumbnail/${templateId}/${themeId}.png`;
};

export type { ThumbnailTemplate, ThumbnailStyleCategory, ThumbnailPlatformCategory };
