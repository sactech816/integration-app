import { KindleCoverTemplate } from './types';

export const selfHelpTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-selfhelp-warm',
    name: '自己啓発・ウォーム',
    description: '温かみのある優しいデザイン。自己啓発・メンタル系に',
    genre: 'self_help',
    promptTemplate: `Design a warm and inviting Kindle book cover (portrait orientation, 1600x2560 pixels ratio).
Title: "{{title}}" displayed in clear, warm-toned Japanese text.
{{subtitle}}
{{author}}
Style: Warm, approachable self-help book cover with soft gradients and gentle visual elements. Inspirational and uplifting mood.
{{colorModifier}}
CRITICAL REQUIREMENTS:
- All Japanese text (日本語) MUST be rendered accurately, clearly, and completely readable
- The title should feel warm and inviting, not aggressive
- Create a sense of hope and positive transformation
- Elegant but not cold - approachable design
- Must be visually appealing at small thumbnail sizes on Amazon/Kindle store
- Do NOT include any placeholder text or lorem ipsum`,
    colorThemes: [
      {
        id: 'warm-sunrise',
        name: 'サンライズ',
        colors: ['#fef3c7', '#f59e0b', '#92400e'],
        promptModifier: 'Color scheme: Warm sunrise gradient with golden tones. Hopeful and new-beginning feel.',
      },
      {
        id: 'warm-sakura',
        name: 'サクラ',
        colors: ['#fce7f3', '#ec4899', '#831843'],
        promptModifier: 'Color scheme: Soft cherry blossom pink tones. Gentle, Japanese aesthetic, renewal.',
      },
      {
        id: 'warm-sky',
        name: 'スカイ',
        colors: ['#e0f2fe', '#0ea5e9', '#0c4a6e'],
        promptModifier: 'Color scheme: Clear sky blue gradient. Open, free, limitless possibilities.',
      },
      {
        id: 'warm-lavender',
        name: 'ラベンダー',
        colors: ['#f3e8ff', '#a855f7', '#581c87'],
        promptModifier: 'Color scheme: Soft lavender purple tones. Spiritual, calming, inner growth.',
      },
    ],
    tags: ['自己啓発', 'メンタル', '心理', '成長'],
  },
];
