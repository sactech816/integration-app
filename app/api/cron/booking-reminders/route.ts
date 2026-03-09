import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/security/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: 予約リマインダーメール自動配信 Cron ジョブ
 * Vercel Cron で毎日朝9時（JST = UTC 0:00）に実行
 * - 前日リマインド: 予約スロットが明日（JST）の予約
 * - 当日リマインド: 予約スロットが今日（JST）の予約
 */
export async function GET(request: NextRequest) {
  try {
    // Cron認証（Vercel Cron Secret）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // JST基準で今日・明日を計算
    const nowUtc = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const nowJst = new Date(nowUtc.getTime() + jstOffset);

    const todayJst = new Date(nowJst.getFullYear(), nowJst.getMonth(), nowJst.getDate());
    const tomorrowJst = new Date(todayJst.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrowJst = new Date(tomorrowJst.getTime() + 24 * 60 * 60 * 1000);

    // UTC に変換（DB クエリ用）
    const todayStartUtc = new Date(todayJst.getTime() - jstOffset).toISOString();
    const tomorrowStartUtc = new Date(tomorrowJst.getTime() - jstOffset).toISOString();
    const dayAfterTomorrowStartUtc = new Date(dayAfterTomorrowJst.getTime() - jstOffset).toISOString();

    let totalSent = 0;
    const errors: string[] = [];

    // --- 前日リマインド（スロットが明日の予約）---
    totalSent += await processReminders(
      supabase,
      '1day_before',
      'reminder_1day_enabled',
      tomorrowStartUtc,
      dayAfterTomorrowStartUtc,
      errors
    );

    // --- 当日リマインド（スロットが今日の予約）---
    totalSent += await processReminders(
      supabase,
      'same_day',
      'reminder_same_day_enabled',
      todayStartUtc,
      tomorrowStartUtc,
      errors
    );

    return NextResponse.json({
      success: true,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Booking Reminders] Fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 指定期間のスロットに紐づく予約にリマインダーを送信
 */
async function processReminders(
  supabase: any,
  reminderType: '1day_before' | 'same_day',
  enabledColumn: string,
  rangeStart: string,
  rangeEnd: string,
  errors: string[]
): Promise<number> {
  let sent = 0;

  try {
    // リマインダーが有効なメニューを取得
    const { data: menus } = await supabase
      .from('booking_menus')
      .select('*')
      .eq(enabledColumn, true)
      .eq('type', 'reservation');

    if (!menus || menus.length === 0) return 0;

    for (const menu of menus) {
      try {
        // 該当期間のスロットを取得
        const { data: slots } = await supabase
          .from('booking_slots')
          .select('*')
          .eq('menu_id', menu.id)
          .gte('start_time', rangeStart)
          .lt('start_time', rangeEnd);

        if (!slots || slots.length === 0) continue;

        const slotIds = slots.map((s: any) => s.id);

        // これらのスロットに紐づくアクティブな予約を取得
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .in('slot_id', slotIds)
          .eq('status', 'ok');

        if (!bookings || bookings.length === 0) continue;

        // 送信済みを取得して除外
        const bookingIds = bookings.map((b: any) => b.id);
        const { data: alreadySent } = await supabase
          .from('booking_reminders_sent')
          .select('booking_id')
          .eq('menu_id', menu.id)
          .eq('reminder_type', reminderType)
          .in('booking_id', bookingIds);

        const sentBookingIds = new Set((alreadySent || []).map((r: any) => r.booking_id));

        // スロットのマップ作成（slot_id -> slot）
        const slotMap = new Map(slots.map((s: any) => [s.id, s]));

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@makers.tokyo';
        const footerName = menu.email_footer_name || '集客メーカー';

        for (const booking of bookings) {
          if (sentBookingIds.has(booking.id)) continue;

          // メールアドレスの取得
          let email = booking.guest_email;
          let name = booking.guest_name || '';

          // ログインユーザーの場合
          if (!email && booking.customer_id) {
            const { data: userData } = await supabase.auth.admin.getUserById(booking.customer_id);
            email = userData?.user?.email;
          }

          if (!email) continue;

          const slot: any = slotMap.get(booking.slot_id);
          if (!slot) continue;

          const slotDateJst = formatDateJst(new Date(slot.start_time));
          const slotTimeJst = formatTimeJst(new Date(slot.start_time));

          try {
            // 件名・本文のテンプレート変数を置換
            const subject = replaceTemplateVars(
              menu.reminder_email_subject || getDefaultSubject(reminderType),
              { name, email, title: menu.title, date: slotDateJst, time: slotTimeJst }
            );

            const bodyText = replaceTemplateVars(
              menu.reminder_email_body || getDefaultBody(reminderType, menu.title, slotDateJst, slotTimeJst),
              { name, email, title: menu.title, date: slotDateJst, time: slotTimeJst }
            );

            const html = buildReminderEmailHtml(subject, bodyText, footerName, escapeHtml(name));

            await resend.emails.send({
              from: `${footerName} <${fromEmail}>`,
              to: [email],
              subject,
              html,
            });

            // 送信済み記録
            await supabase.from('booking_reminders_sent').insert({
              menu_id: menu.id,
              booking_id: booking.id,
              reminder_type: reminderType,
            });

            sent++;
          } catch (err) {
            console.error(`[Booking Reminders] Error sending to ${email}:`, err);
            errors.push(`Menu ${menu.id}, Booking ${booking.id}: ${err}`);
          }
        }
      } catch (err) {
        console.error(`[Booking Reminders] Error processing menu ${menu.id}:`, err);
        errors.push(`Menu ${menu.id}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`[Booking Reminders] Error in processReminders:`, err);
    errors.push(`processReminders(${reminderType}): ${err}`);
  }

  return sent;
}

// ===========================================
// ヘルパー関数
// ===========================================

function replaceTemplateVars(
  text: string,
  vars: { name: string; email: string; title: string; date: string; time: string }
): string {
  return text
    .replace(/\{name\}/g, vars.name)
    .replace(/\{email\}/g, vars.email)
    .replace(/\{title\}/g, vars.title)
    .replace(/\{date\}/g, vars.date)
    .replace(/\{time\}/g, vars.time);
}

function formatDateJst(date: Date): string {
  const jstOffset = 9 * 60 * 60 * 1000;
  const jst = new Date(date.getTime() + jstOffset);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, '0');
  const d = String(jst.getDate()).padStart(2, '0');
  return `${y}年${m}月${d}日`;
}

function formatTimeJst(date: Date): string {
  const jstOffset = 9 * 60 * 60 * 1000;
  const jst = new Date(date.getTime() + jstOffset);
  const h = String(jst.getHours()).padStart(2, '0');
  const min = String(jst.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

function getDefaultSubject(type: '1day_before' | 'same_day'): string {
  return type === '1day_before'
    ? '【リマインド】明日のご予約のお知らせ'
    : '【リマインド】本日のご予約のお知らせ';
}

function getDefaultBody(type: '1day_before' | 'same_day', title: string, date: string, time: string): string {
  const timing = type === '1day_before' ? '明日' : '本日';
  return `{name} 様\n\n「{title}」のご予約は${timing}です。\n\n日時: {date} {time}\n\nご来場をお待ちしております。`;
}

function buildReminderEmailHtml(subject: string, bodyText: string, footerName: string, escapedName: string): string {
  const bodyHtml = escapeHtml(bodyText).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
    <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">${escapeHtml(subject)}</h2>
  </div>
  <div style="background: #f8fafc; border-radius: 0 0 12px 12px; padding: 32px; margin-bottom: 24px; border: 1px solid #e2e8f0; border-top: none;">
    <div style="font-size: 15px; line-height: 1.8; color: #374151;">
      ${bodyHtml}
    </div>
  </div>
  <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
    ${escapeHtml(footerName).replace(/\n/g, '<br>')}
  </div>
</body>
</html>`;
}
