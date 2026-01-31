'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import {
  AttendanceEvent,
  AttendanceResponse,
  CreateAttendanceEventInput,
  CreateAttendanceResponseInput,
  AttendanceTableData,
  SlotSummary,
  AttendanceApiResponse,
  AttendanceStatus,
} from '@/types/attendance';

// レート制限: 1日あたりの最大作成数
const DAILY_CREATE_LIMIT = 10;

// サーバーサイド用Supabaseクライアント
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

// -------------------------------------------
// IPアドレス取得
// -------------------------------------------
async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    // プロキシ経由の場合
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    // Vercel等のプラットフォーム
    const realIp = headersList.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
    return null;
  } catch {
    return null;
  }
}

// -------------------------------------------
// 出欠表イベント作成
// -------------------------------------------
export async function createAttendanceEvent(
  input: CreateAttendanceEventInput,
  userId?: string | null
): Promise<AttendanceApiResponse<AttendanceEvent>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  try {
    // IPアドレスを取得
    const clientIp = await getClientIp();

    // レート制限チェック（IPアドレスがある場合のみ）
    if (clientIp) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { count, error: countError } = await supabase
        .from('attendance_events')
        .select('*', { count: 'exact', head: true })
        .eq('creator_ip', clientIp)
        .gte('created_at', twentyFourHoursAgo);

      if (!countError && count !== null && count >= DAILY_CREATE_LIMIT) {
        return { 
          success: false, 
          error: `1日の作成上限（${DAILY_CREATE_LIMIT}件）に達しました。24時間後に再度お試しください。` 
        };
      }
    }

    const { data, error } = await supabase
      .from('attendance_events')
      .insert({
        title: input.title,
        description: input.description || null,
        slots: input.slots,
        user_id: userId || null,
        creator_ip: clientIp,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance event:', error);
      return { success: false, error: '出欠表の作成に失敗しました' };
    }

    return { success: true, data: data as AttendanceEvent };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: '予期しないエラーが発生しました' };
  }
}

// -------------------------------------------
// 出欠表イベント取得
// -------------------------------------------
export async function getAttendanceEvent(
  eventId: string
): Promise<AttendanceEvent | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('attendance_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) return null;

    return data as AttendanceEvent;
  } catch (err) {
    console.error('Error getting attendance event:', err);
    return null;
  }
}

// -------------------------------------------
// 出欠回答送信
// -------------------------------------------
export async function submitAttendanceResponse(
  input: CreateAttendanceResponseInput
): Promise<AttendanceApiResponse<AttendanceResponse>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  try {
    // 同じ名前の既存回答をチェック
    const { data: existing } = await supabase
      .from('attendance_responses')
      .select('id')
      .eq('event_id', input.event_id)
      .eq('participant_name', input.participant_name)
      .single();

    if (existing) {
      // 既存の回答を更新
      const { data, error } = await supabase
        .from('attendance_responses')
        .update({
          participant_email: input.participant_email || null,
          responses: input.responses,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating attendance response:', error);
        return { success: false, error: '回答の更新に失敗しました' };
      }

      return { success: true, data: data as AttendanceResponse };
    }

    // 新規回答を作成
    const { data, error } = await supabase
      .from('attendance_responses')
      .insert({
        event_id: input.event_id,
        participant_name: input.participant_name,
        participant_email: input.participant_email || null,
        responses: input.responses,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance response:', error);
      return { success: false, error: '回答の送信に失敗しました' };
    }

    return { success: true, data: data as AttendanceResponse };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: '予期しないエラーが発生しました' };
  }
}

// -------------------------------------------
// 最終アクセス日時を更新
// -------------------------------------------
export async function updateLastAccessedAt(eventId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase
      .from('attendance_events')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', eventId);
  } catch (err) {
    // エラーは無視（アクセス追跡の失敗はユーザー体験に影響しない）
    console.error('Failed to update last_accessed_at:', err);
  }
}

// -------------------------------------------
// 出欠表データ取得（集計付き）
// -------------------------------------------
export async function getAttendanceTableData(
  eventId: string
): Promise<AttendanceTableData | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // イベント情報を取得
    const { data: eventData, error: eventError } = await supabase
      .from('attendance_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) return null;

    // 最終アクセス日時を更新（非同期で実行、待機しない）
    updateLastAccessedAt(eventId);

    const event = eventData as AttendanceEvent;

    // 回答を取得
    const { data: responsesData, error: responsesError } = await supabase
      .from('attendance_responses')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (responsesError) {
      console.error('Error getting responses:', responsesError);
      return null;
    }

    const participants = (responsesData || []) as AttendanceResponse[];

    // スロットごとの集計
    const slots: SlotSummary[] = event.slots.map((slot, index) => {
      let yes_count = 0;
      let no_count = 0;
      let maybe_count = 0;

      participants.forEach((participant) => {
        const status = participant.responses[index] as AttendanceStatus | undefined;
        if (status === 'yes') yes_count++;
        else if (status === 'no') no_count++;
        else if (status === 'maybe') maybe_count++;
      });

      return {
        slot_index: index,
        slot,
        yes_count,
        no_count,
        maybe_count,
        available_count: yes_count + maybe_count,
        total_responses: participants.length,
      };
    });

    // 最も参加可能な人が多いスロットを特定
    let best_slot_index: number | undefined;
    let maxAvailable = 0;
    slots.forEach((slotSummary) => {
      if (slotSummary.available_count > maxAvailable) {
        maxAvailable = slotSummary.available_count;
        best_slot_index = slotSummary.slot_index;
      }
    });

    return {
      event,
      slots,
      participants,
      best_slot_index: maxAvailable > 0 ? best_slot_index : undefined,
    };
  } catch (err) {
    console.error('Error getting attendance table data:', err);
    return null;
  }
}

// -------------------------------------------
// 回答削除
// -------------------------------------------
export async function deleteAttendanceResponse(
  responseId: string
): Promise<AttendanceApiResponse<null>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  try {
    const { error } = await supabase
      .from('attendance_responses')
      .delete()
      .eq('id', responseId);

    if (error) {
      console.error('Error deleting response:', error);
      return { success: false, error: '回答の削除に失敗しました' };
    }

    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: '予期しないエラーが発生しました' };
  }
}

// -------------------------------------------
// ユーザーの出欠表イベント一覧取得
// -------------------------------------------
export async function getAttendanceEvents(
  userId: string
): Promise<AttendanceEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('attendance_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting attendance events:', error);
      return [];
    }

    return (data || []) as AttendanceEvent[];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// -------------------------------------------
// 全出欠表イベント取得（管理者用）
// -------------------------------------------
export async function getAllAttendanceEvents(): Promise<AttendanceEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('attendance_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting all attendance events:', error);
      return [];
    }

    return (data || []) as AttendanceEvent[];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// -------------------------------------------
// 出欠表イベント削除
// -------------------------------------------
export async function deleteAttendanceEvent(
  eventId: string,
  userId: string
): Promise<AttendanceApiResponse<null>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  try {
    // 所有者チェック
    const { data: event } = await supabase
      .from('attendance_events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (!event || event.user_id !== userId) {
      return { success: false, error: '削除権限がありません' };
    }

    // 関連する回答も削除
    await supabase
      .from('attendance_responses')
      .delete()
      .eq('event_id', eventId);

    // イベント削除
    const { error } = await supabase
      .from('attendance_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting attendance event:', error);
      return { success: false, error: '出欠表の削除に失敗しました' };
    }

    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: '予期しないエラーが発生しました' };
  }
}

// -------------------------------------------
// 出欠表イベント複製
// -------------------------------------------
export async function duplicateAttendanceEvent(
  eventId: string,
  userId: string
): Promise<AttendanceApiResponse<AttendanceEvent>> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  try {
    // 元のイベントを取得
    const { data: original, error: fetchError } = await supabase
      .from('attendance_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (fetchError || !original) {
      return { success: false, error: '元の出欠表が見つかりません' };
    }

    // 複製を作成
    const { data, error } = await supabase
      .from('attendance_events')
      .insert({
        title: `${original.title} (コピー)`,
        description: original.description,
        slots: original.slots,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating attendance event:', error);
      return { success: false, error: '出欠表の複製に失敗しました' };
    }

    return { success: true, data: data as AttendanceEvent };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: '予期しないエラーが発生しました' };
  }
}

// -------------------------------------------
// 出欠表イベントカウント取得
// -------------------------------------------
export async function getAttendanceEventCount(
  userId: string
): Promise<number> {
  const supabase = getSupabaseClient();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from('attendance_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting attendance events:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Unexpected error:', err);
    return 0;
  }
}
