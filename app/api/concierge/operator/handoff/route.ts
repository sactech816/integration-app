/**
 * コンシェルジュ ハンドオフAPI
 * POST   — ユーザーが人間サポートをリクエスト（session status='waiting'）
 * PATCH  — オペレーターがセッションを担当 or 終了
 * GET    — セッション一覧取得（admin限定）
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

async function getUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.some(e => e.toLowerCase() === email.toLowerCase());
}

// GET — セッション一覧（admin限定）
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !isAdminUser(user.email)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const { searchParams } = request.nextUrl;
    const statusFilter = searchParams.get('status'); // 'waiting' | 'assigned' | 'active' | 'closed' | null

    let query = serviceClient
      .from('concierge_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    } else {
      // デフォルト: closed以外
      query = query.neq('status', 'closed');
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessions: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — ユーザーが人間サポートをリクエスト
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const { sessionId, visitorId, currentPage, userEmail, userPlan, summary } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionIdが必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // upsert: 既存セッションがあればステータス更新、なければ新規作成
    const { data, error } = await serviceClient
      .from('concierge_sessions')
      .upsert({
        session_id: sessionId,
        user_id: user?.id || null,
        visitor_id: visitorId || null,
        mode: 'ai', // まだAIモード。オペレーターが対応開始したらhumanに切り替え
        status: 'waiting',
        user_email: userEmail || user?.email || null,
        user_plan: userPlan || null,
        current_page: currentPage || null,
        summary: summary || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — オペレーターがセッション状態を変更（admin限定）
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !isAdminUser(user.email)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { sessionId, action } = await request.json();
    // action: 'assign' | 'close'

    if (!sessionId || !action) {
      return NextResponse.json({ error: 'sessionId と action が必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    let updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (action === 'assign') {
      updateData = {
        ...updateData,
        mode: 'human',
        status: 'assigned',
        assigned_operator_id: user.id,
      };
    } else if (action === 'close') {
      updateData = {
        ...updateData,
        mode: 'ai',
        status: 'closed',
        closed_at: new Date().toISOString(),
      };
    } else {
      return NextResponse.json({ error: '無効なactionです' }, { status: 400 });
    }

    const { data, error } = await serviceClient
      .from('concierge_sessions')
      .update(updateData)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
