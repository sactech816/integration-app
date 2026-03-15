/**
 * コンシェルジュ config別アクセス解析 API
 * GET /api/concierge/config-analytics?configId=xxx&range=7|30&tab=overview|logs|session|questions
 *
 * config作成者のみアクセス可能（owner認証）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const configId = searchParams.get('configId');
    const range = parseInt(searchParams.get('range') || '7');
    const tab = searchParams.get('tab') || 'overview';

    if (!configId) {
      return NextResponse.json({ error: 'configId が必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // config所有者チェック
    const { data: configData, error: configError } = await serviceClient
      .from('concierge_configs')
      .select('id, user_id, name')
      .eq('id', configId)
      .single();

    if (configError || !configData) {
      return NextResponse.json({ error: 'コンシェルジュが見つかりません' }, { status: 404 });
    }

    if (configData.user_id !== user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startISO = startDate.toISOString();

    // ============================================================
    // 概要
    // ============================================================
    if (tab === 'overview') {
      const [
        { count: totalMessages },
        { count: periodMessages },
        { data: periodData },
        { data: feedbackData },
      ] = await Promise.all([
        serviceClient.from('concierge_messages')
          .select('id', { count: 'exact', head: true })
          .eq('config_id', configId),
        serviceClient.from('concierge_messages')
          .select('id', { count: 'exact', head: true })
          .eq('config_id', configId)
          .gte('created_at', startISO),
        serviceClient.from('concierge_messages')
          .select('created_at, role, visitor_id')
          .eq('config_id', configId)
          .gte('created_at', startISO)
          .order('created_at', { ascending: true }),
        serviceClient.from('concierge_messages')
          .select('feedback')
          .eq('config_id', configId)
          .eq('role', 'assistant')
          .not('feedback', 'is', null)
          .gte('created_at', startISO),
      ]);

      // 日別集計
      const dailyMap: Record<string, { user: number; assistant: number }> = {};
      const allVisitorIds = new Set<string>();

      (periodData || []).forEach((m: any) => {
        const day = m.created_at.slice(0, 10);
        if (!dailyMap[day]) dailyMap[day] = { user: 0, assistant: 0 };
        dailyMap[day][m.role as 'user' | 'assistant']++;
        if (m.role === 'user' && m.visitor_id) {
          allVisitorIds.add(m.visitor_id);
        }
      });

      const dailyChart = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({
          date: date.slice(5),
          messages: counts.user,
          responses: counts.assistant,
        }));

      // 満足度
      const thumbsUp = (feedbackData || []).filter((f: any) => f.feedback === 1).length;
      const thumbsDown = (feedbackData || []).filter((f: any) => f.feedback === -1).length;
      const totalFeedback = thumbsUp + thumbsDown;

      return NextResponse.json({
        configName: configData.name,
        totalMessages: totalMessages || 0,
        periodMessages: periodMessages || 0,
        uniqueVisitors: allVisitorIds.size,
        dailyChart,
        satisfaction: {
          thumbsUp,
          thumbsDown,
          total: totalFeedback,
          rate: totalFeedback > 0 ? Math.round((thumbsUp / totalFeedback) * 100) : null,
        },
      });
    }

    // ============================================================
    // 会話ログ
    // ============================================================
    if (tab === 'logs') {
      const page = parseInt(searchParams.get('page') || '0');
      const limit = 20;

      const { data: messages, error: logsError } = await serviceClient
        .from('concierge_messages')
        .select('visitor_id, session_id, created_at, content, role')
        .eq('config_id', configId)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (logsError) {
        console.error('Config analytics logs error:', logsError);
      }

      const sessionMap: Record<string, any> = {};
      (messages || []).forEach((m: any) => {
        const key = `${m.visitor_id || 'unknown'}_${m.session_id}`;
        if (!sessionMap[key]) {
          sessionMap[key] = {
            visitorId: m.visitor_id,
            sessionId: m.session_id,
            lastMessage: m.content,
            lastAt: m.created_at,
            messageCount: 0,
          };
        }
        sessionMap[key].messageCount++;
      });

      return NextResponse.json({
        sessions: Object.values(sessionMap),
      });
    }

    // ============================================================
    // セッション詳細
    // ============================================================
    if (tab === 'session') {
      const visitorId = searchParams.get('visitorId');
      const sessionId = searchParams.get('sessionId');

      if (!sessionId || !visitorId) {
        return NextResponse.json({ error: 'sessionId と visitorId が必要です' }, { status: 400 });
      }

      const { data: messages } = await serviceClient
        .from('concierge_messages')
        .select('role, content, created_at, feedback')
        .eq('config_id', configId)
        .eq('session_id', sessionId)
        .eq('visitor_id', visitorId)
        .order('created_at', { ascending: true });

      return NextResponse.json({ messages: messages || [] });
    }

    // ============================================================
    // よくある質問・キーワード
    // ============================================================
    if (tab === 'questions') {
      const { data: userMessages } = await serviceClient
        .from('concierge_messages')
        .select('content')
        .eq('config_id', configId)
        .eq('role', 'user')
        .gte('created_at', startISO)
        .order('created_at', { ascending: false })
        .limit(500);

      // よく出るキーワード（汎用的な単語を抽出）
      const wordCount: Record<string, number> = {};
      (userMessages || []).forEach((m: any) => {
        // 3文字以上の単語を抽出（日本語対応）
        const words = m.content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{2,}|[a-zA-Z]{3,}/g) || [];
        words.forEach((w: string) => {
          wordCount[w] = (wordCount[w] || 0) + 1;
        });
      });

      const topKeywords = Object.entries(wordCount)
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([keyword, count]) => ({ keyword, count }));

      // よくある質問
      const questionCount: Record<string, number> = {};
      (userMessages || []).forEach((m: any) => {
        const normalized = m.content.trim().slice(0, 50);
        questionCount[normalized] = (questionCount[normalized] || 0) + 1;
      });

      const topQuestions = Object.entries(questionCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([question, count]) => ({ question, count }));

      return NextResponse.json({
        topKeywords,
        topQuestions,
        totalQuestions: (userMessages || []).length,
      });
    }

    return NextResponse.json({ error: 'Unknown tab' }, { status: 400 });
  } catch (err: any) {
    console.error('Config analytics error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
