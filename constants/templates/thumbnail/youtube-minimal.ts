import { ThumbnailTemplate } from './types';

export const youtubeMinimalTemplates: ThumbnailTemplate[] = [
  {
    id: 'yt-minimal-clean',
    name: 'クリーンミニマル',
    description: 'シンプルで洗練されたデザイン。教育系・解説系に最適',
    styleCategory: 'minimal',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a clean, minimalist design.
The main text "{{title}}" should be displayed in a modern, clean Japanese font with plenty of white space.
{{subtitle}}
Simple geometric shapes or subtle patterns in the background. No clutter.
{{colorModifier}}
Style: Modern, clean, professional. Inspired by Apple/MUJI aesthetics. Lots of breathing room.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'white-black', name: 'モノクロ', colors: ['#FFFFFF', '#1A1A1A'], promptModifier: 'White background with black text. Minimal accent color.' },
      { id: 'soft-blue', name: 'ソフトブルー', colors: ['#F0F4FF', '#2563EB'], promptModifier: 'Soft light blue background with deep blue text. Calm and trustworthy.' },
      { id: 'warm-beige', name: 'ウォームベージュ', colors: ['#FAF5F0', '#8B6914'], promptModifier: 'Warm beige/cream background with brown/gold text. Elegant and warm.' },
    ],
    tags: ['YouTube', 'ミニマル', 'シンプル', '教育'],
  },
  {
    id: 'yt-minimal-number',
    name: 'ナンバリング',
    description: '数字を大きく強調。ランキング・リスト系に最適',
    styleCategory: 'minimal',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a number-focused minimalist design.
The main text "{{title}}" should be displayed with any numbers prominently enlarged and stylized.
{{subtitle}}
Clean background with a subtle gradient. The number should be the hero element.
{{colorModifier}}
Style: Clean, modern, number-centric. Great for "Top 5", "3 Tips", ranking content.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'navy-white', name: 'ネイビー', colors: ['#1B2A4A', '#FFFFFF'], promptModifier: 'Dark navy background with white text. Numbers in accent color.' },
      { id: 'green-fresh', name: 'フレッシュグリーン', colors: ['#E8F5E9', '#2E7D32'], promptModifier: 'Light green background with dark green text. Fresh and positive.' },
      { id: 'purple-elegant', name: 'エレガントパープル', colors: ['#F3E8FF', '#7C3AED'], promptModifier: 'Light purple background with deep purple text. Elegant and creative.' },
    ],
    tags: ['YouTube', 'ミニマル', '数字', 'ランキング'],
  },
];
