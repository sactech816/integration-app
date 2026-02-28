import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: キャンペーン一覧
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const listId = request.nextUrl.searchParams.get('listId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let query = supabase
      .from('newsletter_campaigns')
      .select('*, newsletter_lists(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (listId) {
      query = query.eq('list_id', listId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Newsletter Campaigns] Error:', error);
      return NextResponse.json({ error: 'キャンペーン一覧の取得に失敗しました' }, { status: 500 });
    }

    const campaigns = (data || []).map((c: any) => ({
      ...c,
      list_name: c.newsletter_lists?.name || '',
      newsletter_lists: undefined,
    }));

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('[Newsletter Campaigns] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: キャンペーン作成
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, listId, subject, previewText, htmlContent } = await request.json();

    if (!userId || !listId || !subject) {
      return NextResponse.json({ error: 'userId, listId, subject は必須です' }, { status: 400 });
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
      .from('newsletter_campaigns')
      .insert({
        user_id: userId,
        list_id: listId,
        subject,
        preview_text: previewText || null,
        html_content: htmlContent || '',
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('[Newsletter Campaigns] Insert error:', error);
      return NextResponse.json({ error: 'キャンペーン作成に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    console.error('[Newsletter Campaigns] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
