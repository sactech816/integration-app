import { KindleCoverTemplate, KindleCoverGenre } from './types';
import { businessTemplates } from './business';
import { selfHelpTemplates } from './self-help';
import { howToTemplates } from './how-to';
import { novelTemplates } from './novel';
import { educationTemplates } from './education';

export const kindleCoverTemplates: KindleCoverTemplate[] = [
  ...businessTemplates,
  ...selfHelpTemplates,
  ...howToTemplates,
  ...novelTemplates,
  ...educationTemplates,
];

export const getKindleCoverTemplatesByGenre = (genre: KindleCoverGenre): KindleCoverTemplate[] => {
  return kindleCoverTemplates.filter(t => t.genre === genre);
};

export const getKindleCoverTemplateById = (id: string): KindleCoverTemplate | undefined => {
  return kindleCoverTemplates.find(t => t.id === id);
};

export const KINDLE_COVER_GENRES = [
  { id: 'business' as const, label: 'ビジネス', icon: 'Briefcase' },
  { id: 'self_help' as const, label: '自己啓発', icon: 'Heart' },
  { id: 'how_to' as const, label: 'ハウツー・実用', icon: 'BookOpen' },
  { id: 'novel' as const, label: '小説・エッセイ', icon: 'Feather' },
  { id: 'education' as const, label: '教育・学習', icon: 'GraduationCap' },
];

export type { KindleCoverTemplate, KindleCoverGenre };
