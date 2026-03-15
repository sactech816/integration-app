/**
 * コンシェルジュ分析 API
 * GET /api/concierge/analytics?range=7|30&tab=overview|logs|questions|segments|costs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getAdminEmails } from '@/lib/constants';
import { createClient } from '@supabase/supabase-js';

// Haiku のトークン単価（USD per 1M tokens）
const HAIKU_COST = { input: 0.80, output: 4.00 };
const USD_TO_JPY = 150; // 概算レート

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

    const adminEmails = getAdminEmails();
    const isAdmin = user.email && adminEmails.some(
      (e: string) => user.email?.toLowerCase() === e.toLowerCase()
    );
    if (!isAdmin) {
      return NextResponse.json({ error: '管理者のみアクセス可能です' }, { status: 403 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const { searchParams } = request.nextUrl;
    const range = parseInt(searchParams.get('range') || '7');
    const tab = searchParams.get('tab') || 'overview';

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
          .select('id', { count: 'exact', head: true }),
        serviceClient.from('concierge_messages')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startISO),
        serviceClient.from('concierge_messages')
          .select('created_at, role, user_type, user_id, visitor_id')
          .gte('created_at', startISO)
          .order('created_at', { ascending: true }),
        serviceClient.from('concierge_messages')
          .select('feedback')
          .eq('role', 'assistant')
          .not('feedback', 'is', null)
          .gte('created_at', startISO),
      ]);

      // 日別集計
      const dailyMap: Record<string, { user: number; assistant: number }> = {};
      const allUserIds = new Set<string>();
      const allVisitorIds = new Set<string>();

      (periodData || []).forEach((m: any) => {
        const day = m.created_at.slice(0, 10);
        if (!dailyMap[day]) dailyMap[day] = { user: 0, assistant: 0 };
        dailyMap[day][m.role as 'user' | 'assistant']++;
        if (m.role === 'user') {
          if (m.user_id) allUserIds.add(m.user_id);
          if (m.visitor_id && !m.user_id) allVisitorIds.add(m.visitor_id);
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
        totalMessages: totalMessages || 0,
        periodMessages: periodMessages || 0,
        uniqueLoggedIn: allUserIds.size,
        uniqueGuests: allVisitorIds.size,
        uniqueTotal: allUserIds.size + allVisitorIds.size,
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
    // ユーザー区分・時間帯分析
    // ============================================================
    if (tab === 'segments') {
      const { data: segmentData } = await serviceClient
        .from('concierge_messages')
        .select('user_type, created_at, role, context, user_id, visitor_id')
        .eq('role', 'user')
        .gte('created_at', startISO);

      // ユーザー区分別集計
      const typeCount: Record<string, number> = {};
      const hourCount: Record<number, number> = {};
      const timezoneCount: Record<string, number> = {};

      (segmentData || []).forEach((m: any) => {
        const userType = m.user_type || 'unknown';
        typeCount[userType] = (typeCount[userType] || 0) + 1;

        // 時間帯集計
        const hour = new Date(m.created_at).getHours();
        hourCount[hour] = (hourCount[hour] || 0) + 1;

        // タイムゾーン集計
        const tz = m.context?.timezone;
        if (tz) {
          timezoneCount[tz] = (timezoneCount[tz] || 0) + 1;
        }
      });

      // 時間帯チャート（0-23時）
      const hourlyChart = Array.from({ length: 24 }, (_, h) => ({
        hour: `${h}時`,
        count: hourCount[h] || 0,
      }));

      // ユーザー区分
      const userTypes = [
        { type: 'guest', label: '未ログイン', count: typeCount.guest || 0 },
        { type: 'free', label: '無料', count: typeCount.free || 0 },
        { type: 'standard', label: 'スタンダード', count: typeCount.standard || 0 },
        { type: 'business', label: 'ビジネス', count: typeCount.business || 0 },
        { type: 'premium', label: 'プレミアム', count: typeCount.premium || 0 },
      ];

      // タイムゾーンランキング
      const timezones = Object.entries(timezoneCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tz, count]) => ({ timezone: tz, count }));

      return NextResponse.json({
        userTypes,
        hourlyChart,
        timezones,
        totalMessages: (segmentData || []).length,
      });
    }

    // ============================================================
    // API使用量・コスト分析
    // ============================================================
    if (tab === 'costs') {
      const { data: tokenData } = await serviceClient
        .from('concierge_messages')
        .select('input_tokens, output_tokens, created_at, user_type')
        .eq('role', 'assistant')
        .gte('created_at', startISO);

      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      const dailyCost: Record<string, { input: number; output: number; count: number }> = {};
      const typeCost: Record<string, { input: number; output: number; count: number }> = {};

      (tokenData || []).forEach((m: any) => {
        const inp = m.input_tokens || 0;
        const out = m.output_tokens || 0;
        totalInputTokens += inp;
        totalOutputTokens += out;

        const day = m.created_at.slice(0, 10);
        if (!dailyCost[day]) dailyCost[day] = { input: 0, output: 0, count: 0 };
        dailyCost[day].input += inp;
        dailyCost[day].output += out;
        dailyCost[day].count++;

        const ut = m.user_type || 'unknown';
        if (!typeCost[ut]) typeCost[ut] = { input: 0, output: 0, count: 0 };
        typeCost[ut].input += inp;
        typeCost[ut].output += out;
        typeCost[ut].count++;
      });

      const totalCostUSD =
        (totalInputTokens / 1_000_000) * HAIKU_COST.input +
        (totalOutputTokens / 1_000_000) * HAIKU_COST.output;
      const totalCostJPY = totalCostUSD * USD_TO_JPY;

      const totalConversations = (tokenData || []).length;
      const costPerConversation = totalConversations > 0 ? totalCostJPY / totalConversations : 0;

      // 日別コストチャート
      const dailyCostChart = Object.entries(dailyCost)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, d]) => {
          const cost = ((d.input / 1_000_000) * HAIKU_COST.input + (d.output / 1_000_000) * HAIKU_COST.output) * USD_TO_JPY;
          return {
            date: date.slice(5),
            cost: Math.round(cost * 100) / 100,
            conversations: d.count,
          };
        });

      // ユーザー区分別コスト
      const typeCostData = Object.entries(typeCost).map(([type, d]) => {
        const cost = ((d.input / 1_000_000) * HAIKU_COST.input + (d.output / 1_000_000) * HAIKU_COST.output) * USD_TO_JPY;
        return {
          type,
          label: { guest: '未ログイン', free: '無料', standard: 'スタンダード', business: 'ビジネス', premium: 'プレミアム' }[type] || type,
          cost: Math.round(cost * 100) / 100,
          conversations: d.count,
          inputTokens: d.input,
          outputTokens: d.output,
        };
      });

      return NextResponse.json({
        totalInputTokens,
        totalOutputTokens,
        totalCostJPY: Math.round(totalCostJPY),
        totalCostUSD: Math.round(totalCostUSD * 100) / 100,
        costPerConversation: Math.round(costPerConversation * 10) / 10,
        totalConversations,
        dailyCostChart,
        typeCostData,
      });
    }

    // ============================================================
    // 会話ログ
    // ============================================================
    if (tab === 'logs') {
      const page = parseInt(searchParams.get('page') || '0');
      const limit = 20;

      const { data: sessions, error: logsError } = await serviceClient
        .from('concierge_messages')
        .select('user_id, visitor_id, session_id, created_at, content, role, user_type')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (logsError) {
        console.error('Concierge logs query error:', logsError);
      }

      const sessionMap: Record<string, any> = {};
      (sessions || []).forEach((m: any) => {
        const key = `${m.user_id || m.visitor_id}_${m.session_id}`;
        if (!sessionMap[key]) {
          sessionMap[key] = {
            userId: m.user_id,
            visitorId: m.visitor_id,
            sessionId: m.session_id,
            userType: m.user_type || 'unknown',
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
      const userId = searchParams.get('userId');
      const visitorId = searchParams.get('visitorId');
      const sessionId = searchParams.get('sessionId');

      if (!sessionId || (!userId && !visitorId)) {
        return NextResponse.json({ error: 'sessionId and userId/visitorId required' }, { status: 400 });
      }

      let query = serviceClient
        .from('concierge_messages')
        .select('role, content, metadata, created_at, feedback')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (userId && userId !== 'null') {
        query = query.eq('user_id', userId);
      } else if (visitorId) {
        query = query.eq('visitor_id', visitorId);
      }

      const { data: messages } = await query;
      return NextResponse.json({ messages: messages || [] });
    }

    // ============================================================
    // よくある質問
    // ============================================================
    if (tab === 'questions') {
      const { data: userMessages } = await serviceClient
        .from('concierge_messages')
        .select('content')
        .eq('role', 'user')
        .gte('created_at', startISO)
        .order('created_at', { ascending: false })
        .limit(500);

      const keywordCount: Record<string, number> = {};
      const commonKeywords = [
        'LP', 'ランディングページ', 'プロフィール', '診断', 'クイズ',
        'Kindle', '本', 'セールス', 'サムネ', 'SNS', 'メルマガ',
        'ステップメール', 'ファネル', '予約', 'アンケート', '出欠',
        '料金', 'プラン', '使い方', '集客', 'ガチャ', 'ゲーム',
        'LINE', 'YouTube', 'Google', 'キーワード', 'アフィリエイト',
        'ホームページ', 'ウェビナー', 'フォーム', 'コンシェルジュ',
      ];

      (userMessages || []).forEach((m: any) => {
        commonKeywords.forEach(kw => {
          if (m.content.includes(kw)) {
            keywordCount[kw] = (keywordCount[kw] || 0) + 1;
          }
        });
      });

      const topKeywords = Object.entries(keywordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([keyword, count]) => ({ keyword, count }));

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
    console.error('Concierge analytics error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
