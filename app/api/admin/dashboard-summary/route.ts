import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

/**
 * GET: 管理者ダッシュボード要約データ
 * 全管理セクションの概要を1回のAPIコールで返す
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') || 'makers';

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 全クエリを並列実行
    const [
      usersResult,
      partnersResult,
      newUsersResult,
      announcementsResult,
      activeAnnouncementsResult,
      monitorsResult,
      affiliatesResult,
      conversionsResult,
    ] = await Promise.all([
      // ユーザー総数
      supabase.from('user_roles').select('user_id', { count: 'exact', head: true }),
      // パートナー数
      supabase.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('is_partner', true),
      // 過去7日の新規登録（user_rolesテーブルではなくauth.usersが必要だが、RPC経由でないとアクセスできないため、user_rolesのcreated_atで代替しない。代わりにRPCを使用）
      supabase.rpc('get_all_users_with_roles_paginated', { p_page: 1, p_per_page: 1 }),
      // お知らせ総数
      supabase.from('announcements').select('id', { count: 'exact', head: true }),
      // アクティブお知らせ数
      supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('is_active', true),
      // モニターユーザー
      supabase.from('monitor_users').select('id, monitor_expires_at').or(`service.eq.${service},service.is.null`),
      // アフィリエイト
      supabase.from('affiliates').select('id, status', { count: 'exact' }),
      // 今月のアフィリエイトコンバージョン
      supabase.from('affiliate_conversions')
        .select('commission_amount, status')
        .gte('converted_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

    // ユーザー統計
    const totalUsers = usersResult.count || 0;
    const totalPartners = partnersResult.count || 0;
    // 新規ユーザー数はRPCの結果からtotal_countを取得
    const userTotalCount = (newUsersResult.data && newUsersResult.data.length > 0)
      ? Number(newUsersResult.data[0].total_count) || 0
      : totalUsers;

    // お知らせ統計
    const totalAnnouncements = announcementsResult.count || 0;
    const activeAnnouncements = activeAnnouncementsResult.count || 0;

    // モニター統計
    const now = new Date();
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const monitors = monitorsResult.data || [];
    const activeMonitors = monitors.filter(m => new Date(m.monitor_expires_at) > now);
    const expiringMonitors = activeMonitors.filter(m => new Date(m.monitor_expires_at) < sevenDaysLater);
    const expiredMonitors = monitors.filter(m => new Date(m.monitor_expires_at) <= now);

    // 設定ヘルスチェック（簡易版）
    const healthChecks = await getHealthSummary(supabase, service);

    // アフィリエイト統計
    const affiliatesData = affiliatesResult.data || [];
    const totalAffiliates = affiliatesResult.count || 0;
    const activeAffiliates = affiliatesData.filter((a: any) => a.status === 'active').length;
    const conversionsData = conversionsResult.data || [];
    const thisMonthEarnings = conversionsData
      .filter((c: any) => c.status === 'confirmed' || c.status === 'paid')
      .reduce((sum: number, c: any) => sum + (Number(c.commission_amount) || 0), 0);
    const thisMonthConversions = conversionsData.length;

    return NextResponse.json({
      users: {
        total: userTotalCount,
        partners: totalPartners,
      },
      announcements: {
        total: totalAnnouncements,
        active: activeAnnouncements,
      },
      monitors: {
        active: activeMonitors.length,
        expiringSoon: expiringMonitors.length,
        expired: expiredMonitors.length,
      },
      health: healthChecks,
      affiliate: {
        totalAffiliates,
        activeAffiliates,
        thisMonthEarnings: Math.round(thisMonthEarnings),
        thisMonthConversions,
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getHealthSummary(supabase: any, service: string) {
  try {
    const { AVAILABLE_AI_MODELS } = await import('@/lib/ai-provider');
    const validModelIds = new Set(AVAILABLE_AI_MODELS.map((m: any) => m.id));

    const [aiSettingsResult, planSettingsResult] = await Promise.all([
      supabase.from('admin_ai_settings')
        .select('plan_tier, custom_outline_model, custom_writing_model, backup_outline_model, backup_writing_model')
        .eq('service', service),
      supabase.from('service_plans')
        .select('plan_tier, is_active, daily_ai_limit')
        .eq('service', service),
    ]);

    // AIモデル設定チェック
    let aiModelsStatus: 'ok' | 'warning' | 'error' = 'ok';
    const aiData = aiSettingsResult.data || [];
    if (aiData.length === 0) {
      aiModelsStatus = 'warning';
    } else {
      for (const row of aiData) {
        const models = [row.custom_outline_model, row.custom_writing_model, row.backup_outline_model, row.backup_writing_model];
        for (const modelId of models) {
          if (modelId && !validModelIds.has(modelId)) {
            aiModelsStatus = 'warning';
            break;
          }
        }
        if (aiModelsStatus !== 'ok') break;
      }
    }

    // プラン設定チェック
    let planSettingsStatus: 'ok' | 'warning' | 'error' = 'ok';
    const planData = planSettingsResult.data || [];
    if (planData.length === 0) {
      planSettingsStatus = 'warning';
    } else {
      const activePlans = planData.filter((p: any) => p.is_active);
      for (const plan of activePlans) {
        if (plan.daily_ai_limit === 0) {
          planSettingsStatus = 'warning';
          break;
        }
      }
    }

    const overall: 'ok' | 'warning' | 'error' =
      (aiModelsStatus === 'warning' || planSettingsStatus === 'warning') ? 'warning' : 'ok';

    return { overall, aiModels: aiModelsStatus, planSettings: planSettingsStatus };
  } catch {
    return { overall: 'warning' as const, aiModels: 'warning' as const, planSettings: 'warning' as const };
  }
}
