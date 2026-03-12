/**
 * Fortune ファネルイベント記録
 * POST /api/fortune/funnel-event
 * Body: { eventType, sessionId, metadata? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const VALID_EVENT_TYPES = ['page_view', 'quiz_start', 'quiz_complete', 'report_purchase'] as const;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const { eventType, sessionId, metadata } = await request.json();

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 認証済みならuser_idを取得
    let userId: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // 未ログインでもOK
    }

    const { error } = await serviceClient
      .from('fortune_funnel_events')
      .insert({
        session_id: sessionId || null,
        user_id: userId,
        event_type: eventType,
        metadata: metadata || {},
      });

    if (error) {
      console.error('[Fortune Funnel] Insert error:', error);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Fortune Funnel] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
