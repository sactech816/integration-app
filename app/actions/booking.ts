'use server';

import { createClient } from '@supabase/supabase-js';
import {
  BookingMenu,
  BookingSlot,
  BookingSlotWithAvailability,
  Booking,
  BookingWithDetails,
  BookingResponse,
  CreateBookingMenuInput,
  UpdateBookingMenuInput,
  CreateBookingSlotInput,
  CreateBookingInput,
  ScheduleAdjustmentResponse,
  ScheduleAdjustmentWithDetails,
  CreateScheduleAdjustmentInput,
  UpdateScheduleAdjustmentInput,
  AttendanceTableData,
  SlotAttendanceSummary,
  AttendanceStatus,
  DEFAULT_DURATION_MIN,
  DEFAULT_MAX_CAPACITY,
} from '@/types/booking';

// ===========================================
// Supabaseクライアント初期化
// ===========================================

/**
 * サーバーサイド用Supabaseクライアントを取得
 * 
 * NOTE: Supabaseクライアントのimportパスが異なる場合は、
 * 以下のコメントを参考に適切なパスに修正してください。
 * 例: import { createServerClient } from '@/utils/supabase/server';
 */
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) return null;

  // Service Role Keyがあればそれを使用（RLSバイパス）、なければAnon Key
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ===========================================
// 予約メニュー管理
// ===========================================

/**
 * 予約メニューを新規作成
 */
export async function createBookingMenu(
  userId: string,
  input: CreateBookingMenuInput
): Promise<BookingResponse<BookingMenu>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  if (!userId) {
    return { success: false, error: 'User ID is required', code: 'UNAUTHORIZED' };
  }

  if (!input.title?.trim()) {
    return { success: false, error: 'Title is required', code: 'INVALID_INPUT' };
  }

  const { data, error } = await supabase
    .from('booking_menus')
    .insert({
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      duration_min: input.duration_min ?? DEFAULT_DURATION_MIN,
      type: input.type ?? 'reservation',
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('[Booking] Create menu error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data };
}

/**
 * 自分の予約メニュー一覧を取得
 */
export async function getBookingMenus(userId: string): Promise<BookingMenu[]> {
  const supabase = getSupabaseServer();
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from('booking_menus')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Booking] Get menus error:', error);
    return [];
  }

  return data || [];
}

/**
 * 予約メニューを取得（単一）
 */
export async function getBookingMenu(menuId: string): Promise<BookingMenu | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('booking_menus')
    .select('*')
    .eq('id', menuId)
    .single();

  if (error) {
    console.error('[Booking] Get menu error:', error);
    return null;
  }

  return data;
}

/**
 * 予約メニューを更新
 */
export async function updateBookingMenu(
  menuId: string,
  userId: string,
  input: UpdateBookingMenuInput
): Promise<BookingResponse<BookingMenu>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // 所有者確認
  const existingMenu = await getBookingMenu(menuId);
  if (!existingMenu) {
    return { success: false, error: 'Menu not found', code: 'MENU_NOT_FOUND' };
  }
  if (existingMenu.user_id !== userId) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.description !== undefined) updateData.description = input.description?.trim() || null;
  if (input.duration_min !== undefined) updateData.duration_min = input.duration_min;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;

  const { data, error } = await supabase
    .from('booking_menus')
    .update(updateData)
    .eq('id', menuId)
    .select()
    .single();

  if (error) {
    console.error('[Booking] Update menu error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data };
}

/**
 * 予約メニューを削除
 */
export async function deleteBookingMenu(
  menuId: string,
  userId: string
): Promise<BookingResponse<{ deleted: boolean }>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // 所有者確認
  const existingMenu = await getBookingMenu(menuId);
  if (!existingMenu) {
    return { success: false, error: 'Menu not found', code: 'MENU_NOT_FOUND' };
  }
  if (existingMenu.user_id !== userId) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const { error } = await supabase
    .from('booking_menus')
    .delete()
    .eq('id', menuId);

  if (error) {
    console.error('[Booking] Delete menu error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data: { deleted: true } };
}

// ===========================================
// 予約枠管理
// ===========================================

/**
 * 予約枠を一括登録
 */
export async function createBookingSlots(
  menuId: string,
  userId: string,
  slots: CreateBookingSlotInput[]
): Promise<BookingResponse<BookingSlot[]>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // メニュー所有者確認
  const menu = await getBookingMenu(menuId);
  if (!menu) {
    return { success: false, error: 'Menu not found', code: 'MENU_NOT_FOUND' };
  }
  if (menu.user_id !== userId) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  if (!slots || slots.length === 0) {
    return { success: false, error: 'At least one slot is required', code: 'INVALID_INPUT' };
  }

  // 入力バリデーション
  const now = new Date();
  for (const slot of slots) {
    if (!slot.start_time || !slot.end_time) {
      return { success: false, error: 'start_time and end_time are required', code: 'INVALID_INPUT' };
    }
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: 'Invalid date format', code: 'INVALID_INPUT' };
    }
    if (start >= end) {
      return { success: false, error: 'start_time must be before end_time', code: 'INVALID_INPUT' };
    }
    // 過去日時チェック
    if (start <= now) {
      return { success: false, error: 'Cannot create slots in the past', code: 'INVALID_INPUT' };
    }
  }

  const insertData = slots.map((slot) => ({
    menu_id: menuId,
    start_time: slot.start_time,
    end_time: slot.end_time,
    max_capacity: slot.max_capacity ?? DEFAULT_MAX_CAPACITY,
  }));

  const { data, error } = await supabase
    .from('booking_slots')
    .insert(insertData)
    .select();

  if (error) {
    console.error('[Booking] Create slots error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data: data || [] };
}

/**
 * 特定メニューの予約枠一覧を取得（空き状況付き）
 * 
 * bookingテーブルをjoinして、予約数がmax_capacityに達していないか判定
 */
export async function getAvailableSlots(
  menuId: string,
  options?: {
    fromDate?: string; // ISO 8601形式、指定日以降の枠のみ取得
    includeFullSlots?: boolean; // 満席の枠も含めるか（デフォルト: false）
  }
): Promise<BookingSlotWithAvailability[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  // メニュー存在確認
  const menu = await getBookingMenu(menuId);
  if (!menu) return [];

  // 予約枠を取得
  let query = supabase
    .from('booking_slots')
    .select('*')
    .eq('menu_id', menuId)
    .order('start_time', { ascending: true });

  // 日付フィルター
  const fromDate = options?.fromDate || new Date().toISOString();
  query = query.gte('start_time', fromDate);

  const { data: slots, error: slotsError } = await query;

  if (slotsError) {
    console.error('[Booking] Get slots error:', slotsError);
    return [];
  }

  if (!slots || slots.length === 0) return [];

  // 各枠の予約数を取得
  const slotIds = slots.map((s) => s.id);
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('slot_id')
    .in('slot_id', slotIds)
    .neq('status', 'cancelled'); // キャンセル済みは除外

  if (bookingsError) {
    console.error('[Booking] Get bookings count error:', bookingsError);
    return [];
  }

  // 枠ごとの予約数をカウント
  const bookingCounts: Record<string, number> = {};
  for (const booking of bookings || []) {
    bookingCounts[booking.slot_id] = (bookingCounts[booking.slot_id] || 0) + 1;
  }

  // 空き状況を付与
  const slotsWithAvailability: BookingSlotWithAvailability[] = slots.map((slot) => {
    const currentBookings = bookingCounts[slot.id] || 0;
    const remainingCapacity = slot.max_capacity - currentBookings;
    const isAvailable = remainingCapacity > 0;

    return {
      ...slot,
      current_bookings: currentBookings,
      is_available: isAvailable,
      remaining_capacity: Math.max(0, remainingCapacity),
    };
  });

  // 満席の枠を除外するかどうか
  if (!options?.includeFullSlots) {
    return slotsWithAvailability.filter((slot) => slot.is_available);
  }

  return slotsWithAvailability;
}

/**
 * 予約枠を削除
 */
export async function deleteBookingSlot(
  slotId: string,
  userId: string
): Promise<BookingResponse<{ deleted: boolean }>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // 枠の存在確認とメニュー所有者確認
  const { data: slot, error: slotError } = await supabase
    .from('booking_slots')
    .select('*, menu:booking_menus(*)')
    .eq('id', slotId)
    .single();

  if (slotError || !slot) {
    return { success: false, error: 'Slot not found', code: 'SLOT_NOT_FOUND' };
  }

  if (slot.menu?.user_id !== userId) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const { error } = await supabase
    .from('booking_slots')
    .delete()
    .eq('id', slotId);

  if (error) {
    console.error('[Booking] Delete slot error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data: { deleted: true } };
}

// ===========================================
// 予約管理
// ===========================================

/**
 * 予約を登録（ログインユーザーとゲストユーザー両対応）
 */
export async function submitBooking(
  input: CreateBookingInput,
  customerId?: string // ログインユーザーの場合はユーザーID
): Promise<BookingResponse<Booking>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  const { slot_id } = input;

  if (!slot_id) {
    return { success: false, error: 'slot_id is required', code: 'INVALID_INPUT' };
  }

  // ゲストユーザーの場合、名前とメールが必須
  const isGuest = !customerId;
  if (isGuest) {
    const guestInput = input as { guest_name?: string; guest_email?: string };
    if (!guestInput.guest_name?.trim()) {
      return { success: false, error: 'guest_name is required for guest booking', code: 'INVALID_INPUT' };
    }
    if (!guestInput.guest_email?.trim()) {
      return { success: false, error: 'guest_email is required for guest booking', code: 'INVALID_INPUT' };
    }
    // 簡易的なメールバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestInput.guest_email)) {
      return { success: false, error: 'Invalid email format', code: 'INVALID_INPUT' };
    }
  }

  // 枠の存在確認
  const { data: slot, error: slotError } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('id', slot_id)
    .single();

  if (slotError || !slot) {
    return { success: false, error: 'Slot not found', code: 'SLOT_NOT_FOUND' };
  }

  // 空き状況確認
  const { data: existingBookings, error: countError } = await supabase
    .from('bookings')
    .select('id')
    .eq('slot_id', slot_id)
    .neq('status', 'cancelled');

  if (countError) {
    console.error('[Booking] Count bookings error:', countError);
    return { success: false, error: 'Failed to check availability', code: 'UNKNOWN_ERROR' };
  }

  const currentCount = existingBookings?.length || 0;
  if (currentCount >= slot.max_capacity) {
    return { success: false, error: 'This slot is fully booked', code: 'SLOT_FULL' };
  }

  // ログインユーザーの場合、同じ枠への重複予約チェック
  if (customerId) {
    const { data: duplicateBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('slot_id', slot_id)
      .eq('customer_id', customerId)
      .neq('status', 'cancelled')
      .single();

    if (duplicateBooking) {
      return { success: false, error: 'You have already booked this slot', code: 'ALREADY_BOOKED' };
    }
  }

  // 予約データを作成
  const guestInput = input as { guest_name?: string; guest_email?: string; guest_comment?: string };
  const insertData: Record<string, unknown> = {
    slot_id,
    status: 'ok',
  };

  if (customerId) {
    insertData.customer_id = customerId;
    insertData.guest_comment = guestInput.guest_comment?.trim() || null;
  } else {
    insertData.guest_name = guestInput.guest_name?.trim();
    insertData.guest_email = guestInput.guest_email?.trim();
    insertData.guest_comment = guestInput.guest_comment?.trim() || null;
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[Booking] Submit booking error:', error);
    // ユニーク制約違反の場合
    if (error.code === '23505') {
      return { success: false, error: 'You have already booked this slot', code: 'ALREADY_BOOKED' };
    }
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  // 予約完了メール送信（非同期で実行、エラーは無視）
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    fetch(`${baseUrl}/api/booking/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: data.id, type: 'confirm' }),
    }).catch(() => {}); // エラーは無視
  } catch {
    // メール送信エラーは予約成功に影響させない
  }

  return { success: true, data };
}

/**
 * 予約をキャンセル
 */
export async function cancelBooking(
  bookingId: string,
  userId?: string // ログインユーザーの場合
): Promise<BookingResponse<Booking>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // 予約の存在確認
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return { success: false, error: 'Booking not found', code: 'SLOT_NOT_FOUND' };
  }

  // ログインユーザーの場合、本人確認
  if (userId && booking.customer_id && booking.customer_id !== userId) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('[Booking] Cancel booking error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data };
}

/**
 * 予約一覧を取得（メニュー所有者用）
 */
export async function getBookingsByMenu(
  menuId: string,
  userId: string,
  options?: {
    status?: string;
    fromDate?: string;
  }
): Promise<BookingWithDetails[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  // メニュー所有者確認
  const menu = await getBookingMenu(menuId);
  if (!menu || menu.user_id !== userId) return [];

  // 枠IDを取得
  const { data: slots, error: slotsError } = await supabase
    .from('booking_slots')
    .select('id')
    .eq('menu_id', menuId);

  if (slotsError || !slots || slots.length === 0) return [];

  const slotIds = slots.map((s) => s.id);

  // 予約を取得
  let query = supabase
    .from('bookings')
    .select(`
      *,
      slot:booking_slots(*)
    `)
    .in('slot_id', slotIds)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Booking] Get bookings by menu error:', error);
    return [];
  }

  // メニュー情報を付与
  return (data || []).map((booking) => ({
    ...booking,
    menu,
  }));
}

/**
 * ユーザーの予約一覧を取得
 */
export async function getUserBookings(
  userId: string,
  options?: {
    status?: string;
    upcoming?: boolean; // 今後の予約のみ
  }
): Promise<BookingWithDetails[]> {
  const supabase = getSupabaseServer();
  if (!supabase || !userId) return [];

  let query = supabase
    .from('bookings')
    .select(`
      *,
      slot:booking_slots(
        *,
        menu:booking_menus(*)
      )
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Booking] Get user bookings error:', error);
    return [];
  }

  let bookings = (data || []).map((booking) => ({
    ...booking,
    menu: booking.slot?.menu,
  }));

  // 今後の予約のみフィルター
  if (options?.upcoming) {
    const now = new Date().toISOString();
    bookings = bookings.filter(
      (b) => b.slot?.start_time && b.slot.start_time >= now
    );
  }

  return bookings;
}

// ===========================================
// 日程調整管理
// ===========================================

/**
 * 日程調整への回答を送信または更新
 */
export async function submitScheduleAdjustment(
  input: CreateScheduleAdjustmentInput
): Promise<BookingResponse<ScheduleAdjustmentResponse>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // メニュー存在確認とタイプ確認
  const menu = await getBookingMenu(input.menu_id);
  if (!menu) {
    return { success: false, error: 'Menu not found', code: 'MENU_NOT_FOUND' };
  }
  if (menu.type !== 'adjustment') {
    return { success: false, error: 'This menu is not a schedule adjustment menu', code: 'INVALID_INPUT' };
  }
  if (!menu.is_active) {
    return { success: false, error: 'This menu is not active', code: 'INVALID_INPUT' };
  }

  if (!input.participant_name?.trim()) {
    return { success: false, error: 'participant_name is required', code: 'INVALID_INPUT' };
  }

  // メールアドレスのバリデーション（入力されている場合）
  if (input.participant_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.participant_email)) {
      return { success: false, error: 'Invalid email format', code: 'INVALID_INPUT' };
    }
  }

  // 既存の回答を確認
  const { data: existingResponse } = await supabase
    .from('schedule_adjustment_responses')
    .select('id')
    .eq('menu_id', input.menu_id)
    .eq('participant_name', input.participant_name.trim())
    .single();

  let data;
  let error;

  if (existingResponse) {
    // 更新
    const { data: updated, error: updateError } = await supabase
      .from('schedule_adjustment_responses')
      .update({
        participant_email: input.participant_email?.trim() || null,
        responses: input.responses,
      })
      .eq('id', existingResponse.id)
      .select()
      .single();

    data = updated;
    error = updateError;
  } else {
    // 新規作成
    const { data: created, error: insertError } = await supabase
      .from('schedule_adjustment_responses')
      .insert({
        menu_id: input.menu_id,
        participant_name: input.participant_name.trim(),
        participant_email: input.participant_email?.trim() || null,
        responses: input.responses,
      })
      .select()
      .single();

    data = created;
    error = insertError;
  }

  if (error) {
    console.error('[Booking] Submit schedule adjustment error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  // メール送信（participant_emailがある場合、非同期で実行）
  if (input.participant_email && data) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');
      fetch(`${baseUrl}/api/booking/adjustment/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: data.id, type: 'response' }),
      }).catch(() => {}); // エラーは無視
    } catch {
      // メール送信エラーは回答成功に影響させない
    }
  }

  return { success: true, data };
}

/**
 * 日程調整の出欠表データを取得
 */
export async function getScheduleAdjustments(
  menuId: string
): Promise<AttendanceTableData | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  // メニュー確認
  const menu = await getBookingMenu(menuId);
  if (!menu || menu.type !== 'adjustment') return null;

  // 日程候補（スロット）を取得
  const { data: slots, error: slotsError } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('menu_id', menuId)
    .order('start_time', { ascending: true });

  if (slotsError || !slots || slots.length === 0) {
    return { slots: [], participants: [] };
  }

  // 回答を取得
  const { data: responses, error: responsesError } = await supabase
    .from('schedule_adjustment_responses')
    .select('*')
    .eq('menu_id', menuId)
    .order('created_at', { ascending: true });

  if (responsesError) {
    console.error('[Booking] Get schedule adjustments error:', responsesError);
    return null;
  }

  const participants = (responses || []) as ScheduleAdjustmentResponse[];

  // 各日程候補の集計
  const slotSummaries: SlotAttendanceSummary[] = slots.map((slot) => {
    let yesCount = 0;
    let noCount = 0;
    let maybeCount = 0;

    participants.forEach((participant) => {
      const status = participant.responses[slot.id] as AttendanceStatus | undefined;
      if (status === 'yes') yesCount++;
      else if (status === 'no') noCount++;
      else if (status === 'maybe') maybeCount++;
    });

    const availableCount = yesCount + maybeCount;
    const totalResponses = yesCount + noCount + maybeCount;

    return {
      slot_id: slot.id,
      slot,
      yes_count: yesCount,
      no_count: noCount,
      maybe_count: maybeCount,
      available_count: availableCount,
      total_responses: totalResponses,
    };
  });

  // 最も多くの人が参加できる日程を判定（available_countが最大のもの）
  const bestSlot = slotSummaries.reduce((best, current) => {
    if (current.available_count > best.available_count) {
      return current;
    }
    // 同数の場合、yes_countが多い方を優先
    if (current.available_count === best.available_count && current.yes_count > best.yes_count) {
      return current;
    }
    return best;
  }, slotSummaries[0] || null);

  return {
    slots: slotSummaries,
    participants,
    best_slot_id: bestSlot?.slot_id,
  };
}

/**
 * 日程調整の回答を更新
 */
export async function updateScheduleAdjustment(
  menuId: string,
  participantName: string,
  input: UpdateScheduleAdjustmentInput
): Promise<BookingResponse<ScheduleAdjustmentResponse>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // 既存の回答を確認
  const { data: existingResponse, error: findError } = await supabase
    .from('schedule_adjustment_responses')
    .select('*')
    .eq('menu_id', menuId)
    .eq('participant_name', participantName.trim())
    .single();

  if (findError || !existingResponse) {
    return { success: false, error: 'Response not found', code: 'SLOT_NOT_FOUND' };
  }

  const updateData: Record<string, unknown> = {};
  if (input.participant_email !== undefined) {
    updateData.participant_email = input.participant_email?.trim() || null;
  }
  if (input.responses) {
    updateData.responses = input.responses;
  }

  const { data, error } = await supabase
    .from('schedule_adjustment_responses')
    .update(updateData)
    .eq('id', existingResponse.id)
    .select()
    .single();

  if (error) {
    console.error('[Booking] Update schedule adjustment error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data };
}

/**
 * メニュー所有者用: 日程調整の全回答を取得
 */
export async function getScheduleAdjustmentsByMenu(
  menuId: string,
  userId: string
): Promise<ScheduleAdjustmentWithDetails[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  // メニュー所有者確認
  const menu = await getBookingMenu(menuId);
  if (!menu || menu.user_id !== userId) return [];

  const { data, error } = await supabase
    .from('schedule_adjustment_responses')
    .select('*')
    .eq('menu_id', menuId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Booking] Get schedule adjustments by menu error:', error);
    return [];
  }

  return (data || []).map((response) => ({
    ...response,
    menu,
  }));
}

