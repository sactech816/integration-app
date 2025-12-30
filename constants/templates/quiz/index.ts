import { QuizTemplate } from '../types';
import { personalityTemplates } from './personality';
import { careerTemplates } from './career';
import { loveTemplates } from './love';
import { businessTemplates } from './business';

/**
 * 診断クイズ用テンプレート（全カテゴリ統合）
 */
export const quizTemplates: QuizTemplate[] = [
  ...personalityTemplates,
  ...careerTemplates,
  ...loveTemplates,
  ...businessTemplates,
];

// 個別エクスポート
export {
  personalityTemplates,
  careerTemplates,
  loveTemplates,
  businessTemplates,
};

// カテゴリ別取得関数
export function getQuizTemplatesByCategory(category: string): QuizTemplate[] {
  return quizTemplates.filter(t => 
    t.category.toLowerCase().includes(category.toLowerCase())
  );
}

// モード別取得関数
export function getQuizTemplatesByMode(mode: 'diagnosis' | 'test' | 'fortune'): QuizTemplate[] {
  return quizTemplates.filter(t => t.mode === mode);
}

