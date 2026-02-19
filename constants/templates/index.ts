/**
 * テンプレート統合エクスポート
 * 
 * 使用方法:
 * import { quizTemplates, profileTemplates, businessLpTemplates } from '@/constants/templates';
 */

// 型定義のエクスポート
export * from './types';

// プロフィールLPテンプレート
export { 
  profileTemplates,
  consultantTemplates,
  creatorTemplates,
  marketerTemplates,
  authorTemplates,
  coachTemplates,
  storeTemplates,
  getProfileTemplatesByCategory 
} from './profile';

// 診断クイズテンプレート
export { 
  quizTemplates,
  personalityTemplates,
  careerTemplates,
  loveTemplates,
  businessTemplates,
  getQuizTemplatesByCategory,
  getQuizTemplatesByMode 
} from './quiz';

// ビジネスLPテンプレート
export { 
  templates as businessLpTemplates,
  getTemplatesByCategory as getBusinessTemplatesByCategory 
} from './business';

// サムネイルテンプレート
export {
  thumbnailTemplates,
  getTemplatesByPlatform as getThumbnailTemplatesByPlatform,
  getTemplatesByStyle as getThumbnailTemplatesByStyle,
  getTemplateById as getThumbnailTemplateById,
  PLATFORM_CATEGORIES,
  STYLE_CATEGORIES,
} from './thumbnail';

// ===========================================
// 後方互換性のためのエイリアス
// ===========================================
import { profileTemplates } from './profile';
import { quizTemplates as quizTemplatesFromQuiz } from './quiz';

// 旧: templates（プロフィール用）
export const templates = profileTemplates;

// 旧: quizTemplates は quiz/index.ts から直接エクスポート済み
// 明示的に再エクスポートして後方互換性を維持
export { quizTemplatesFromQuiz };

