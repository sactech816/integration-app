import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

/**
 * GET: ユーザー詳細情報取得（管理者用）
 * 複数テーブルからデータを集約して返す
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 管理者認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // トークンからユーザー情報を取得してadminチェック
    const { createClient: createAuthClient } = await import('@supabase/supabase-js');
    const authClient = createAuthClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user: authUser } } = await authClient.auth.getUser(token);

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email: string) => authUser.email?.toLowerCase() === email.toLowerCase()
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 並列でデータ取得
    const [
      userResult,
      rolesResult,
      pointsResult,
      makersSubResult,
      kdlSubResult,
      monitorResult,
      aiUsageResult,
      contentCountsResult,
      kdlBooksResult,
    ] = await Promise.all([
      // 基本ユーザー情報
      supabase.auth.admin.getUserById(userId),
      // ロール情報
      supabase.from('user_roles').select('*').eq('user_id', userId).maybeSingle(),
      // ポイント残高
      supabase.rpc('get_user_point_balance', { p_user_id: userId, p_session_id: null }),
      // Makersサブスクリプション
      supabase.from('subscriptions').select('*').eq('user_id', userId).eq('service', 'makers').order('created_at', { ascending: false }).limit(5),
      // KDLサブスクリプション
      supabase.from('subscriptions').select('*').eq('user_id', userId).eq('service', 'kdl').order('created_at', { ascending: false }).limit(5),
      // モニター状態
      supabase.from('monitor_users').select('*').eq('user_id', userId),
      // AI使用量（直近30日）
      supabase.from('ai_usage_logs')
        .select('model, action_type, input_tokens, output_tokens, estimated_cost_jpy, created_at, service')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(200),
      // コンテンツ数（各テーブルのカウント）
      Promise.all([
        supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('business_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('sales_letters').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]),
      // KDL書籍
      supabase.from('kdl_books').select('id, title, status, progress, created_at, updated_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    ]);

    // ユーザー基本情報
    const user = userResult.data?.user;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // AI使用量の集計
    const aiLogs = aiUsageResult.data || [];
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const aiUsage = {
      daily: aiLogs.filter(log => log.created_at?.startsWith(today)).length,
      monthly: aiLogs.length,
      totalCostJpy: aiLogs.reduce((sum, log) => sum + (log.estimated_cost_jpy || 0), 0),
      byModel: Object.entries(
        aiLogs.reduce((acc: Record<string, { count: number; cost: number }>, log) => {
          const model = log.model || 'unknown';
          if (!acc[model]) acc[model] = { count: 0, cost: 0 };
          acc[model].count++;
          acc[model].cost += log.estimated_cost_jpy || 0;
          return acc;
        }, {})
      ).map(([model, stats]) => ({ model, ...stats })),
      byAction: Object.entries(
        aiLogs.reduce((acc: Record<string, number>, log) => {
          const action = log.action_type || 'unknown';
          acc[action] = (acc[action] || 0) + 1;
          return acc;
        }, {})
      ).map(([action, count]) => ({ action, count })),
      byService: Object.entries(
        aiLogs.reduce((acc: Record<string, number>, log) => {
          const service = log.service || 'unknown';
          acc[service] = (acc[service] || 0) + 1;
          return acc;
        }, {})
      ).map(([service, count]) => ({ service, count })),
    };

    // コンテンツ数
    const [quizzes, profiles, businessProjects, salesLetters] = contentCountsResult;
    const content = {
      quizCount: quizzes.count || 0,
      profileCount: profiles.count || 0,
      businessCount: businessProjects.count || 0,
      salesLetterCount: salesLetters.count || 0,
      kdlBooks: (kdlBooksResult.data || []).map(book => ({
        id: book.id,
        title: book.title,
        status: book.status,
        progress: book.progress,
        createdAt: book.created_at,
        updatedAt: book.updated_at,
      })),
    };

    // ポイント情報
    const pointData = pointsResult.data?.[0];
    const points = {
      current: pointData?.current_points || 0,
      accumulated: pointData?.total_accumulated_points || 0,
    };

    // サブスクリプション情報
    const subscriptions = {
      makers: (makersSubResult.data || []).map(sub => ({
        id: sub.id,
        planTier: sub.plan_tier,
        status: sub.status,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        createdAt: sub.created_at,
      })),
      kdl: (kdlSubResult.data || []).map(sub => ({
        id: sub.id,
        planTier: sub.plan_tier,
        status: sub.status,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        createdAt: sub.created_at,
      })),
    };

    // モニター情報
    const monitors = (monitorResult.data || []).map(mon => ({
      id: mon.id,
      service: mon.service,
      planType: mon.monitor_plan_type,
      startAt: mon.monitor_start_at,
      expiresAt: mon.monitor_expires_at,
      notes: mon.notes,
      isActive: new Date(mon.monitor_expires_at) > new Date(),
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        isPartner: rolesResult.data?.is_partner || false,
        partnerSince: rolesResult.data?.partner_since,
        partnerNote: rolesResult.data?.partner_note,
      },
      subscriptions,
      monitors,
      aiUsage,
      points,
      content,
    });
  } catch (error) {
    console.error('GET user detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
