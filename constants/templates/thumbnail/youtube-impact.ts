import { ThumbnailTemplate } from './types';

export const youtubeImpactTemplates: ThumbnailTemplate[] = [
  {
    id: 'yt-impact-bold',
    name: '太字インパクト',
    description: '大きな太字テキストで視聴者の目を引くスタイル',
    styleCategory: 'impact',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a bold, eye-catching design.
The main text "{{title}}" should be displayed prominently in large, bold Japanese text with a strong outline/shadow effect.
{{subtitle}}
The background should be dynamic with a gradient effect and abstract shapes.
{{colorModifier}}
Style: High contrast, visually striking, professional YouTube thumbnail.
IMPORTANT: All Japanese text must be rendered clearly and accurately. Text should be the focal point.`,
    colorThemes: [
      { id: 'red-energy', name: '情熱レッド', colors: ['#FF0000', '#FF6B6B'], promptModifier: 'Use vibrant red and warm tones. High energy, urgent feel.' },
      { id: 'blue-trust', name: '信頼ブルー', colors: ['#0066FF', '#00BFFF'], promptModifier: 'Use deep blue and cool tones. Professional and trustworthy feel.' },
      { id: 'gold-premium', name: 'プレミアムゴールド', colors: ['#FFD700', '#FFA500'], promptModifier: 'Use gold and amber tones on dark background. Premium, luxurious feel.' },
    ],
    tags: ['YouTube', 'インパクト', '太字', '目立つ'],
  },
  {
    id: 'yt-impact-versus',
    name: 'VS対決スタイル',
    description: '比較・対決系の動画に最適なスプリットデザイン',
    styleCategory: 'impact',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a dramatic split/versus design.
The main text "{{title}}" should be displayed in the center with a bold, dramatic font.
{{subtitle}}
The image should be split diagonally or vertically, suggesting a comparison or battle.
{{colorModifier}}
Style: Dynamic, dramatic, competitive feel. Lightning or energy effects between the two sides.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'red-blue', name: '赤vs青', colors: ['#FF3333', '#3333FF'], promptModifier: 'Left side red/warm, right side blue/cool. Dramatic contrast.' },
      { id: 'dark-neon', name: 'ダークネオン', colors: ['#0A0A0A', '#00FF88'], promptModifier: 'Dark background with neon green accents and electric effects.' },
      { id: 'fire-ice', name: '炎と氷', colors: ['#FF6600', '#00CCFF'], promptModifier: 'Fire/orange on one side, ice/blue on the other. Elemental contrast.' },
    ],
    tags: ['YouTube', 'VS', '比較', '対決'],
  },
];
