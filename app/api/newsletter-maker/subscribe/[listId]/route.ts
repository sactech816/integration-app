import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isValidEmail } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: 公開購読エンドポイント（読者が自分で登録）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    // レート制限
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { listId } = await params;
    const { email, name } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リスト存在チェック
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('id, name, resend_audience_id')
      .eq('id', listId)
      .single();

    if (!list) {
      return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }

    // Resend Contactsに追加
    if (list.resend_audience_id) {
      try {
        await resend.contacts.create({
          email,
          firstName: name || '',
          audienceId: list.resend_audience_id,
          unsubscribed: false,
        });
      } catch (err) {
        console.error('[Newsletter Subscribe] Resend contact create failed:', err);
      }
    }

    // DB upsert
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          list_id: listId,
          email,
          name: name || null,
          status: 'subscribed',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: 'list_id,email' }
      );

    if (error) {
      console.error('[Newsletter Subscribe] Error:', error);
      return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '登録が完了しました' });
  } catch (error) {
    console.error('[Newsletter Subscribe] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
