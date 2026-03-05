/**
 * 申し込みフォーム用デザインテーマ定義
 * - layout: フォームの構造・レイアウト
 * - color: カラースキーム
 */

// ── レイアウト定義 ──
export interface OrderFormLayout {
  id: string;
  name: string;
  description: string;
}

export const ORDER_FORM_LAYOUTS: Record<string, OrderFormLayout> = {
  standard: {
    id: 'standard',
    name: 'スタンダード',
    description: 'シンプルなフォーム',
  },
  business: {
    id: 'business',
    name: 'ビジネス',
    description: '企業・法人向け',
  },
  entertainment: {
    id: 'entertainment',
    name: 'エンタメ',
    description: 'イベント・講座向け',
  },
};

export const ORDER_FORM_LAYOUT_IDS = Object.keys(ORDER_FORM_LAYOUTS);
export const DEFAULT_ORDER_FORM_LAYOUT = 'standard';

// ── カラーテーマ定義 ──
export interface OrderFormColorTheme {
  id: string;
  name: string;
  swatch: string; // CSS color for UI swatch
  background: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  headerText: string;
  textPrimary: string;
  textSecondary: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  inputBg: string;
  inputBorder: string;
  inputFocusRing: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export const ORDER_FORM_COLORS: Record<string, OrderFormColorTheme> = {
  emerald: {
    id: 'emerald',
    name: 'エメラルド',
    swatch: '#10b981',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e5e7eb',
    headerBg: '#10b981',
    headerText: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonBg: '#059669',
    buttonHover: '#047857',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocusRing: '#10b981',
    accentColor: '#059669',
    badgeBg: '#ecfdf5',
    badgeText: '#065f46',
  },
  blue: {
    id: 'blue',
    name: 'ブルー',
    swatch: '#3b82f6',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #ffffff 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e5e7eb',
    headerBg: '#3b82f6',
    headerText: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonBg: '#2563eb',
    buttonHover: '#1d4ed8',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocusRing: '#3b82f6',
    accentColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeText: '#1e40af',
  },
  purple: {
    id: 'purple',
    name: 'パープル',
    swatch: '#8b5cf6',
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ffffff 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e5e7eb',
    headerBg: '#8b5cf6',
    headerText: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonBg: '#7c3aed',
    buttonHover: '#6d28d9',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocusRing: '#8b5cf6',
    accentColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    badgeText: '#5b21b6',
  },
  rose: {
    id: 'rose',
    name: 'ローズ',
    swatch: '#f43f5e',
    background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #ffffff 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e5e7eb',
    headerBg: '#f43f5e',
    headerText: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonBg: '#e11d48',
    buttonHover: '#be123c',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocusRing: '#f43f5e',
    accentColor: '#e11d48',
    badgeBg: '#fff1f2',
    badgeText: '#9f1239',
  },
  amber: {
    id: 'amber',
    name: 'アンバー',
    swatch: '#f59e0b',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ffffff 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e5e7eb',
    headerBg: '#f59e0b',
    headerText: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonBg: '#d97706',
    buttonHover: '#b45309',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocusRing: '#f59e0b',
    accentColor: '#d97706',
    badgeBg: '#fffbeb',
    badgeText: '#92400e',
  },
  monochrome: {
    id: 'monochrome',
    name: 'モノトーン',
    swatch: '#374151',
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #ffffff 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #d1d5db',
    headerBg: '#1f2937',
    headerText: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonBg: '#374151',
    buttonHover: '#1f2937',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocusRing: '#6b7280',
    accentColor: '#374151',
    badgeBg: '#f3f4f6',
    badgeText: '#374151',
  },
  ocean: {
    id: 'ocean',
    name: 'オーシャン',
    swatch: '#06b6d4',
    background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #ffffff 100%)',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e5e7eb',
    headerBg: '#06b6d4',
    headerText: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonBg: '#0891b2',
    buttonHover: '#0e7490',
    buttonText: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocusRing: '#06b6d4',
    accentColor: '#0891b2',
    badgeBg: '#ecfeff',
    badgeText: '#155e75',
  },
  neon: {
    id: 'neon',
    name: 'ネオン',
    swatch: '#a855f7',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    cardBg: 'rgba(15, 23, 42, 0.9)',
    cardBorder: '1px solid rgba(168, 85, 247, 0.4)',
    headerBg: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    headerText: '#ffffff',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    buttonBg: '#a855f7',
    buttonHover: '#9333ea',
    buttonText: '#ffffff',
    inputBg: 'rgba(30, 41, 59, 0.8)',
    inputBorder: 'rgba(168, 85, 247, 0.3)',
    inputFocusRing: '#a855f7',
    accentColor: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    badgeText: '#c084fc',
  },
};

export const ORDER_FORM_COLOR_IDS = Object.keys(ORDER_FORM_COLORS);
export const DEFAULT_ORDER_FORM_COLOR = 'emerald';

export function getOrderFormColor(colorId?: string): OrderFormColorTheme {
  if (colorId && ORDER_FORM_COLORS[colorId]) {
    return ORDER_FORM_COLORS[colorId];
  }
  return ORDER_FORM_COLORS[DEFAULT_ORDER_FORM_COLOR];
}

export function getOrderFormLayout(layoutId?: string): OrderFormLayout {
  if (layoutId && ORDER_FORM_LAYOUTS[layoutId]) {
    return ORDER_FORM_LAYOUTS[layoutId];
  }
  return ORDER_FORM_LAYOUTS[DEFAULT_ORDER_FORM_LAYOUT];
}
