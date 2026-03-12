import { KindleCoverTemplate } from './types';

export const novelTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-novel-literary',
    name: '文芸・文学',
    description: '文学的で美しいデザイン。小説・エッセイに',
    genre: 'novel',
    promptTemplate: `Design an artistic literary Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Atmospheric background imagery (abstract landscape, mood-setting scene, or artistic texture)
- Title "{{title}}" in elegant, artistic Japanese typography
- {{subtitle}}
- {{author}}
- Evocative visual that hints at the story's mood without being literal

DESIGN DIRECTION:
- Japanese literary fiction aesthetic (文芸書)
- Artistic, atmospheric, emotionally evocative
- Think "gallery poster" quality — beautiful enough to frame
- Balance between artistic expression and commercial readability
- Suggest a mood/emotion, not a specific scene
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: elegant typography, artistic but still clearly readable
- Author name: subtle, refined placement
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'novel-twilight',
        name: 'トワイライト',
        colors: ['#1e1b4b', '#6366f1', '#c7d2fe'],
        promptModifier: 'COLOR: Deep twilight indigo tones. Mysterious, contemplative, atmospheric.',
      },
      {
        id: 'novel-monochrome',
        name: 'モノクローム',
        colors: ['#18181b', '#71717a', '#f4f4f5'],
        promptModifier: 'COLOR: Elegant monochrome — black, gray, white. Classic, timeless, sophisticated.',
      },
      {
        id: 'novel-autumn',
        name: 'オータム',
        colors: ['#451a03', '#d97706', '#fef3c7'],
        promptModifier: 'COLOR: Rich autumn tones — deep brown, amber, warm gold. Nostalgic, reflective.',
      },
      {
        id: 'novel-ocean',
        name: 'オーシャン',
        colors: ['#0c4a6e', '#06b6d4', '#e0f2fe'],
        promptModifier: 'COLOR: Deep ocean blue to cyan. Vast, emotional, journey.',
      },
    ],
    tags: ['小説', 'エッセイ', '文芸', '物語'],
  },
  {
    id: 'kindle-novel-illustration',
    name: 'イラスト風',
    description: 'イラストレーション中心のデザイン。ライトノベル・ファンタジーに',
    genre: 'novel',
    promptTemplate: `Design an illustration-style Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Main visual: beautiful illustration occupying 70% of the cover
- Title "{{title}}" positioned clearly (top or bottom) in stylish Japanese text
- {{subtitle}}
- {{author}}
- Illustration style: anime-influenced or Japanese illustration (日本イラスト) aesthetic

DESIGN DIRECTION:
- Light novel / Japanese illustration book style
- Beautiful, detailed character or scene illustration
- Eye-catching and inviting — draw readers into the story world
- Popular Japanese book illustration quality
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: stylish but readable, positioned to not obstruct key illustration areas
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'illust-fantasy',
        name: 'ファンタジー',
        colors: ['#312e81', '#8b5cf6', '#fde68a'],
        promptModifier: 'COLOR: Fantasy purple and gold tones. Magical, otherworldly, adventurous.',
      },
      {
        id: 'illust-pastel',
        name: 'パステル',
        colors: ['#fce7f3', '#a5f3fc', '#fef9c3'],
        promptModifier: 'COLOR: Soft pastel rainbow. Gentle, dreamy, romantic.',
      },
      {
        id: 'illust-dark',
        name: 'ダーク',
        colors: ['#0f172a', '#475569', '#94a3b8'],
        promptModifier: 'COLOR: Dark, moody tones. Suspense, mystery, drama.',
      },
    ],
    tags: ['ライトノベル', 'ファンタジー', 'イラスト', '物語'],
  },
];
