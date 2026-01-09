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

// プランTierの表示名
const PLAN_TIER_LABELS: Record<string, string> = {
  none: '無料',
  lite: 'ライト',
  standard: 'スタンダード',
  pro: 'プロ',
  business: 'ビジネス',
  enterprise: 'エンタープライズ',
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

    // まずkdl_subscriptionsテーブルを試す（新テーブル）
    let subscriptions: any[] = [];
    let useNewTable = true;

    const { data: kdlSubs, error: kdlError } = await supabase
      .from('kdl_subscriptions')
      .select('id, user_id, status, period, amount, plan_tier, plan_name, email, current_period_end, next_payment_date, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (kdlError) {
      // kdl_subscriptionsテーブルがない場合、旧subscriptionsテーブルにフォールバック
      console.log('kdl_subscriptions not found, falling back to subscriptions table');
      useNewTable = false;
      
      const { data: oldSubs, error: oldError } = await supabase
        .from('subscriptions')
        .select('id, user_id, status, period, amount, plan_name, next_payment_date, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (oldError) {
        throw oldError;
      }

      // 旧テーブルのデータにplan_tierを推定して追加
      subscriptions = (oldSubs || []).map((sub) => ({
        ...sub,
        plan_tier: inferPlanTier(sub.amount, sub.period),
      }));
    } else {
      subscriptions = kdlSubs || [];
    }

    // ユーザーIDを抽出
    const userIds = subscriptions.map((s) => s.user_id).filter(Boolean);

    // ユーザー情報を取得（auth.usersから）
    let usersMap: Record<string, string> = {};
    if (userIds.length > 0) {
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
    const enrichedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      email: sub.email || usersMap[sub.user_id] || 'Unknown',
      plan_tier_label: PLAN_TIER_LABELS[sub.plan_tier] || sub.plan_tier,
      usage: usageMap[sub.user_id] || { dailyUsage: 0, monthlyUsage: 0, totalCost: 0 },
    }));

    // 統計を取得（新テーブル or 旧テーブル）
    const tableName = useNewTable ? 'kdl_subscriptions' : 'subscriptions';

    // 総加入者数
    const { count: totalSubscribers } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    // 月額/年間プラン数
    const { count: monthlyPlanCount } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('period', 'monthly');

    const { count: yearlyPlanCount } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('period', 'yearly');

    // プランTier別の統計（新テーブルのみ）
    let tierStats: Record<string, number> = {
      lite: 0,
      standard: 0,
      pro: 0,
      business: 0,
      enterprise: 0,
    };

    if (useNewTable) {
      for (const tier of Object.keys(tierStats)) {
        const { count } = await supabase
          .from('kdl_subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('plan_tier', tier);
        tierStats[tier] = count || 0;
      }
    } else {
      // 旧テーブルの場合は金額から推定
      subscriptions.forEach((sub) => {
        const tier = sub.plan_tier;
        if (tier && tierStats[tier] !== undefined) {
          tierStats[tier]++;
        }
      });
    }

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

    // 月間収益予測（アクティブなサブスクリプションの月額換算合計）
    let monthlyRevenue = 0;
    subscriptions.forEach((sub) => {
      if (sub.period === 'yearly') {
        monthlyRevenue += (sub.amount || 0) / 12;
      } else {
        monthlyRevenue += sub.amount || 0;
      }
    });

    return NextResponse.json({
      subscribers: enrichedSubscriptions,
      stats: {
        totalSubscribers: totalSubscribers || 0,
        monthlyPlanCount: monthlyPlanCount || 0,
        yearlyPlanCount: yearlyPlanCount || 0,
        tierStats,
        totalMonthlyAIUsage: totalMonthlyAIUsage || 0,
        totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue),
      },
      useNewTable,
    });
  } catch (error: any) {
    console.error('Get KDL subscribers error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscribers' },
      { status: 500 }
    );
  }
}

// 金額からプランTierを推定（旧テーブル用）
function inferPlanTier(amount: number, period: string): string {
  if (period === 'yearly') {
    if (amount <= 29800) return 'lite';
    if (amount <= 49800) return 'standard';
    if (amount <= 98000) return 'pro';
    return 'business';
  } else {
    if (amount <= 2980) return 'lite';
    if (amount <= 4980) return 'standard';
    if (amount <= 9800) return 'pro';
    return 'business';
  }
}
