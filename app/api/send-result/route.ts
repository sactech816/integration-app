import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml, isValidEmail, truncate } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // レート制限（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { email, diagnosisType, score } = await request.json();

    // バリデーション
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    // サニタイズ
    const safeDiagnosisType = escapeHtml(truncate(diagnosisType, 200));
    const safeScore = escapeHtml(truncate(String(score ?? ''), 50));

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'YOUR_EMAIL@gmail.com',
      subject: '【診断結果】あなたの診断結果が届きました',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>診断完了のお知らせ</h1>
          <p>ご利用ありがとうございます。あなたの診断結果をお送りします。</p>
          <hr />
          <h2>結果: ${safeDiagnosisType} タイプ</h2>
          <p><strong>スコア:</strong> ${safeScore} 点</p>
          <p>この結果を活かして、次のステップへ進みましょう！</p>
          <hr />
          <p style="font-size: 12px; color: #888;">※このメールは自動送信されています。</p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'メール送信に失敗しました' }, { status: 500 });
  }
}
