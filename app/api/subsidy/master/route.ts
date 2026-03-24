import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('subsidy_master')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Subsidy master fetch error:', error);
      return NextResponse.json({ error: 'マスタデータの取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ subsidies: data || [] });
  } catch (error) {
    console.error('Subsidy master error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
