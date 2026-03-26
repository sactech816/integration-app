/**
 * オペレータープレゼンスAPI
 * GET  — オペレーターのオンライン状態を取得（ウィジェット用）
 * POST — オンライン/オフライン設定 + ハートビート（admin限定）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getAdminEmails } from '@/lib/constants';

const PRESENCE_TIMEOUT_SEC = 90; // 90秒ハートビートなしでオフライン扱い

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET — オペレーターがオンラインかチェック（誰でもアクセス可能）
export async function GET() {
  try {
    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ operatorOnline: false });
    }

    const cutoff = new Date(Date.now() - PRESENCE_TIMEOUT_SEC * 1000).toISOString();

    const { data } = await serviceClient
      .from('concierge_operator_presence')
      .select('operator_id, status, last_seen_at')
      .eq('is_online', true)
      .gte('last_seen_at', cutoff)
      .limit(1);

    return NextResponse.json({
      operatorOnline: (data && data.length > 0) || false,
    });
  } catch {
    return NextResponse.json({ operatorOnline: false });
  }
}

// POST — オペレーターのプレゼンス更新（admin限定）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (!isAdmin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const { status: presenceStatus } = await request.json();
    // presenceStatus: 'online' | 'away' | 'offline'

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const isOnline = presenceStatus !== 'offline';

    await serviceClient
      .from('concierge_operator_presence')
      .upsert({
        operator_id: user.id,
        is_online: isOnline,
        status: presenceStatus || 'online',
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'operator_id' });

    return NextResponse.json({ success: true, status: presenceStatus });
  } catch (err: any) {
    console.error('Operator presence error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
