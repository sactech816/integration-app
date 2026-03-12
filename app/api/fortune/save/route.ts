import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { birthYear, birthMonth, birthDay, resultSnapshot, inputDetails } = body;

    if (!birthYear || !birthMonth || !birthDay || !resultSnapshot) {
      return NextResponse.json({ error: '診断データが不足しています' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('fortune_results')
      .insert({
        user_id: user?.id || null,
        birth_year: birthYear,
        birth_month: birthMonth,
        birth_day: birthDay,
        result_snapshot: resultSnapshot,
        is_public: true,
        input_details: inputDetails || {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('Fortune save error:', error);
      return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Fortune save error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
