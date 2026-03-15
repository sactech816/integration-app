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
      to: 'YOUR_EMAIL@gmail.com', // ★ご自身のメールアドレスへ
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