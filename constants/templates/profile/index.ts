import { Template } from '../types';
import { consultantTemplates } from './consultant';
import { creatorTemplates } from './creator';
import { marketerTemplates } from './marketer';
import { authorTemplates } from './author';
import { coachTemplates } from './coach';
import { storeTemplates } from './store';

/**
 * プロフィールLP用テンプレート（全カテゴリ統合）
 */
export const profileTemplates: Template[] = [
  ...consultantTemplates,
  ...creatorTemplates,
  ...marketerTemplates,
  ...authorTemplates,
  ...coachTemplates,
  ...storeTemplates,
];

// 個別エクスポート
export {
  consultantTemplates,
  creatorTemplates,
  marketerTemplates,
  authorTemplates,
  coachTemplates,
  storeTemplates,
};

// カテゴリ別取得関数
export function getProfileTemplatesByCategory(category: string): Template[] {
  return profileTemplates.filter(t => 
    t.category.toLowerCase().includes(category.toLowerCase())
  );
}

