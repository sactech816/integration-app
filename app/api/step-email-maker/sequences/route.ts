import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: シーケンス一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('step_email_sequences')
      .select('*, newsletter_lists(name), step_email_steps(id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Step Email Sequences] Error:', error);
      return NextResponse.json({ error: 'シーケンス一覧の取得に失敗しました' }, { status: 500 });
    }

    const sequences = (data || []).map((s: any) => ({
      ...s,
      list_name: s.newsletter_lists?.name || '',
      step_count: s.step_email_steps?.length || 0,
      newsletter_lists: undefined,
      step_email_steps: undefined,
    }));

    return NextResponse.json({ sequences });
  } catch (error) {
    console.error('[Step Email Sequences] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: シーケンス作成
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, listId, name, description } = await request.json();

    if (!userId || !listId || !name) {
      return NextResponse.json({ error: 'userId, listId, name は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リスト所有者チェック
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', userId)
      .single();

    if (!list) {
      return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('step_email_sequences')
      .insert({
        user_id: userId,
        list_id: listId,
        name,
        description: description || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('[Step Email Sequences] Insert error:', error);
      return NextResponse.json({ error: 'シーケンス作成に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ sequence: data });
  } catch (error) {
    console.error('[Step Email Sequences] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
