import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { businessInfo, matchedSubsidies, resultSnapshot } = body;

    if (!businessInfo || !matchedSubsidies) {
      return NextResponse.json({ error: '診断データが不足しています' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('subsidy_results')
      .insert({
        user_id: user?.id || null,
        business_info: businessInfo,
        matched_subsidies: matchedSubsidies,
        result_snapshot: resultSnapshot || {},
        is_public: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Subsidy save error:', error);
      return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Subsidy save error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
