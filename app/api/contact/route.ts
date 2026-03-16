import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml, isValidEmail, truncate, containsSuspiciousPattern } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // レート制限チェック（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { name, email, subject, message, sourcePage } = await request.json();

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    // 入力値の長さ制限
    const safeName = truncate(name, 100);
    const safeSubject = truncate(subject, 200);
    const safeMessage = truncate(message, 5000);

    // 不審なパターンの検出（ログ記録のみ、ブロックはしない）
    if (containsSuspiciousPattern(safeMessage)) {
      console.warn('[Contact API] Suspicious pattern detected:', { email, subject: safeSubject });
    }

    // XSSエスケープを適用してHTMLメールを生成
    const escapedName = escapeHtml(safeName);
    const escapedEmail = escapeHtml(email);
    const escapedSubject = escapeHtml(safeSubject);
    const escapedMessage = escapeHtml(safeMessage);

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'support@makers.tokyo',
      replyTo: email,
      subject: `【お問い合わせ】${escapedSubject} (${escapedName}様)`,
      html: `
        <p>ウェブサイトからのお問い合わせがありました。</p>
        <hr />
        <p><strong>お名前:</strong> ${escapedName}</p>
        <p><strong>メール:</strong> ${escapedEmail}</p>
        <p><strong>件名:</strong> ${escapedSubject}</p>
        <p><strong>内容:</strong></p>
        <p style="white-space: pre-wrap;">${escapedMessage}</p>
      `,
    });

    // ユーザーへの自動返信メール
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: '【集客メーカー】お問い合わせを受け付けました',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #3b82f6, #60a5fa); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #fff; font-size: 20px; margin: 0;">お問い合わせありがとうございます</h1>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <p style="font-size: 15px; line-height: 1.8;">${escapedName} 様</p>
              <p style="font-size: 15px; line-height: 1.8;">
                この度は集客メーカーにお問い合わせいただき、誠にありがとうございます。
              </p>
              <p style="font-size: 15px; line-height: 1.8;">
                以下の内容でお問い合わせを受け付けました。<br />
                <strong>2営業日以内</strong>に担当者よりご連絡いたしますので、しばらくお待ちください。
              </p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;"><strong>件名:</strong></p>
                <p style="margin: 0 0 16px; font-size: 15px;">${escapedSubject}</p>
                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;"><strong>内容:</strong></p>
                <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${escapedMessage}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
                このメールは集客メーカー（makers.tokyo）のお問い合わせフォームから自動送信されています。<br />
                お心当たりのない場合は、このメールを無視していただいて問題ありません。
              </p>
            </div>
          </div>
        `,
      });
    } catch (autoReplyError) {
      console.warn('[Contact API] Auto-reply failed:', autoReplyError);
    }

    // DBに保存
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        const supabase = createClient(supabaseUrl, serviceKey);
        await supabase.from('contact_inquiries').insert({
          source: 'contact',
          source_page: sourcePage || '/contact',
          name: safeName,
          email,
          subject: safeSubject,
          message: safeMessage,
        });
      }
    } catch (dbError) {
      console.warn('[Contact API] DB save failed:', dbError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json({ error: '送信失敗' }, { status: 500 });
  }
}