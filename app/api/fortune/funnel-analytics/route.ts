/**
 * Fortune ファネル分析
 * GET /api/fortune/funnel-analytics?days=30
 * 管理者のみアクセス可能
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/auth-server';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: events, error } = await supabase
      .from('fortune_funnel_events')
      .select('session_id, user_id, event_type, metadata, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Fortune Funnel Analytics] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // ファネル集計
    const sessionMap = new Map<string, Set<string>>();
    const dailyCounts: Record<string, Record<string, number>> = {};
    const eventTotals: Record<string, number> = {
      page_view: 0,
      quiz_start: 0,
      quiz_complete: 0,
      report_purchase: 0,
    };

    for (const event of events || []) {
      eventTotals[event.event_type] = (eventTotals[event.event_type] || 0) + 1;

      const day = event.created_at.split('T')[0];
      if (!dailyCounts[day]) {
        dailyCounts[day] = { page_view: 0, quiz_start: 0, quiz_complete: 0, report_purchase: 0 };
      }
      dailyCounts[day][event.event_type] = (dailyCounts[day][event.event_type] || 0) + 1;

      const sessionKey = event.session_id || event.user_id || 'unknown';
      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, new Set());
      }
      sessionMap.get(sessionKey)!.add(event.event_type);
    }

    let didView = 0, didStart = 0, didComplete = 0, didPurchase = 0;
    for (const types of sessionMap.values()) {
      if (types.has('page_view')) didView++;
      if (types.has('quiz_start')) didStart++;
      if (types.has('quiz_complete')) didComplete++;
      if (types.has('report_purchase')) didPurchase++;
    }

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      totals: eventTotals,
      funnel: {
        unique_sessions: sessionMap.size,
        page_views: didView,
        quiz_starts: didStart,
        quiz_completions: didComplete,
        report_purchases: didPurchase,
      },
      conversion_rates: {
        view_to_start: didView > 0 ? Math.round((didStart / didView) * 100) : 0,
        start_to_complete: didStart > 0 ? Math.round((didComplete / didStart) * 100) : 0,
        complete_to_purchase: didComplete > 0 ? Math.round((didPurchase / didComplete) * 100) : 0,
        view_to_purchase: didView > 0 ? Math.round((didPurchase / didView) * 100) : 0,
      },
      daily: dailyCounts,
    });
  } catch (err) {
    console.error('[Fortune Funnel Analytics] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
