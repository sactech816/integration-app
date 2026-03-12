import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('fortune_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '結果が見つかりません' }, { status: 404 });
    }

    // 自分の結果か、公開設定の結果のみ閲覧可
    if (!data.is_public && (!user || data.user_id !== user.id)) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    return NextResponse.json({ result: data });
  } catch (error) {
    console.error('Fortune result error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
