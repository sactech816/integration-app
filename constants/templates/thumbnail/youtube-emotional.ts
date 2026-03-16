import { ThumbnailTemplate } from './types';

export const youtubeEmotionalTemplates: ThumbnailTemplate[] = [
  {
    id: 'yt-emotional-quote',
    name: '名言・引用スタイル',
    description: '感動的な引用や名言を中心にしたデザイン',
    styleCategory: 'emotional',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a deeply emotional, inspirational design.
The main text "{{title}}" should be displayed in elegant, expressive Japanese typography, like a meaningful quote or life lesson.
{{subtitle}}
The background should be atmospheric — think soft gradients, bokeh lights, or a contemplative landscape.
{{colorModifier}}
Style: Emotional, reflective, cinematic quality. Should make viewers pause and think.
IMPORTANT: All Japanese text must be rendered clearly and accurately. Text should feel like a powerful quote.`,
    colorThemes: [
      { id: 'sunset-warm', name: 'サンセット', colors: ['#FF6B35', '#FFD700'], promptModifier: 'Warm sunset gradient background. Golden hour, nostalgic, hopeful.' },
      { id: 'night-blue', name: 'ナイトブルー', colors: ['#0A1628', '#4A90D9'], promptModifier: 'Deep night sky blue with subtle stars. Contemplative, peaceful, deep.' },
      { id: 'cherry-blossom', name: '桜', colors: ['#FFB7C5', '#FFF0F5'], promptModifier: 'Soft cherry blossom pink tones. Japanese beauty, fleeting, precious.' },
    ],
    tags: ['YouTube', '名言', '感動', 'エモーショナル'],
  },
  {
    id: 'yt-ranking',
    name: 'ランキング TOP',
    description: 'ランキング・TOP5/10形式の動画に最適',
    styleCategory: 'impact',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a bold ranking/top-list design.
The main text "{{title}}" should be displayed prominently with large numbers (like TOP 5, TOP 10) as a major visual element.
{{subtitle}}
The design should use medal/trophy motifs, numbered list visual cues, or podium-style layout.
{{colorModifier}}
Style: Eye-catching, competitive, "must-watch" energy. Numbers should be HUGE and impossible to miss.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'rank-gold', name: 'ゴールドランキング', colors: ['#FFD700', '#B8860B'], promptModifier: 'Gold and dark background. Trophy, medal, first place energy.' },
      { id: 'rank-neon', name: 'ネオンランキング', colors: ['#FF00FF', '#00FFFF'], promptModifier: 'Neon colors on dark background. Modern, flashy, tech-style ranking.' },
      { id: 'rank-red', name: 'レッドランキング', colors: ['#FF0000', '#8B0000'], promptModifier: 'Bold red with black. Urgent, must-see, breaking-news style ranking.' },
    ],
    tags: ['YouTube', 'ランキング', 'TOP', '順位'],
  },
  {
    id: 'yt-before-after',
    name: 'ビフォーアフター',
    description: '変化・成長を見せるBefore→Afterスタイル',
    styleCategory: 'impact',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with a dramatic before/after transformation design.
The main text "{{title}}" should be displayed prominently across the image.
{{subtitle}}
The image should be split into two halves — left side showing "before" (darker, duller) and right side showing "after" (brighter, better). Arrow or transformation symbol in the center.
{{colorModifier}}
Style: Dramatic transformation, satisfying contrast, click-worthy. Clear visual progression from left to right.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'ba-contrast', name: 'コントラスト', colors: ['#555555', '#00FF88'], promptModifier: 'Gray/dull on left side, vibrant green/bright on right. Maximum transformation contrast.' },
      { id: 'ba-glow', name: 'グロウアップ', colors: ['#1A1A2E', '#FFD700'], promptModifier: 'Dark to golden glow. From ordinary to extraordinary transformation.' },
      { id: 'ba-fresh', name: 'フレッシュ', colors: ['#8B4513', '#00BFFF'], promptModifier: 'Earthy/old on left to fresh/blue on right. Renewal, upgrade, evolution.' },
    ],
    tags: ['YouTube', 'ビフォーアフター', '変化', '比較'],
  },
  {
    id: 'yt-recipe',
    name: '料理・レシピ',
    description: '料理動画に最適な食欲をそそるデザイン',
    styleCategory: 'pop',
    platformCategory: 'youtube',
    aspectRatio: '16:9',
    promptTemplate: `Create a YouTube thumbnail (1280x720) with an appetizing food/recipe design.
The main text "{{title}}" should be displayed in bold, warm Japanese text with a fun, inviting feel.
{{subtitle}}
The background should feature stylized food illustrations or warm kitchen-themed design elements.
{{colorModifier}}
Style: Appetizing, warm, homemade feel. Should make viewers hungry and want to watch.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'recipe-warm', name: 'あったか', colors: ['#FF8C00', '#FFF8DC'], promptModifier: 'Warm orange and cream tones. Homemade, cozy, delicious.' },
      { id: 'recipe-fresh', name: 'フレッシュ', colors: ['#32CD32', '#FFFACD'], promptModifier: 'Fresh green and light yellow. Healthy, organic, farm-fresh.' },
      { id: 'recipe-cafe', name: 'カフェ風', colors: ['#8B4513', '#DEB887'], promptModifier: 'Rich brown and beige. Cafe aesthetic, artisan, crafted.' },
    ],
    tags: ['YouTube', '料理', 'レシピ', '食べ物'],
  },
];
