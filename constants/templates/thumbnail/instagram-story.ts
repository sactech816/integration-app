import { ThumbnailTemplate } from './types';

export const instagramStoryTemplates: ThumbnailTemplate[] = [
  {
    id: 'ig-story-gradient',
    name: 'グラデーション',
    description: 'トレンド感のあるグラデーション背景ストーリー',
    styleCategory: 'pop',
    platformCategory: 'instagram_story',
    aspectRatio: '9:16',
    promptTemplate: `Create an Instagram Story image (1080x1920) with a trendy gradient design.
The main text "{{title}}" should be displayed in large, bold Japanese text in the center area.
{{subtitle}}
Beautiful gradient background filling the full vertical space. Modern, trendy feel.
{{colorModifier}}
Style: Trendy Instagram Story, full vertical layout, bold typography.
IMPORTANT: All Japanese text must be rendered clearly and accurately. Vertical 9:16 format.`,
    colorThemes: [
      { id: 'sunset', name: 'サンセット', colors: ['#FF6B6B', '#FFA07A', '#FFD700'], promptModifier: 'Sunset gradient from warm red through orange to gold. Dreamy atmosphere.' },
      { id: 'ocean', name: 'オーシャン', colors: ['#0077B6', '#00B4D8', '#90E0EF'], promptModifier: 'Ocean blue gradient from deep to light. Calm and refreshing.' },
      { id: 'aurora', name: 'オーロラ', colors: ['#7B2FF7', '#00D2FF', '#00FF88'], promptModifier: 'Aurora/northern lights gradient: purple, blue, green. Magical and dreamy.' },
    ],
    tags: ['Instagram', 'ストーリー', 'グラデーション'],
  },
  {
    id: 'ig-story-quote',
    name: '名言・格言',
    description: '心に響く言葉を美しく見せるストーリー',
    styleCategory: 'emotional',
    platformCategory: 'instagram_story',
    aspectRatio: '9:16',
    promptTemplate: `Create an Instagram Story image (1080x1920) for a quote or inspirational message.
The main text "{{title}}" should be displayed as an elegant quote in Japanese, centered vertically.
{{subtitle}}
Subtle, atmospheric background - soft bokeh, nature, or abstract art feel.
{{colorModifier}}
Style: Inspirational, thoughtful, elegant. Like a high-quality quote card.
IMPORTANT: All Japanese text must be rendered clearly and accurately. Vertical 9:16 format.`,
    colorThemes: [
      { id: 'dark-gold', name: 'ダークゴールド', colors: ['#1A1A2E', '#D4AF37'], promptModifier: 'Dark midnight blue background with gold text. Luxurious and profound.' },
      { id: 'soft-white', name: 'ソフトホワイト', colors: ['#F8F8F8', '#555555'], promptModifier: 'Soft white/light gray background with dark text. Clean and contemplative.' },
      { id: 'forest', name: 'フォレスト', colors: ['#1B4332', '#D8F3DC'], promptModifier: 'Deep forest green background with soft green/white text. Natural, serene.' },
    ],
    tags: ['Instagram', 'ストーリー', '名言', '格言'],
  },
];
