import { KindleCoverTemplate } from './types';

export const selfHelpTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-selfhelp-warm',
    name: 'ウォーム・やさしい',
    description: '温かみのある優しいデザイン。自己啓発・メンタル系に',
    genre: 'self_help',
    promptTemplate: `Design a warm and inviting Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Soft gradient background with gentle, organic shapes
- Title "{{title}}" in warm, friendly Japanese typography (rounded or soft font style)
- {{subtitle}}
- {{author}}
- Optional: soft watercolor-style abstract shapes or gentle light effects

DESIGN DIRECTION:
- Japanese self-help book aesthetic (自己啓発書)
- Warm, approachable, hopeful — like a gentle sunrise
- Soft edges, no sharp angles
- Convey "transformation" and "new beginning"
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: warm and inviting feel, not aggressive or corporate
- Clear hierarchy: title > subtitle > author
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'warm-sunrise',
        name: 'サンライズ',
        colors: ['#fef3c7', '#f59e0b', '#92400e'],
        promptModifier: 'COLOR: Warm sunrise gradient — soft yellow to golden amber. Hopeful, new-beginning.',
      },
      {
        id: 'warm-sakura',
        name: 'サクラ',
        colors: ['#fce7f3', '#ec4899', '#831843'],
        promptModifier: 'COLOR: Soft cherry blossom pink gradient. Gentle Japanese aesthetic, renewal, beauty.',
      },
      {
        id: 'warm-sky',
        name: 'スカイ',
        colors: ['#e0f2fe', '#0ea5e9', '#0c4a6e'],
        promptModifier: 'COLOR: Clear sky blue gradient. Open, free, limitless possibilities.',
      },
      {
        id: 'warm-lavender',
        name: 'ラベンダー',
        colors: ['#f3e8ff', '#a855f7', '#581c87'],
        promptModifier: 'COLOR: Soft lavender purple gradient. Spiritual, calming, inner growth.',
      },
    ],
    tags: ['自己啓発', 'メンタル', '心理', '成長'],
  },
  {
    id: 'kindle-selfhelp-empowering',
    name: 'エンパワー・力強い',
    description: '力強く背中を押すデザイン。行動・習慣・目標達成系に',
    genre: 'self_help',
    promptTemplate: `Design an empowering Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Bold, upward-moving visual composition (rising lines, upward arrows, ascending shapes)
- Title "{{title}}" in strong, confident Japanese typography
- {{subtitle}}
- {{author}}
- Dynamic composition suggesting forward momentum and growth

DESIGN DIRECTION:
- Japanese motivational book style
- Energetic but not aggressive — empowering, not intimidating
- Suggest action, movement, progress
- Think "I can do this" energy
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: bold and confident, medium-large size
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'empower-blue-white',
        name: 'ブルー&ホワイト',
        colors: ['#1e40af', '#60a5fa', '#ffffff'],
        promptModifier: 'COLOR: Deep blue to light blue gradient, white text. Confident, clear-headed.',
      },
      {
        id: 'empower-green-gold',
        name: 'グリーン&ゴールド',
        colors: ['#065f46', '#10b981', '#fbbf24'],
        promptModifier: 'COLOR: Deep green with gold accents. Growth, achievement, success.',
      },
      {
        id: 'empower-coral',
        name: 'コーラル',
        colors: ['#be185d', '#fb7185', '#ffffff'],
        promptModifier: 'COLOR: Vibrant coral to pink. Energetic, passionate, life-affirming.',
      },
    ],
    tags: ['行動', '習慣', '目標達成', 'モチベーション'],
  },
];
