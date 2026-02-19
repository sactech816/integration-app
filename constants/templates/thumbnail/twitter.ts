import { ThumbnailTemplate } from './types';

export const twitterTemplates: ThumbnailTemplate[] = [
  {
    id: 'tw-news',
    name: 'ニュース・速報',
    description: 'ニュースや重要情報のシェアに最適',
    styleCategory: 'professional',
    platformCategory: 'twitter',
    aspectRatio: '16:9',
    promptTemplate: `Create a Twitter/X post image (1200x675) with a news/breaking announcement style.
The main text "{{title}}" should be displayed in a bold, urgent Japanese font.
{{subtitle}}
Clean, structured layout like a news graphic. Clear and informative.
{{colorModifier}}
Style: News-style graphic, authoritative, easy to read at small sizes on Twitter feed.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'breaking-red', name: '速報レッド', colors: ['#CC0000', '#FFFFFF'], promptModifier: 'Red accent bar with white background. Breaking news urgency.' },
      { id: 'tech-dark', name: 'テックダーク', colors: ['#0F172A', '#38BDF8'], promptModifier: 'Dark slate background with sky blue accents. Tech news feel.' },
      { id: 'finance-green', name: 'ファイナンスグリーン', colors: ['#064E3B', '#10B981'], promptModifier: 'Dark green with emerald accents. Finance/business news feel.' },
    ],
    tags: ['X', 'Twitter', 'ニュース', '速報'],
  },
  {
    id: 'tw-tips',
    name: 'Tips・ノウハウ',
    description: '役立つ情報をシェアするカード型デザイン',
    styleCategory: 'minimal',
    platformCategory: 'twitter',
    aspectRatio: '16:9',
    promptTemplate: `Create a Twitter/X post image (1200x675) as an informational tip card.
The main text "{{title}}" should be clear and readable in Japanese.
{{subtitle}}
Card-style layout with icon or small illustration. Clean and shareable.
{{colorModifier}}
Style: Clean tip card, informational, easy to read. Optimized for Twitter feed visibility.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'blue-card', name: 'ブルーカード', colors: ['#EFF6FF', '#1D4ED8'], promptModifier: 'Light blue card background with dark blue text. Trustworthy, educational.' },
      { id: 'yellow-card', name: 'イエローカード', colors: ['#FFFBEB', '#B45309'], promptModifier: 'Light yellow background with amber text. Friendly, approachable tips.' },
      { id: 'violet-card', name: 'バイオレットカード', colors: ['#F5F3FF', '#6D28D9'], promptModifier: 'Light violet background with purple text. Creative, insightful.' },
    ],
    tags: ['X', 'Twitter', 'Tips', 'ノウハウ'],
  },
];
