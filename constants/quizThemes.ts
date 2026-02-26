/**
 * 診断クイズ用デザインテーマ定義
 */

export interface QuizTheme {
  id: string;
  name: string;
  description: string;
  // 背景
  background: string;
  // カード背景
  cardBg: string;
  cardBorder?: string;
  // テキスト
  textPrimary: string;
  textSecondary: string;
  // アクセントカラー
  accentColor: string;
  accentColorHover?: string;
  // オプションボタン
  optionBg: string;
  optionBorder: string;
  optionHoverBg: string;
  // プログレスバー
  progressBg: string;
  progressFill: string;
}

export const QUIZ_THEMES: Record<string, QuizTheme> = {
  standard: {
    id: 'standard',
    name: 'スタンダード',
    description: 'シンプル',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e5e7eb',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    accentColor: '#6366f1',
    accentColorHover: '#4f46e5',
    optionBg: '#ffffff',
    optionBorder: '#e5e7eb',
    optionHoverBg: '#eef2ff',
    progressBg: '#e5e7eb',
    progressFill: '#6366f1',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'サイバーパンク',
    description: '未来的',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    cardBg: 'rgba(15, 12, 41, 0.8)',
    cardBorder: '1px solid rgba(0, 255, 245, 0.3)',
    textPrimary: '#00fff5',
    textSecondary: '#a78bfa',
    accentColor: '#ff00ff',
    accentColorHover: '#cc00cc',
    optionBg: 'rgba(0, 255, 245, 0.1)',
    optionBorder: 'rgba(0, 255, 245, 0.3)',
    optionHoverBg: 'rgba(255, 0, 255, 0.2)',
    progressBg: 'rgba(0, 255, 245, 0.2)',
    progressFill: '#00fff5',
  },
  japanese: {
    id: 'japanese',
    name: '和風・雅',
    description: '伝統的',
    background: 'linear-gradient(135deg, #f5f0e6 0%, #e8dcc8 100%)',
    cardBg: '#fffef7',
    cardBorder: '2px solid #8b4513',
    textPrimary: '#3d2914',
    textSecondary: '#6b5344',
    accentColor: '#c41e3a',
    accentColorHover: '#a01830',
    optionBg: '#fffef7',
    optionBorder: '#d4a574',
    optionHoverBg: '#fff5e6',
    progressBg: '#d4a574',
    progressFill: '#c41e3a',
  },
  pastel: {
    id: 'pastel',
    name: 'パステルポップ',
    description: '優しい',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffecd2 100%)',
    cardBg: '#ffffff',
    cardBorder: '2px solid #ffb6c1',
    textPrimary: '#4a4a4a',
    textSecondary: '#7a7a7a',
    accentColor: '#ff69b4',
    accentColorHover: '#ff1493',
    optionBg: '#fff0f5',
    optionBorder: '#ffb6c1',
    optionHoverBg: '#ffe4e9',
    progressBg: '#ffd1dc',
    progressFill: '#ff69b4',
  },
  monochrome: {
    id: 'monochrome',
    name: 'モノトーン',
    description: 'クール',
    background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #ddd',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    accentColor: '#333333',
    accentColorHover: '#000000',
    optionBg: '#f8f8f8',
    optionBorder: '#cccccc',
    optionHoverBg: '#eeeeee',
    progressBg: '#cccccc',
    progressFill: '#333333',
  },
  nature: {
    id: 'nature',
    name: 'ナチュラル',
    description: '自然',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
    cardBg: '#fffef5',
    cardBorder: '2px solid #81c784',
    textPrimary: '#2e7d32',
    textSecondary: '#558b2f',
    accentColor: '#43a047',
    accentColorHover: '#388e3c',
    optionBg: '#f1f8e9',
    optionBorder: '#aed581',
    optionHoverBg: '#dcedc8',
    progressBg: '#c5e1a5',
    progressFill: '#43a047',
  },
  vibrant: {
    id: 'vibrant',
    name: 'ビビッド',
    description: 'エンタメ',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
    cardBg: '#ffffff',
    cardBorder: '2px solid #ff6b6b',
    textPrimary: '#2d3436',
    textSecondary: '#636e72',
    accentColor: '#ff6b6b',
    accentColorHover: '#ee5a24',
    optionBg: '#fff5f5',
    optionBorder: '#ff6b6b',
    optionHoverBg: '#ffe8e8',
    progressBg: '#ffeaa7',
    progressFill: '#ff6b6b',
  },
  kawaii: {
    id: 'kawaii',
    name: 'かわいい',
    description: 'ファンシー',
    background: 'linear-gradient(135deg, #fd79a8 0%, #e17055 30%, #fdcb6e 70%, #a29bfe 100%)',
    cardBg: '#fff0f6',
    cardBorder: '2px solid #fd79a8',
    textPrimary: '#6c5ce7',
    textSecondary: '#a29bfe',
    accentColor: '#fd79a8',
    accentColorHover: '#e84393',
    optionBg: '#fdf2f8',
    optionBorder: '#f9a8d4',
    optionHoverBg: '#fce7f3',
    progressBg: '#fce7f3',
    progressFill: '#fd79a8',
  },
  galaxy: {
    id: 'galaxy',
    name: 'ギャラクシー',
    description: '宇宙',
    background: 'linear-gradient(135deg, #0c0032 0%, #190061 40%, #240090 70%, #3500d3 100%)',
    cardBg: 'rgba(12, 0, 50, 0.85)',
    cardBorder: '1px solid rgba(165, 94, 234, 0.5)',
    textPrimary: '#e2d9f3',
    textSecondary: '#a29bfe',
    accentColor: '#a55eea',
    accentColorHover: '#8854d0',
    optionBg: 'rgba(165, 94, 234, 0.15)',
    optionBorder: 'rgba(165, 94, 234, 0.4)',
    optionHoverBg: 'rgba(165, 94, 234, 0.3)',
    progressBg: 'rgba(165, 94, 234, 0.2)',
    progressFill: '#a55eea',
  },
};

// テーマIDの配列（UI用）
export const QUIZ_THEME_IDS = Object.keys(QUIZ_THEMES) as Array<keyof typeof QUIZ_THEMES>;

// デフォルトテーマ
export const DEFAULT_QUIZ_THEME = 'standard';

// テーマを取得（存在しない場合はデフォルト）
export function getQuizTheme(themeId?: string): QuizTheme {
  if (themeId && QUIZ_THEMES[themeId]) {
    return QUIZ_THEMES[themeId];
  }
  return QUIZ_THEMES[DEFAULT_QUIZ_THEME];
}













































































































