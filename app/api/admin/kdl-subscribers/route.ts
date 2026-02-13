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
  initial_trial: '初回トライアル',
  initial_standard: '初回スタンダード',
  initial_business: '初回ビジネス',
};

// モデル名からプロバイダーを判定
function getProviderFromModel(modelName: string): 'gemini' | 'openai' | 'claude' | 'unknown' {
  if (!modelName) return 'unknown';
  const lower = modelName.toLowerCase();
  if (lower.includes('gemini')) return 'gemini';
  if (lower.includes('gpt') || lower.includes('o1') || lower.includes('o3')) return 'openai';
  if (lower.includes('claude') || lower.includes('haiku') || lower.includes('sonnet') || lower.includes('opus')) return 'claude';
  return 'unknown';
}

// アクションタイプの表示名
const ACTION_TYPE_LABELS: Record<string, string> = {
  generate_title: 'タイトル生成',
  generate_toc: '目次生成',
  generate_chapters: '目次生成',
  recommend_pattern: 'パターン推薦',
  generate_section: '執筆',
  rewrite: '書き直し',
};

// モデル別・アクション別使用統計の型
interface ModelUsageStats {
  gemini: number;
  openai: number;
  claude: number;
  unknown: number;
}

interface ActionUsageStats {
  generate_title: number;
  generate_toc: number;
  generate_chapters: number;
  generate_section: number;
  rewrite: number;
  other: number;
}

interface ModelCostStats {
  gemini: number;
  openai: number;
  claude: number;
}

interface DetailedUsageStats {
  byModel: ModelUsageStats;
  byAction: ActionUsageStats;
  byModelCost: ModelCostStats;
  actionModelBreakdown: Record<string, ModelUsageStats>;
}

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

    // モニターユーザーを取得（アクティブなもののみ）
    const now = new Date().toISOString();
    const { data: monitorUsers, error: monitorError } = await supabase
      .from('monitor_users')
      .select('id, user_id, admin_user_id, monitor_plan_type, monitor_start_at, monitor_expires_at, notes, service, created_at')
      .eq('service', 'kdl')
      .gt('monitor_expires_at', now)
      .order('created_at', { ascending: false });

    if (monitorError) {
      console.log('monitor_users fetch error (non-critical):', monitorError);
    }

    // 重複ユーザーの処理（購読者かつモニターの場合）
    const subscriberUserIds = new Set(subscriptions.map((s: any) => s.user_id));
    const monitorOnlyUsers = (monitorUsers || []).filter(
      (m: any) => !subscriberUserIds.has(m.user_id)
    );
    const dualUserMonitorMap = new Map(
      (monitorUsers || [])
        .filter((m: any) => subscriberUserIds.has(m.user_id))
        .map((m: any) => [m.user_id, m])
    );

    // ユーザーIDを抽出（購読者 + モニター専用ユーザー）
    const subscriptionUserIds = subscriptions.map((s: any) => s.user_id).filter(Boolean);
    const monitorOnlyUserIds = monitorOnlyUsers.map((m: any) => m.user_id).filter(Boolean);
    const userIds = [...new Set([...subscriptionUserIds, ...monitorOnlyUserIds])];

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

      // 今月の詳細使用ログを取得（モデル別・アクション別統計用）
      const { data: monthlyLogs } = await supabase
        .from('ai_usage_logs')
        .select('model_used, action_type, estimated_cost_jpy')
        .eq('user_id', userId)
        .gte('created_at', firstDayOfMonth.toISOString());

      // モデル別使用回数を集計
      const byModel: ModelUsageStats = { gemini: 0, openai: 0, claude: 0, unknown: 0 };
      const byAction: ActionUsageStats = { 
        generate_title: 0, 
        generate_toc: 0, 
        generate_chapters: 0, 
        generate_section: 0, 
        rewrite: 0, 
        other: 0 
      };
      const byModelCost: ModelCostStats = { gemini: 0, openai: 0, claude: 0 };
      const actionModelBreakdown: Record<string, ModelUsageStats> = {};

      (monthlyLogs || []).forEach((log) => {
        const provider = getProviderFromModel(log.model_used);
        byModel[provider]++;
        
        // コスト集計
        if (provider !== 'unknown' && log.estimated_cost_jpy) {
          byModelCost[provider] += log.estimated_cost_jpy;
        }

        // アクション別集計
        const actionType = log.action_type || 'other';
        if (actionType in byAction) {
          byAction[actionType as keyof ActionUsageStats]++;
        } else {
          byAction.other++;
        }

        // アクション×モデルの内訳
        if (!actionModelBreakdown[actionType]) {
          actionModelBreakdown[actionType] = { gemini: 0, openai: 0, claude: 0, unknown: 0 };
        }
        actionModelBreakdown[actionType][provider]++;
      });

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
        detailedStats: {
          byModel,
          byAction,
          byModelCost,
          actionModelBreakdown,
        } as DetailedUsageStats,
      };
    });

    const usageData = await Promise.all(usagePromises);
    const usageMap: Record<string, any> = {};
    usageData.forEach((data) => {
      usageMap[data.userId] = data;
    });

    // サブスクリプションデータにユーザー情報と使用量を追加（モニターフラグ含む）
    const enrichedSubscriptions = subscriptions.map((sub: any) => {
      const monitorInfo = dualUserMonitorMap.get(sub.user_id);
      return {
        ...sub,
        email: sub.email || usersMap[sub.user_id] || 'Unknown',
        plan_tier_label: PLAN_TIER_LABELS[sub.plan_tier] || sub.plan_tier,
        usage: usageMap[sub.user_id] || { dailyUsage: 0, monthlyUsage: 0, totalCost: 0 },
        is_monitor: !!monitorInfo,
        monitor_expires_at: monitorInfo?.monitor_expires_at || null,
        monitor_notes: monitorInfo?.notes || null,
      };
    });

    // モニター専用ユーザーをSubscriber互換フォーマットに変換
    const monitorSubscribers = monitorOnlyUsers.map((m: any) => ({
      id: `monitor-${m.id}`,
      user_id: m.user_id,
      email: usersMap[m.user_id] || 'Unknown',
      status: 'monitor',
      period: 'monthly',
      amount: 0,
      plan_tier: m.monitor_plan_type,
      plan_tier_label: PLAN_TIER_LABELS[m.monitor_plan_type] || m.monitor_plan_type,
      plan_name: `モニター (${PLAN_TIER_LABELS[m.monitor_plan_type] || m.monitor_plan_type})`,
      current_period_end: m.monitor_expires_at,
      next_payment_date: null,
      created_at: m.created_at,
      usage: usageMap[m.user_id] || { dailyUsage: 0, monthlyUsage: 0, totalCost: 0 },
      is_monitor: true,
      monitor_expires_at: m.monitor_expires_at,
      monitor_notes: m.notes,
    }));

    // 購読者とモニター専用ユーザーを統合
    const allSubscribers = [...enrichedSubscriptions, ...monitorSubscribers];

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

    // 今月の全使用ログを取得（全体統計用）
    const { data: allMonthlyLogs } = await supabase
      .from('ai_usage_logs')
      .select('model_used, action_type, estimated_cost_jpy')
      .gte('created_at', firstDayOfMonth.toISOString());

    // 全体のモデル別・アクション別統計を集計
    const globalByModel: ModelUsageStats = { gemini: 0, openai: 0, claude: 0, unknown: 0 };
    const globalByAction: ActionUsageStats = { 
      generate_title: 0, 
      generate_toc: 0, 
      generate_chapters: 0, 
      generate_section: 0, 
      rewrite: 0, 
      other: 0 
    };
    const globalByModelCost: ModelCostStats = { gemini: 0, openai: 0, claude: 0 };

    let totalMonthlyCost = 0;
    (allMonthlyLogs || []).forEach((log) => {
      const provider = getProviderFromModel(log.model_used);
      globalByModel[provider]++;
      
      if (log.estimated_cost_jpy) {
        totalMonthlyCost += log.estimated_cost_jpy;
        if (provider !== 'unknown') {
          globalByModelCost[provider] += log.estimated_cost_jpy;
        }
      }

      const actionType = log.action_type || 'other';
      if (actionType in globalByAction) {
        globalByAction[actionType as keyof ActionUsageStats]++;
      } else {
        globalByAction.other++;
      }
    });

    // 月間収益予測（アクティブなサブスクリプションの月額換算合計）
    let monthlyRevenue = 0;
    subscriptions.forEach((sub) => {
      if (sub.period === 'yearly') {
        monthlyRevenue += (sub.amount || 0) / 12;
      } else {
        monthlyRevenue += sub.amount || 0;
      }
    });

    // モニターユーザー統計
    const activeMonitorCount = monitorOnlyUsers.length + dualUserMonitorMap.size;

    return NextResponse.json({
      subscribers: allSubscribers,
      stats: {
        totalSubscribers: totalSubscribers || 0,
        monthlyPlanCount: monthlyPlanCount || 0,
        yearlyPlanCount: yearlyPlanCount || 0,
        tierStats,
        totalMonthlyAIUsage: totalMonthlyAIUsage || 0,
        totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue),
        activeMonitorCount,
        // 新規追加: モデル別・アクション別統計
        modelUsageStats: globalByModel,
        actionUsageStats: globalByAction,
        modelCostStats: {
          gemini: Math.round(globalByModelCost.gemini * 100) / 100,
          openai: Math.round(globalByModelCost.openai * 100) / 100,
          claude: Math.round(globalByModelCost.claude * 100) / 100,
        },
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
