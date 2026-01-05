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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // アクティブなサブスクリプション一覧を取得
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status, period, amount, plan_name, next_payment_date, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (subError) {
      throw subError;
    }

    // ユーザーIDを抽出
    const userIds = subscriptions?.map((s) => s.user_id).filter(Boolean) || [];

    // ユーザー情報を取得（auth.usersから）
    let usersMap: Record<string, string> = {};
    if (userIds.length > 0) {
      // Supabase Admin APIでユーザーメールを取得
      for (const userId of userIds) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(userId);
          if (userData?.user?.email) {
            usersMap[userId] = userData.user.email;
          }
        } catch (e) {
          // 取得できない場合はスキップ
        }
      }
    }

    // 各ユーザーのAI使用量を取得
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const usagePromises = userIds.map(async (userId) => {
      // 今日の使用量
      const { count: dailyCount } = await supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      // 今月の使用量
      const { count: monthlyCount } = await supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', firstDayOfMonth.toISOString());

      // 総推定コスト
      const { data: costData } = await supabase
        .from('ai_usage_logs')
        .select('estimated_cost_jpy')
        .eq('user_id', userId);

      const totalCost = costData?.reduce((sum, item) => sum + (item.estimated_cost_jpy || 0), 0) || 0;

      return {
        userId,
        dailyUsage: dailyCount || 0,
        monthlyUsage: monthlyCount || 0,
        totalCost,
      };
    });

    const usageData = await Promise.all(usagePromises);
    const usageMap: Record<string, any> = {};
    usageData.forEach((data) => {
      usageMap[data.userId] = data;
    });

    // サブスクリプションデータにユーザー情報と使用量を追加
    const enrichedSubscriptions = subscriptions?.map((sub) => ({
      ...sub,
      email: usersMap[sub.user_id] || 'Unknown',
      usage: usageMap[sub.user_id] || { dailyUsage: 0, monthlyUsage: 0, totalCost: 0 },
    })) || [];

    // 全体統計も取得
    const { count: totalSubscribers } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: monthlyPlanCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('period', 'monthly');

    const { count: yearlyPlanCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('period', 'yearly');

    // 今月の総AI使用量
    const { count: totalMonthlyAIUsage } = await supabase
      .from('ai_usage_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    // 今月の総推定コスト
    const { data: allCostData } = await supabase
      .from('ai_usage_logs')
      .select('estimated_cost_jpy')
      .gte('created_at', firstDayOfMonth.toISOString());

    const totalMonthlyCost = allCostData?.reduce((sum, item) => sum + (item.estimated_cost_jpy || 0), 0) || 0;

    return NextResponse.json({
      subscribers: enrichedSubscriptions,
      stats: {
        totalSubscribers: totalSubscribers || 0,
        monthlyPlanCount: monthlyPlanCount || 0,
        yearlyPlanCount: yearlyPlanCount || 0,
        totalMonthlyAIUsage: totalMonthlyAIUsage || 0,
        totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error('Get KDL subscribers error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscribers' },
      { status: 500 }
    );
  }
}

