import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AVAILABLE_AI_MODELS } from '@/lib/ai-provider';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

type HealthStatus = 'ok' | 'warning' | 'error';
type CheckResult = {
  status: HealthStatus;
  message: string;
  details?: string[];
};

/**
 * GET: 管理者設定のヘルスチェック
 * 各設定が正しく保存・適用されているかを確認
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') || 'kdl';

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const validModelIds = new Set(AVAILABLE_AI_MODELS.map(m => m.id));

    // 1. AIモデル設定チェック
    const aiModelsCheck = await checkAIModelSettings(supabase, service, validModelIds);

    // 2. プラン設定チェック
    const planSettingsCheck = await checkPlanSettings(supabase, service);

    // 3. モニターユーザーチェック
    const monitorCheck = await checkMonitorUsers(supabase, service);

    return NextResponse.json({
      service,
      checks: {
        aiModels: aiModelsCheck,
        planSettings: planSettingsCheck,
        monitors: monitorCheck,
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Settings health check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function checkAIModelSettings(
  supabase: any,
  service: string,
  validModelIds: Set<string>
): Promise<CheckResult> {
  const { data, error } = await supabase
    .from('admin_ai_settings')
    .select('plan_tier, custom_outline_model, custom_writing_model, backup_outline_model, backup_writing_model, updated_at')
    .eq('service', service);

  if (error) {
    if (error.code === '42P01') {
      return { status: 'error', message: 'admin_ai_settingsテーブルが存在しません' };
    }
    return { status: 'error', message: `設定の取得に失敗: ${error.message}` };
  }

  if (!data || data.length === 0) {
    return { status: 'warning', message: '設定が保存されていません（デフォルト値を使用中）' };
  }

  const issues: string[] = [];
  let configuredCount = 0;

  for (const row of data) {
    configuredCount++;
    const models = [
      { name: 'アウトラインモデル', value: row.custom_outline_model },
      { name: 'ライティングモデル', value: row.custom_writing_model },
      { name: 'バックアップ(アウトライン)', value: row.backup_outline_model },
      { name: 'バックアップ(ライティング)', value: row.backup_writing_model },
    ];

    for (const model of models) {
      if (model.value && !validModelIds.has(model.value)) {
        issues.push(`${row.plan_tier}: ${model.name}「${model.value}」が無効なモデルID`);
      }
    }

    // 更新日チェック（30日以上前の場合は警告）
    if (row.updated_at) {
      const daysSinceUpdate = (Date.now() - new Date(row.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 30) {
        issues.push(`${row.plan_tier}: 30日以上前に更新（${Math.round(daysSinceUpdate)}日前）`);
      }
    }
  }

  if (issues.length > 0) {
    return {
      status: 'warning',
      message: `${configuredCount}プラン設定済み、${issues.length}件の要確認事項`,
      details: issues,
    };
  }

  return {
    status: 'ok',
    message: `${configuredCount}プラン設定済み、全モデルID有効`,
  };
}

async function checkPlanSettings(
  supabase: any,
  service: string
): Promise<CheckResult> {
  const { data, error } = await supabase
    .from('service_plans')
    .select('plan_tier, is_active, price, price_type, ai_daily_limit, ai_monthly_limit')
    .eq('service', service);

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST204') {
      return { status: 'warning', message: 'service_plansテーブルが見つかりません' };
    }
    return { status: 'error', message: `取得エラー: ${error.message}` };
  }

  if (!data || data.length === 0) {
    return { status: 'warning', message: 'プラン設定が保存されていません' };
  }

  const issues: string[] = [];
  const activePlans = data.filter(p => p.is_active);
  const inactivePlans = data.filter(p => !p.is_active);

  for (const plan of activePlans) {
    if (plan.ai_daily_limit === 0) {
      issues.push(`${plan.plan_tier}: 日次AI制限が0（AI使用不可）`);
    }
  }

  if (issues.length > 0) {
    return {
      status: 'warning',
      message: `${activePlans.length}プラン有効、${issues.length}件の要確認`,
      details: issues,
    };
  }

  return {
    status: 'ok',
    message: `${activePlans.length}プラン有効${inactivePlans.length > 0 ? `、${inactivePlans.length}プラン無効` : ''}`,
  };
}

async function checkMonitorUsers(
  supabase: any,
  service: string
): Promise<CheckResult> {
  const now = new Date().toISOString();
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('monitor_users')
    .select('id, monitor_expires_at, monitor_plan_type, service')
    .or(`service.eq.${service},service.is.null`);

  if (error) {
    if (error.code === '42P01') {
      return { status: 'warning', message: 'monitor_usersテーブルが見つかりません' };
    }
    return { status: 'error', message: `取得エラー: ${error.message}` };
  }

  if (!data || data.length === 0) {
    return { status: 'ok', message: 'モニターユーザーなし' };
  }

  const active = data.filter(m => new Date(m.monitor_expires_at) > new Date(now));
  const expiringSoon = active.filter(m => new Date(m.monitor_expires_at) < new Date(sevenDaysLater));
  const expired = data.filter(m => new Date(m.monitor_expires_at) <= new Date(now));

  const details: string[] = [];
  if (expiringSoon.length > 0) {
    details.push(`${expiringSoon.length}件が7日以内に期限切れ`);
  }
  if (expired.length > 0) {
    details.push(`${expired.length}件が期限切れ（未削除）`);
  }

  if (expiringSoon.length > 0) {
    return {
      status: 'warning',
      message: `${active.length}件有効、${expiringSoon.length}件が期限切れ間近`,
      details,
    };
  }

  return {
    status: 'ok',
    message: `${active.length}件有効`,
    details: details.length > 0 ? details : undefined,
  };
}
