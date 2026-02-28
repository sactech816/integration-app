import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: フォームの申し込み一覧（オーナーのみ）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // フォーム所有者チェック
    const { data: form } = await supabase
      .from('order_forms')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!form) {
      return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('order_form_submissions')
      .select('*')
      .eq('form_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Order Form Submissions] Error:', error);
      return NextResponse.json({ error: '申し込み一覧の取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ submissions: data || [] });
  } catch (error) {
    console.error('[Order Form Submissions] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
