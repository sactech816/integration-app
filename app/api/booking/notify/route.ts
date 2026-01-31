import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Supabaseクライアント
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) return null;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// 日時フォーマット（日本時間）
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
};

export async function POST(request: Request) {
  try {
    const { bookingId, type } = await request.json();

    console.log('[Booking Notify] Received request:', { bookingId, type });

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    // 環境変数チェック
    if (!process.env.RESEND_API_KEY) {
      console.error('[Booking Notify] RESEND_API_KEY is not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.warn('[Booking Notify] RESEND_FROM_EMAIL is not set, using default onboarding@resend.dev');
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 予約情報を取得
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        slot:booking_slots(
          *,
          menu:booking_menus(*)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const slot = booking.slot;
    const menu = slot?.menu;

    if (!slot || !menu) {
      return NextResponse.json({ error: 'Slot or menu not found' }, { status: 404 });
    }

    // メニュー所有者のメールアドレスを取得
    // 1. notification_emailが設定されていればそれを優先
    // 2. なければuser_idからログインユーザーのメールを取得
    let ownerEmail = menu.notification_email || null;
    if (!ownerEmail && menu.user_id) {
      const { data: ownerData } = await supabase.auth.admin.getUserById(menu.user_id);
      ownerEmail = ownerData?.user?.email;
    }

    // 予約者の情報
    // 入力された名前を優先、なければ「お客様」
    const customerName = booking.guest_name || 'お客様';
    let customerEmail = booking.guest_email;
    let registeredEmail: string | null = null; // ログインユーザーの登録メール（表示用）

    // ログインユーザーの場合、メールアドレスを取得
    if (booking.customer_id) {
      const { data: customerData } = await supabase.auth.admin.getUserById(booking.customer_id);
      customerEmail = customerData?.user?.email;
      registeredEmail = customerEmail || null; // ログインユーザーの登録メールを保持
    }

    const startTime = formatDateTime(slot.start_time);
    const endTime = new Date(slot.end_time).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
    });

    // キャンセルリンクを生成
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makers.tokyo';
    const cancelUrl = booking.cancel_token 
      ? `${baseUrl}/booking/cancel?token=${booking.cancel_token}`
      : null;

    const emailPromises = [];

    // 予約者へのメール
    if (customerEmail) {
      const customerHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">予約${type === 'cancel' ? 'キャンセル' : '完了'}のお知らせ</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 16px; color: #374151;">
              ${customerName}様<br><br>
              ${type === 'cancel' 
                ? 'ご予約がキャンセルされました。' 
                : 'ご予約ありがとうございます。以下の内容で予約を承りました。'}
            </p>
            ${registeredEmail ? `
              <p style="font-size: 14px; color: #6b7280; margin: 10px 0;">
                <strong>📧 ご登録メール:</strong> ${registeredEmail}
              </p>
            ` : ''}
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">${menu.title}</h2>
              ${menu.description ? `<p style="color: #6b7280; margin: 10px 0;">${menu.description}</p>` : ''}
              ${menu.contact_method ? `<p style="color: #374151; margin: 10px 0;"><strong>📍 コンタクト方法:</strong> ${menu.contact_method}</p>` : ''}
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 15px; padding-top: 15px;">
                <p style="margin: 8px 0; color: #374151;">
                  <strong>📅 日時:</strong> ${startTime} 〜 ${endTime}
                </p>
                <p style="margin: 8px 0; color: #374151;">
                  <strong>⏱ 所要時間:</strong> ${menu.duration_min}分
                </p>
                ${booking.guest_comment ? `
                  <p style="margin: 8px 0; color: #374151;">
                    <strong>💬 コメント:</strong> ${booking.guest_comment}
                  </p>
                ` : ''}
              </div>
            </div>
            
            ${type !== 'cancel' && cancelUrl ? `
              <div style="background: #fef2f2; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #fecaca;">
                <p style="font-size: 14px; color: #991b1b; margin: 0 0 10px 0;">
                  <strong>予約のキャンセル</strong>
                </p>
                <p style="font-size: 13px; color: #7f1d1d; margin: 0 0 12px 0;">
                  ご都合が悪くなった場合は、以下のリンクからキャンセルできます。
                </p>
                <a href="${cancelUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                  予約をキャンセル
                </a>
                <p style="font-size: 11px; color: #9ca3af; margin: 12px 0 0 0; word-break: break-all;">
                  キャンセルURL: <a href="${cancelUrl}" style="color: #6b7280;">${cancelUrl}</a>
                </p>
              </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #6b7280;">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">このメールは、予約メーカーから自動送信されています。</p>
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">-----</p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 5px 0;">集客に役立つツールが無料で使えるポータルサイト</p>
            <p style="margin: 5px 0;"><a href="https://makers.tokyo/tools" style="color: #60a5fa; font-size: 11px;">https://makers.tokyo/tools</a></p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 5px 0;">開発支援のお願い</p>
            <p style="margin: 5px 0;"><a href="https://makers.tokyo/donation" style="color: #60a5fa; font-size: 11px;">https://makers.tokyo/donation</a></p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 5px 0;">@2026 集客メーカー</p>
            <p style="margin: 5px 0;"><a href="https://makers.tokyo/" style="color: #60a5fa; font-size: 11px;">https://makers.tokyo/</a></p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: customerEmail,
          subject: `【予約${type === 'cancel' ? 'キャンセル' : '完了'}】${menu.title}`,
          html: customerHtml,
        })
      );
    }

    // 管理者へのメール
    if (ownerEmail) {
      const ownerHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">新規予約${type === 'cancel' ? 'キャンセル' : ''}のお知らせ</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 16px; color: #374151;">
              ${type === 'cancel' 
                ? '以下の予約がキャンセルされました。' 
                : '新しい予約が入りました。'}
            </p>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">${menu.title}</h2>
              ${menu.description ? `<p style="color: #6b7280; margin: 10px 0;">${menu.description}</p>` : ''}
              ${menu.contact_method ? `<p style="color: #374151; margin: 10px 0;"><strong>📍 コンタクト方法:</strong> ${menu.contact_method}</p>` : ''}
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 15px; padding-top: 15px;">
                <p style="margin: 8px 0; color: #374151;">
                  <strong>👤 予約者:</strong> ${customerName || '(名前なし)'}
                </p>
                <p style="margin: 8px 0; color: #374151;">
                  <strong>📧 メール:</strong> ${customerEmail || '(メールなし)'}
                </p>
                <p style="margin: 8px 0; color: #374151;">
                  <strong>📅 日時:</strong> ${startTime} 〜 ${endTime}
                </p>
                ${booking.guest_comment ? `
                  <p style="margin: 8px 0; color: #374151;">
                    <strong>💬 コメント:</strong> ${booking.guest_comment}
                  </p>
                ` : ''}
              </div>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">このメールは、予約メーカーから自動送信されています。</p>
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">-----</p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 5px 0;">集客に役立つツールが無料で使えるポータルサイト</p>
            <p style="margin: 5px 0;"><a href="https://makers.tokyo/tools" style="color: #60a5fa; font-size: 11px;">https://makers.tokyo/tools</a></p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 5px 0;">開発支援のお願い</p>
            <p style="margin: 5px 0;"><a href="https://makers.tokyo/donation" style="color: #60a5fa; font-size: 11px;">https://makers.tokyo/donation</a></p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 5px 0;">@2026 集客メーカー</p>
            <p style="margin: 5px 0;"><a href="https://makers.tokyo/" style="color: #60a5fa; font-size: 11px;">https://makers.tokyo/</a></p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: ownerEmail,
          subject: `【新規予約${type === 'cancel' ? 'キャンセル' : ''}】${menu.title} - ${customerName || '(名前なし)'}様`,
          html: ownerHtml,
        })
      );
    }

    // メール送信
    console.log('[Booking Notify] Sending emails...', {
      customerEmail,
      ownerEmail,
      emailCount: emailPromises.length
    });

    const results = await Promise.allSettled(emailPromises);
    
    // 送信結果をログ出力
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`[Booking Notify] Email ${index + 1} sent successfully:`, result.value);
      } else {
        console.error(`[Booking Notify] Email ${index + 1} failed:`, result.reason);
      }
    });

    // 少なくとも1通が成功していれば成功とする
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    if (successCount === 0) {
      console.error('[Booking Notify] All email sends failed');
      return NextResponse.json({ 
        error: 'Failed to send notification emails',
        detail: 'Check server logs for details'
      }, { status: 500 });
    }

    console.log(`[Booking Notify] Successfully sent ${successCount}/${results.length} emails`);

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      total: results.length 
    });
  } catch (error) {
    console.error('[Booking Notify] Error:', error);
    
    // より詳細なエラー情報をログ出力
    if (error instanceof Error) {
      console.error('[Booking Notify] Error message:', error.message);
      console.error('[Booking Notify] Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Failed to send notification',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

