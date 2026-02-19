import { ThumbnailTemplate } from './types';

export const youtubeProfessionalTemplates: ThumbnailTemplate[] = [
  {
    id: 'yt-pro-business',
    name: 'ビジネス',
    description: 'ビジネス・マーケティング系に最適な上品なデザイン',
    styleCategory: 'professional',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a professional business design.
The main text "{{title}}" should be displayed in an elegant, professional Japanese font.
{{subtitle}}
Clean layout with subtle gradient background, professional icons or abstract business elements.
{{colorModifier}}
Style: Corporate, trustworthy, sophisticated. Like a business presentation or consulting firm branding.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'navy-gold', name: 'ネイビーゴールド', colors: ['#1B3A5C', '#D4AF37'], promptModifier: 'Deep navy background with gold accents. Executive, premium feel.' },
      { id: 'charcoal', name: 'チャコール', colors: ['#333333', '#F5F5F5'], promptModifier: 'Dark charcoal with light gray/white text. Sleek and modern corporate.' },
      { id: 'teal-pro', name: 'ティールプロ', colors: ['#0D9488', '#F0FDFA'], promptModifier: 'Teal/dark cyan with clean white. Fresh yet professional.' },
    ],
    tags: ['YouTube', 'プロフェッショナル', 'ビジネス', 'マーケティング'],
  },
];
