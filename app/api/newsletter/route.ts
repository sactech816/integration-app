import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isValidEmail } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);
const audienceId = process.env.RESEND_AUDIENCE_ID;

export async function POST(request: Request) {
  try {
    // レート制限チェック（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { email } = await request.json();

    // メールバリデーション
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    if (!audienceId) {
      return NextResponse.json({ error: 'Audience ID未設定' }, { status: 500 });
    }

    // Resendの連絡先リスト(Contacts)に追加する処理
    const data = await resend.contacts.create({
      email: email,
      audienceId: audienceId,
      unsubscribed: false, // 最初は購読状態で登録
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Newsletter API] Error:', error);
    return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
  }
}