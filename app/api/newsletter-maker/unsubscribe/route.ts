import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isValidEmail } from '@/lib/security/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: 配信停止処理
 */
export async function POST(request: NextRequest) {
  try {
    const { listId, email } = await request.json();

    if (!listId || !email || !isValidEmail(email)) {
      return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リストのResend Audience IDを取得
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('resend_audience_id')
      .eq('id', listId)
      .single();

    // Resend側も配信停止
    if (list?.resend_audience_id) {
      try {
        await resend.contacts.update({
          email,
          audienceId: list.resend_audience_id,
          unsubscribed: true,
        });
      } catch (err) {
        console.error('[Newsletter Unsubscribe] Resend update failed:', err);
      }
    }

    // DB更新
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('list_id', listId)
      .eq('email', email);

    if (error) {
      console.error('[Newsletter Unsubscribe] Error:', error);
      return NextResponse.json({ error: '配信停止に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Newsletter Unsubscribe] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
