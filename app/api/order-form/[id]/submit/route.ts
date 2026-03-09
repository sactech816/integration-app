import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isValidEmail, escapeHtml } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: 申し込みフォーム送信
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { id } = await params;
    const { email, name, fieldsData } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // フォーム取得
    const { data: form } = await supabase
      .from('order_forms')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (!form) {
      return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 });
    }

    // payment_status判定
    const isFree = form.payment_type === 'free' || form.price === 0;
    const paymentStatus = isFree ? 'free' : 'pending';

    // submission作成
    const { data: submission, error } = await supabase
      .from('order_form_submissions')
      .insert({
        form_id: id,
        email,
        name: name || null,
        fields_data: fieldsData || {},
        payment_status: paymentStatus,
        amount_paid: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[Order Form Submit] Error:', error);
      return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 });
    }

    // メール送信（非同期、エラーでもフォーム送信は成功扱い）
    if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Makers Support <support@makers.tokyo>';
      const submitterName = name || email;

      // 1. 申し込み者への自動返信メール
      if (form.reply_email_enabled !== false) {
        try {
          const subject = (form.reply_email_subject || 'お申し込みありがとうございます')
            .replace(/\{name\}/g, submitterName)
            .replace(/\{email\}/g, email)
            .replace(/\{form_title\}/g, form.title);

          let bodyHtml: string;
          if (form.reply_email_body) {
            const customBody = escapeHtml(form.reply_email_body)
              .replace(/\{name\}/g, escapeHtml(submitterName))
              .replace(/\{email\}/g, escapeHtml(email))
              .replace(/\{form_title\}/g, escapeHtml(form.title))
              .replace(/\n/g, '<br>');
            bodyHtml = `
              <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                <div style="background:linear-gradient(135deg,#059669,#14b8a6);padding:24px;border-radius:12px 12px 0 0;">
                  <h1 style="color:#fff;font-size:20px;margin:0;">${escapeHtml(form.title)}</h1>
                </div>
                <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                  <p style="color:#374151;line-height:1.8;">${customBody}</p>
                </div>
                <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">${escapeHtml(form.email_footer_name || '集客メーカー').replace(/\n/g, '<br>')}</p>
              </div>`;
          } else {
            const fieldsHtml = fieldsData
              ? Object.entries(fieldsData as Record<string, string>)
                  .map(([key, val]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:30%;">${escapeHtml(key)}</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">${escapeHtml(String(val))}</td></tr>`)
                  .join('')
              : '';
            bodyHtml = `
              <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                <div style="background:linear-gradient(135deg,#059669,#14b8a6);padding:24px;border-radius:12px 12px 0 0;">
                  <h1 style="color:#fff;font-size:20px;margin:0;">${escapeHtml(form.title)}</h1>
                </div>
                <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                  <p style="color:#374151;font-size:16px;font-weight:600;margin:0 0 8px;">お申し込みを受け付けました</p>
                  <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">${escapeHtml(submitterName)} 様、お申し込みありがとうございます。</p>
                  ${fieldsHtml ? `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">${fieldsHtml}</table>` : ''}
                  ${!isFree ? '<p style="color:#6b7280;font-size:13px;">決済完了後、確認メールをお送りいたします。</p>' : ''}
                </div>
                <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">${escapeHtml(form.email_footer_name || '集客メーカー').replace(/\n/g, '<br>')}</p>
              </div>`;
          }

          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject,
            html: bodyHtml,
          });
        } catch (emailError) {
          console.error('[Order Form Submit] Reply email error:', emailError);
        }
      }

      // 2. フォーム作成者への通知メール
      if (form.notify_owner !== false && form.user_id) {
        try {
          // 通知先メールアドレスを収集
          const notifyTargets: string[] = [];

          // カスタム指定のメールアドレス
          if (form.notify_emails) {
            const customEmails = form.notify_emails
              .split(',')
              .map((e: string) => e.trim())
              .filter((e: string) => e && e.includes('@'));
            notifyTargets.push(...customEmails);
          }

          // カスタム指定がない場合はオーナーのメールを使用
          if (notifyTargets.length === 0) {
            const { data: owner } = await supabase
              .from('user_profiles')
              .select('email')
              .eq('user_id', form.user_id)
              .single();
            if (owner?.email) {
              notifyTargets.push(owner.email);
            } else {
              const { data: authUser } = await supabase.auth.admin.getUserById(form.user_id);
              if (authUser?.user?.email) notifyTargets.push(authUser.user.email);
            }
          }

          if (notifyTargets.length > 0) {
            const fieldsHtml = fieldsData
              ? Object.entries(fieldsData as Record<string, string>)
                  .map(([key, val]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:30%;">${escapeHtml(key)}</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">${escapeHtml(String(val))}</td></tr>`)
                  .join('')
              : '';

            const notifyHtml = `
              <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                <div style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:24px;border-radius:12px 12px 0 0;">
                  <h1 style="color:#fff;font-size:20px;margin:0;">新しい申し込みがありました</h1>
                </div>
                <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                  <p style="color:#374151;font-size:16px;font-weight:600;margin:0 0 16px;">「${escapeHtml(form.title)}」に申し込みがありました。</p>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                    <tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:30%;">名前</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">${escapeHtml(name || '未入力')}</td></tr>
                    <tr><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">メール</td><td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">${escapeHtml(email)}</td></tr>
                    ${fieldsHtml}
                  </table>
                  ${!isFree ? `<p style="color:#6b7280;font-size:13px;">決済状況: 決済待ち / 金額: ${form.price.toLocaleString()}円</p>` : ''}
                </div>
                <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">${escapeHtml(form.email_footer_name || '集客メーカー').replace(/\n/g, '<br>')}</p>
              </div>`;

            // 各通知先にメール送信
            await Promise.all(notifyTargets.map((targetEmail) =>
              resend.emails.send({
                from: fromEmail,
                to: targetEmail,
                subject: `【新規申し込み】${form.title}`,
                html: notifyHtml,
              })
            ));
          }
        } catch (emailError) {
          console.error('[Order Form Submit] Owner notification error:', emailError);
        }
      }
    }

    return NextResponse.json({
      submission,
      requiresPayment: !isFree,
      paymentType: form.payment_type,
      paymentProvider: form.payment_provider,
      price: form.price,
      formSlug: form.slug,
    });
  } catch (error) {
    console.error('[Order Form Submit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
