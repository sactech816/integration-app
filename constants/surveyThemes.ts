/**
 * アンケート用デザインテーマ定義
 */

export interface SurveyTheme {
  id: string;
  name: string;
  description: string;
  // ヘッダーグラデーション
  headerGradient: string;
  headerTextColor: string;
  headerSubTextColor: string;
  // アクセントカラー
  accentColor: string;
  accentHoverColor: string;
  // 質問番号バッジ
  badgeBg: string;
  badgeText: string;
  // 選択肢の選択状態
  selectedBorder: string;
  selectedBg: string;
  selectedRing: string;
  // 評価ボタン選択状態
  ratingSelectedBg: string;
  ratingSelectedText: string;
  // 送信ボタン
  buttonGradient: string;
  buttonHoverGradient: string;
  // フォーカスリング
  focusRing: string;
  // ラジオボタン
  radioColor: string;
}

export const SURVEY_THEMES: Record<string, SurveyTheme> = {
  teal: {
    id: 'teal',
    name: 'ティール',
    description: '爽やか',
    headerGradient: 'linear-gradient(135deg, #0d9488, #06b6d4)',
    headerTextColor: '#ffffff',
    headerSubTextColor: 'rgba(204,251,241,0.8)',
    accentColor: '#0d9488',
    accentHoverColor: '#0f766e',
    badgeBg: '#ccfbf1',
    badgeText: '#0f766e',
    selectedBorder: '#14b8a6',
    selectedBg: '#f0fdfa',
    selectedRing: '#99f6e4',
    ratingSelectedBg: '#0d9488',
    ratingSelectedText: '#ffffff',
    buttonGradient: 'linear-gradient(135deg, #0d9488, #06b6d4)',
    buttonHoverGradient: 'linear-gradient(135deg, #0f766e, #0891b2)',
    focusRing: 'rgba(20,184,166,0.4)',
    radioColor: '#0d9488',
  },
  blue: {
    id: 'blue',
    name: 'ブルー',
    description: 'ビジネス',
    headerGradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    headerTextColor: '#ffffff',
    headerSubTextColor: 'rgba(219,234,254,0.8)',
    accentColor: '#2563eb',
    accentHoverColor: '#1d4ed8',
    badgeBg: '#dbeafe',
    badgeText: '#1d4ed8',
    selectedBorder: '#3b82f6',
    selectedBg: '#eff6ff',
    selectedRing: '#93c5fd',
    ratingSelectedBg: '#2563eb',
    ratingSelectedText: '#ffffff',
    buttonGradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    buttonHoverGradient: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    focusRing: 'rgba(59,130,246,0.4)',
    radioColor: '#2563eb',
  },
  purple: {
    id: 'purple',
    name: 'パープル',
    description: 'クリエイティブ',
    headerGradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    headerTextColor: '#ffffff',
    headerSubTextColor: 'rgba(237,233,254,0.8)',
    accentColor: '#7c3aed',
    accentHoverColor: '#6d28d9',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    selectedBorder: '#8b5cf6',
    selectedBg: '#f5f3ff',
    selectedRing: '#c4b5fd',
    ratingSelectedBg: '#7c3aed',
    ratingSelectedText: '#ffffff',
    buttonGradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    buttonHoverGradient: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    focusRing: 'rgba(139,92,246,0.4)',
    radioColor: '#7c3aed',
  },
  rose: {
    id: 'rose',
    name: 'ローズ',
    description: 'エレガント',
    headerGradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
    headerTextColor: '#ffffff',
    headerSubTextColor: 'rgba(255,228,230,0.8)',
    accentColor: '#e11d48',
    accentHoverColor: '#be123c',
    badgeBg: '#ffe4e6',
    badgeText: '#be123c',
    selectedBorder: '#f43f5e',
    selectedBg: '#fff1f2',
    selectedRing: '#fda4af',
    ratingSelectedBg: '#e11d48',
    ratingSelectedText: '#ffffff',
    buttonGradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
    buttonHoverGradient: 'linear-gradient(135deg, #be123c, #e11d48)',
    focusRing: 'rgba(244,63,94,0.4)',
    radioColor: '#e11d48',
  },
  orange: {
    id: 'orange',
    name: 'オレンジ',
    description: 'エネルギッシュ',
    headerGradient: 'linear-gradient(135deg, #ea580c, #f97316)',
    headerTextColor: '#ffffff',
    headerSubTextColor: 'rgba(255,237,213,0.8)',
    accentColor: '#ea580c',
    accentHoverColor: '#c2410c',
    badgeBg: '#ffedd5',
    badgeText: '#c2410c',
    selectedBorder: '#f97316',
    selectedBg: '#fff7ed',
    selectedRing: '#fdba74',
    ratingSelectedBg: '#ea580c',
    ratingSelectedText: '#ffffff',
    buttonGradient: 'linear-gradient(135deg, #ea580c, #f97316)',
    buttonHoverGradient: 'linear-gradient(135deg, #c2410c, #ea580c)',
    focusRing: 'rgba(249,115,22,0.4)',
    radioColor: '#ea580c',
  },
  green: {
    id: 'green',
    name: 'グリーン',
    description: 'ナチュラル',
    headerGradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
    headerTextColor: '#ffffff',
    headerSubTextColor: 'rgba(220,252,231,0.8)',
    accentColor: '#16a34a',
    accentHoverColor: '#15803d',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    selectedBorder: '#22c55e',
    selectedBg: '#f0fdf4',
    selectedRing: '#86efac',
    ratingSelectedBg: '#16a34a',
    ratingSelectedText: '#ffffff',
    buttonGradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
    buttonHoverGradient: 'linear-gradient(135deg, #15803d, #16a34a)',
    focusRing: 'rgba(34,197,94,0.4)',
    radioColor: '#16a34a',
  },
};

// テーマIDの配列（UI用）
export const SURVEY_THEME_IDS = Object.keys(SURVEY_THEMES) as Array<keyof typeof SURVEY_THEMES>;

// デフォルトテーマ
export const DEFAULT_SURVEY_THEME = 'teal';

// テーマを取得（存在しない場合はデフォルト）
export function getSurveyTheme(themeId?: string): SurveyTheme {
  if (themeId && SURVEY_THEMES[themeId]) {
    return SURVEY_THEMES[themeId];
  }
  return SURVEY_THEMES[DEFAULT_SURVEY_THEME];
}
