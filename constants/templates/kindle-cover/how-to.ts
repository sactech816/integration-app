import { KindleCoverTemplate } from './types';

export const howToTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-howto-practical',
    name: 'プラクティカル・実用',
    description: '実用的で分かりやすいデザイン。ノウハウ本・入門書に',
    genre: 'how_to',
    promptTemplate: `Design a practical how-to Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Clean, structured layout with clear visual sections
- Title "{{title}}" in bold, clear Japanese typography
- {{subtitle}}
- {{author}}
- Optional: simple flat icons or pictograms related to the topic
- Visual "step" or "list" feeling (subtle numbered sections, bullet points as design elements)

DESIGN DIRECTION:
- Japanese practical/how-to book style (ハウツー本)
- Organized, trustworthy, "this book has the answers" feeling
- Clean whitespace, information-rich but not cluttered
- Accessible — should feel easy to read, not intimidating
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: clear and benefit-focused, communicates "what you'll learn"
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'howto-green',
        name: 'グリーン',
        colors: ['#f0fdf4', '#22c55e', '#14532d'],
        promptModifier: 'COLOR: Fresh green on light background. Growth, learning, step-by-step progress.',
      },
      {
        id: 'howto-blue',
        name: 'ブルー',
        colors: ['#eff6ff', '#3b82f6', '#1e3a5f'],
        promptModifier: 'COLOR: Clear blue on light background. Trustworthy, systematic, methodical.',
      },
      {
        id: 'howto-teal',
        name: 'ティール',
        colors: ['#f0fdfa', '#14b8a6', '#134e4a'],
        promptModifier: 'COLOR: Teal tones on light background. Modern, tech-savvy, innovative.',
      },
    ],
    tags: ['ハウツー', '実用', '入門', 'ノウハウ'],
  },
  {
    id: 'kindle-howto-guide',
    name: 'ガイドブック風',
    description: '完全ガイド・大全系のデザイン。網羅的な内容の書籍に',
    genre: 'how_to',
    promptTemplate: `Design a comprehensive guide Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Bold title "{{title}}" at center, framed by a decorative border or banner
- {{subtitle}}
- {{author}}
- "Complete guide" / "大全" aesthetic — feels comprehensive and authoritative
- Optional: subtle grid or pattern background suggesting thoroughness

DESIGN DIRECTION:
- Japanese "完全ガイド" / "大全" book style
- Authoritative and comprehensive feeling
- Should feel like "the definitive resource"
- Clean but substantial — not too minimal
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: bold and prominent, communicates authority
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'guide-royal',
        name: 'ロイヤル',
        colors: ['#1e1b4b', '#6366f1', '#ffffff'],
        promptModifier: 'COLOR: Royal indigo with gold/white accents. Prestigious, definitive, authoritative.',
      },
      {
        id: 'guide-orange',
        name: 'オレンジ',
        colors: ['#ffffff', '#ea580c', '#1c1917'],
        promptModifier: 'COLOR: White background with bold orange title and dark accents. Energetic, practical.',
      },
      {
        id: 'guide-slate',
        name: 'スレート',
        colors: ['#1e293b', '#94a3b8', '#ffffff'],
        promptModifier: 'COLOR: Dark slate with silver/white text. Professional, encyclopedic, reliable.',
      },
    ],
    tags: ['ガイド', '大全', '完全版', '網羅'],
  },
  {
    id: 'kindle-howto-stepbystep',
    name: 'ステップ図解',
    description: '手順を視覚的に伝えるデザイン。マニュアル・手順書に',
    genre: 'how_to',
    promptTemplate: `Design a step-by-step guide Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Structured layout with visual "step" progression (1-2-3 flow or arrows)
- Title "{{title}}" in clear, modern Japanese typography
- {{subtitle}}
- {{author}}
- Visual elements suggesting progression: numbered circles, flowchart-style arrows, milestone markers
- Clean grid-based layout conveying organization

DESIGN DIRECTION:
- Japanese step-by-step guide aesthetic (図解・手順書)
- Organized, logical, "follow this path to success"
- Infographic-inspired design elements
- Clear visual hierarchy — information architecture as design
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: clear, action-oriented, conveys "easy to follow"
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'step-blue',
        name: 'ステップブルー',
        colors: ['#eff6ff', '#2563eb', '#1e3a5f'],
        promptModifier: 'COLOR: Clear blue with white. Systematic, logical, step-by-step clarity.',
      },
      {
        id: 'step-purple',
        name: 'プロセスパープル',
        colors: ['#faf5ff', '#7c3aed', '#3b0764'],
        promptModifier: 'COLOR: Purple gradient. Creative process, transformation journey.',
      },
      {
        id: 'step-orange',
        name: 'アクションオレンジ',
        colors: ['#fff7ed', '#ea580c', '#431407'],
        promptModifier: 'COLOR: Energetic orange. Action-oriented, practical, hands-on.',
      },
    ],
    tags: ['図解', 'ステップ', '手順', 'マニュアル'],
  },
];
