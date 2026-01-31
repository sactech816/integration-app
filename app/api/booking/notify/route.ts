import { NextResponse } from 'next/server';
import { sendBookingNotificationEmail } from '@/app/actions/booking';

/**
 * 予約通知メールを送信するAPIエンドポイント
 * 主にキャンセルAPIなど外部から呼び出される場合に使用
 * メール送信のコア機能は booking.ts の sendBookingNotificationEmail に統一
 */
export async function POST(request: Request) {
  try {
    const { bookingId, type } = await request.json();

    console.log('[Booking Notify API] Received request:', { bookingId, type });

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    // booking.ts の共通関数を呼び出し
    await sendBookingNotificationEmail(bookingId, type || 'confirm');

    console.log('[Booking Notify API] Email sent successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Notification email sent'
    });
  } catch (error) {
    console.error('[Booking Notify API] Error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to send notification',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
