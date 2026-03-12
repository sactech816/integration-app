import { KindleCoverTemplate } from './types';

export const educationTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-education-study',
    name: '学習・テキスト',
    description: '知的で信頼感のあるデザイン。教育・学習・資格本に',
    genre: 'education',
    promptTemplate: `Design an educational Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Clean, academic layout with clear structure
- Title "{{title}}" in authoritative, clear Japanese typography
- {{subtitle}}
- {{author}}
- Optional: subtle academic motifs (geometric patterns, abstract knowledge symbols)
- Professional framing/border element for authority

DESIGN DIRECTION:
- Japanese educational/textbook aesthetic (教育書・参考書)
- Intelligent, well-organized, credible
- Communicate "expert knowledge" and "trustworthy content"
- Academic but not boring — modern educational design
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: authoritative and clear, conveys expertise
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'edu-royal-blue',
        name: 'ロイヤルブルー',
        colors: ['#1e3a5f', '#2563eb', '#ffffff'],
        promptModifier: 'COLOR: Royal blue and white. Academic, trustworthy, intellectual.',
      },
      {
        id: 'edu-forest',
        name: 'フォレスト',
        colors: ['#14532d', '#16a34a', '#f0fdf4'],
        promptModifier: 'COLOR: Forest green. Knowledge, growth, natural learning.',
      },
      {
        id: 'edu-burgundy',
        name: 'バーガンディ',
        colors: ['#4c1d25', '#be123c', '#fff1f2'],
        promptModifier: 'COLOR: Rich burgundy. Traditional, prestigious, scholarly.',
      },
    ],
    tags: ['教育', '学習', '資格', 'テキスト'],
  },
  {
    id: 'kindle-education-beginner',
    name: 'ビギナー・入門',
    description: '親しみやすい入門書デザイン。初心者向け解説書に',
    genre: 'education',
    promptTemplate: `Design a beginner-friendly Kindle book cover (portrait, 9:16 aspect ratio, 1600x2560px).

LAYOUT:
- Friendly, approachable layout
- Title "{{title}}" in clear, inviting Japanese typography
- {{subtitle}}
- {{author}}
- Simple flat illustrations or icons related to the topic
- Visual elements that say "easy to understand" and "welcoming"

DESIGN DIRECTION:
- Japanese beginner/intro book style (入門書・初心者向け)
- Friendly, non-intimidating, "you can do this" energy
- Simple, colorful, with clear visual hierarchy
- Think popular "いちばんやさしい" series aesthetic
{{colorModifier}}

CRITICAL TEXT RULES:
- Japanese text (日本語) must be 100% accurate and perfectly legible
- Title: friendly and inviting, not corporate or academic
- NO placeholder text, NO lorem ipsum`,
    colorThemes: [
      {
        id: 'beginner-yellow',
        name: 'イエロー',
        colors: ['#fef9c3', '#eab308', '#713f12'],
        promptModifier: 'COLOR: Bright cheerful yellow. Approachable, easy, fun to learn.',
      },
      {
        id: 'beginner-mint',
        name: 'ミント',
        colors: ['#d1fae5', '#34d399', '#065f46'],
        promptModifier: 'COLOR: Fresh mint green. Clean, refreshing, easy to digest.',
      },
      {
        id: 'beginner-light-blue',
        name: 'ライトブルー',
        colors: ['#dbeafe', '#60a5fa', '#1e40af'],
        promptModifier: 'COLOR: Light sky blue. Calm, clear, straightforward.',
      },
    ],
    tags: ['入門', '初心者', 'わかりやすい', '解説'],
  },
];
