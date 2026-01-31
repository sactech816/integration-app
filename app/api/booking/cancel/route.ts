import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアント
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) return null;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function POST(request: Request) {
  try {
    const { cancel_token } = await request.json();

    if (!cancel_token) {
      return NextResponse.json({ error: 'cancel_token is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // トークンで予約を検索
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        slot:booking_slots(
          *,
          menu:booking_menus(*)
        )
      `)
      .eq('cancel_token', cancel_token)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 既にキャンセル済みの場合
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // 予約をキャンセル
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id);

    if (updateError) {
      console.error('[Booking Cancel] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
    }

    // キャンセル通知メール送信
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makers.tokyo';
      await fetch(`${baseUrl}/api/booking/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, type: 'cancel' }),
      });
    } catch (emailError) {
      console.error('[Booking Cancel] Email notification error:', emailError);
      // メール送信エラーはキャンセル処理には影響させない
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking: {
        id: booking.id,
        guest_name: booking.guest_name,
        slot: booking.slot,
      }
    });
  } catch (error) {
    console.error('[Booking Cancel] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel booking',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GETでキャンセルページ用の予約情報を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cancel_token = searchParams.get('token');

    if (!cancel_token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // トークンで予約を検索
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        guest_name,
        status,
        created_at,
        slot:booking_slots(
          id,
          start_time,
          end_time,
          menu:booking_menus(
            id,
            title,
            description,
            duration_min
          )
        )
      `)
      .eq('cancel_token', cancel_token)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('[Booking Cancel GET] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to get booking',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
