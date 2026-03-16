import { KindleCoverTemplate } from './types';

export const mangaIllustrationTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-manga-comic',
    name: 'コミック・マンガ',
    description: 'マンガ風のポップなデザイン。コミックエッセイ・マンガ解説に',
    genre: 'manga_illustration',
    promptTemplate: `Design a manga/comic-style Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Dynamic manga-style composition with strong visual impact
- Title "{{title}}" in bold, energetic Japanese manga typography (with effects like speed lines, burst)
- {{subtitle}}
- {{author}}
- Manga-style character or scene illustration
- Optional: speech bubbles, effect lines, halftone dots as design elements

DESIGN DIRECTION:
- Japanese manga cover aesthetic (マンガ・コミック)
- Dynamic, fun, eye-catching — "I want to read this!" energy
- Bold lines, expressive characters, action-oriented composition
- Think popular manga tankoubon (単行本) cover quality
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: bold manga-style lettering, energetic and fun
- NO placeholder text, NO lorem ipsum, NO English unless in the original title`,
    colorThemes: [
      {
        id: 'manga-shounen',
        name: '少年マンガ',
        colors: ['#ffffff', '#dc2626', '#1e40af'],
        promptModifier: 'COLOR: Bold red, blue, white. Classic shounen manga energy — action, adventure.',
      },
      {
        id: 'manga-shoujo',
        name: '少女マンガ',
        colors: ['#fdf2f8', '#ec4899', '#fbbf24'],
        promptModifier: 'COLOR: Pink, gold, soft tones. Shoujo manga aesthetic — romantic, sparkly.',
      },
      {
        id: 'manga-seinen',
        name: '青年マンガ',
        colors: ['#18181b', '#6b7280', '#ffffff'],
        promptModifier: 'COLOR: Dark, mature tones. Seinen manga — sophisticated, dramatic.',
      },
      {
        id: 'manga-comedy',
        name: 'コメディ',
        colors: ['#fef9c3', '#f97316', '#dc2626'],
        promptModifier: 'COLOR: Bright yellow, orange, red. Comedy manga — fun, lively, humorous.',
      },
    ],
    tags: ['マンガ', 'コミック', 'コミックエッセイ', 'イラスト'],
  },
  {
    id: 'kindle-illustration-artbook',
    name: 'イラスト集・画集',
    description: 'アートワーク・イラスト集のデザイン。作品集・画集に',
    genre: 'manga_illustration',
    promptTemplate: `Design an art collection/illustration book Kindle cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Showcase a beautiful piece of artwork/illustration as the centerpiece
- Title "{{title}}" in refined, artistic Japanese typography
- {{subtitle}}
- {{author}}
- Elegant framing that presents the art like a gallery exhibition
- Clean white space to let the artwork breathe

DESIGN DIRECTION:
- Japanese art book/illustration collection aesthetic (画集・イラスト集)
- Gallery-quality presentation — the art speaks for itself
- Refined, professional, collector-worthy
- Think art exhibition catalog quality
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: elegant and refined, doesn't overpower the artwork
- NO placeholder text, NO lorem ipsum, NO English unless in the original title`,
    colorThemes: [
      {
        id: 'artbook-white',
        name: 'ギャラリーホワイト',
        colors: ['#ffffff', '#1e293b', '#94a3b8'],
        promptModifier: 'COLOR: Clean white gallery-style. Minimalist, professional, art-focused.',
      },
      {
        id: 'artbook-black',
        name: 'ギャラリーブラック',
        colors: ['#0f172a', '#e2e8f0', '#94a3b8'],
        promptModifier: 'COLOR: Dark gallery-style. Dramatic, premium, exhibition-quality.',
      },
      {
        id: 'artbook-craft',
        name: 'クラフト',
        colors: ['#fef7ed', '#92400e', '#78350f'],
        promptModifier: 'COLOR: Warm craft paper tones. Handmade, artisan, warm creativity.',
      },
    ],
    tags: ['イラスト集', '画集', 'アートブック', '作品集'],
  },
];
