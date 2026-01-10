// ===========================================
// 予約システム・日程調整機能 型定義
// ===========================================

// -------------------------------------------
// 予約メニュータイプ
// -------------------------------------------
export type BookingMenuType = 'reservation' | 'adjustment';

// -------------------------------------------
// 予約ステータス
// -------------------------------------------
export type BookingStatus = 'ok' | 'pending' | 'cancelled';

// -------------------------------------------
// 予約メニュー (booking_menus)
// -------------------------------------------
export interface BookingMenu {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  duration_min: number;
  type: BookingMenuType;
  is_active: boolean;
  created_at?: string;
}

// 予約メニュー作成用の入力型
export interface CreateBookingMenuInput {
  title: string;
  description?: string;
  duration_min?: number;
  type?: BookingMenuType;
  is_active?: boolean;
}

// 予約メニュー更新用の入力型
export interface UpdateBookingMenuInput {
  title?: string;
  description?: string;
  duration_min?: number;
  type?: BookingMenuType;
  is_active?: boolean;
}

// -------------------------------------------
// 予約枠 (booking_slots)
// -------------------------------------------
export interface BookingSlot {
  id: string;
  menu_id: string;
  start_time: string; // ISO 8601形式
  end_time: string;   // ISO 8601形式
  max_capacity: number;
  created_at?: string;
}

// 予約枠作成用の入力型
export interface CreateBookingSlotInput {
  start_time: string; // ISO 8601形式
  end_time: string;   // ISO 8601形式
  max_capacity?: number;
}

// 予約枠（空き状況付き）
export interface BookingSlotWithAvailability extends BookingSlot {
  current_bookings: number;
  is_available: boolean;
  remaining_capacity: number;
}

// -------------------------------------------
// 予約回答 (bookings)
// -------------------------------------------
export interface Booking {
  id: string;
  slot_id: string;
  customer_id?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_comment?: string | null;
  status: BookingStatus;
  created_at?: string;
}

// 予約作成用の入力型（ログインユーザー用）
export interface CreateBookingInputUser {
  slot_id: string;
  guest_comment?: string;
}

// 予約作成用の入力型（ゲストユーザー用）
export interface CreateBookingInputGuest {
  slot_id: string;
  guest_name: string;
  guest_email: string;
  guest_comment?: string;
}

// 予約作成用の統合入力型
export type CreateBookingInput = CreateBookingInputUser | CreateBookingInputGuest;

// 予約（詳細情報付き）
export interface BookingWithDetails extends Booking {
  slot?: BookingSlot;
  menu?: BookingMenu;
}

// -------------------------------------------
// API レスポンス型
// -------------------------------------------

// 成功レスポンス
export interface BookingSuccessResponse<T> {
  success: true;
  data: T;
}

// エラーレスポンス
export interface BookingErrorResponse {
  success: false;
  error: string;
  code?: BookingErrorCode;
}

// 統合レスポンス型
export type BookingResponse<T> = BookingSuccessResponse<T> | BookingErrorResponse;

// エラーコード
export type BookingErrorCode =
  | 'DATABASE_NOT_CONFIGURED'
  | 'UNAUTHORIZED'
  | 'MENU_NOT_FOUND'
  | 'SLOT_NOT_FOUND'
  | 'SLOT_FULL'
  | 'ALREADY_BOOKED'
  | 'INVALID_INPUT'
  | 'UNKNOWN_ERROR';

// -------------------------------------------
// ユーティリティ型
// -------------------------------------------

// 予約メニュー（枠情報付き）
export interface BookingMenuWithSlots extends BookingMenu {
  slots: BookingSlotWithAvailability[];
}

// 予約統計
export interface BookingStats {
  total_menus: number;
  total_slots: number;
  total_bookings: number;
  upcoming_bookings: number;
}

// -------------------------------------------
// 定数
// -------------------------------------------

// メニュータイプラベル
export const BOOKING_MENU_TYPE_LABELS: Record<BookingMenuType, string> = {
  reservation: '予約',
  adjustment: '日程調整',
};

// ステータスラベル
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  ok: '確定',
  pending: '保留中',
  cancelled: 'キャンセル',
};

// デフォルト値
export const DEFAULT_DURATION_MIN = 60;
export const DEFAULT_MAX_CAPACITY = 1;

