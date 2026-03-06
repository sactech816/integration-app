import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ユーザーのLINE友だちリストを取得
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const sourceType = request.nextUrl.searchParams.get('sourceType');
    const status = request.nextUrl.searchParams.get('status') || 'active';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let query = supabase
      .from('line_friends')
      .select('*')
      .eq('owner_id', userId)
      .order('followed_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[LINE Friends] Error:', error);
      return NextResponse.json({ error: '友だちリスト取得に失敗しました' }, { status: 500 });
    }

    // 統計情報も返す
    const { count: totalCount } = await supabase
      .from('line_friends')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    const { count: activeCount } = await supabase
      .from('line_friends')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'active');

    return NextResponse.json({
      friends: data || [],
      stats: {
        total: totalCount || 0,
        active: activeCount || 0,
      },
    });
  } catch (error) {
    console.error('[LINE Friends] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
