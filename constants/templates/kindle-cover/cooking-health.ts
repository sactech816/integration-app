import { KindleCoverTemplate } from './types';

export const cookingHealthTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-cooking-recipe',
    name: 'レシピブック',
    description: '美味しさが伝わるレシピ本デザイン。料理本・レシピ集に',
    genre: 'cooking_health',
    promptTemplate: `Design a beautiful recipe book Kindle cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Upper area: Appetizing food photography or illustration (stylized, not real photo)
- Title "{{title}}" in warm, inviting Japanese typography
- {{subtitle}}
- {{author}}
- Optional: rustic textures, kitchen-themed decorative elements

DESIGN DIRECTION:
- Japanese recipe/cooking book aesthetic (料理本)
- Warm, appetizing, makes you want to cook
- Clean food styling with natural lighting feel
- Should convey "homemade warmth" and "delicious simplicity"
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: warm and inviting, food-related visual feel
- NO placeholder text, NO lorem ipsum, NO English unless in the original title`,
    colorThemes: [
      {
        id: 'recipe-warm',
        name: 'ナチュラル',
        colors: ['#fef7ed', '#ea580c', '#78350f'],
        promptModifier: 'COLOR: Warm natural tones — cream background, orange-brown accents. Rustic, homemade, appetizing.',
      },
      {
        id: 'recipe-green',
        name: 'オーガニック',
        colors: ['#f0fdf4', '#16a34a', '#14532d'],
        promptModifier: 'COLOR: Fresh green on light background. Organic, healthy, farm-to-table.',
      },
      {
        id: 'recipe-red',
        name: 'クッキングレッド',
        colors: ['#fef2f2', '#dc2626', '#450a0a'],
        promptModifier: 'COLOR: Rich red with cream background. Passionate cooking, Italian-inspired warmth.',
      },
    ],
    tags: ['レシピ', '料理', 'クッキング', '食'],
  },
  {
    id: 'kindle-health-wellness',
    name: 'ヘルス＆ウェルネス',
    description: '健康・ダイエット・美容本のデザイン。体の悩み解決系に',
    genre: 'cooking_health',
    promptTemplate: `Design a health and wellness Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Clean, refreshing background with health-themed abstract elements
- Title "{{title}}" in clear, modern Japanese typography
- {{subtitle}}
- {{author}}
- Optional: subtle body silhouette, leaf motifs, or wellness icons

DESIGN DIRECTION:
- Japanese health/wellness book aesthetic (健康本・美容本)
- Fresh, clean, invigorating — conveys vitality
- Scientific credibility meets approachable design
- "Your healthier self starts here" energy
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: clear and benefit-focused, communicates health transformation
- NO placeholder text, NO lorem ipsum, NO English unless in the original title`,
    colorThemes: [
      {
        id: 'health-green',
        name: 'フレッシュグリーン',
        colors: ['#ecfdf5', '#059669', '#064e3b'],
        promptModifier: 'COLOR: Fresh green tones. Natural, healthy, vitality.',
      },
      {
        id: 'health-blue',
        name: 'メディカルブルー',
        colors: ['#eff6ff', '#2563eb', '#1e3a5f'],
        promptModifier: 'COLOR: Clean medical blue. Trustworthy, scientific, professional.',
      },
      {
        id: 'health-pink',
        name: 'ビューティーピンク',
        colors: ['#fdf2f8', '#ec4899', '#831843'],
        promptModifier: 'COLOR: Soft beauty pink. Feminine, self-care, beauty-focused.',
      },
      {
        id: 'health-orange',
        name: 'エナジーオレンジ',
        colors: ['#fff7ed', '#f97316', '#7c2d12'],
        promptModifier: 'COLOR: Energetic orange. Active, diet, fitness-oriented.',
      },
    ],
    tags: ['健康', 'ダイエット', '美容', 'ウェルネス'],
  },
];
