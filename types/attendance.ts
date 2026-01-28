// ===========================================
// 出欠表メーカー 型定義
// ===========================================

// -------------------------------------------
// 出欠ステータス
// -------------------------------------------
export type AttendanceStatus = 'yes' | 'no' | 'maybe';

// -------------------------------------------
// 候補日程スロット
// -------------------------------------------
export interface AttendanceSlot {
  date: string; // YYYY-MM-DD形式
  start_time?: string; // HH:mm形式（任意）
  end_time?: string; // HH:mm形式（任意）
  label?: string; // カスタムラベル（任意）
}

// -------------------------------------------
// 出欠表イベント (attendance_events)
// -------------------------------------------
export interface AttendanceEvent {
  id: string;
  title: string;
  description?: string | null;
  slots: AttendanceSlot[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// 出欠表イベント作成用の入力型
export interface CreateAttendanceEventInput {
  title: string;
  description?: string;
  slots: AttendanceSlot[];
}

// -------------------------------------------
// 出欠回答 (attendance_responses)
// -------------------------------------------
export interface AttendanceResponse {
  id: string;
  event_id: string;
  participant_name: string;
  participant_email?: string | null;
  responses: Record<number, AttendanceStatus>; // {slot_index: 'yes'|'no'|'maybe'}
  created_at?: string;
  updated_at?: string;
}

// 出欠回答作成用の入力型
export interface CreateAttendanceResponseInput {
  event_id: string;
  participant_name: string;
  participant_email?: string;
  responses: Record<number, AttendanceStatus>;
}

// -------------------------------------------
// 集計用の型
// -------------------------------------------

// スロットごとの集計
export interface SlotSummary {
  slot_index: number;
  slot: AttendanceSlot;
  yes_count: number;
  no_count: number;
  maybe_count: number;
  available_count: number; // yes + maybe
  total_responses: number;
}

// 出欠表データ（表示用）
export interface AttendanceTableData {
  event: AttendanceEvent;
  slots: SlotSummary[];
  participants: AttendanceResponse[];
  best_slot_index?: number; // 最も参加可能な人が多いスロット
}

// -------------------------------------------
// API レスポンス型
// -------------------------------------------
export interface AttendanceSuccessResponse<T> {
  success: true;
  data: T;
}

export interface AttendanceErrorResponse {
  success: false;
  error: string;
}

export type AttendanceApiResponse<T> = AttendanceSuccessResponse<T> | AttendanceErrorResponse;

// -------------------------------------------
// 定数
// -------------------------------------------

// 出欠ステータスラベル
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  yes: '参加可',
  no: '参加不可',
  maybe: '未定',
};

// 出欠ステータスアイコン
export const ATTENDANCE_STATUS_ICONS: Record<AttendanceStatus, string> = {
  yes: '○',
  no: '×',
  maybe: '△',
};

// 出欠ステータスカラー
export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, { bg: string; text: string; border: string }> = {
  yes: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  no: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  maybe: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};
