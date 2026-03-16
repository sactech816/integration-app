import { KindleCoverTemplate } from './types';

export const photoTravelTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-travel-guide',
    name: 'トラベルガイド',
    description: '旅情あふれるガイドブック風。旅行記・エリアガイドに',
    genre: 'photo_travel',
    promptTemplate: `Design a travel guide Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Stunning travel destination scenery (illustrated/stylized, not photorealistic)
- Title "{{title}}" in bold, adventurous Japanese typography
- {{subtitle}}
- {{author}}
- Optional: compass, map elements, stamp/passport motifs as decorative accents

DESIGN DIRECTION:
- Japanese travel book aesthetic (旅行ガイド・紀行本)
- Wanderlust-inducing, adventurous, culturally rich
- Beautiful scenic composition that transports the viewer
- Balance between "guidebook utility" and "travel dream inspiration"
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: bold and adventurous, visible against scenic background
- NO placeholder text, NO lorem ipsum, NO English unless in the original title`,
    colorThemes: [
      {
        id: 'travel-ocean',
        name: 'オーシャンブルー',
        colors: ['#0369a1', '#38bdf8', '#f0f9ff'],
        promptModifier: 'COLOR: Ocean blue tones. Beach, tropical, island paradise.',
      },
      {
        id: 'travel-earth',
        name: 'アーストーン',
        colors: ['#78350f', '#d97706', '#fef3c7'],
        promptModifier: 'COLOR: Warm earth tones. Desert, historical sites, cultural heritage.',
      },
      {
        id: 'travel-forest',
        name: 'フォレストグリーン',
        colors: ['#14532d', '#22c55e', '#f0fdf4'],
        promptModifier: 'COLOR: Lush forest green. Nature, mountains, countryside.',
      },
      {
        id: 'travel-sunset',
        name: 'サンセット',
        colors: ['#7c2d12', '#fb923c', '#fef3c7'],
        promptModifier: 'COLOR: Warm sunset gradient. Romantic, memorable, golden hour.',
      },
    ],
    tags: ['旅行', 'ガイド', '紀行', '観光'],
  },
  {
    id: 'kindle-photobook',
    name: 'フォトブック',
    description: '写真集・ビジュアルブック風。写真集・アート本に',
    genre: 'photo_travel',
    promptTemplate: `Design a photobook/visual book Kindle cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Full-bleed artistic photograph or illustration as main visual
- Title "{{title}}" in elegant, minimal Japanese typography
- {{subtitle}}
- {{author}}
- Minimal text placement — let the visual breathe
- White or thin border frame optional for gallery feel

DESIGN DIRECTION:
- Japanese photobook aesthetic (写真集・アートブック)
- Gallery-quality visual composition
- The image IS the cover — typography is secondary
- Artistic, contemplative, visually stunning
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: elegant and minimal, positioned to complement not compete with the visual
- NO placeholder text, NO lorem ipsum, NO English unless in the original title`,
    colorThemes: [
      {
        id: 'photo-mono',
        name: 'モノクローム',
        colors: ['#18181b', '#71717a', '#ffffff'],
        promptModifier: 'COLOR: Elegant black and white. Classic photography, timeless, artistic.',
      },
      {
        id: 'photo-warm',
        name: 'ウォームトーン',
        colors: ['#451a03', '#b45309', '#fef3c7'],
        promptModifier: 'COLOR: Warm sepia-like tones. Nostalgic, warm, film photography feel.',
      },
      {
        id: 'photo-cool',
        name: 'クールトーン',
        colors: ['#0c4a6e', '#0ea5e9', '#f0f9ff'],
        promptModifier: 'COLOR: Cool blue tones. Modern, crisp, contemporary photography.',
      },
    ],
    tags: ['写真集', 'フォトブック', 'アート', 'ビジュアル'],
  },
];
