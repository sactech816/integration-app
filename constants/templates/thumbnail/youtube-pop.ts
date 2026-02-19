import { ThumbnailTemplate } from './types';

export const youtubePopTemplates: ThumbnailTemplate[] = [
  {
    id: 'yt-pop-colorful',
    name: 'カラフルポップ',
    description: '明るく楽しいデザイン。エンタメ・バラエティ系に最適',
    styleCategory: 'pop',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a colorful, fun, pop-art inspired design.
The main text "{{title}}" should be displayed in a playful, bold Japanese font with colorful outlines or speech bubble effects.
{{subtitle}}
Bright, vibrant background with confetti, stars, emoji-like elements, or comic-style effects.
{{colorModifier}}
Style: Fun, energetic, eye-catching. Like a Japanese variety show or manga style.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'rainbow', name: 'レインボー', colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'], promptModifier: 'Multi-color rainbow palette. Festive and cheerful atmosphere.' },
      { id: 'pink-yellow', name: 'ピンクイエロー', colors: ['#FF69B4', '#FFD700'], promptModifier: 'Pink and yellow dominant. Cute and energetic kawaii style.' },
      { id: 'neon-party', name: 'ネオンパーティー', colors: ['#FF00FF', '#00FFFF'], promptModifier: 'Neon magenta and cyan on dark background. Party/club vibe.' },
    ],
    tags: ['YouTube', 'ポップ', 'カラフル', 'エンタメ'],
  },
  {
    id: 'yt-pop-manga',
    name: '漫画スタイル',
    description: '漫画風の吹き出しと効果線で注目度UP',
    styleCategory: 'pop',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a Japanese manga/comic style design.
The main text "{{title}}" should be displayed in a manga-style speech bubble or impact frame with speed lines.
{{subtitle}}
Include manga elements: speed lines, impact effects, halftone dots, exclamation marks.
{{colorModifier}}
Style: Japanese manga aesthetic with bold outlines, dramatic effects, and expressive typography.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'classic-bw', name: 'クラシック白黒', colors: ['#FFFFFF', '#000000'], promptModifier: 'Black and white manga style with red accent for emphasis.' },
      { id: 'shonen', name: '少年マンガ', colors: ['#FF4500', '#FFD700'], promptModifier: 'Orange and gold tones. Energetic shonen manga feel with action lines.' },
      { id: 'shoujo', name: '少女マンガ', colors: ['#FF69B4', '#FFB6C1'], promptModifier: 'Pink tones with sparkle effects. Shoujo manga dreamy aesthetic.' },
    ],
    tags: ['YouTube', 'ポップ', '漫画', 'マンガ'],
  },
];
