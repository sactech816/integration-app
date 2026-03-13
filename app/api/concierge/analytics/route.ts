/**
 * コンシェルジュ分析 API
 * GET /api/concierge/analytics?range=7|30&tab=overview|logs|questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getAdminEmails } from '@/lib/constants';
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

    // 管理者チェック
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

    if (tab === 'overview') {
      // 概要: 統計サマリー + 日別チャート
      const [
        { count: totalMessages },
        { count: totalUsers },
        { count: periodMessages },
        { data: dailyData },
      ] = await Promise.all([
        serviceClient
          .from('concierge_messages')
          .select('id', { count: 'exact', head: true }),
        serviceClient
          .from('concierge_messages')
          .select('user_id', { count: 'exact', head: true })
          .eq('role', 'user'),
        serviceClient
          .from('concierge_messages')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startISO),
        serviceClient
          .from('concierge_messages')
          .select('created_at, role')
          .gte('created_at', startISO)
          .order('created_at', { ascending: true }),
      ]);

      // 日別集計
      const dailyMap: Record<string, { user: number; assistant: number }> = {};
      (dailyData || []).forEach((m: any) => {
        const day = m.created_at.slice(0, 10);
        if (!dailyMap[day]) dailyMap[day] = { user: 0, assistant: 0 };
        dailyMap[day][m.role as 'user' | 'assistant']++;
      });

      const dailyChart = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({
          date: date.slice(5), // MM-DD
          messages: counts.user,
          responses: counts.assistant,
        }));

      // ユニークユーザー数を取得
      const { data: uniqueUsers } = await serviceClient
        .from('concierge_messages')
        .select('user_id')
        .eq('role', 'user');
      const uniqueUserCount = new Set((uniqueUsers || []).map((u: any) => u.user_id)).size;

      return NextResponse.json({
        totalMessages: totalMessages || 0,
        uniqueUsers: uniqueUserCount,
        periodMessages: periodMessages || 0,
        dailyChart,
      });
    }

    if (tab === 'logs') {
      // 会話ログ: セッション一覧
      const page = parseInt(searchParams.get('page') || '0');
      const limit = 20;

      const { data: sessions } = await serviceClient
        .from('concierge_messages')
        .select('user_id, session_id, created_at, content, role')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // セッションごとにグループ化
      const sessionMap: Record<string, any> = {};
      (sessions || []).forEach((m: any) => {
        const key = `${m.user_id}_${m.session_id}`;
        if (!sessionMap[key]) {
          sessionMap[key] = {
            userId: m.user_id,
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

    if (tab === 'session') {
      // 特定セッションの全メッセージ
      const userId = searchParams.get('userId');
      const sessionId = searchParams.get('sessionId');
      if (!userId || !sessionId) {
        return NextResponse.json({ error: 'userId and sessionId required' }, { status: 400 });
      }

      const { data: messages } = await serviceClient
        .from('concierge_messages')
        .select('role, content, metadata, created_at')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      return NextResponse.json({ messages: messages || [] });
    }

    if (tab === 'questions') {
      // よくある質問分析: ユーザーメッセージの頻度分析
      const { data: userMessages } = await serviceClient
        .from('concierge_messages')
        .select('content')
        .eq('role', 'user')
        .gte('created_at', startISO)
        .order('created_at', { ascending: false })
        .limit(500);

      // 簡易的なキーワード頻度分析
      const keywordCount: Record<string, number> = {};
      const commonKeywords = [
        'LP', 'ランディングページ', 'プロフィール', '診断', 'クイズ',
        'Kindle', '本', 'セールス', 'サムネ', 'SNS', 'メルマガ',
        'ステップメール', 'ファネル', '予約', 'アンケート', '出欠',
        '料金', 'プラン', '使い方', '集客', 'ガチャ', 'ゲーム',
        'LINE', 'YouTube', 'Google', 'キーワード', 'アフィリエイト',
        'ホームページ', 'ウェビナー', 'フォーム',
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

      // よくある質問（上位20件）
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
