import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { escapeHtml, truncate, containsSuspiciousPattern } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

export async function POST(request: Request) {
  try {
    // レート制限チェック（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const supabaseAdmin = getServiceClient();
    if (!supabaseAdmin) {
      console.error('[Feedback API] Supabase service client not configured');
      return NextResponse.json({ error: 'サーバー設定エラーです' }, { status: 500 });
    }

    const { userId, userEmail, rating, message, toolUrls } = await request.json();

    // バリデーション
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '星をタップして評価してください（1〜5）' }, { status: 400 });
    }

    // サニタイズ
    const safeMessage = truncate(message || '', 500);
    const safeToolUrls = truncate(toolUrls || '', 1000);

    if (safeMessage && containsSuspiciousPattern(safeMessage)) {
      console.warn('[Feedback API] Suspicious pattern detected:', { userEmail });
    }

    // Supabaseに保存
    const { error: dbError } = await supabaseAdmin
      .from('feedbacks')
      .insert({
        user_id: userId,
        user_email: userEmail,
        rating,
        message: safeMessage || null,
        tool_urls: safeToolUrls || null,
      });

    if (dbError) {
      console.error('[Feedback API] DB error:', dbError);
      return NextResponse.json(
        { error: `保存に失敗しました: ${dbError.message}` },
        { status: 500 }
      );
    }

    // メール通知
    const starDisplay = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const escapedEmail = escapeHtml(userEmail);
    const escapedMessage = escapeHtml(safeMessage);
    const escapedToolUrls = escapeHtml(safeToolUrls);

    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'info@sac-office.net',
        subject: `【ご意見箱】${starDisplay}（${userEmail}）`,
        html: `
          <h2>ご意見箱に投稿がありました</h2>
          <hr />
          <p><strong>評価:</strong> ${starDisplay} (${rating}/5)</p>
          <p><strong>送信者:</strong> ${escapedEmail}</p>
          ${escapedMessage ? `<p><strong>内容:</strong></p><p style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px;">${escapedMessage}</p>` : '<p><em>コメントなし</em></p>'}
          ${escapedToolUrls ? `<p><strong>関連ツールURL:</strong></p><p style="white-space: pre-wrap;">${escapedToolUrls}</p>` : ''}
          <hr />
          <p style="color: #999; font-size: 12px;">集客メーカー ご意見箱</p>
        `,
      });
    } catch (emailError) {
      console.warn('[Feedback API] Email send failed (DB save succeeded):', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Feedback API] Error:', error);
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 });
  }
}
