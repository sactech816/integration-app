'use server';

import { createClient } from '@supabase/supabase-js';
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
    const { data, error } = await supabase
      .from('attendance_events')
      .insert({
        title: input.title,
        description: input.description || null,
        slots: input.slots,
        user_id: userId || null,
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
