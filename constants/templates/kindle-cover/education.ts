import { KindleCoverTemplate } from './types';

export const educationTemplates: KindleCoverTemplate[] = [
  {
    id: 'kindle-education-study',
    name: '教育・学習',
    description: '知的で信頼感のあるデザイン。教育・学習・資格本に',
    genre: 'education',
    promptTemplate: `Design an educational and trustworthy Kindle book cover (portrait orientation, 1600x2560 pixels ratio).
Title: "{{title}}" displayed in clear, authoritative Japanese text.
{{subtitle}}
{{author}}
Style: Educational book cover with a smart, intellectual feel. Clean layout that communicates expertise and reliability. Suitable for textbooks, study guides, or certification prep books.
{{colorModifier}}
CRITICAL REQUIREMENTS:
- All Japanese text (日本語) MUST be rendered accurately, clearly, and completely readable
- The title should convey authority and expertise
- Design should look intelligent and well-organized
- Communicate credibility and educational value
- Must be clearly readable at small thumbnail sizes on Amazon/Kindle store
- Do NOT include any placeholder text or lorem ipsum`,
    colorThemes: [
      {
        id: 'edu-royal-blue',
        name: 'ロイヤルブルー',
        colors: ['#1e3a5f', '#2563eb', '#ffffff'],
        promptModifier: 'Color scheme: Royal blue and white. Academic, trustworthy, intellectual.',
      },
      {
        id: 'edu-forest',
        name: 'フォレスト',
        colors: ['#14532d', '#16a34a', '#f0fdf4'],
        promptModifier: 'Color scheme: Forest green tones. Knowledge, growth, natural learning.',
      },
      {
        id: 'edu-burgundy',
        name: 'バーガンディ',
        colors: ['#4c1d25', '#be123c', '#fff1f2'],
        promptModifier: 'Color scheme: Rich burgundy red. Traditional, prestigious, scholarly.',
      },
    ],
    tags: ['教育', '学習', '資格', 'テキスト'],
  },
];
