import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { quizId } = await request.json();

    if (!quizId) {
      return NextResponse.json({ error: 'quizIdが必要です' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: 'DB設定エラー' }, { status: 500 });
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await supabase.rpc('increment_shares', { row_id: quizId });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Share tracking error:', error);
    return NextResponse.json({ error: 'シェアトラッキングに失敗しました' }, { status: 500 });
  }
}
