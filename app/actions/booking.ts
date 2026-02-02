'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
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
// メール送信ヘルパー
// ===========================================

const FROM_EMAIL = 'Makers Support <support@makers.tokyo>';

/**
 * 日時フォーマット（日本時間）
 */
function formatDateTime(dateStr: string) {
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
}

/**
 * 予約完了メールを直接送信
 * APIエンドポイントからも呼び出せるようにエクスポート
 */
export async function sendBookingNotificationEmail(
  bookingId: string,
  type: 'confirm' | 'cancel' = 'confirm'
): Promise<void> {
  try {
    // 環境変数チェック
    if (!process.env.RESEND_API_KEY) {
      console.error('[Booking Email] RESEND_API_KEY is not configured');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = getSupabaseServer();
    if (!supabase) {
      console.error('[Booking Email] Database not configured');
      return;
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
      console.error('[Booking Email] Booking not found:', bookingId);
      return;
    }

    const slot = booking.slot;
    const menu = slot?.menu;

    if (!slot || !menu) {
      console.error('[Booking Email] Slot or menu not found');
      return;
    }

    // メニュー所有者のメールアドレスを取得
    let ownerEmail = menu.notification_email || null;
    if (!ownerEmail && menu.user_id) {
      const { data: ownerData } = await supabase.auth.admin.getUserById(menu.user_id);
      ownerEmail = ownerData?.user?.email || null;
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
        <div style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #3b82f6; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">予約${type === 'cancel' ? 'キャンセル' : '完了'}のお知らせ</h1>
          </div>
          
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #333333; margin: 0 0 20px 0; line-height: 1.6;">
              ${customerName} 様<br><br>
              ${type === 'cancel' 
                ? 'ご予約がキャンセルされました。' 
                : 'ご予約ありがとうございます。<br>以下の内容で予約を承りました。'}
            </p>
            
            ${registeredEmail ? `
              <p style="font-size: 14px; color: #666666; margin: 0 0 16px 0;">
                ■ ご登録メール: ${registeredEmail}
              </p>
            ` : ''}
            
            <div style="background: #f8f9fa; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
              <p style="font-size: 16px; font-weight: bold; color: #333333; margin: 0 0 12px 0;">${menu.title}</p>
              ${menu.description ? `<p style="color: #666666; margin: 0 0 12px 0; font-size: 14px; white-space: pre-wrap;">${menu.description}</p>` : ''}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; width: 120px;">■ 日時</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px;">${startTime} 〜 ${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px;">■ 所要時間</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px;">${menu.duration_min}分</td>
              </tr>
              ${menu.contact_method ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; vertical-align: top;">■ コンタクト方法</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px; white-space: pre-wrap;">${menu.contact_method}</td>
              </tr>
              ` : ''}
              ${booking.guest_comment ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; vertical-align: top;">■ コメント</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px; white-space: pre-wrap;">${booking.guest_comment}</td>
              </tr>
              ` : ''}
            </table>
            
            ${type !== 'cancel' && cancelUrl ? `
              <div style="background: #fff5f5; border: 1px solid #fed7d7; padding: 16px; margin: 20px 0;">
                <p style="font-size: 14px; color: #c53030; margin: 0 0 8px 0; font-weight: bold;">
                  ▼ 予約のキャンセル
                </p>
                <p style="font-size: 13px; color: #742a2a; margin: 0 0 8px 0;">
                  ご都合が悪くなった場合は、以下のリンクからキャンセルできます。
                </p>
                <p style="font-size: 12px; margin: 0; word-break: break-all;">
                  <a href="${cancelUrl}" style="color: #c53030;">${cancelUrl}</a>
                </p>
              </div>
            ` : ''}
            
            <p style="font-size: 13px; color: #666666; margin: 20px 0 0 0;">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
          </div>
          
          <div style="background: #333333; padding: 20px; text-align: center;">
            <p style="color: #999999; font-size: 11px; margin: 0 0 8px 0;">このメールは予約メーカーから自動送信されています</p>
            <p style="color: #666666; font-size: 10px; margin: 8px 0;">―――</p>
            <p style="color: #999999; font-size: 10px; margin: 4px 0;">集客メーカー <a href="https://makers.tokyo/" style="color: #60a5fa;">https://makers.tokyo/</a></p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: customerEmail,
          subject: `【予約${type === 'cancel' ? 'キャンセル' : '完了'}】${menu.title}`,
          html: customerHtml,
        })
      );
    }

    // 管理者へのメール
    if (ownerEmail) {
      const ownerHtml = `
        <div style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #10b981; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">新規予約${type === 'cancel' ? 'キャンセル' : ''}のお知らせ</h1>
          </div>
          
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #333333; margin: 0 0 20px 0; line-height: 1.6;">
              ${type === 'cancel' ? '以下の予約がキャンセルされました。' : '新しい予約が入りました。'}
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
              <p style="font-size: 16px; font-weight: bold; color: #333333; margin: 0 0 8px 0;">${menu.title}</p>
              ${menu.description ? `<p style="color: #666666; margin: 0; font-size: 14px; white-space: pre-wrap;">${menu.description}</p>` : ''}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; width: 120px;">■ 予約者</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px; font-weight: bold;">${customerName || '(名前なし)'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px;">■ メール</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px;">${customerEmail || '(メールなし)'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px;">■ 日時</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px;">${startTime} 〜 ${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px;">■ 所要時間</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px;">${menu.duration_min}分</td>
              </tr>
              ${menu.contact_method ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; vertical-align: top;">■ コンタクト方法</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px; white-space: pre-wrap;">${menu.contact_method}</td>
              </tr>
              ` : ''}
              ${booking.guest_comment ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; vertical-align: top;">■ コメント</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #333333; font-size: 14px; white-space: pre-wrap;">${booking.guest_comment}</td>
              </tr>
              ` : ''}
            </table>
            
            ${type !== 'cancel' && cancelUrl ? `
              <div style="background: #fff5f5; border: 1px solid #fed7d7; padding: 16px; margin: 20px 0;">
                <p style="font-size: 14px; color: #c53030; margin: 0 0 8px 0; font-weight: bold;">
                  ▼ 予約のキャンセル（管理者用）
                </p>
                <p style="font-size: 13px; color: #742a2a; margin: 0 0 8px 0;">
                  この予約をキャンセルする場合は、以下のリンクを使用してください。
                </p>
                <p style="font-size: 12px; margin: 0; word-break: break-all;">
                  <a href="${cancelUrl}" style="color: #c53030;">${cancelUrl}</a>
                </p>
              </div>
            ` : ''}
          </div>
          
          <div style="background: #333333; padding: 20px; text-align: center;">
            <p style="color: #999999; font-size: 11px; margin: 0 0 8px 0;">このメールは予約メーカーから自動送信されています</p>
            <p style="color: #666666; font-size: 10px; margin: 8px 0;">―――</p>
            <p style="color: #999999; font-size: 10px; margin: 4px 0;">集客メーカー <a href="https://makers.tokyo/" style="color: #60a5fa;">https://makers.tokyo/</a></p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: ownerEmail,
          subject: `【新規予約${type === 'cancel' ? 'キャンセル' : ''}】${menu.title} - ${customerName || '(名前なし)'}様`,
          html: ownerHtml,
        })
      );
    }

    // メール送信実行
    if (emailPromises.length > 0) {
      const results = await Promise.allSettled(emailPromises);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`[Booking Email] Email ${index + 1} sent successfully`);
        } else {
          console.error(`[Booking Email] Email ${index + 1} failed:`, result.reason);
        }
      });
    } else {
      console.log('[Booking Email] No email addresses to send to');
    }
  } catch (error) {
    console.error('[Booking Email] Error sending notification:', error);
  }
}

/**
 * 日程調整の通知メールを直接送信
 * 参加者と作成者の両方に出欠表の状況をメールで通知する
 */
export async function sendScheduleAdjustmentNotificationEmail(
  responseId: string
): Promise<void> {
  try {
    // 環境変数チェック
    if (!process.env.RESEND_API_KEY) {
      console.error('[Schedule Adjustment Email] RESEND_API_KEY is not configured');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = getSupabaseServer();
    if (!supabase) {
      console.error('[Schedule Adjustment Email] Database not configured');
      return;
    }

    // 回答情報を取得
    const { data: response, error: responseError } = await supabase
      .from('schedule_adjustment_responses')
      .select(`
        *,
        menu:booking_menus(*)
      `)
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      console.error('[Schedule Adjustment Email] Response not found:', responseId);
      return;
    }

    const menu = response.menu;
    if (!menu || menu.type !== 'adjustment') {
      console.error('[Schedule Adjustment Email] Invalid menu type');
      return;
    }

    // 作成者のメールアドレスを取得
    let ownerEmail = menu.notification_email || null;
    if (!ownerEmail && menu.user_id) {
      const { data: ownerData } = await supabase.auth.admin.getUserById(menu.user_id);
      ownerEmail = ownerData?.user?.email || null;
    }

    // 出欠表データを取得
    const { data: slots } = await supabase
      .from('booking_slots')
      .select('*')
      .eq('menu_id', menu.id)
      .order('start_time', { ascending: true });

    const { data: allResponses } = await supabase
      .from('schedule_adjustment_responses')
      .select('*')
      .eq('menu_id', menu.id)
      .order('created_at', { ascending: true });

    // 最も参加者が多い日程を判定
    let bestSlotId: string | undefined;
    if (slots && slots.length > 0 && allResponses) {
      const slotCounts = slots.map(slot => {
        let availableCount = 0;
        allResponses.forEach(r => {
          const responses = r.responses as Record<string, string>;
          const status = responses[slot.id];
          if (status === 'yes' || status === 'maybe') {
            availableCount++;
          }
        });
        return { slotId: slot.id, count: availableCount };
      });

      const bestSlot = slotCounts.reduce((best, current) => 
        current.count > best.count ? current : best,
        slotCounts[0]
      );
      bestSlotId = bestSlot?.slotId;
    }

    // 日時フォーマット（日本時間）
    const formatDateJP = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        timeZone: 'Asia/Tokyo',
      });
    };

    const formatTimeJP = (dateStr: string) => {
      return new Date(dateStr).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo',
      });
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makers.tokyo';

    // 共通フッターHTML
    const footerHtml = `
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 12px 0;">
            このメールは日程調整システムから自動送信されています。
          </p>
          <div style="border-top: 1px solid #374151; padding-top: 16px; margin-top: 8px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
              集客に役立つツールが無料で使えるポータルサイト<br>
              <a href="https://makers.tokyo/tools" style="color: #60a5fa;">https://makers.tokyo/tools</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
              開発支援のお願い<br>
              <a href="https://makers.tokyo/donation" style="color: #60a5fa;">https://makers.tokyo/donation</a>
            </p>
            <p style="color: #6b7280; font-size: 11px; margin: 12px 0 0 0;">
              &copy;2026 集客メーカー<br>
              <a href="https://makers.tokyo/" style="color: #60a5fa;">https://makers.tokyo/</a>
            </p>
          </div>
        </div>
    `;

    // 出欠表HTML（共通部分）
    const attendanceTableHtml = slots && slots.length > 0 ? `
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; overflow-x: auto;">
              <h3 style="color: #1f2937; font-size: 16px; margin-top: 0; margin-bottom: 15px;">出欠表</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb; background: #f9fafb;">
                    <th style="text-align: left; padding: 10px; font-weight: bold; color: #374151;">参加者</th>
                    ${slots.map(slot => `
                      <th style="text-align: center; padding: 10px; font-weight: bold; color: #374151; border-left: 1px solid #e5e7eb; ${
                        bestSlotId === slot.id ? 'background: #dcfce7;' : ''
                      }">
                        <div>${formatDateJP(slot.start_time)}</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                          ${formatTimeJP(slot.start_time)} - ${formatTimeJP(slot.end_time)}
                        </div>
                        ${bestSlotId === slot.id ? '<div style="color: #16a34a; font-weight: bold; margin-top: 4px;">★ 候補</div>' : ''}
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${allResponses ? allResponses.map((participant) => {
                    const participantResponses = participant.responses as Record<string, string>;
                    return `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 10px; font-weight: 500; color: #1f2937;">
                        ${participant.participant_name}
                      </td>
                      ${slots.map(slot => {
                        const status = participantResponses[slot.id];
                        let icon = '-';
                        let color = '#9ca3af';
                        if (status === 'yes') { icon = '○'; color = '#16a34a'; }
                        else if (status === 'no') { icon = '×'; color = '#dc2626'; }
                        else if (status === 'maybe') { icon = '△'; color = '#ca8a04'; }
                        return `
                          <td style="text-align: center; padding: 10px; border-left: 1px solid #e5e7eb; color: ${color}; font-size: 18px; font-weight: bold;">
                            ${icon}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;}).join('') : ''}
                </tbody>
              </table>
            </div>
          ` : '';

    const emailPromises = [];

    // 参加者へのメール（メールアドレスがある場合のみ）
    if (response.participant_email) {
      const participantEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">日程調整結果のお知らせ</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">
            ${response.participant_name}様<br><br>
            以下の日程調整に出欠を登録いただき、ありがとうございます。<br>
            現在の出欠状況をお知らせします。
          </p>
          
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">${menu.title}</h2>
            ${menu.description ? `<p style="color: #6b7280; margin: 10px 0;">${menu.description}</p>` : ''}
          </div>

          ${attendanceTableHtml}

          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            出欠状況を変更したい場合は、再度日程調整ページにアクセスしてください。<br>
            調整結果のURL: <a href="${baseUrl}/booking/${menu.id}" style="color: #6366f1;">${baseUrl}/booking/${menu.id}</a>
          </p>
        </div>
        
        ${footerHtml}
      </div>
    `;

      console.log('[Schedule Adjustment Email] Sending email to participant:', response.participant_email);
      emailPromises.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: response.participant_email,
          subject: `【日程調整結果】${menu.title}`,
          html: participantEmailHtml,
        })
      );
    }

    // 作成者へのメール
    if (ownerEmail) {
      const ownerEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">日程調整に新しい回答がありました</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">
            「${menu.title}」に新しい回答が登録されました。
          </p>
          
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; font-size: 16px; margin-top: 0;">回答者情報</h3>
            <p style="color: #374151; margin: 8px 0;"><strong>名前:</strong> ${response.participant_name}</p>
            ${response.participant_email ? `<p style="color: #374151; margin: 8px 0;"><strong>メール:</strong> ${response.participant_email}</p>` : ''}
          </div>

          ${attendanceTableHtml}

          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            日程調整ページで詳細を確認できます。<br>
            <a href="${baseUrl}/booking/${menu.id}" style="color: #6366f1;">${baseUrl}/booking/${menu.id}</a>
          </p>
        </div>
        
        ${footerHtml}
      </div>
    `;

      console.log('[Schedule Adjustment Email] Sending email to owner:', ownerEmail);
      emailPromises.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: ownerEmail,
          subject: `【日程調整】${response.participant_name}さんが回答しました - ${menu.title}`,
          html: ownerEmailHtml,
        })
      );
    }

    if (emailPromises.length > 0) {
      const results = await Promise.all(emailPromises);
      console.log('[Schedule Adjustment Email] Emails sent successfully:', results);
    } else {
      console.log('[Schedule Adjustment Email] No email addresses to send to');
    }
  } catch (error) {
    console.error('[Schedule Adjustment Email] Error sending notification:', error);
  }
}

// ===========================================
// 予約メニュー管理
// ===========================================

/**
 * 予約メニューを新規作成
 * @param userId ユーザーID（オプション、非ログインユーザーの場合はnull）
 */
export async function createBookingMenu(
  userId: string | null,
  input: CreateBookingMenuInput
): Promise<BookingResponse<BookingMenu>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  if (!input.title?.trim()) {
    return { success: false, error: 'Title is required', code: 'INVALID_INPUT' };
  }

  const { data, error } = await supabase
    .from('booking_menus')
    .insert({
      user_id: userId || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      contact_method: input.contact_method?.trim() || null,
      duration_min: input.duration_min ?? DEFAULT_DURATION_MIN,
      type: input.type ?? 'reservation',
      is_active: input.is_active ?? true,
      notification_email: input.notification_email?.trim() || null,
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
 * Service Role Keyを使用している場合でも、user_idでフィルタリングして自分のメニューのみ取得
 */
export async function getBookingMenus(userId: string): Promise<BookingMenu[]> {
  const supabase = getSupabaseServer();
  if (!supabase || !userId) return [];

  // ユーザーIDでフィルタリングして自分のメニューのみ取得
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
 * 全ての予約メニュー一覧を取得（管理者用）
 */
export async function getAllBookingMenus(): Promise<BookingMenu[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('booking_menus')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Booking] Get all menus error:', error);
    return [];
  }

  return data || [];
}

/**
 * 予約メニューを複製
 */
export async function duplicateBookingMenu(
  menuId: string,
  userId: string
): Promise<BookingResponse<BookingMenu>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // 元のメニューを取得
  const originalMenu = await getBookingMenu(menuId);
  if (!originalMenu) {
    return { success: false, error: 'Menu not found', code: 'MENU_NOT_FOUND' };
  }

  // 新しいメニューを作成
  const { data: newMenu, error: menuError } = await supabase
    .from('booking_menus')
    .insert({
      user_id: userId,
      title: `${originalMenu.title} のコピー`,
      description: originalMenu.description,
      contact_method: originalMenu.contact_method,
      duration_min: originalMenu.duration_min,
      type: originalMenu.type,
      is_active: false, // 複製時は非公開
      notification_email: originalMenu.notification_email,
    })
    .select()
    .single();

  if (menuError || !newMenu) {
    console.error('[Booking] Duplicate menu error:', menuError);
    return { success: false, error: menuError?.message || 'Failed to create menu', code: 'UNKNOWN_ERROR' };
  }

  // 元のスロットを取得
  const { data: originalSlots, error: slotsError } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('menu_id', menuId);

  if (slotsError) {
    console.error('[Booking] Get slots error:', slotsError);
    // メニューは作成されたが、スロットの複製に失敗
    return { success: true, data: newMenu };
  }

  // スロットを複製（存在する場合）
  if (originalSlots && originalSlots.length > 0) {
    const newSlots = originalSlots.map((slot) => ({
      menu_id: newMenu.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_capacity: slot.max_capacity,
    }));

    const { error: insertSlotsError } = await supabase
      .from('booking_slots')
      .insert(newSlots);

    if (insertSlotsError) {
      console.error('[Booking] Duplicate slots error:', insertSlotsError);
      // スロットの複製に失敗しても、メニューは作成されている
    }
  }

  return { success: true, data: newMenu };
}

/**
 * 予約メニューごとの予約数を取得
 */
export async function getBookingCountByMenuId(menuId: string): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;

  // 該当メニューのスロットを取得
  const { data: slots, error: slotsError } = await supabase
    .from('booking_slots')
    .select('id')
    .eq('menu_id', menuId);

  if (slotsError || !slots || slots.length === 0) return 0;

  const slotIds = slots.map((s) => s.id);

  // 予約数を取得（キャンセル以外）
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .in('slot_id', slotIds)
    .neq('status', 'cancelled');

  if (error) {
    console.error('[Booking] Get booking count error:', error);
    return 0;
  }

  return count || 0;
}

/**
 * 複数メニューの予約数を一括取得
 */
export async function getBookingCountsForMenus(menuIds: string[]): Promise<Record<string, number>> {
  const supabase = getSupabaseServer();
  if (!supabase || menuIds.length === 0) return {};

  // 全メニューのスロットを一括取得
  const { data: slots, error: slotsError } = await supabase
    .from('booking_slots')
    .select('id, menu_id')
    .in('menu_id', menuIds);

  if (slotsError || !slots || slots.length === 0) {
    // スロットがない場合は全メニュー0件
    return menuIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
  }

  const slotIds = slots.map((s) => s.id);
  const slotMenuMap: Record<string, string> = {};
  slots.forEach((s) => {
    slotMenuMap[s.id] = s.menu_id;
  });

  // 全予約を一括取得（キャンセル以外）
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('slot_id')
    .in('slot_id', slotIds)
    .neq('status', 'cancelled');

  if (bookingsError) {
    console.error('[Booking] Get booking counts error:', bookingsError);
    return menuIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
  }

  // メニューごとにカウント
  const counts: Record<string, number> = menuIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
  (bookings || []).forEach((booking) => {
    const menuId = slotMenuMap[booking.slot_id];
    if (menuId && counts[menuId] !== undefined) {
      counts[menuId]++;
    }
  });

  return counts;
}

/**
 * 編集キーで予約メニューを取得
 */
export async function getBookingMenuByEditKey(editKey: string): Promise<BookingMenu | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('booking_menus')
    .select('*')
    .eq('edit_key', editKey)
    .single();

  if (error) {
    console.error('[Booking] Get menu by edit key error:', error);
    return null;
  }

  return data;
}

/**
 * 予約メニューを更新
 * @param menuId メニューID
 * @param userId ユーザーID（オプション）
 * @param input 更新内容
 * @param editKey 編集キー（オプション、非ログインユーザーの場合）
 */
export async function updateBookingMenu(
  menuId: string,
  userId: string | null,
  input: UpdateBookingMenuInput,
  editKey?: string
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

  // 認証チェック: ユーザーIDまたは編集キーで認証
  const isAuthorized = 
    (userId && existingMenu.user_id === userId) ||
    (editKey && existingMenu.edit_key === editKey);

  if (!isAuthorized) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.description !== undefined) updateData.description = input.description?.trim() || null;
  if (input.contact_method !== undefined) updateData.contact_method = input.contact_method?.trim() || null;
  if (input.duration_min !== undefined) updateData.duration_min = input.duration_min;
  if (input.type !== undefined) updateData.type = input.type;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;
  if (input.notification_email !== undefined) updateData.notification_email = input.notification_email?.trim() || null;

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
 * @param menuId メニューID
 * @param userId ユーザーID（オプション）
 * @param editKey 編集キー（オプション、非ログインユーザーの場合）
 */
export async function deleteBookingMenu(
  menuId: string,
  userId: string | null,
  editKey?: string,
  isAdmin?: boolean
): Promise<BookingResponse<{ deleted: boolean }>> {
  console.log('[Booking] deleteBookingMenu called:', { menuId, userId, isAdmin });

  const supabase = getSupabaseServer();
  if (!supabase) {
    console.error('[Booking] Failed to get Supabase server client');
    return { success: false, error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED' };
  }

  // 所有者確認
  const existingMenu = await getBookingMenu(menuId);
  console.log('[Booking] Existing menu:', { existingMenu });

  if (!existingMenu) {
    return { success: false, error: 'Menu not found', code: 'MENU_NOT_FOUND' };
  }

  // 認証チェック: 管理者、ユーザーID、または編集キーで認証
  const isAuthorized = 
    isAdmin ||
    (userId && existingMenu.user_id === userId) ||
    (editKey && existingMenu.edit_key === editKey);

  console.log('[Booking] Authorization check:', { 
    isAdmin, 
    userId, 
    menuUserId: existingMenu.user_id, 
    isAuthorized 
  });

  if (!isAuthorized) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const { error } = await supabase
    .from('booking_menus')
    .delete()
    .eq('id', menuId);

  console.log('[Booking] Delete result:', { error });

  if (error) {
    console.error('[Booking] Delete menu error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  console.log('[Booking] Delete successful:', menuId);
  return { success: true, data: { deleted: true } };
}

// ===========================================
// 予約枠管理
// ===========================================

/**
 * 予約枠を一括登録
 * @param menuId メニューID
 * @param userId ユーザーID（オプション）
 * @param slots 予約枠リスト
 * @param editKey 編集キー（オプション、非ログインユーザーの場合）
 */
export async function createBookingSlots(
  menuId: string,
  userId: string | null,
  slots: CreateBookingSlotInput[],
  editKey?: string
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

  // 認証チェック: ユーザーIDまたは編集キーで認証
  const isAuthorized = 
    (userId && menu.user_id === userId) ||
    (editKey && menu.edit_key === editKey);

  if (!isAuthorized) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  if (!slots || slots.length === 0) {
    return { success: false, error: 'At least one slot is required', code: 'INVALID_INPUT' };
  }

  // 入力バリデーション
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
    includePastSlots?: boolean; // 過去の枠も含めるか（デフォルト: false、編集画面用）
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

  // 日付フィルター（includePastSlotsがtrueの場合はフィルターしない）
  if (!options?.includePastSlots) {
    const fromDate = options?.fromDate || new Date().toISOString();
    query = query.gte('start_time', fromDate);
  }

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
 * @param slotId 予約枠ID
 * @param userId ユーザーID（オプション）
 * @param editKey 編集キー（オプション、非ログインユーザーの場合）
 */
export async function deleteBookingSlot(
  slotId: string,
  userId: string | null,
  editKey?: string
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

  // 認証チェック: ユーザーIDまたは編集キーで認証
  const isAuthorized = 
    (userId && slot.menu?.user_id === userId) ||
    (editKey && slot.menu?.edit_key === editKey);

  if (!isAuthorized) {
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

/**
 * 予約枠を更新（最大予約数の変更など）
 * @param slotId 予約枠ID
 * @param userId ユーザーID（オプション）
 * @param updateData 更新データ
 * @param editKey 編集キー（オプション、非ログインユーザーの場合）
 */
export async function updateBookingSlot(
  slotId: string,
  userId: string | null,
  updateData: { max_capacity?: number },
  editKey?: string
): Promise<BookingResponse<BookingSlot>> {
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

  // 認証チェック: ユーザーIDまたは編集キーで認証
  const isAuthorized = 
    (userId && slot.menu?.user_id === userId) ||
    (editKey && slot.menu?.edit_key === editKey);

  if (!isAuthorized) {
    return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  // max_capacityは現在の予約数以上でなければならない
  if (updateData.max_capacity !== undefined) {
    // 現在の予約数を取得
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('slot_id', slotId)
      .eq('status', 'confirmed');

    if (countError) {
      console.error('[Booking] Count bookings error:', countError);
      return { success: false, error: countError.message, code: 'UNKNOWN_ERROR' };
    }

    const currentBookings = count || 0;
    if (updateData.max_capacity < currentBookings) {
      return { 
        success: false, 
        error: `現在${currentBookings}件の予約があるため、最大予約数を${currentBookings}未満に設定できません`, 
        code: 'INVALID_CAPACITY' 
      };
    }
  }

  const { data: updatedSlot, error } = await supabase
    .from('booking_slots')
    .update(updateData)
    .eq('id', slotId)
    .select()
    .single();

  if (error) {
    console.error('[Booking] Update slot error:', error);
    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { success: true, data: updatedSlot };
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
  
  // キャンセルトークンを生成（ランダムな文字列）
  const cancelToken = crypto.randomUUID();
  
  const insertData: Record<string, unknown> = {
    slot_id,
    status: 'ok',
    cancel_token: cancelToken,
    // 名前は常に保存（ログインユーザーでもゲストでも）
    guest_name: guestInput.guest_name?.trim() || null,
    guest_comment: guestInput.guest_comment?.trim() || null,
  };

  if (customerId) {
    insertData.customer_id = customerId;
  } else {
    insertData.guest_email = guestInput.guest_email?.trim();
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

  // 予約完了メール送信（直接Resendを呼び出す）
  await sendBookingNotificationEmail(data.id, 'confirm');

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

  // メール送信（participant_emailがある場合）- 直接関数呼び出し
  if (input.participant_email && data) {
    await sendScheduleAdjustmentNotificationEmail(data.id);
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

/**
 * ユーザーの全予約を一括取得（ダッシュボード用・高速化）
 * N+1問題を回避するため、1クエリで全データを取得
 */
export async function getAllBookingsForUser(
  userId: string
): Promise<BookingWithDetails[]> {
  const supabase = getSupabaseServer();
  if (!supabase || !userId) return [];

  // ユーザーが所有する予約タイプのメニューIDを取得
  const { data: menus, error: menusError } = await supabase
    .from('booking_menus')
    .select('id, title, description, type, duration_min, is_active, user_id, created_at, updated_at')
    .eq('user_id', userId)
    .eq('type', 'reservation');

  if (menusError || !menus || menus.length === 0) return [];

  const menuIds = menus.map(m => m.id);
  const menuMap: Record<string, BookingMenu> = {};
  menus.forEach(m => {
    menuMap[m.id] = m as BookingMenu;
  });

  // 該当メニューの全スロットIDを取得
  const { data: slots, error: slotsError } = await supabase
    .from('booking_slots')
    .select('id, menu_id')
    .in('menu_id', menuIds);

  if (slotsError || !slots || slots.length === 0) return [];

  const slotIds = slots.map(s => s.id);
  const slotMenuMap: Record<string, string> = {};
  slots.forEach(s => {
    slotMenuMap[s.id] = s.menu_id;
  });

  // 全予約を一括取得
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      slot:booking_slots(*)
    `)
    .in('slot_id', slotIds)
    .order('created_at', { ascending: false });

  if (bookingsError) {
    console.error('[Booking] Get all bookings for user error:', bookingsError);
    return [];
  }

  // メニュー情報を付与
  return (bookings || []).map((booking) => {
    const menuId = slotMenuMap[booking.slot_id];
    return {
      ...booking,
      menu: menuMap[menuId] || null,
    };
  });
}

/**
 * ユーザーの全出欠表データを一括取得（ダッシュボード用・高速化）
 * N+1問題を回避するため、効率的にデータを取得
 */
export async function getAllAdjustmentsForUser(
  userId: string
): Promise<Record<string, AttendanceTableData>> {
  const supabase = getSupabaseServer();
  if (!supabase || !userId) return {};

  // ユーザーが所有する日程調整タイプのメニューを取得
  const { data: menus, error: menusError } = await supabase
    .from('booking_menus')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'adjustment');

  if (menusError || !menus || menus.length === 0) return {};

  const menuIds = menus.map(m => m.id);

  // 全スロットを一括取得
  const { data: allSlots, error: slotsError } = await supabase
    .from('booking_slots')
    .select('*')
    .in('menu_id', menuIds)
    .order('start_time', { ascending: true });

  if (slotsError) {
    console.error('[Booking] Get all slots error:', slotsError);
    return {};
  }

  // 全回答を一括取得
  const { data: allResponses, error: responsesError } = await supabase
    .from('schedule_adjustment_responses')
    .select('*')
    .in('menu_id', menuIds)
    .order('created_at', { ascending: true });

  if (responsesError) {
    console.error('[Booking] Get all responses error:', responsesError);
    return {};
  }

  // メニューごとにデータを整理
  const result: Record<string, AttendanceTableData> = {};

  for (const menu of menus) {
    const menuSlots = (allSlots || []).filter(s => s.menu_id === menu.id);
    const menuResponses = (allResponses || []).filter(r => r.menu_id === menu.id);

    if (menuSlots.length === 0) {
      result[menu.id] = { slots: [], participants: [] };
      continue;
    }

    // 各日程候補の集計
    const slotSummaries: SlotAttendanceSummary[] = menuSlots.map((slot) => {
      let yesCount = 0;
      let noCount = 0;
      let maybeCount = 0;

      menuResponses.forEach((response) => {
        const status = response.responses?.[slot.id] as AttendanceStatus | undefined;
        if (status === 'yes') yesCount++;
        else if (status === 'no') noCount++;
        else if (status === 'maybe') maybeCount++;
      });

      return {
        slot_id: slot.id,
        slot,
        yes_count: yesCount,
        no_count: noCount,
        maybe_count: maybeCount,
        available_count: yesCount + maybeCount,
        total_responses: menuResponses.length,
      };
    });

    // 最適な日程を判定
    let bestSlotId: string | undefined;
    let maxYes = 0;
    slotSummaries.forEach((summary) => {
      if (summary.yes_count > maxYes) {
        maxYes = summary.yes_count;
        bestSlotId = summary.slot_id;
      }
    });

    result[menu.id] = {
      slots: slotSummaries,
      participants: menuResponses as ScheduleAdjustmentResponse[],
      best_slot_id: bestSlotId,
    };
  }

  return result;
}

// ===========================================
// スプレッドシート連携設定
// ===========================================

import {
  BookingSpreadsheetSettings,
  CreateSpreadsheetSettingsInput,
  UpdateSpreadsheetSettingsInput,
} from '@/types/booking';

/**
 * スプレッドシート連携設定を取得
 */
export async function getSpreadsheetSettings(
  userId: string,
  menuId: string
): Promise<BookingSpreadsheetSettings | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('booking_spreadsheet_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('menu_id', menuId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Not found error is ok
      console.error('[Spreadsheet] Get settings error:', error);
    }
    return null;
  }

  return data as BookingSpreadsheetSettings;
}

/**
 * スプレッドシート連携設定を作成
 */
export async function createSpreadsheetSettings(
  userId: string,
  input: CreateSpreadsheetSettingsInput
): Promise<BookingResponse<BookingSpreadsheetSettings>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  const { data, error } = await supabase
    .from('booking_spreadsheet_settings')
    .insert({
      user_id: userId,
      menu_id: input.menu_id,
      spreadsheet_id: input.spreadsheet_id,
      sheet_name: input.sheet_name || 'Sheet1',
      is_enabled: input.is_enabled ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('[Spreadsheet] Create settings error:', error);
    return { success: false, error: '設定の保存に失敗しました' };
  }

  return { success: true, data: data as BookingSpreadsheetSettings };
}

/**
 * スプレッドシート連携設定を更新
 */
export async function updateSpreadsheetSettings(
  userId: string,
  menuId: string,
  input: UpdateSpreadsheetSettingsInput
): Promise<BookingResponse<BookingSpreadsheetSettings>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  const { data, error } = await supabase
    .from('booking_spreadsheet_settings')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('menu_id', menuId)
    .select()
    .single();

  if (error) {
    console.error('[Spreadsheet] Update settings error:', error);
    return { success: false, error: '設定の更新に失敗しました' };
  }

  return { success: true, data: data as BookingSpreadsheetSettings };
}

/**
 * スプレッドシート連携設定を削除
 */
export async function deleteSpreadsheetSettings(
  userId: string,
  menuId: string
): Promise<BookingResponse<null>> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'データベースが設定されていません' };
  }

  const { error } = await supabase
    .from('booking_spreadsheet_settings')
    .delete()
    .eq('user_id', userId)
    .eq('menu_id', menuId);

  if (error) {
    console.error('[Spreadsheet] Delete settings error:', error);
    return { success: false, error: '設定の削除に失敗しました' };
  }

  return { success: true, data: null };
}

/**
 * スプレッドシートIDをURLから抽出
 * 例: https://docs.google.com/spreadsheets/d/xxxxx/edit -> xxxxx
 */
export async function extractSpreadsheetId(url: string): Promise<string | null> {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

