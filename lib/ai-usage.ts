/**
 * AI使用量管理ユーティリティ
 * リミットチェック・使用量ログ記録
 */

import { createClient } from '@supabase/supabase-js';
import { PlanTier, PLAN_DEFINITIONS } from './subscription';

// サーバーサイド用Supabaseクライアント（service role key使用）
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// プランTier別のAI制限を取得
export function getAILimitsForPlan(planTier: PlanTier): { daily: number; monthly: number } {
  const plan = PLAN_DEFINITIONS[planTier];
  return {
    daily: plan.dailyAILimit,
    monthly: plan.monthlyAILimit,
  };
}

// 環境変数ベースのデフォルト設定（DBがない場合のフォールバック）
// レガシー互換のため残す
const DEFAULT_LIMITS = {
  daily: {
    default: parseInt(process.env.AI_DAILY_LIMIT_DEFAULT || '50', 10),
    monthly_plan: parseInt(process.env.AI_DAILY_LIMIT_MONTHLY || '50', 10),
    yearly_plan: parseInt(process.env.AI_DAILY_LIMIT_YEARLY || '100', 10),
  },
  monthly: {
    default: parseInt(process.env.AI_MONTHLY_LIMIT_DEFAULT || '500', 10),
    monthly_plan: parseInt(process.env.AI_MONTHLY_LIMIT_MONTHLY || '500', 10),
    yearly_plan: parseInt(process.env.AI_MONTHLY_LIMIT_YEARLY || '-1', 10), // -1 = 無制限
  },
};

// プランTier別のデフォルト制限
const PLAN_TIER_LIMITS: Record<PlanTier, { daily: number; monthly: number }> = {
  none: { daily: 3, monthly: 10 },
  lite: { daily: 20, monthly: 300 },
  standard: { daily: 50, monthly: 500 },
  pro: { daily: 100, monthly: 1000 },
  business: { daily: -1, monthly: -1 }, // 無制限
  enterprise: { daily: -1, monthly: -1 }, // 無制限
};

export interface UsageCheckResult {
  dailyUsage: number;
  monthlyUsage: number;
  dailyLimit: number;
  monthlyLimit: number;
  isWithinLimit: boolean;
  remainingDaily: number;
  remainingMonthly: number;
  planTier?: PlanTier;
}

export interface LogAIUsageParams {
  userId: string;
  actionType: string;
  service?: string;
  modelUsed?: string;
  inputTokens?: number;
  outputTokens?: number;
  metadata?: Record<string, any>;
}

/**
 * ユーザーのAI使用量リミットをチェック
 */
export async function checkAIUsageLimit(userId: string): Promise<UsageCheckResult> {
  const supabase = getServiceClient();

  // Supabaseがない場合は常に許可（開発環境用）
  if (!supabase) {
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: DEFAULT_LIMITS.daily.default,
      monthlyLimit: DEFAULT_LIMITS.monthly.default,
      isWithinLimit: true,
      remainingDaily: DEFAULT_LIMITS.daily.default,
      remainingMonthly: DEFAULT_LIMITS.monthly.default,
    };
  }

  try {
    // RPC関数を呼び出し
    const { data, error } = await supabase.rpc('check_ai_usage_limit', {
      check_user_id: userId,
    });

    if (error) {
      console.error('Failed to check AI usage limit:', error);
      // エラー時はデフォルト値で許可
      return {
        dailyUsage: 0,
        monthlyUsage: 0,
        dailyLimit: DEFAULT_LIMITS.daily.default,
        monthlyLimit: DEFAULT_LIMITS.monthly.default,
        isWithinLimit: true,
        remainingDaily: DEFAULT_LIMITS.daily.default,
        remainingMonthly: DEFAULT_LIMITS.monthly.default,
      };
    }

    if (!data || data.length === 0) {
      // データがない場合はデフォルトで許可
      return {
        dailyUsage: 0,
        monthlyUsage: 0,
        dailyLimit: DEFAULT_LIMITS.daily.default,
        monthlyLimit: DEFAULT_LIMITS.monthly.default,
        isWithinLimit: true,
        remainingDaily: DEFAULT_LIMITS.daily.default,
        remainingMonthly: DEFAULT_LIMITS.monthly.default,
      };
    }

    const result = data[0];
    const monthlyLimit = result.monthly_limit === -1 ? Infinity : result.monthly_limit;

    return {
      dailyUsage: result.daily_usage,
      monthlyUsage: result.monthly_usage,
      dailyLimit: result.daily_limit,
      monthlyLimit: result.monthly_limit,
      isWithinLimit: result.is_within_limit,
      remainingDaily: Math.max(0, result.daily_limit - result.daily_usage),
      remainingMonthly: result.monthly_limit === -1 
        ? Infinity 
        : Math.max(0, result.monthly_limit - result.monthly_usage),
      planTier: result.plan_tier || undefined,
    };
  } catch (err) {
    console.error('Error checking AI usage limit:', err);
    // エラー時は許可（サービス継続優先）
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: DEFAULT_LIMITS.daily.default,
      monthlyLimit: DEFAULT_LIMITS.monthly.default,
      isWithinLimit: true,
      remainingDaily: DEFAULT_LIMITS.daily.default,
      remainingMonthly: DEFAULT_LIMITS.monthly.default,
    };
  }
}

/**
 * プランTierを指定してAI使用量リミットをチェック
 */
export async function checkAIUsageLimitByPlanTier(
  userId: string, 
  planTier: PlanTier
): Promise<UsageCheckResult> {
  const supabase = getServiceClient();
  const limits = PLAN_TIER_LIMITS[planTier];

  // Supabaseがない場合は常に許可（開発環境用）
  if (!supabase) {
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: limits.daily,
      monthlyLimit: limits.monthly,
      isWithinLimit: true,
      remainingDaily: limits.daily === -1 ? Infinity : limits.daily,
      remainingMonthly: limits.monthly === -1 ? Infinity : limits.monthly,
      planTier,
    };
  }

  try {
    // 今日の使用量を取得
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyData, error: dailyError } = await supabase
      .from('ai_usage_logs')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);

    // 今月の使用量を取得
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('ai_usage_logs')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString());

    const dailyUsage = dailyError ? 0 : (dailyData?.length || 0);
    const monthlyUsage = monthlyError ? 0 : (monthlyData?.length || 0);

    // 無制限の場合
    const dailyLimit = limits.daily;
    const monthlyLimit = limits.monthly;

    const isWithinDailyLimit = dailyLimit === -1 || dailyUsage < dailyLimit;
    const isWithinMonthlyLimit = monthlyLimit === -1 || monthlyUsage < monthlyLimit;

    return {
      dailyUsage,
      monthlyUsage,
      dailyLimit,
      monthlyLimit,
      isWithinLimit: isWithinDailyLimit && isWithinMonthlyLimit,
      remainingDaily: dailyLimit === -1 ? Infinity : Math.max(0, dailyLimit - dailyUsage),
      remainingMonthly: monthlyLimit === -1 ? Infinity : Math.max(0, monthlyLimit - monthlyUsage),
      planTier,
    };
  } catch (err) {
    console.error('Error checking AI usage limit by plan tier:', err);
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: limits.daily,
      monthlyLimit: limits.monthly,
      isWithinLimit: true,
      remainingDaily: limits.daily === -1 ? Infinity : limits.daily,
      remainingMonthly: limits.monthly === -1 ? Infinity : limits.monthly,
      planTier,
    };
  }
}

/**
 * AI使用量を記録
 */
export async function logAIUsage(params: LogAIUsageParams): Promise<string | null> {
  const supabase = getServiceClient();

  if (!supabase) {
    console.log('[AI Usage] Logging skipped (no Supabase):', params.actionType);
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('log_ai_usage', {
      p_user_id: params.userId,
      p_action_type: params.actionType,
      p_service: params.service || 'kdl',
      p_model_used: params.modelUsed || 'gemini-1.5-flash',
      p_input_tokens: params.inputTokens || 0,
      p_output_tokens: params.outputTokens || 0,
      p_metadata: params.metadata || null,
    });

    if (error) {
      console.error('Failed to log AI usage:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error logging AI usage:', err);
    return null;
  }
}

/**
 * リミットチェック付きでAI使用を実行するラッパー
 */
export async function withAIUsageCheck<T>(
  userId: string,
  actionType: string,
  fn: () => Promise<T>,
  options?: {
    service?: string;
    modelUsed?: string;
    estimateTokens?: { input: number; output: number };
    metadata?: Record<string, any>;
  }
): Promise<T> {
  // リミットチェック
  const usageCheck = await checkAIUsageLimit(userId);

  if (!usageCheck.isWithinLimit) {
    const message = usageCheck.remainingDaily === 0
      ? '本日のAI使用上限に達しました。明日またお試しください。'
      : '今月のAI使用上限に達しました。';
    throw new Error(message);
  }

  // AI処理を実行
  const result = await fn();

  // 使用量を記録（非同期で記録、エラーは無視）
  logAIUsage({
    userId,
    actionType,
    service: options?.service,
    modelUsed: options?.modelUsed,
    inputTokens: options?.estimateTokens?.input,
    outputTokens: options?.estimateTokens?.output,
    metadata: options?.metadata,
  }).catch(console.error);

  return result;
}

/**
 * ユーザーの使用量サマリーを取得（フロントエンド表示用）
 */
export async function getAIUsageSummary(userId: string): Promise<{
  daily: { used: number; limit: number; remaining: number };
  monthly: { used: number; limit: number; remaining: number };
} | null> {
  const result = await checkAIUsageLimit(userId);

  return {
    daily: {
      used: result.dailyUsage,
      limit: result.dailyLimit,
      remaining: result.remainingDaily,
    },
    monthly: {
      used: result.monthlyUsage,
      limit: result.monthlyLimit,
      remaining: result.remainingMonthly === Infinity ? -1 : result.remainingMonthly,
    },
  };
}


