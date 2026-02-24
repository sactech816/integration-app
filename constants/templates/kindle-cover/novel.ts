import { KindleCoverTemplate } from './types';

export const novelTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-novel-literary',
    name: '小説・文芸',
    description: '文学的で美しいデザイン。小説・エッセイに',
    genre: 'novel',
    promptTemplate: `Design an artistic and literary Kindle book cover (portrait orientation, 1600x2560 pixels ratio).
Title: "{{title}}" displayed in elegant, artistic Japanese text.
{{subtitle}}
{{author}}
Style: Literary and artistic book cover with beautiful visual storytelling. Evocative imagery that hints at the story's mood and theme.
{{colorModifier}}
CRITICAL REQUIREMENTS:
- All Japanese text (日本語) MUST be rendered accurately, clearly, and completely readable
- The title should have an artistic, literary feel - elegant typography
- Create atmospheric visual mood that draws readers in
- Balance between artistic expression and commercial appeal
- Must look intriguing and beautiful at small thumbnail sizes on Amazon/Kindle store
- Do NOT include any placeholder text or lorem ipsum`,
    colorThemes: [
      {
        id: 'novel-twilight',
        name: 'トワイライト',
        colors: ['#1e1b4b', '#6366f1', '#c7d2fe'],
        promptModifier: 'Color scheme: Deep twilight indigo tones. Mysterious, contemplative, atmospheric.',
      },
      {
        id: 'novel-monochrome',
        name: 'モノクローム',
        colors: ['#18181b', '#71717a', '#f4f4f5'],
        promptModifier: 'Color scheme: Elegant monochrome. Classic, timeless, sophisticated.',
      },
      {
        id: 'novel-autumn',
        name: 'オータム',
        colors: ['#451a03', '#d97706', '#fef3c7'],
        promptModifier: 'Color scheme: Rich autumn tones - deep brown, amber, warm gold. Nostalgic and reflective.',
      },
      {
        id: 'novel-ocean',
        name: 'オーシャン',
        colors: ['#0c4a6e', '#06b6d4', '#e0f2fe'],
        promptModifier: 'Color scheme: Deep ocean blue to cyan gradient. Vast, emotional, journey.',
      },
    ],
    tags: ['小説', 'エッセイ', '文芸', '物語'],
  },
];
