import { ThumbnailTemplate } from './types';

export const bannerTemplates: ThumbnailTemplate[] = [
  {
    id: 'banner-event',
    name: 'イベント告知',
    description: 'セミナー・ウェビナー・イベント告知用バナー',
    styleCategory: 'professional',
    platformCategory: 'banner',
    aspectRatio: '16:9',
    promptTemplate: `Create an event announcement banner (1920x1080) with a professional design.
The main text "{{title}}" should be the central focus in bold Japanese text.
{{subtitle}}
Professional layout suitable for event promotion. Include subtle date/time placeholder area.
{{colorModifier}}
Style: Event promotion banner, professional yet inviting. Clear hierarchy of information.
IMPORTANT: All Japanese text must be rendered clearly and accurately.`,
    colorThemes: [
      { id: 'corporate-blue', name: 'コーポレートブルー', colors: ['#1E3A5F', '#4A90D9'], promptModifier: 'Corporate blue gradient. Professional seminar/conference feel.' },
      { id: 'creative-gradient', name: 'クリエイティブ', colors: ['#667EEA', '#764BA2'], promptModifier: 'Purple to indigo gradient. Creative workshop/seminar feel.' },
      { id: 'warm-orange', name: 'ウォームオレンジ', colors: ['#F97316', '#FBBF24'], promptModifier: 'Warm orange to yellow. Welcoming community event feel.' },
    ],
    tags: ['バナー', 'イベント', 'セミナー'],
  },
];
