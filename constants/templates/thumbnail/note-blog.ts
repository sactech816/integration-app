import { ThumbnailTemplate } from './types';

export const noteBlogTemplates: ThumbnailTemplate[] = [
  {
    id: 'note-eyecatch',
    name: 'noteアイキャッチ',
    description: 'note記事のアイキャッチ画像に最適なデザイン',
    styleCategory: 'minimal',
    platformCategory: 'note_blog',
    aspectRatio: '16:9',
    promptTemplate: `Create a note/blog article eyecatch image (1280x720) with a clean, intellectual design.
The main text "{{title}}" should be displayed in elegant, readable Japanese typography.
{{subtitle}}
The design should be clean and sophisticated — suitable for a professional blog article.
{{colorModifier}}
Style: Intellectual, clean, readable. Should convey "quality content worth reading." Japanese note/blog aesthetic.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'note-minimal', name: 'ミニマル', colors: ['#FFFFFF', '#333333'], promptModifier: 'Clean white background with dark text. Minimalist, intellectual, note.com style.' },
      { id: 'note-warm', name: 'ウォーム', colors: ['#FFF8E7', '#8B6914'], promptModifier: 'Warm cream/ivory with dark gold text. Literary, thoughtful, warm.' },
      { id: 'note-gradient', name: 'グラデーション', colors: ['#667eea', '#764ba2'], promptModifier: 'Soft purple-blue gradient. Modern, tech-focused, trendy.' },
    ],
    tags: ['note', 'ブログ', 'アイキャッチ', '記事'],
  },
  {
    id: 'blog-ogp',
    name: 'ブログOGP画像',
    description: 'ブログ記事のOGP/SNSシェア用画像に',
    styleCategory: 'professional',
    platformCategory: 'note_blog',
    aspectRatio: '16:9',
    promptTemplate: `Create a blog OGP/social share image (1200x630, displayed at 16:9) with a professional design.
The main text "{{title}}" should be displayed prominently in clear, bold Japanese typography.
{{subtitle}}
Design should look great when shared on Twitter/Facebook. Clean layout with clear hierarchy.
{{colorModifier}}
Style: Professional, shareable, click-worthy in social feeds. Blog/media quality.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'ogp-blue', name: 'プロフェッショナル', colors: ['#1E3A5F', '#FFFFFF'], promptModifier: 'Navy and white. Professional, trustworthy, corporate blog.' },
      { id: 'ogp-green', name: 'テック', colors: ['#064E3B', '#10B981'], promptModifier: 'Dark green with emerald accents. Tech blog, startup, innovation.' },
      { id: 'ogp-orange', name: 'クリエイティブ', colors: ['#EA580C', '#FFF7ED'], promptModifier: 'Bold orange on light background. Creative, energetic, standout in feeds.' },
    ],
    tags: ['ブログ', 'OGP', 'SNSシェア', '記事'],
  },
];
