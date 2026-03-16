import { ThumbnailTemplate } from './types';

export const instagramStoryExtraTemplates: ThumbnailTemplate[] = [
  {
    id: 'ig-story-countdown',
    name: 'カウントダウン',
    description: 'イベント・リリースのカウントダウンに最適',
    styleCategory: 'impact',
    platformCategory: 'instagram_story',
    aspectRatio: '9:16',
    promptTemplate: `Create an Instagram story image (1080x1920) with a dramatic countdown/announcement design.
The main text "{{title}}" should be displayed in bold, urgent Japanese typography.
{{subtitle}}
Include countdown visual elements like large numbers, clock motifs, or timer graphics.
{{colorModifier}}
Style: Urgent, exciting, "mark your calendar" energy. Event countdown quality.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'countdown-dark', name: 'ダーク', colors: ['#0A0A0A', '#FF0000'], promptModifier: 'Dark background with red accents. Dramatic, urgent, limited time.' },
      { id: 'countdown-gold', name: 'ゴールド', colors: ['#1A1A2E', '#FFD700'], promptModifier: 'Dark with gold accents. Premium event, exclusive, VIP.' },
      { id: 'countdown-neon', name: 'ネオン', colors: ['#0D0D0D', '#00FF88'], promptModifier: 'Dark with neon green. Digital countdown, tech launch, modern.' },
    ],
    tags: ['Instagram', 'ストーリー', 'カウントダウン', 'イベント'],
  },
  {
    id: 'ig-story-qa',
    name: 'Q&A・質問募集',
    description: '質問募集やQ&Aセッションの告知に',
    styleCategory: 'minimal',
    platformCategory: 'instagram_story',
    aspectRatio: '9:16',
    promptTemplate: `Create an Instagram story image (1080x1920) for a Q&A session or question collection.
The main text "{{title}}" should be displayed in friendly, inviting Japanese typography.
{{subtitle}}
Include visual elements like question marks, speech bubbles, or chat-style interface elements.
{{colorModifier}}
Style: Interactive, friendly, "ask me anything" energy. Should encourage participation.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'qa-pastel', name: 'パステル', colors: ['#E8D5F5', '#B8E6F0'], promptModifier: 'Soft pastel purple and blue. Friendly, approachable, casual.' },
      { id: 'qa-orange', name: 'オレンジ', colors: ['#FF8C00', '#FFF8DC'], promptModifier: 'Warm orange on light background. Fun, energetic, welcoming.' },
      { id: 'qa-mint', name: 'ミント', colors: ['#98FB98', '#F0FFF0'], promptModifier: 'Fresh mint green. Clean, calm, easy to engage with.' },
    ],
    tags: ['Instagram', 'ストーリー', 'Q&A', '質問'],
  },
  {
    id: 'ig-story-reels-cover',
    name: 'リール表紙',
    description: 'Instagram Reelsのカバー画像に最適',
    styleCategory: 'pop',
    platformCategory: 'instagram_story',
    aspectRatio: '9:16',
    promptTemplate: `Create an Instagram Reels cover image (1080x1920) that stands out in a profile grid.
The main text "{{title}}" should be displayed in bold, catchy Japanese typography.
{{subtitle}}
Design should work as both a video cover and standalone image. Include play button hint or dynamic motion-suggesting elements.
{{colorModifier}}
Style: Eye-catching, trendy, scroll-stopping. Should stand out in a profile grid view.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'reels-gradient', name: 'グラデーション', colors: ['#833AB4', '#FD1D1D', '#FCB045'], promptModifier: 'Instagram-style gradient (purple-red-orange). Trendy, viral, attention-grabbing.' },
      { id: 'reels-dark', name: 'ダークモード', colors: ['#121212', '#FFFFFF'], promptModifier: 'Dark background with white text. Clean, modern, bold contrast.' },
      { id: 'reels-pop', name: 'ポップカラー', colors: ['#FFE135', '#FF69B4'], promptModifier: 'Bright yellow and pink. Fun, Gen-Z aesthetic, playful.' },
    ],
    tags: ['Instagram', 'リール', 'カバー', '動画'],
  },
];
