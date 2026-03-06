// ===========================================
// LINE公式アカウント連携 型定義
// ===========================================

// -------------------------------------------
// LINE公式アカウント設定 (line_accounts)
// -------------------------------------------
export interface LineAccount {
  id: string;
  user_id: string;
  channel_id: string;
  channel_secret: string;
  channel_access_token: string;
  bot_basic_id?: string | null;
  display_name?: string | null;
  friend_add_message?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLineAccountInput {
  channel_id: string;
  channel_secret: string;
  channel_access_token: string;
  bot_basic_id?: string;
  display_name?: string;
  friend_add_message?: string;
}

export interface UpdateLineAccountInput {
  channel_id?: string;
  channel_secret?: string;
  channel_access_token?: string;
  bot_basic_id?: string;
  display_name?: string;
  friend_add_message?: string;
  is_active?: boolean;
}

// -------------------------------------------
// LINE友だち (line_friends)
// -------------------------------------------
export type LineSourceType =
  | 'quiz'
  | 'entertainment_quiz'
  | 'profile'
  | 'business'
  | 'salesletter'
  | 'survey'
  | 'gamification'
  | 'attendance'
  | 'booking'
  | 'onboarding'
  | 'thumbnail'
  | 'newsletter'
  | 'order-form'
  | 'funnel'
  | 'direct';

export type LineFriendStatus = 'active' | 'blocked' | 'unfollowed';

export interface LineFriend {
  id: string;
  owner_id: string;
  line_user_id: string;
  display_name?: string | null;
  picture_url?: string | null;
  status_message?: string | null;
  source_type: LineSourceType;
  source_id?: string | null;
  status: LineFriendStatus;
  followed_at?: string;
  unfollowed_at?: string | null;
  created_at?: string;
}

// -------------------------------------------
// LINEメッセージ (line_messages)
// -------------------------------------------
export type LineMessageType = 'text' | 'image' | 'flex';
export type LineMessageStatus = 'draft' | 'sent';
export type LineTargetType = 'all' | 'segment';

export type LineMessageContent =
  | { type: 'text'; text: string }
  | { type: 'image'; originalContentUrl: string; previewImageUrl: string }
  | { type: 'flex'; altText: string; contents: Record<string, unknown> };

export interface LineTargetFilter {
  source_type?: LineSourceType;
  source_id?: string;
}

export interface LineMessage {
  id: string;
  user_id: string;
  title: string;
  message_type: LineMessageType;
  content: LineMessageContent;
  target_type: LineTargetType;
  target_filter?: LineTargetFilter | null;
  status: LineMessageStatus;
  sent_at?: string | null;
  sent_count: number;
  success_count: number;
  failure_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLineMessageInput {
  title: string;
  message_type?: LineMessageType;
  content: LineMessageContent;
  target_type?: LineTargetType;
  target_filter?: LineTargetFilter;
}

// -------------------------------------------
// LINE配信ログ (line_send_logs)
// -------------------------------------------
export type LineSendStatus = 'pending' | 'sent' | 'failed';

export interface LineSendLog {
  id: string;
  message_id: string;
  friend_id: string;
  status: LineSendStatus;
  error_message?: string | null;
  sent_at?: string | null;
  created_at?: string;
}

// -------------------------------------------
// 統計・集計用
// -------------------------------------------
export interface LineStats {
  total_friends: number;
  active_friends: number;
  total_messages_sent: number;
  friends_by_source: Record<string, number>;
}

// -------------------------------------------
// LINE Webhook イベント型
// -------------------------------------------
export interface LineWebhookEvent {
  type: string;
  timestamp: number;
  source: {
    type: string;
    userId?: string;
  };
  replyToken?: string;
}

export interface LineFollowEvent extends LineWebhookEvent {
  type: 'follow';
}

export interface LineUnfollowEvent extends LineWebhookEvent {
  type: 'unfollow';
}

export interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}
