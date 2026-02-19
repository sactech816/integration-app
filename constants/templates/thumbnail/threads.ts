import { ThumbnailTemplate } from './types';

export const threadsTemplates: ThumbnailTemplate[] = [
  {
    id: 'threads-conversation',
    name: 'カンバセーション',
    description: '会話を引き出すシンプルなカード型デザイン',
    styleCategory: 'minimal',
    platformCategory: 'threads',
    aspectRatio: '1:1',
    promptTemplate: `Create a Threads post image (1080x1080) with a conversation-starter card design.
The main text "{{title}}" should be displayed in a clear, modern Japanese font.
{{subtitle}}
Simple, clean card design with subtle texture or pattern. Invites engagement and discussion.
{{colorModifier}}
Style: Conversational, modern, Instagram Threads aesthetic. Clean and social.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'threads-dark', name: 'ダークモード', colors: ['#101010', '#FFFFFF'], promptModifier: 'Dark mode style matching Threads app aesthetic. White text on near-black.' },
      { id: 'threads-warm', name: 'ウォーム', colors: ['#FFF8F0', '#1A1A1A'], promptModifier: 'Warm off-white background with dark text. Friendly and approachable.' },
      { id: 'threads-accent', name: 'アクセントカラー', colors: ['#F0F0F0', '#E1306C'], promptModifier: 'Light gray background with Instagram pink accent. Social media native feel.' },
    ],
    tags: ['Threads', 'カンバセーション', 'シンプル'],
  },
];
