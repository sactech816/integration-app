import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function PUT(request: NextRequest) {
  try {
    const { bookId, title, subtitle } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: 'bookIdが必要です' }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabaseの設定が見つかりません' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 書籍情報を更新
    const { data, error } = await supabase
      .from('kdl_books')
      .update({
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookId)
      .select()
      .single();

    if (error) {
      console.error('Update book error:', error);
      return NextResponse.json(
        { error: '書籍の更新に失敗しました: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, book: data });
  } catch (error: any) {
    console.error('Update book error:', error);
    return NextResponse.json(
      { error: '書籍の更新中にエラーが発生しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

