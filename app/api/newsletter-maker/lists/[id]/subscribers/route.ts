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
 * GET: リストの読者一覧
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');
    const status = request.nextUrl.searchParams.get('status'); // subscribed | unsubscribed | all

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リスト所有者チェック
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!list) {
      return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }

    let query = supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('list_id', id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Newsletter Subscribers] Error:', error);
      return NextResponse.json({ error: '読者一覧の取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ subscribers: data || [] });
  } catch (error) {
    console.error('[Newsletter Subscribers] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: 読者を手動追加
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, email, name } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId と email は必須です' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リスト所有者チェック + Resend Audience ID取得
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('id, resend_audience_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!list) {
      return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }

    // Resend Contactsにも追加
    if (list.resend_audience_id) {
      try {
        await resend.contacts.create({
          email,
          firstName: name || '',
          audienceId: list.resend_audience_id,
          unsubscribed: false,
        });
      } catch (err) {
        console.error('[Newsletter] Resend contact create failed:', err);
      }
    }

    // DB upsert（重複時はstatusを更新）
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          list_id: id,
          email,
          name: name || null,
          status: 'subscribed',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: 'list_id,email' }
      )
      .select()
      .single();

    if (error) {
      console.error('[Newsletter Subscribers] Insert error:', error);
      return NextResponse.json({ error: '読者の追加に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ subscriber: data });
  } catch (error) {
    console.error('[Newsletter Subscribers] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: 読者の配信停止
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId と email は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リスト所有者チェック
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('id, resend_audience_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!list) {
      return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }

    // Resend側も配信停止
    if (list.resend_audience_id) {
      try {
        await resend.contacts.update({
          email,
          audienceId: list.resend_audience_id,
          unsubscribed: true,
        });
      } catch (err) {
        console.error('[Newsletter] Resend contact unsubscribe failed:', err);
      }
    }

    // DB更新
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('list_id', id)
      .eq('email', email);

    if (error) {
      console.error('[Newsletter Subscribers] Unsubscribe error:', error);
      return NextResponse.json({ error: '配信停止に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Newsletter Subscribers] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
