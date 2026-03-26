/**
 * オペレーターメッセージAPI
 * POST — オペレーターがメッセージ送信（admin限定）
 * GET  — セッションの全メッセージ取得（admin限定）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getAdminEmails } from '@/lib/constants';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.some(e => e.toLowerCase() === email.toLowerCase());
}

// GET — セッションの全メッセージ取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user.email)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionIdが必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const { data, error } = await serviceClient
      .from('concierge_messages')
      .select('id, role, content, metadata, created_at, feedback, sender_type, user_type, context')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — オペレーターがメッセージを送信
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user.email)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { sessionId, content } = await request.json();

    if (!sessionId || !content?.trim()) {
      return NextResponse.json({ error: 'sessionId と content が必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // セッション情報を取得（user_id / visitor_idが必要）
    const { data: session } = await serviceClient
      .from('concierge_sessions')
      .select('user_id, visitor_id')
      .eq('session_id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'セッションが見つかりません' }, { status: 404 });
    }

    // オペレーターのメッセージを保存
    const { data, error } = await serviceClient
      .from('concierge_messages')
      .insert({
        user_id: session.user_id,
        visitor_id: session.visitor_id,
        session_id: sessionId,
        role: 'assistant',
        sender_type: 'operator',
        content: content.trim(),
        metadata: { source: 'operator' },
        input_tokens: 0,
        output_tokens: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // セッションのupdated_atを更新
    await serviceClient
      .from('concierge_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    return NextResponse.json({ message: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
