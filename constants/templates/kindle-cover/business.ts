import { KindleCoverTemplate } from './types';

export const businessTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-business-modern',
    name: 'ビジネス・モダン',
    description: '洗練されたモダンデザイン。経営・マーケティング書に最適',
    genre: 'business',
    promptTemplate: `Design a professional Kindle book cover (portrait orientation, 1600x2560 pixels ratio).
Title: "{{title}}" displayed prominently in large, bold Japanese text at the center.
{{subtitle}}
{{author}}
Style: Modern business book cover with clean geometric shapes and professional layout.
{{colorModifier}}
CRITICAL REQUIREMENTS:
- All Japanese text (日本語) MUST be rendered accurately, clearly, and completely readable
- The title is the MOST important visual element - make it large, bold, and impossible to miss
- Professional, premium quality design suitable for commercial publication
- Clean typography with proper spacing and hierarchy
- The cover must look compelling even at small thumbnail sizes on Amazon/Kindle store
- Do NOT include any placeholder text or lorem ipsum`,
    colorThemes: [
      {
        id: 'business-navy',
        name: 'ネイビー',
        colors: ['#1a365d', '#2b6cb0', '#ffffff'],
        promptModifier: 'Color scheme: Deep navy blue with white and gold accents. Professional and trustworthy feel.',
      },
      {
        id: 'business-black-gold',
        name: 'ブラック&ゴールド',
        colors: ['#1a1a2e', '#c9a84c', '#ffffff'],
        promptModifier: 'Color scheme: Black background with luxurious gold accents and white text. Premium and authoritative.',
      },
      {
        id: 'business-white-blue',
        name: 'ホワイト&ブルー',
        colors: ['#ffffff', '#2563eb', '#1e293b'],
        promptModifier: 'Color scheme: Clean white background with blue accent elements and dark text. Modern and approachable.',
      },
      {
        id: 'business-dark-green',
        name: 'ダークグリーン',
        colors: ['#064e3b', '#10b981', '#ffffff'],
        promptModifier: 'Color scheme: Dark green with emerald accents. Growth and success oriented.',
      },
    ],
    tags: ['ビジネス', '経営', 'マーケティング', '戦略'],
  },
  {
    id: 'kindle-business-impact',
    name: 'ビジネス・インパクト',
    description: '大胆で目を引くデザイン。売上・成果系の書籍に',
    genre: 'business',
    promptTemplate: `Design a high-impact Kindle book cover (portrait orientation, 1600x2560 pixels ratio).
Title: "{{title}}" displayed in LARGE, bold, eye-catching Japanese text.
{{subtitle}}
{{author}}
Style: Bold and impactful business book cover with strong contrast and dynamic composition. Think bestseller design.
{{colorModifier}}
CRITICAL REQUIREMENTS:
- All Japanese text (日本語) MUST be rendered accurately, clearly, and completely readable
- The title should be dramatically large and immediately grab attention
- Use bold typography and strong visual contrast
- High-energy, success-oriented visual mood
- Must stand out among other books at thumbnail size on Amazon/Kindle store
- Do NOT include any placeholder text or lorem ipsum`,
    colorThemes: [
      {
        id: 'impact-red-black',
        name: 'レッド&ブラック',
        colors: ['#1a1a1a', '#dc2626', '#ffffff'],
        promptModifier: 'Color scheme: Bold red and black with white text. Powerful and urgent.',
      },
      {
        id: 'impact-orange',
        name: 'オレンジ',
        colors: ['#1a1a1a', '#f97316', '#ffffff'],
        promptModifier: 'Color scheme: Vibrant orange on dark background. Energetic and action-oriented.',
      },
      {
        id: 'impact-yellow-black',
        name: 'イエロー&ブラック',
        colors: ['#000000', '#eab308', '#ffffff'],
        promptModifier: 'Color scheme: Striking yellow and black. High visibility, warning-style impact.',
      },
    ],
    tags: ['インパクト', '売上', '成果', 'ベストセラー'],
  },
];
