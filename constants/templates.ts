/**
 * テンプレート - 後方互換性レイヤー
 * 
 * このファイルは後方互換性のために残しています。
 * 新しいコードでは以下のインポートを使用してください：
 * 
 * import { 
 *   quizTemplates, 
 *   profileTemplates, 
 *   businessLpTemplates 
 * } from '@/constants/templates';
 * 
 * または個別カテゴリ：
 * 
 * import { personalityTemplates } from '@/constants/templates/quiz/personality';
 * import { consultantTemplates } from '@/constants/templates/profile/consultant';
 */

// 新しいテンプレート構造から再エクスポート
export * from './templates/index';

// 旧インターフェースの再エクスポート（型定義）
export type { Template, QuizTemplate } from './templates/types';
