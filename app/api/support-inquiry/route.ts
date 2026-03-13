import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml, isValidEmail, truncate, containsSuspiciousPattern } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const PACK_NAMES: Record<string, string> = {
  coach: 'セミナー集客パック',
  creator: 'コンテンツ販売スタートパック',
  freelance: 'フリーランス集客パック',
  shop: '店舗集客パック',
  starter: '起業スタートパック',
  business: '法人導入サポートパック',
};

export async function POST(request: Request) {
  try {
    // レート制限チェック（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { name, email, pack, situation, message } = await request.json();

    // バリデーション
    if (!name || !email) {
      return NextResponse.json({ error: 'お名前とメールアドレスは必須です' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    // 入力値の長さ制限
    const safeName = truncate(name, 100);
    const safePack = pack ? truncate(pack, 50) : '';
    const safeSituation = situation ? truncate(situation, 3000) : '';
    const safeMessage = message ? truncate(message, 3000) : '';

    // 不審なパターンの検出
    const allText = `${safeSituation} ${safeMessage}`;
    if (containsSuspiciousPattern(allText)) {
      console.warn('[Support Inquiry API] Suspicious pattern detected:', { email, pack: safePack });
    }

    // XSSエスケープ
    const escapedName = escapeHtml(safeName);
    const escapedEmail = escapeHtml(email);
    const packName = PACK_NAMES[safePack] || safePack || '未選択';
    const escapedPackName = escapeHtml(packName);
    const escapedSituation = safeSituation ? escapeHtml(safeSituation) : '（未入力）';
    const escapedMessage = safeMessage ? escapeHtml(safeMessage) : '（未入力）';

    // 管理者宛メール送信
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'YOUR_EMAIL@gmail.com', // ★ご自身のメールアドレスへ
      subject: `【サポートパック相談】${escapedPackName}（${escapedName}様）`,
      html: `
        <h2>サポートパックのお問い合わせがありました</h2>
        <hr />
        <p><strong>お名前:</strong> ${escapedName}</p>
        <p><strong>メール:</strong> ${escapedEmail}</p>
        <p><strong>関心のあるパック:</strong> ${escapedPackName}</p>
        <p><strong>現在の状況:</strong></p>
        <p style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${escapedSituation}</p>
        <p><strong>メッセージ:</strong></p>
        <p style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px;">${escapedMessage}</p>
        <hr />
        <p style="color: #9ca3af; font-size: 12px;">このメールは集客メーカーのサポートパックお問い合わせフォームから送信されました。</p>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Support Inquiry API] Error:', error);
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 });
  }
}
