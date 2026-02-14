import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET: セクションのドラフト一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section_id = searchParams.get('section_id');

    if (!section_id) {
      return NextResponse.json(
        { error: 'section_idを指定してください' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ drafts: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('kdl_section_drafts')
      .select('id, section_id, book_id, label, content, tab_type, order_index, created_at, updated_at')
      .eq('section_id', section_id)
      .order('order_index', { ascending: true });

    if (error) {
      // テーブルが存在しない場合は空配列を返す
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ drafts: [] });
      }
      throw new Error('ドラフトの取得に失敗しました: ' + error.message);
    }

    return NextResponse.json({ drafts: data || [] });
  } catch (error: any) {
    console.error('Get section drafts error:', error);
    return NextResponse.json(
      { error: error.message || 'ドラフトの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいドラフトを作成
export async function POST(request: Request) {
  try {
    const { section_id, book_id, label, content, tab_type } = await request.json();

    if (!section_id || !book_id) {
      return NextResponse.json(
        { error: 'section_idとbook_idを指定してください' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'データベースが設定されていません' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 現在の最大order_indexを取得
    const { data: existing } = await supabase
      .from('kdl_section_drafts')
      .select('order_index')
      .eq('section_id', section_id)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrder = (existing && existing.length > 0) ? existing[0].order_index + 1 : 0;

    const { data, error } = await supabase
      .from('kdl_section_drafts')
      .insert({
        section_id,
        book_id,
        label: label || (tab_type === 'memo' ? 'メモ' : 'AI案'),
        content: content || '',
        tab_type: tab_type || 'draft',
        order_index: nextOrder,
      })
      .select()
      .single();

    if (error) {
      throw new Error('ドラフトの作成に失敗しました: ' + error.message);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create section draft error:', error);
    return NextResponse.json(
      { error: error.message || 'ドラフトの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: ドラフトを更新
export async function PUT(request: Request) {
  try {
    const { id, content, label } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'idを指定してください' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'データベースが設定されていません' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (content !== undefined) updateData.content = content;
    if (label !== undefined) updateData.label = label;

    const { error } = await supabase
      .from('kdl_section_drafts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error('ドラフトの更新に失敗しました: ' + error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update section draft error:', error);
    return NextResponse.json(
      { error: error.message || 'ドラフトの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: ドラフトを削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'idを指定してください' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'データベースが設定されていません' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('kdl_section_drafts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('ドラフトの削除に失敗しました: ' + error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete section draft error:', error);
    return NextResponse.json(
      { error: error.message || 'ドラフトの削除に失敗しました' },
      { status: 500 }
    );
  }
}
