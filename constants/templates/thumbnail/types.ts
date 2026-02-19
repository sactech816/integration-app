export type ThumbnailStyleCategory =
  | 'impact'        // インパクト系
  | 'minimal'       // ミニマル系
  | 'pop'           // ポップ系
  | 'professional'  // プロフェッショナル系
  | 'emotional';    // エモーショナル系

export type ThumbnailPlatformCategory =
  | 'youtube'
  | 'instagram_post'
  | 'instagram_story'
  | 'twitter'
  | 'threads'
  | 'banner';

export interface ThumbnailColorTheme {
  id: string;
  name: string;
  colors: string[];
  promptModifier: string;
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  description: string;
  styleCategory: ThumbnailStyleCategory;
  platformCategory: ThumbnailPlatformCategory;
  aspectRatio: string;
  promptTemplate: string;
  colorThemes: ThumbnailColorTheme[];
  tags: string[];
}
