import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const testType = searchParams.get('test_type');

    let query = supabase
      .from('bigfive_results')
      .select('id, test_type, openness, conscientiousness, extraversion, agreeableness, neuroticism, mbti_code, is_public, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (testType) {
      query = query.eq('test_type', testType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('BigFive history error:', error);
      return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    console.error('BigFive history error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
