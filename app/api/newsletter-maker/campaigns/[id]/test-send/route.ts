import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: テスト送信（指定メールアドレスに1通だけ送信）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // レート制限（フォーム送信: 3回/分）
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { id } = await params;
    const { userId, testEmail } = await request.json();

    if (!userId || !testEmail) {
      return NextResponse.json({ error: 'userId と testEmail は必須です' }, { status: 400 });
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // キャンペーン取得
    const { data: campaign } = await supabase
      .from('newsletter_campaigns')
      .select('*, newsletter_lists(name, from_name, from_email)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'キャンペーンが見つかりません' }, { status: 404 });
    }

    if (!campaign.subject || !campaign.html_content) {
      return NextResponse.json({ error: '件名と本文は必須です' }, { status: 400 });
    }

    const emailRegexSimple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const defaultEmail = process.env.RESEND_FROM_EMAIL || 'noreply@makers.tokyo';

    // from_name / from_email が入れ違いの場合を自動検出・修正
    let fromName = (campaign.newsletter_lists?.from_name || '').replace(/[<>]/g, '').trim();
    let fromEmail = (campaign.newsletter_lists?.from_email || '').replace(/[^\x00-\x7F]/g, '').trim();

    // from_emailが空orメール形式でない場合、from_nameにメールが入っていないか確認
    if (!emailRegexSimple.test(fromEmail)) {
      if (emailRegexSimple.test(fromName)) {
        // 入れ違い: from_nameにメールが入っている
        fromEmail = fromName;
        fromName = (campaign.newsletter_lists?.from_email || '').replace(/[<>]/g, '').trim();
      } else {
        // どちらにもメールがない → デフォルト使用
        if (!fromName && campaign.newsletter_lists?.from_email) {
          fromName = campaign.newsletter_lists.from_email; // 名前として使う
        }
        fromEmail = defaultEmail;
      }
    }
    if (!fromName) fromName = '集客メーカー';

    // Resendのfromフィールド: 差出人名がある場合は "Name <email>" 形式、なければメールのみ
    const fromField = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    // テスト送信であることを件名に明示
    const testSubject = `【テスト送信】${campaign.subject}`;

    const emailPayload: { from: string; to: string[]; subject: string; html: string; text?: string } = {
      from: fromField,
      to: [testEmail],
      subject: testSubject,
      html: campaign.html_content,
    };
    if (campaign.text_content) {
      emailPayload.text = campaign.text_content;
    }

    const { data, error: sendError } = await resend.emails.send(emailPayload);

    if (sendError) {
      console.error('[Newsletter Test Send] Resend error:', sendError);
      return NextResponse.json(
        { error: `送信エラー: ${sendError.message || 'メール送信に失敗しました'}` },
        { status: 422 }
      );
    }

    console.log('[Newsletter Test Send] Success:', data?.id, '→', testEmail);

    return NextResponse.json({
      success: true,
      message: `テストメールを ${testEmail} に送信しました`,
    });
  } catch (error) {
    console.error('[Newsletter Test Send] Error:', error);
    const message = error instanceof Error ? error.message : 'テスト送信に失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
