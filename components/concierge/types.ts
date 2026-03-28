export type AvatarState = 'idle' | 'thinking' | 'talking';

// アバタータイプ
export type AvatarType = 'maker' | 'business' | 'yasashii' | 'anime' | 'robot' | 'neko' | 'custom';
export type AvatarShape = 'circle' | 'rounded' | 'egg';
export type CustomImageShape = 'circle' | 'rounded' | 'square';

export interface AvatarStyle {
  type: AvatarType;
  primaryColor: string;
  shape: AvatarShape;
  aspectRatio: number;
  customImageUrl?: string;
  customImageShape?: CustomImageShape;
}

/** 既存データとの後方互換を保ちながら安全にパースする */
export function normalizeAvatarStyle(raw: any): AvatarStyle {
  return {
    type: raw?.type === 'default' ? 'maker' : (raw?.type || 'maker'),
    primaryColor: raw?.primaryColor || '#3B82F6',
    shape: raw?.shape || 'circle',
    aspectRatio: raw?.aspectRatio ?? 1.0,
    customImageUrl: raw?.customImageUrl,
    customImageShape: raw?.customImageShape || 'circle',
  };
}

/** プリセットアバターの定義 */
export const AVATAR_PRESETS: { type: AvatarType; label: string; emoji: string }[] = [
  { type: 'maker', label: 'メイカーくん', emoji: '😊' },
  { type: 'business', label: 'ビジネス', emoji: '💼' },
  { type: 'yasashii', label: 'やさしい', emoji: '🌸' },
  { type: 'anime', label: 'アニメ風', emoji: '✨' },
  { type: 'robot', label: 'ロボット', emoji: '🤖' },
  { type: 'neko', label: 'ねこ', emoji: '🐱' },
];

export interface ContactInfo {
  formUrl?: string;
  phone?: string;
  email?: string;
  businessHours?: string;
}

export interface ConciergeMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ToolAction[];
  suggestions?: string[];
  contactInfo?: ContactInfo;
  plan?: PlanCard;
  feedback?: 1 | -1 | null;
  created_at: string;
  /** メッセージの送信者種別（Phase 2: 人間チャット対応） */
  sender_type?: 'user' | 'assistant' | 'operator';
  /** メタデータ */
  metadata?: {
    source?: 'ai' | 'faq' | 'operator';
    faqId?: string;
    mediaUrl?: string;
    actions?: ToolAction[];
    suggestions?: string[];
    contactInfo?: ContactInfo;
    plan?: PlanCard;
  };
}

export interface ToolAction {
  id: string;
  label: string;
  url: string;
}

/** 集客プランのステップ */
export interface PlanStep {
  toolId: string;
  description: string;
}

/** 集客プランカード */
export interface PlanCard {
  name: string;
  steps: PlanStep[];
}

/** プラン実行の進捗 */
export interface PlanExecutionProgress {
  stepIndex: number;
  toolId: string;
  status: 'generating' | 'saving' | 'done' | 'error';
  message: string;
}

/** プラン実行結果 */
export interface PlanExecutionResult {
  stepIndex: number;
  toolId: string;
  contentId: string;
  url: string;
  title: string;
}

/** プラン実行状態 */
export interface PlanExecution {
  status: 'idle' | 'executing' | 'completed' | 'error';
  progress: PlanExecutionProgress[];
  results: PlanExecutionResult[];
  errorMessage?: string;
}

export interface ConciergeChatResponse {
  reply: string;
  actions: ToolAction[];
  suggestions: string[];
  contactInfo?: ContactInfo;
  remainingMessages: number;
  sessionId: string;
}

export interface ConciergeChatHistoryResponse {
  messages: ConciergeMessage[];
  sessionId: string;
}
