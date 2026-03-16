import { ThumbnailTemplate } from './types';

export const instagramPostExtraTemplates: ThumbnailTemplate[] = [
  {
    id: 'ig-post-carousel',
    name: 'カルーセル1枚目',
    description: 'カルーセル投稿の表紙に最適な目を引くデザイン',
    styleCategory: 'impact',
    platformCategory: 'instagram_post',
    aspectRatio: '1:1',
    promptTemplate: `Create an Instagram carousel cover image (1080x1080) that compels users to swipe.
The main text "{{title}}" should be displayed in large, bold Japanese typography.
{{subtitle}}
Include a subtle "swipe" indicator or arrow element suggesting more content.
{{colorModifier}}
Style: Clean, modern, swipe-worthy. Should feel like the first slide of valuable content.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'carousel-gradient', name: 'グラデーション', colors: ['#667eea', '#764ba2'], promptModifier: 'Purple-blue gradient background. Modern, trendy, informative.' },
      { id: 'carousel-minimal', name: 'ミニマル', colors: ['#FFFFFF', '#1A1A1A'], promptModifier: 'Clean white background with black text. Minimalist, professional, readable.' },
      { id: 'carousel-warm', name: 'ウォーム', colors: ['#FF9A9E', '#FECFEF'], promptModifier: 'Soft warm pink gradient. Friendly, approachable, feminine.' },
    ],
    tags: ['Instagram', 'カルーセル', 'スワイプ', '投稿'],
  },
  {
    id: 'ig-post-sale',
    name: 'セール・告知',
    description: 'セール・キャンペーン告知に最適なポップなデザイン',
    styleCategory: 'pop',
    platformCategory: 'instagram_post',
    aspectRatio: '1:1',
    promptTemplate: `Create an Instagram sale/announcement post image (1080x1080) that grabs attention.
The main text "{{title}}" should be displayed in large, exciting Japanese text with sale/event energy.
{{subtitle}}
Include visual elements like confetti, stars, burst shapes, or price tags to create excitement.
{{colorModifier}}
Style: Exciting, urgent, "don't miss this!" energy. Retail/event announcement quality.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'sale-red', name: 'セールレッド', colors: ['#FF0000', '#FFD700'], promptModifier: 'Bold red with gold accents. Sale, discount, limited time energy.' },
      { id: 'sale-party', name: 'パーティー', colors: ['#FF69B4', '#FFD700'], promptModifier: 'Pink and gold with sparkles. Celebration, event, festive.' },
      { id: 'sale-cool', name: 'クールブルー', colors: ['#00BFFF', '#FFFFFF'], promptModifier: 'Cool blue and white. Modern sale, tech product launch.' },
    ],
    tags: ['Instagram', 'セール', '告知', 'キャンペーン'],
  },
  {
    id: 'ig-post-review',
    name: 'レビュー・口コミ',
    description: 'レビューや口コミ紹介に最適な信頼感のあるデザイン',
    styleCategory: 'professional',
    platformCategory: 'instagram_post',
    aspectRatio: '1:1',
    promptTemplate: `Create an Instagram review/testimonial post image (1080x1080) that builds trust.
The main text "{{title}}" should be displayed in clean, trustworthy Japanese typography.
{{subtitle}}
Include visual elements like star ratings, quote marks, or speech bubble shapes.
{{colorModifier}}
Style: Trustworthy, authentic, social proof. Should feel like a genuine customer review.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'review-gold', name: 'ゴールドスター', colors: ['#FFD700', '#FFF8DC'], promptModifier: 'Gold stars on light background. 5-star quality, premium review.' },
      { id: 'review-green', name: 'トラストグリーン', colors: ['#22C55E', '#F0FDF4'], promptModifier: 'Green trust tones on white. Verified, authentic, trustworthy.' },
      { id: 'review-navy', name: 'プロフェッショナル', colors: ['#1E3A5F', '#FFFFFF'], promptModifier: 'Navy and white. Professional, corporate testimonial style.' },
    ],
    tags: ['Instagram', 'レビュー', '口コミ', '評価'],
  },
];
