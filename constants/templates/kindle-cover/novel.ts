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
  {
    id: 'kindle-novel-mystery',
    name: 'ミステリー・サスペンス',
    description: '緊張感のあるダークなデザイン。推理小説・ホラー・サスペンスに',
    genre: 'novel',
    promptTemplate: `Design a mystery/thriller Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Dark, atmospheric background with tension-building elements
- Title "{{title}}" in sharp, dramatic Japanese typography
- {{subtitle}}
- {{author}}
- Mysterious visual elements: shadows, silhouettes, fog, broken glass, or abstract danger motifs
- Strong contrast between light and dark areas

DESIGN DIRECTION:
- Japanese mystery/thriller book aesthetic (ミステリー・サスペンス)
- Tension, suspense, unease — "what's hiding in the shadows?"
- Dark and moody but professionally designed
- Think award-winning Japanese mystery novel covers
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: dramatic, sharp, creates intrigue
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'mystery-noir',
        name: 'ノワール',
        colors: ['#0f172a', '#475569', '#dc2626'],
        promptModifier: 'COLOR: Film noir — dark blacks with a single red accent. Danger, crime, suspense.',
      },
      {
        id: 'mystery-midnight',
        name: 'ミッドナイト',
        colors: ['#0c0a1d', '#312e81', '#818cf8'],
        promptModifier: 'COLOR: Deep midnight blue. Psychological thriller, eerie, cold.',
      },
      {
        id: 'mystery-blood',
        name: 'ブラッドレッド',
        colors: ['#1a0000', '#991b1b', '#fca5a5'],
        promptModifier: 'COLOR: Deep blood red and black. Horror, visceral, intense.',
      },
    ],
    tags: ['ミステリー', 'サスペンス', 'ホラー', '推理'],
  },
  {
    id: 'kindle-novel-romance',
    name: 'ロマンス・恋愛',
    description: '華やかで心ときめくデザイン。恋愛小説・ラブストーリーに',
    genre: 'novel',
    promptTemplate: `Design a romance novel Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Beautiful, dreamy background with romantic atmosphere
- Title "{{title}}" in elegant, flowing Japanese typography
- {{subtitle}}
- {{author}}
- Romantic visual elements: flowers, soft light, silhouettes, or abstract heart motifs
- Ethereal, dreamy composition

DESIGN DIRECTION:
- Japanese romance novel aesthetic (恋愛小説)
- Romantic, beautiful, heart-fluttering
- Elegant and tasteful — not cheesy
- Think bestselling Japanese romance novel covers
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: elegant, romantic, emotionally evocative
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'romance-rose',
        name: 'ローズ',
        colors: ['#fdf2f8', '#e11d48', '#881337'],
        promptModifier: 'COLOR: Deep rose pink tones. Passionate, romantic, beautiful.',
      },
      {
        id: 'romance-spring',
        name: 'スプリング',
        colors: ['#fefce8', '#fbbf24', '#fce7f3'],
        promptModifier: 'COLOR: Soft spring pastels — yellow, pink, warm light. First love, fresh romance.',
      },
      {
        id: 'romance-twilight',
        name: 'トワイライト',
        colors: ['#1e1b4b', '#a855f7', '#fce7f3'],
        promptModifier: 'COLOR: Purple twilight gradient to soft pink. Bittersweet, mature romance.',
      },
    ],
    tags: ['恋愛', 'ロマンス', 'ラブストーリー', '純文学'],
  },
];
