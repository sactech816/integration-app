// マーケットプレイス カテゴリ・定数定義

export interface MarketplaceCategory {
  id: string;
  label: string;
  icon: string;
  isToolLinked: boolean;
  linkedServiceType?: string;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  // ツール連携カテゴリ
  { id: 'lp_creation', label: 'LP作成・改善', icon: 'Layout', isToolLinked: true, linkedServiceType: 'business' },
  { id: 'quiz_creation', label: '診断クイズ作成', icon: 'Sparkles', isToolLinked: true, linkedServiceType: 'quiz' },
  { id: 'profile_creation', label: 'プロフィールLP作成', icon: 'UserCircle', isToolLinked: true, linkedServiceType: 'profile' },
  { id: 'sales_writing', label: 'セールスレター作成', icon: 'PenTool', isToolLinked: true, linkedServiceType: 'salesletter' },
  { id: 'kindle_support', label: 'Kindle執筆サポート', icon: 'BookOpen', isToolLinked: true },
  // 汎用カテゴリ
  { id: 'design', label: 'デザイン', icon: 'Palette', isToolLinked: false },
  { id: 'writing', label: 'ライティング', icon: 'FileText', isToolLinked: false },
  { id: 'marketing', label: 'マーケティング', icon: 'TrendingUp', isToolLinked: false },
  { id: 'video', label: '動画・音声', icon: 'Video', isToolLinked: false },
  { id: 'consulting', label: 'コンサル・相談', icon: 'MessageCircle', isToolLinked: false },
  { id: 'other', label: 'その他', icon: 'MoreHorizontal', isToolLinked: false },
];

export const CATEGORY_MAP = Object.fromEntries(
  MARKETPLACE_CATEGORIES.map(c => [c.id, c])
) as Record<string, MarketplaceCategory>;

export const PRICE_TYPE_LABELS: Record<string, string> = {
  fixed: '固定価格',
  range: '価格帯',
  negotiable: '要相談',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  requested: '依頼送信済み',
  accepted: '受注確認',
  in_progress: '作業中',
  delivered: '納品済み',
  completed: '完了',
  cancelled: 'キャンセル',
};

export const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  requested: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  accepted: { bg: 'bg-blue-50', text: 'text-blue-700' },
  in_progress: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  delivered: { bg: 'bg-purple-50', text: 'text-purple-700' },
  completed: { bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-500' },
};

export const RESPONSE_TIME_OPTIONS = [
  '24時間以内',
  '2〜3日以内',
  '1週間以内',
  'ご相談ください',
];

// =============================================
// クリエイター登録用: サポート可能ツール
// =============================================

export interface SupportedTool {
  id: string;
  label: string;
  icon: string;
  hasSubtypes?: boolean;
}

export const SUPPORTED_TOOLS: SupportedTool[] = [
  { id: 'quiz', label: '診断クイズ', icon: 'Sparkles' },
  { id: 'profile', label: 'プロフィール', icon: 'UserCircle' },
  { id: 'business', label: 'ランディングページ', icon: 'Layout' },
  { id: 'survey', label: 'アンケート', icon: 'ClipboardList' },
  { id: 'booking', label: '予約システム', icon: 'Calendar' },
  { id: 'attendance', label: '出欠確認', icon: 'CalendarCheck' },
  { id: 'gamification', label: 'ゲーム', icon: 'Gamepad2' },
  { id: 'kindle', label: 'Kindle出版', icon: 'BookOpen', hasSubtypes: true },
];

export const SUPPORTED_TOOLS_MAP = Object.fromEntries(
  SUPPORTED_TOOLS.map(t => [t.id, t])
) as Record<string, SupportedTool>;

// Kindle出版のサブカテゴリ
export interface KindleSubtype {
  id: string;
  label: string;
}

export const KINDLE_SUBTYPES: KindleSubtype[] = [
  { id: 'kindle_writing', label: '執筆サポート' },
  { id: 'kindle_proofreading', label: '校正' },
  { id: 'kindle_cover', label: '表紙作成' },
  { id: 'kindle_paperback', label: 'ペーパーバック支援' },
  { id: 'kindle_a_plus', label: 'A+コンテンツ作成' },
  { id: 'kindle_marketing', label: 'マーケティング・販促' },
];
