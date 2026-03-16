import { KindleCoverTemplate } from './types';

export const businessTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-business-modern',
    name: 'モダン・ミニマル',
    description: '洗練されたミニマルデザイン。経営・マーケティング書に最適',
    genre: 'business',
    promptTemplate: `Design a professional Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Upper 60%: Clean solid or subtle gradient background
- Title "{{title}}" centered, large bold Japanese typography (at least 40% of cover width)
- {{subtitle}}
- {{author}}
- Minimal geometric accents (thin lines, circles, or rectangles) for visual interest

DESIGN DIRECTION:
- Minimalist Japanese business book aesthetic (think 日本のビジネス書 bestsellers)
- Typography-driven design — text IS the main visual element
- No photographs, no complex illustrations
- Clean whitespace, strong typographic hierarchy
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: largest element, bold weight, impossible to miss even at thumbnail size
- Subtitle: 50% of title size, lighter weight
- Author: smallest text, bottom area
- NO placeholder text, NO lorem ipsum, NO English unless specifically in the title`,
    colorThemes: [
      {
        id: 'business-navy',
        name: 'ネイビー',
        colors: ['#1a365d', '#2b6cb0', '#ffffff'],
        promptModifier: 'COLOR: Deep navy blue background, white title text, thin gold accent line. Professional and trustworthy.',
      },
      {
        id: 'business-black-gold',
        name: 'ブラック&ゴールド',
        colors: ['#1a1a2e', '#c9a84c', '#ffffff'],
        promptModifier: 'COLOR: Rich black background, gold metallic title text, white subtitle. Premium and authoritative.',
      },
      {
        id: 'business-white-blue',
        name: 'ホワイト&ブルー',
        colors: ['#ffffff', '#2563eb', '#1e293b'],
        promptModifier: 'COLOR: Clean white background, blue accent elements, dark gray text. Modern and approachable.',
      },
      {
        id: 'business-dark-green',
        name: 'ダークグリーン',
        colors: ['#064e3b', '#10b981', '#ffffff'],
        promptModifier: 'COLOR: Dark emerald green background, white text, light green accents. Growth and success.',
      },
    ],
    tags: ['ビジネス', '経営', 'マーケティング', '戦略'],
  },
  {
    id: 'kindle-business-impact',
    name: 'インパクト・ベストセラー',
    description: '大胆で目を引くデザイン。売上・成果系の書籍に',
    genre: 'business',
    promptTemplate: `Design a high-impact Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Title "{{title}}" in MASSIVE bold Japanese text, filling 50-60% of the cover
- {{subtitle}}
- {{author}}
- Strong diagonal or angular design elements for dynamism
- Optional: large impact number or keyword highlighted in contrasting color

DESIGN DIRECTION:
- Japanese bestseller business book style (ベストセラー系)
- Bold, attention-grabbing, high-contrast
- Think "airport bookstore" — must pop from 3 meters away
- Dynamic composition with strong visual weight
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: dramatically large, bold, impossible to miss even at small thumbnail
- Use text size contrast for visual impact (key words EXTRA large)
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'impact-red-black',
        name: 'レッド&ブラック',
        colors: ['#1a1a1a', '#dc2626', '#ffffff'],
        promptModifier: 'COLOR: Bold red and black with white text. Powerful, urgent, high-energy.',
      },
      {
        id: 'impact-orange',
        name: 'オレンジ',
        colors: ['#1a1a1a', '#f97316', '#ffffff'],
        promptModifier: 'COLOR: Vibrant orange on dark background. Energetic, action-oriented.',
      },
      {
        id: 'impact-yellow-black',
        name: 'イエロー&ブラック',
        colors: ['#000000', '#eab308', '#ffffff'],
        promptModifier: 'COLOR: Striking yellow and black combination. Maximum visibility, warning-style impact.',
      },
    ],
    tags: ['インパクト', '売上', '成果', 'ベストセラー'],
  },
  {
    id: 'kindle-business-typographic',
    name: 'タイポグラフィック',
    description: '文字のみで構成する洗練デザイン。思考法・理論系に',
    genre: 'business',
    promptTemplate: `Design a typography-only Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- 100% typography-driven — NO illustrations, NO photos, NO icons
- Title "{{title}}" as the ENTIRE visual design element
- {{subtitle}}
- {{author}}
- Creative text layout: varying sizes, weights, and positions of title words
- Each word of the title may be a different size for visual rhythm

DESIGN DIRECTION:
- Inspired by premium Japanese book cover design (新書/文庫 style)
- Sophisticated, intellectual, thought-provoking
- The arrangement of text itself creates visual interest
- Maximum 2 fonts/weights for elegance
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title text IS the design — no other visual elements needed
- Clean, precise typography with intentional spacing
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'typo-white-black',
        name: 'モノトーン',
        colors: ['#ffffff', '#000000', '#6b7280'],
        promptModifier: 'COLOR: White background, black title text, gray accents. Minimalist intellectual.',
      },
      {
        id: 'typo-cream',
        name: 'クリーム',
        colors: ['#fef7ed', '#78350f', '#92400e'],
        promptModifier: 'COLOR: Warm cream/ivory background, dark brown text. Classic, literary, warm.',
      },
      {
        id: 'typo-navy-white',
        name: 'ネイビー&ホワイト',
        colors: ['#1e3a5f', '#ffffff', '#93c5fd'],
        promptModifier: 'COLOR: Dark navy background, white text, subtle blue accents. Authoritative.',
      },
    ],
    tags: ['タイポグラフィ', '思考法', '理論', 'ミニマル'],
  },
  {
    id: 'kindle-business-consulting',
    name: 'コンサルティング',
    description: 'プロフェッショナルで信頼感のあるデザイン。コンサル・戦略系に',
    genre: 'business',
    promptTemplate: `Design a consulting/strategy Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Premium, corporate layout with sophisticated geometric patterns
- Title "{{title}}" in authoritative, sans-serif Japanese typography
- {{subtitle}}
- {{author}}
- Subtle data visualization elements (abstract charts, graphs, network nodes) as decorative accents
- Professional corporate border or frame element

DESIGN DIRECTION:
- McKinsey/BCG-level consulting book aesthetic
- Data-driven, strategic, executive-level
- Premium and authoritative — "C-suite reads this" quality
- Clean lines, precise spacing, geometric precision
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: authoritative, strategic, professional
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'consulting-navy-gold',
        name: 'ネイビー&ゴールド',
        colors: ['#0f172a', '#c9a84c', '#ffffff'],
        promptModifier: 'COLOR: Dark navy with gold accents. Executive, premium, corporate authority.',
      },
      {
        id: 'consulting-gray',
        name: 'エグゼクティブグレー',
        colors: ['#374151', '#9ca3af', '#ffffff'],
        promptModifier: 'COLOR: Sophisticated gray tones. Modern consulting, analytical, refined.',
      },
      {
        id: 'consulting-blue',
        name: 'コーポレートブルー',
        colors: ['#1e3a5f', '#3b82f6', '#ffffff'],
        promptModifier: 'COLOR: Corporate blue. Trustworthy, data-driven, strategic.',
      },
    ],
    tags: ['コンサル', '戦略', '経営', 'MBA'],
  },
  {
    id: 'kindle-business-startup',
    name: 'スタートアップ',
    description: 'モダンでテック感のあるデザイン。起業・IT・スタートアップ系に',
    genre: 'business',
    promptTemplate: `Design a startup/tech business Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Modern, tech-forward design with gradient backgrounds
- Title "{{title}}" in modern, clean Japanese typography
- {{subtitle}}
- {{author}}
- Optional: abstract tech elements (circuit patterns, dots, connecting lines)
- Silicon Valley meets Japanese design sensibility

DESIGN DIRECTION:
- Tech startup book aesthetic
- Modern, innovative, future-forward
- Clean gradients, bold colors, geometric shapes
- "Disruption" and "innovation" energy
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: modern, bold, forward-looking
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'startup-purple',
        name: 'テックパープル',
        colors: ['#2e1065', '#8b5cf6', '#c4b5fd'],
        promptModifier: 'COLOR: Tech purple gradient. AI, innovation, future technology.',
      },
      {
        id: 'startup-dark',
        name: 'ダークモード',
        colors: ['#0f172a', '#06b6d4', '#22d3ee'],
        promptModifier: 'COLOR: Dark mode with cyan accents. Developer, coding, tech-savvy.',
      },
      {
        id: 'startup-gradient',
        name: 'グラデーション',
        colors: ['#4f46e5', '#ec4899', '#f97316'],
        promptModifier: 'COLOR: Vibrant multi-color gradient. Startup energy, creativity, disruption.',
      },
    ],
    tags: ['スタートアップ', '起業', 'IT', 'テック'],
  },
];
