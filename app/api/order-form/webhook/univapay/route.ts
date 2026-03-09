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

async function sendPaymentCompleteEmail(supabase: any, submissionId: string, amountPaid: number) {
  try {
    const { data: submission } = await supabase
      .from('order_form_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();
    if (!submission) return;

    const { data: form } = await supabase
      .from('order_forms')
      .select('*')
      .eq('id', submission.form_id)
      .single();
    if (!form || form.payment_email_enabled === false) return;

    if (!process.env.RESEND_API_KEY) return;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Makers Support <support@makers.tokyo>';
    const submitterName = submission.name || submission.email;
    const amount = amountPaid > 0 ? amountPaid : form.price || 0;
    const footerName = form.email_footer_name || '集客メーカー';

    const subject = (form.payment_email_subject || '決済が完了しました')
      .replace(/\{name\}/g, submitterName)
      .replace(/\{email\}/g, submission.email)
      .replace(/\{form_title\}/g, form.title)
      .replace(/\{amount\}/g, amount.toLocaleString());

    let bodyHtml: string;
    if (form.payment_email_body) {
      const customBody = escapeHtml(form.payment_email_body)
        .replace(/\{name\}/g, escapeHtml(submitterName))
        .replace(/\{email\}/g, escapeHtml(submission.email))
        .replace(/\{form_title\}/g, escapeHtml(form.title))
        .replace(/\{amount\}/g, amount.toLocaleString())
        .replace(/\n/g, '<br>');
      bodyHtml = `
        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
          <div style="background:linear-gradient(135deg,#059669,#14b8a6);padding:24px;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;font-size:20px;margin:0;">${escapeHtml(form.title)}</h1>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#374151;line-height:1.8;">${customBody}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">${escapeHtml(footerName)}</p>
        </div>`;
    } else {
      bodyHtml = `
        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
          <div style="background:linear-gradient(135deg,#059669,#14b8a6);padding:24px;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;font-size:20px;margin:0;">${escapeHtml(form.title)}</h1>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#374151;font-size:16px;font-weight:600;margin:0 0 8px;">決済が完了しました</p>
            <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">${escapeHtml(submitterName)} 様、決済が正常に完了しました。ありがとうございます。</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
              <tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:30%;">金額</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${amount.toLocaleString()}円</td></tr>
              <tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">ステータス</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#059669;font-size:14px;font-weight:600;">決済完了</td></tr>
            </table>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">${escapeHtml(footerName)}</p>
        </div>`;
    }

    await resend.emails.send({
      from: fromEmail,
      to: submission.email,
      subject,
      html: bodyHtml,
    });

    console.log('[Order Form UnivaPay Webhook] Payment complete email sent to:', submission.email);
  } catch (emailError) {
    console.error('[Order Form UnivaPay Webhook] Payment email error:', emailError);
  }
}

/**
 * POST: UnivaPay Webhook（申し込みフォーム決済完了処理）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const eventType = body.event || body.type;
    const metadata = body.metadata || body.data?.metadata || {};

    // order_form用かチェック
    if (metadata?.type !== 'order_form' || !metadata?.submissionId) {
      return NextResponse.json({ received: true });
    }

    if (eventType === 'charge.succeeded' || eventType === 'subscription.created') {
      const amountPaid = body.amount || body.data?.amount || 0;

      await supabase
        .from('order_form_submissions')
        .update({
          payment_status: 'paid',
          payment_provider: 'univapay',
          payment_reference: body.id || body.data?.id || '',
          amount_paid: amountPaid,
        })
        .eq('id', metadata.submissionId);

      console.log('[Order Form UnivaPay Webhook] Payment completed for submission:', metadata.submissionId);

      // 決済完了メール送信
      await sendPaymentCompleteEmail(supabase, metadata.submissionId, amountPaid);
    } else if (eventType === 'charge.failed') {
      await supabase
        .from('order_form_submissions')
        .update({ payment_status: 'failed' })
        .eq('id', metadata.submissionId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Order Form UnivaPay Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
