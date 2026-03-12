/**
 * Big Five ファネル分析
 * GET /api/bigfive/funnel-analytics?days=30
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

    // 全イベント取得
    const { data: events, error } = await supabase
      .from('bigfive_funnel_events')
      .select('session_id, email, user_id, event_type, metadata, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Funnel Analytics] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // ファネル集計（セッションベース）
    const sessionMap = new Map<string, Set<string>>();
    const dailyCounts: Record<string, Record<string, number>> = {};
    const eventTotals: Record<string, number> = {
      sample_request: 0,
      quiz_start: 0,
      quiz_complete: 0,
      pdf_purchase: 0,
    };

    // テストモード別カウント
    const testModeCounts: Record<string, number> = { simple: 0, full: 0 };
    // サンプルタイプ別カウント
    const sampleTypeCounts: Record<string, number> = {};

    for (const event of events || []) {
      // 総数カウント
      eventTotals[event.event_type] = (eventTotals[event.event_type] || 0) + 1;

      // 日別カウント
      const day = event.created_at.split('T')[0];
      if (!dailyCounts[day]) {
        dailyCounts[day] = { sample_request: 0, quiz_start: 0, quiz_complete: 0, pdf_purchase: 0 };
      }
      dailyCounts[day][event.event_type] = (dailyCounts[day][event.event_type] || 0) + 1;

      // セッション別
      const sessionKey = event.session_id || event.email || event.user_id || 'unknown';
      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, new Set());
      }
      sessionMap.get(sessionKey)!.add(event.event_type);

      // メタデータ集計
      const meta = event.metadata as Record<string, any> || {};
      if (event.event_type === 'quiz_start' && meta.test_mode) {
        testModeCounts[meta.test_mode] = (testModeCounts[meta.test_mode] || 0) + 1;
      }
      if (event.event_type === 'sample_request' && meta.sample_type) {
        sampleTypeCounts[meta.sample_type] = (sampleTypeCounts[meta.sample_type] || 0) + 1;
      }
    }

    // コンバージョンファネル
    let didSample = 0, didStart = 0, didComplete = 0, didPurchase = 0;
    for (const types of sessionMap.values()) {
      if (types.has('sample_request')) didSample++;
      if (types.has('quiz_start')) didStart++;
      if (types.has('quiz_complete')) didComplete++;
      if (types.has('pdf_purchase')) didPurchase++;
    }

    // リンク済みサンプル申込者数
    const { count: linkedCount } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'bigfive_sample')
      .not('linked_user_id', 'is', null);

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      totals: eventTotals,
      funnel: {
        unique_sessions: sessionMap.size,
        sample_requests: didSample,
        quiz_starts: didStart,
        quiz_completions: didComplete,
        pdf_purchases: didPurchase,
      },
      conversion_rates: {
        sample_to_start: didSample > 0 ? Math.round((didStart / didSample) * 100) : 0,
        start_to_complete: didStart > 0 ? Math.round((didComplete / didStart) * 100) : 0,
        complete_to_purchase: didComplete > 0 ? Math.round((didPurchase / didComplete) * 100) : 0,
        sample_to_purchase: didSample > 0 ? Math.round((didPurchase / didSample) * 100) : 0,
      },
      breakdown: {
        by_test_mode: testModeCounts,
        by_sample_type: sampleTypeCounts,
      },
      linked_sample_subscribers: linkedCount || 0,
      daily: dailyCounts,
    });
  } catch (err) {
    console.error('[Funnel Analytics] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
