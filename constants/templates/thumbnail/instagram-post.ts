import { ThumbnailTemplate } from './types';

export const instagramPostTemplates: ThumbnailTemplate[] = [
  {
    id: 'ig-post-lifestyle',
    name: 'ライフスタイル',
    description: 'おしゃれで統一感のあるフィード向けデザイン',
    styleCategory: 'minimal',
    platformCategory: 'instagram_post',
    aspectRatio: '1:1',
    promptTemplate: `Create an Instagram post image (1080x1080) with a lifestyle/aesthetic design.
The main text "{{title}}" should be displayed in a stylish, modern Japanese font.
{{subtitle}}
Aesthetic background with soft lighting, subtle textures, or lifestyle photography feel.
{{colorModifier}}
Style: Instagram-worthy, aesthetic, lifestyle brand feel. Clean typography with visual balance.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'cream-brown', name: 'クリームブラウン', colors: ['#FDF5E6', '#8B4513'], promptModifier: 'Warm cream/beige tones with brown text. Cozy, cafe-like atmosphere.' },
      { id: 'sage-green', name: 'セージグリーン', colors: ['#E8F0E8', '#5F7A61'], promptModifier: 'Sage green and natural tones. Organic, natural aesthetic.' },
      { id: 'dusty-rose', name: 'ダスティローズ', colors: ['#F5E6E8', '#C48B9F'], promptModifier: 'Dusty rose and muted pink tones. Soft, feminine aesthetic.' },
    ],
    tags: ['Instagram', 'ライフスタイル', 'おしゃれ'],
  },
  {
    id: 'ig-post-announcement',
    name: 'お知らせ投稿',
    description: 'イベント・キャンペーン告知用の目立つデザイン',
    styleCategory: 'impact',
    platformCategory: 'instagram_post',
    aspectRatio: '1:1',
    promptTemplate: `Create an Instagram post image (1080x1080) for an announcement or promotion.
The main text "{{title}}" should be large and eye-catching in bold Japanese text.
{{subtitle}}
Dynamic background with gradient, geometric patterns, or abstract shapes.
{{colorModifier}}
Style: Attention-grabbing, promotional, clear call-to-action feel.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'orange-energy', name: 'オレンジエナジー', colors: ['#FF6B35', '#FFD700'], promptModifier: 'Vibrant orange and yellow gradient. Energetic and exciting.' },
      { id: 'electric-blue', name: 'エレクトリックブルー', colors: ['#0099FF', '#00D4FF'], promptModifier: 'Electric blue gradient. Modern and tech-forward feel.' },
      { id: 'magenta-bold', name: 'マゼンタボールド', colors: ['#FF0080', '#FF6EC7'], promptModifier: 'Bold magenta to pink gradient. Trendy and attention-grabbing.' },
    ],
    tags: ['Instagram', 'お知らせ', 'キャンペーン'],
  },
];
