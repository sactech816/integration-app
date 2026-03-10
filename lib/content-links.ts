// ================================================================
// コンテンツリンク共通定義
// 各ツール間で相互リンクするための型・定数・ユーティリティ
// ================================================================
//
// 【新しいツールを追加する手順】
//  1. LinkableContentType に新しいタイプを追加
//  2. LINKABLE_TOOLS 配列にエントリを追加（type, label, category, refType, urlPath, color, iconName）
//  3. /api/user-contents/route.ts にクエリを追加（テーブル名, select カラム, user_id カラム名）
//  4. components/shared/ContentLinker.tsx の ICON_MAP にアイコンを追加
//  5. components/shared/LinkedContentCard.tsx の ICON_MAP にも同じアイコンを追加
//  6. ファネル連携が必要なら /api/funnel/user-contents/route.ts の keyMapping に追加
//

import type { ServiceType } from '@/lib/types';

// リンク可能なコンテンツタイプ（公開URLを持つツールのみ）
export type LinkableContentType =
  | 'quiz'
  | 'entertainment_quiz'
  | 'profile'
  | 'business'
  | 'salesletter'
  | 'webinar'
  | 'order-form'
  | 'onboarding'
  | 'thumbnail'
  | 'sns-post'
  | 'survey'
  | 'booking'
  | 'attendance'
  | 'newsletter'
  | 'gamification'
  | 'funnel'
  | 'site';

// コンテンツ参照（DBに保存する形式）
export interface ContentRef {
  type: LinkableContentType;
  id: string;
  slug?: string;
  label?: string; // 表示用（保存時点のタイトル）
}

// APIから返るコンテンツ項目
export interface UserContentItem {
  id: string;
  label: string;
  slug?: string;
  type: LinkableContentType;
}

// カテゴリ定義
export type ContentCategory = 'page' | 'quiz' | 'writing' | 'marketing' | 'monetization';

export const CONTENT_CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: 'page', label: 'LP・ページ作成' },
  { value: 'quiz', label: '診断・クイズ' },
  { value: 'writing', label: 'ライティング・制作' },
  { value: 'marketing', label: '集客・イベント' },
  { value: 'monetization', label: '収益化・販売' },
];

// ツール定義マスタ
export interface LinkableToolDef {
  type: LinkableContentType;
  label: string;
  category: ContentCategory;
  refType: 'slug' | 'id'; // URLに使うのがslugかidか
  urlPath: string; // 公開URLパスのプレフィックス
  color: string;
  iconName: string; // lucide-react のアイコン名
}

export const LINKABLE_TOOLS: LinkableToolDef[] = [
  // LP・ページ作成
  { type: 'profile', label: 'プロフィールLP', category: 'page', refType: 'slug', urlPath: '/profile', color: 'emerald', iconName: 'User' },
  { type: 'business', label: 'ビジネスLP', category: 'page', refType: 'slug', urlPath: '/business', color: 'amber', iconName: 'Building2' },
  { type: 'webinar', label: 'ウェビナーLP', category: 'page', refType: 'slug', urlPath: '/webinar', color: 'purple', iconName: 'Megaphone' },
  { type: 'onboarding', label: 'はじめかたガイド', category: 'page', refType: 'slug', urlPath: '/onboarding', color: 'lime', iconName: 'BookOpen' },
  { type: 'site', label: 'マイサイト', category: 'page', refType: 'slug', urlPath: '/site', color: 'cyan', iconName: 'Globe' },
  // 診断・クイズ
  { type: 'quiz', label: '診断クイズ', category: 'quiz', refType: 'slug', urlPath: '/quiz', color: 'indigo', iconName: 'HelpCircle' },
  { type: 'entertainment_quiz', label: 'エンタメ診断', category: 'quiz', refType: 'slug', urlPath: '/entertainment', color: 'pink', iconName: 'Sparkles' },
  // ライティング・制作
  { type: 'salesletter', label: 'セールスレター', category: 'writing', refType: 'slug', urlPath: '/s', color: 'rose', iconName: 'PenTool' },
  { type: 'thumbnail', label: 'サムネイル', category: 'writing', refType: 'slug', urlPath: '/thumbnail', color: 'sky', iconName: 'Image' },
  { type: 'sns-post', label: 'SNS投稿', category: 'writing', refType: 'slug', urlPath: '/sns-post', color: 'sky', iconName: 'MessageSquare' },
  // 集客・イベント
  { type: 'booking', label: '予約', category: 'marketing', refType: 'id', urlPath: '/booking', color: 'blue', iconName: 'Calendar' },
  { type: 'attendance', label: '出欠表', category: 'marketing', refType: 'id', urlPath: '/attendance', color: 'orange', iconName: 'Users' },
  { type: 'survey', label: 'アンケート', category: 'marketing', refType: 'slug', urlPath: '/survey', color: 'cyan', iconName: 'ClipboardList' },
  { type: 'newsletter', label: 'メルマガ', category: 'marketing', refType: 'id', urlPath: '/newsletter/subscribe', color: 'violet', iconName: 'Mail' },
  { type: 'funnel', label: 'ファネル', category: 'marketing', refType: 'slug', urlPath: '/funnel', color: 'amber', iconName: 'GitBranch' },
  // 収益化
  { type: 'order-form', label: '申し込みフォーム', category: 'monetization', refType: 'slug', urlPath: '/order-form', color: 'teal', iconName: 'FileText' },
  { type: 'gamification', label: 'ゲーミフィケーション', category: 'monetization', refType: 'id', urlPath: '/gamification', color: 'fuchsia', iconName: 'Trophy' },
];

// ルックアップ用マップ
export const LINKABLE_TOOL_MAP = Object.fromEntries(
  LINKABLE_TOOLS.map((t) => [t.type, t])
) as Record<LinkableContentType, LinkableToolDef>;

// コンテンツの公開URLを生成
export function getContentUrl(ref: ContentRef, origin?: string): string {
  const tool = LINKABLE_TOOL_MAP[ref.type];
  if (!tool) return '#';
  const identifier = ref.slug || ref.id;
  const base = origin || '';
  return `${base}${tool.urlPath}/${identifier}`;
}

// カテゴリでフィルタ
export function getToolsByCategory(category: ContentCategory): LinkableToolDef[] {
  return LINKABLE_TOOLS.filter((t) => t.category === category);
}

// ServiceType → LinkableContentType 変換（一致するもののみ）
export function toLinkableType(serviceType: ServiceType): LinkableContentType | null {
  const found = LINKABLE_TOOLS.find((t) => t.type === serviceType);
  return found ? found.type : null;
}
