// テンプレート集約エクスポート

// 型定義のエクスポート
export type { Template, TemplateCategory, TemplateId } from './types';

// 各テンプレートのインポート
import { consultantTemplate } from './consultant';
import { coachTemplate } from './coach';
import { retailEcTemplate } from './retail-ec';
import { storeTemplate } from './store';
import { cafeRestaurantTemplate } from './cafe-restaurant';
import { freelanceTemplate } from './freelance';
import { pasonaTemplate } from './pasona';
import { aidomaTemplate } from './aidoma';
import { questTemplate } from './quest';

// 個別エクスポート
export { consultantTemplate } from './consultant';
export { coachTemplate } from './coach';
export { retailEcTemplate } from './retail-ec';
export { storeTemplate } from './store';
export { cafeRestaurantTemplate } from './cafe-restaurant';
export { freelanceTemplate } from './freelance';
export { pasonaTemplate } from './pasona';
export { aidomaTemplate } from './aidoma';
export { questTemplate } from './quest';

// 全テンプレート配列（order順にソート）
export const templates = [
  consultantTemplate,
  coachTemplate,
  retailEcTemplate,
  storeTemplate,
  cafeRestaurantTemplate,
  freelanceTemplate,
  pasonaTemplate,
  aidomaTemplate,
  questTemplate,
].sort((a, b) => (a.order || 0) - (b.order || 0));

// おすすめテンプレート（トップページ表示用）
export const recommendedTemplates = templates.filter(t => t.recommended);

// テンプレートIDで取得
export const getTemplateById = (id: string) => {
  return templates.find(t => t.id === id);
};

// カテゴリーでフィルタリング
export const getTemplatesByCategory = (category: string) => {
  return templates.filter(t => t.category === category);
};
