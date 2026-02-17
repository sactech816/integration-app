import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { escapeHtml, truncate, containsSuspiciousPattern } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // レート制限チェック（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { userId, userEmail, rating, message, youtubeUrl } = await request.json();

    // バリデーション
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '満足度を選択してください（1〜5）' }, { status: 400 });
    }

    // サニタイズ
    const safeMessage = truncate(message || '', 500);
    const safeYoutubeUrl = truncate(youtubeUrl || '', 500);

    if (safeMessage && containsSuspiciousPattern(safeMessage)) {
      console.warn('[Feedback API] Suspicious pattern detected:', { userEmail });
    }

    // YouTube URLバリデーション（入力がある場合）
    if (safeYoutubeUrl && !safeYoutubeUrl.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//)) {
      return NextResponse.json({ error: '有効なYouTube URLを入力してください' }, { status: 400 });
    }

    // Supabaseに保存
    const { error: dbError } = await supabaseAdmin
      .from('feedbacks')
      .insert({
        user_id: userId,
        user_email: userEmail,
        rating,
        message: safeMessage || null,
        youtube_url: safeYoutubeUrl || null,
      });

    if (dbError) {
      console.error('[Feedback API] DB error:', dbError);
      return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
    }

    // メール通知
    const starDisplay = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const escapedEmail = escapeHtml(userEmail);
    const escapedMessage = escapeHtml(safeMessage);
    const escapedYoutubeUrl = escapeHtml(safeYoutubeUrl);

    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'info@sac-office.net',
        subject: `【ご意見箱】満足度${rating} ${starDisplay}（${userEmail}）`,
        html: `
          <h2>ご意見箱に新しい投稿がありました</h2>
          <hr />
          <p><strong>満足度:</strong> ${starDisplay} (${rating}/5)</p>
          <p><strong>ユーザー:</strong> ${escapedEmail}</p>
          ${escapedMessage ? `<p><strong>ご意見・ご要望:</strong></p><p style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px;">${escapedMessage}</p>` : '<p><em>コメントなし</em></p>'}
          ${escapedYoutubeUrl ? `<p><strong>参考YouTube URL:</strong> <a href="${escapedYoutubeUrl}">${escapedYoutubeUrl}</a></p>` : ''}
          <hr />
          <p style="color: #999; font-size: 12px;">集客メーカー フィードバックシステム</p>
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
