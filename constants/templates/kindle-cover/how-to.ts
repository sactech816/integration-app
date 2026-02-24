import { KindleCoverTemplate } from './types';

export const howToTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-howto-practical',
    name: 'ハウツー・実用',
    description: '実用的で分かりやすいデザイン。ノウハウ本・入門書に',
    genre: 'how_to',
    promptTemplate: `Design a practical and informative Kindle book cover (portrait orientation, 1600x2560 pixels ratio).
Title: "{{title}}" displayed in bold, clear Japanese text.
{{subtitle}}
{{author}}
Style: Clean, informative how-to book cover. Practical and structured design with clear visual hierarchy. Should communicate "useful knowledge inside".
{{colorModifier}}
CRITICAL REQUIREMENTS:
- All Japanese text (日本語) MUST be rendered accurately, clearly, and completely readable
- The title must clearly communicate the topic/benefit
- Design should look organized and information-rich
- Professional but accessible - not intimidating
- Must be readable and attractive at small thumbnail sizes on Amazon/Kindle store
- Do NOT include any placeholder text or lorem ipsum`,
    colorThemes: [
      {
        id: 'howto-green',
        name: 'グリーン',
        colors: ['#f0fdf4', '#22c55e', '#14532d'],
        promptModifier: 'Color scheme: Fresh green tones. Growth, learning, step-by-step progress.',
      },
      {
        id: 'howto-blue',
        name: 'ブルー',
        colors: ['#eff6ff', '#3b82f6', '#1e3a5f'],
        promptModifier: 'Color scheme: Clear blue tones. Trustworthy, systematic, methodical.',
      },
      {
        id: 'howto-teal',
        name: 'ティール',
        colors: ['#f0fdfa', '#14b8a6', '#134e4a'],
        promptModifier: 'Color scheme: Teal tones. Modern, tech-savvy, innovative approach.',
      },
    ],
    tags: ['ハウツー', '実用', '入門', 'ノウハウ'],
  },
];
