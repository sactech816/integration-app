import { ThumbnailTemplate } from './types';

export const tiktokTemplates: ThumbnailTemplate[] = [
  {
    id: 'tiktok-trend',
    name: 'トレンド系',
    description: 'TikTokのトレンド動画カバーに最適なポップなデザイン',
    styleCategory: 'pop',
    platformCategory: 'tiktok',
    aspectRatio: '9:16',
    promptTemplate: `Create a TikTok video cover image (1080x1920) with a trendy, viral-ready design.
The main text "{{title}}" should be displayed in bold, dynamic Japanese typography with modern effects.
{{subtitle}}
Include TikTok-style visual elements: bold outlines, sticker-like graphics, emoji-inspired icons, or glitch effects.
{{colorModifier}}
Style: Trendy, viral, Gen-Z appeal. Should look native to TikTok's aesthetic — fun, bold, shareable.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'tiktok-neon', name: 'ティックトックネオン', colors: ['#000000', '#69C9D0', '#EE1D52'], promptModifier: 'TikTok brand colors — black with cyan and red neon accents. Native, on-brand.' },
      { id: 'tiktok-rainbow', name: 'レインボー', colors: ['#FF6B6B', '#FECA57', '#48DBFB'], promptModifier: 'Rainbow gradient, vibrant and playful. Attention-grabbing, fun, energetic.' },
      { id: 'tiktok-dark', name: 'ダークモード', colors: ['#161823', '#FFFFFF'], promptModifier: 'Dark mode aesthetic with white bold text. Clean, modern, cinematic.' },
    ],
    tags: ['TikTok', 'トレンド', 'バイラル', 'ポップ'],
  },
  {
    id: 'tiktok-howto',
    name: 'ハウツー・解説',
    description: 'ハウツー・チュートリアル動画のカバーに',
    styleCategory: 'minimal',
    platformCategory: 'tiktok',
    aspectRatio: '9:16',
    promptTemplate: `Create a TikTok tutorial/how-to cover image (1080x1920) with a clear, educational design.
The main text "{{title}}" should be displayed in clear, readable Japanese typography.
{{subtitle}}
Include visual elements suggesting learning: numbered steps, light bulb icons, or simple flat illustrations.
{{colorModifier}}
Style: Educational but fun, easy to understand, "learn this in 60 seconds" energy. Clean and organized.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'howto-blue', name: 'クリアブルー', colors: ['#E8F4FD', '#2196F3'], promptModifier: 'Clean blue and white. Educational, trustworthy, easy to follow.' },
      { id: 'howto-green', name: 'フレッシュグリーン', colors: ['#E8F5E9', '#4CAF50'], promptModifier: 'Fresh green on light background. Growth, learning, new skill.' },
      { id: 'howto-purple', name: 'クリエイティブパープル', colors: ['#F3E5F5', '#9C27B0'], promptModifier: 'Creative purple tones. Artistic tutorial, creative process.' },
    ],
    tags: ['TikTok', 'ハウツー', 'チュートリアル', '解説'],
  },
];
