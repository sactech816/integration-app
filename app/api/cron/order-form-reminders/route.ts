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
 * GET: リマインダーメール自動配信 Cron ジョブ
 * Vercel Cron で毎日朝9時（JST = UTC 0:00）に実行
 * - 前日リマインド: event_date が明日（JST）のフォーム
 * - 当日リマインド: event_date が今日（JST）のフォーム
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

    // --- 前日リマインド（event_date が明日のフォーム）---
    const { data: tomorrowForms } = await supabase
      .from('order_forms')
      .select('*')
      .eq('reminder_1day_enabled', true)
      .gte('event_date', tomorrowStartUtc)
      .lt('event_date', dayAfterTomorrowStartUtc);

    if (tomorrowForms && tomorrowForms.length > 0) {
      for (const form of tomorrowForms) {
        const sent = await sendReminders(supabase, form, '1day_before', errors);
        totalSent += sent;
      }
    }

    // --- 当日リマインド（event_date が今日のフォーム）---
    const { data: todayForms } = await supabase
      .from('order_forms')
      .select('*')
      .eq('reminder_same_day_enabled', true)
      .gte('event_date', todayStartUtc)
      .lt('event_date', tomorrowStartUtc);

    if (todayForms && todayForms.length > 0) {
      for (const form of todayForms) {
        const sent = await sendReminders(supabase, form, 'same_day', errors);
        totalSent += sent;
      }
    }

    return NextResponse.json({
      success: true,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Order Form Reminders] Fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 指定フォームの全申し込み者にリマインドメールを送信
 */
async function sendReminders(
  supabase: any,
  form: any,
  reminderType: '1day_before' | 'same_day',
  errors: string[]
): Promise<number> {
  let sent = 0;

  try {
    // このフォームの全申し込みを取得
    const { data: submissions } = await supabase
      .from('order_form_submissions')
      .select('*')
      .eq('form_id', form.id);

    if (!submissions || submissions.length === 0) return 0;

    // 送信済みを取得して除外
    const { data: alreadySent } = await supabase
      .from('order_form_reminders_sent')
      .select('submission_id')
      .eq('form_id', form.id)
      .eq('reminder_type', reminderType);

    const sentIds = new Set((alreadySent || []).map((r: any) => r.submission_id));

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@makers.tokyo';
    const footerName = form.email_footer_name || '集客メーカー';

    // イベント日時のフォーマット（JST表示）
    const eventDateJst = form.event_date ? formatDateJst(new Date(form.event_date)) : '';

    for (const submission of submissions) {
      if (sentIds.has(submission.id)) continue;

      const email = submission.email;
      const name = submission.name || '';
      if (!email) continue;

      try {
        // 件名・本文のテンプレート変数を置換
        const subject = replaceTemplateVars(
          form.reminder_email_subject || (reminderType === '1day_before' ? '【リマインド】明日開催のお知らせ' : '【リマインド】本日開催のお知らせ'),
          { name, email, form_title: form.title, event_date: eventDateJst }
        );

        const bodyText = replaceTemplateVars(
          form.reminder_email_body || getDefaultReminderBody(reminderType, form.title, eventDateJst),
          { name, email, form_title: form.title, event_date: eventDateJst }
        );

        const html = buildReminderEmailHtml(subject, bodyText, footerName, escapeHtml(name));

        await resend.emails.send({
          from: `${footerName} <${fromEmail}>`,
          to: [email],
          subject,
          html,
        });

        // 送信済み記録
        await supabase.from('order_form_reminders_sent').insert({
          form_id: form.id,
          submission_id: submission.id,
          reminder_type: reminderType,
        });

        sent++;
      } catch (err) {
        console.error(`[Order Form Reminders] Error sending to ${email}:`, err);
        errors.push(`Form ${form.id}, Submission ${submission.id}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`[Order Form Reminders] Error processing form ${form.id}:`, err);
    errors.push(`Form ${form.id}: ${err}`);
  }

  return sent;
}

/**
 * テンプレート変数を置換
 */
function replaceTemplateVars(
  text: string,
  vars: { name: string; email: string; form_title: string; event_date: string }
): string {
  return text
    .replace(/\{name\}/g, vars.name)
    .replace(/\{email\}/g, vars.email)
    .replace(/\{form_title\}/g, vars.form_title)
    .replace(/\{event_date\}/g, vars.event_date);
}

/**
 * JST で日時フォーマット
 */
function formatDateJst(date: Date): string {
  const jstOffset = 9 * 60 * 60 * 1000;
  const jst = new Date(date.getTime() + jstOffset);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, '0');
  const d = String(jst.getDate()).padStart(2, '0');
  const h = String(jst.getHours()).padStart(2, '0');
  const min = String(jst.getMinutes()).padStart(2, '0');
  return `${y}年${m}月${d}日 ${h}:${min}`;
}

/**
 * デフォルトのリマインダーメール本文
 */
function getDefaultReminderBody(type: '1day_before' | 'same_day', title: string, eventDate: string): string {
  if (type === '1day_before') {
    return `{name} 様\n\n「{form_title}」は明日開催です。\n\n開催日時: {event_date}\n\nご参加をお待ちしております。`;
  }
  return `{name} 様\n\n「{form_title}」は本日開催です。\n\n開催日時: {event_date}\n\nご参加をお待ちしております。`;
}

/**
 * リマインダーメールHTML生成
 */
function buildReminderEmailHtml(subject: string, bodyText: string, footerName: string, escapedName: string): string {
  const bodyHtml = escapeHtml(bodyText).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
    <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">${escapeHtml(subject)}</h2>
    <div style="font-size: 15px; line-height: 1.8; color: #374151;">
      ${bodyHtml}
    </div>
  </div>
  <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
    ${escapeHtml(footerName)}
  </div>
</body>
</html>`;
}
