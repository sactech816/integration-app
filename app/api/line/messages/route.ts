import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ユーザーのLINEメッセージ一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('line_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[LINE Messages] Error:', error);
      return NextResponse.json({ error: 'メッセージ取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error('[LINE Messages] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: 新しいLINEメッセージを作成（下書き保存）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, messageType, content, targetType, targetFilter } = body;

    if (!userId || !title || !content) {
      return NextResponse.json({ error: 'userId, title, content は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('line_messages')
      .insert({
        user_id: userId,
        title,
        message_type: messageType || 'text',
        content,
        target_type: targetType || 'all',
        target_filter: targetFilter || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[LINE Messages] Insert error:', error);
      return NextResponse.json({ error: 'メッセージ作成に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ message: data });
  } catch (error) {
    console.error('[LINE Messages] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT: LINEメッセージを更新
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, messageId, title, content, targetType, targetFilter } = body;

    if (!userId || !messageId) {
      return NextResponse.json({ error: 'userId, messageId は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (targetType !== undefined) updateData.target_type = targetType;
    if (targetFilter !== undefined) updateData.target_filter = targetFilter;

    const { data, error } = await supabase
      .from('line_messages')
      .update(updateData)
      .eq('id', messageId)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .select()
      .single();

    if (error) {
      console.error('[LINE Messages] Update error:', error);
      return NextResponse.json({ error: 'メッセージ更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ message: data });
  } catch (error) {
    console.error('[LINE Messages] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: LINEメッセージを削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const messageId = request.nextUrl.searchParams.get('messageId');

    if (!userId || !messageId) {
      return NextResponse.json({ error: 'userId, messageId は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('line_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) {
      console.error('[LINE Messages] Delete error:', error);
      return NextResponse.json({ error: 'メッセージ削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LINE Messages] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
