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
  // ハイブリッドクレジット用フィールド
  premiumUsage?: number;
  standardUsage?: number;
  premiumLimit?: number;
  standardLimit?: number;
  canUsePremium?: boolean;
  canUseStandard?: boolean;
  remainingPremium?: number;
  remainingStandard?: number;
}

export interface FeatureUsageCheckResult extends UsageCheckResult {
  featureType: 'profile' | 'business' | 'quiz' | 'total';
  featureLimit: number;
  featureUsage: number;
  featureRemaining: number;
}

export interface LogAIUsageParams {
  userId: string;
  actionType: string;
  service?: string;
  modelUsed?: string;
  inputTokens?: number;
  outputTokens?: number;
  metadata?: Record<string, any>;
  usageType?: 'premium' | 'standard';  // ハイブリッドクレジット用
  featureType?: 'profile' | 'business' | 'quiz';  // 機能タイプ
}

/**
 * モデル名からコストを計算（円）
 * 価格は1Mトークンあたりのドル、1ドル=150円で換算
 */
export function calculateEstimatedCostJpy(
  modelUsed: string,
  inputTokens: number,
  outputTokens: number
): number {
  // モデル別の価格設定（$/1M tokens）
  const modelPricing: Record<string, { input: number; output: number }> = {
    // Gemini系
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-2.0-flash': { input: 0.075, output: 0.30 },
    'gemini-2.5-flash': { input: 0.30, output: 2.50 },
    'gemini-2.5-flash-lite': { input: 0.075, output: 0.30 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
    'gemini-2.0-pro': { input: 1.25, output: 5.00 },
    'gemini-2.5-pro': { input: 1.25, output: 10.00 },
    // OpenAI系
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-5-nano': { input: 0.05, output: 0.40 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5.1': { input: 1.25, output: 10.00 },
    'o3-mini': { input: 1.10, output: 4.40 },
    'o1': { input: 15.00, output: 60.00 },
    // Anthropic系
    'claude-3-haiku': { input: 0.25, output: 1.25 },
    'claude-3.5-haiku': { input: 0.80, output: 4.00 },
    'claude-4-haiku': { input: 1.00, output: 5.00 },
    'claude-4.5-haiku': { input: 1.00, output: 5.00 },
    'claude-3-5-sonnet': { input: 3.00, output: 15.00 },
    'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
    'claude-haiku-4-5': { input: 1.00, output: 5.00 },
    'claude-opus-4-5': { input: 5.00, output: 25.00 },
  };

  // 部分一致でモデルを探す
  let pricing = { input: 0.075, output: 0.30 }; // デフォルト（Gemini Flash）
  
  for (const [modelKey, price] of Object.entries(modelPricing)) {
    if (modelUsed.includes(modelKey)) {
      pricing = price;
      break;
    }
  }

  // コスト計算（1ドル=150円）
  const exchangeRate = 150;
  const inputCost = (inputTokens * pricing.input / 1000000) * exchangeRate;
  const outputCost = (outputTokens * pricing.output / 1000000) * exchangeRate;
  
  return inputCost + outputCost;
}

/**
 * ハイブリッドクレジット制限をチェック（新方式）
 * Premium Credits と Standard Credits を別々に管理
 */
export async function checkAICreditLimit(
  userId: string,
  mode: 'quality' | 'speed' = 'speed'
): Promise<UsageCheckResult> {
  const supabase = getServiceClient();

  // Supabaseがない場合は常に許可（開発環境用）
  if (!supabase) {
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: 100,
      monthlyLimit: -1,
      isWithinLimit: true,
      remainingDaily: 100,
      remainingMonthly: -1,
      premiumUsage: 0,
      standardUsage: 0,
      premiumLimit: 20,
      standardLimit: 80,
      canUsePremium: true,
      canUseStandard: true,
      remainingPremium: 20,
      remainingStandard: 80,
    };
  }

  try {
    // RPC関数を呼び出し（ハイブリッドクレジットチェック）
    const { data, error } = await supabase.rpc('check_ai_credit_limit', {
      check_user_id: userId,
      credit_type: mode === 'quality' ? 'premium' : 'standard',
    });

    if (error) {
      console.error('Failed to check AI credit limit:', error);
      // エラー時はデフォルト値で許可
      return {
        dailyUsage: 0,
        monthlyUsage: 0,
        dailyLimit: 100,
        monthlyLimit: -1,
        isWithinLimit: true,
        remainingDaily: 100,
        remainingMonthly: -1,
      };
    }

    if (!data || data.length === 0) {
      // データがない場合はデフォルトで許可
      return {
        dailyUsage: 0,
        monthlyUsage: 0,
        dailyLimit: 100,
        monthlyLimit: -1,
        isWithinLimit: true,
        remainingDaily: 100,
        remainingMonthly: -1,
      };
    }

    const result = data[0];
    
    // Premium/Standard使用量と制限を取得
    const premiumUsage = result.premium_usage || 0;
    const standardUsage = result.standard_usage || 0;
    const premiumLimit = result.premium_limit || 0;
    const standardLimit = result.standard_limit || 0;
    const canUsePremium = result.can_use_premium || false;
    const canUseStandard = result.can_use_standard || false;

    // レガシー互換：合計使用量
    const totalUsage = premiumUsage + standardUsage;
    const totalLimit = (premiumLimit === -1 || standardLimit === -1) 
      ? -1 
      : premiumLimit + standardLimit;

    // モードに応じた制限チェック
    const isWithinLimit = mode === 'quality' ? canUsePremium : canUseStandard;

    return {
      dailyUsage: totalUsage,
      monthlyUsage: totalUsage,
      dailyLimit: totalLimit,
      monthlyLimit: -1,
      isWithinLimit,
      remainingDaily: totalLimit === -1 ? Infinity : Math.max(0, totalLimit - totalUsage),
      remainingMonthly: Infinity,
      planTier: result.plan_tier || undefined,
      // ハイブリッドクレジット情報
      premiumUsage,
      standardUsage,
      premiumLimit,
      standardLimit,
      canUsePremium,
      canUseStandard,
      remainingPremium: premiumLimit === -1 ? Infinity : Math.max(0, premiumLimit - premiumUsage),
      remainingStandard: standardLimit === -1 ? Infinity : Math.max(0, standardLimit - standardUsage),
    };
  } catch (err) {
    console.error('Error checking AI credit limit:', err);
    // エラー時は許可（サービス継続優先）
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: 100,
      monthlyLimit: -1,
      isWithinLimit: true,
      remainingDaily: 100,
      remainingMonthly: -1,
    };
  }
}

/**
 * 機能タイプごとのAI使用量制限をチェック
 */
export async function checkAIUsageLimitForFeature(
  userId: string,
  featureType: 'profile' | 'business' | 'quiz'
): Promise<FeatureUsageCheckResult> {
  const supabase = getServiceClient();
  
  if (!supabase) {
    // 開発環境用のデフォルト値
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: 5,
      monthlyLimit: -1,
      isWithinLimit: true,
      remainingDaily: 5,
      remainingMonthly: -1,
      featureType,
      featureLimit: 5,
      featureUsage: 0,
      featureRemaining: 5
    };
  }

  try {
    // RPC関数を呼び出し（機能タイプごとの制限チェック）
    const { data, error } = await supabase.rpc('check_ai_feature_limit', {
      check_user_id: userId,
      feature_type: featureType
    });

    if (error) {
      console.error('Failed to check AI feature limit:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      // データがない場合はデフォルトで許可
      return {
        dailyUsage: 0,
        monthlyUsage: 0,
        dailyLimit: 5,
        monthlyLimit: -1,
        isWithinLimit: true,
        remainingDaily: 5,
        remainingMonthly: -1,
        featureType,
        featureLimit: 5,
        featureUsage: 0,
        featureRemaining: 5
      };
    }

    const result = data[0];
    
    return {
      dailyUsage: result.total_usage || 0,
      monthlyUsage: result.total_usage || 0,
      dailyLimit: result.total_limit === -1 ? Infinity : (result.total_limit || 5),
      monthlyLimit: -1,
      isWithinLimit: result.can_use || false,
      remainingDaily: result.total_remaining === -1 ? Infinity : (result.total_remaining || 0),
      remainingMonthly: -1,
      planTier: result.plan_tier || undefined,
      featureType,
      featureLimit: result.feature_limit === -1 ? Infinity : (result.feature_limit || 5),
      featureUsage: result.feature_usage || 0,
      featureRemaining: result.feature_remaining === -1 ? Infinity : (result.feature_remaining || 0)
    };
  } catch (err) {
    console.error('Error checking AI feature limit:', err);
    // エラー時は許可（サービス継続優先）
    return {
      dailyUsage: 0,
      monthlyUsage: 0,
      dailyLimit: 5,
      monthlyLimit: -1,
      isWithinLimit: true,
      remainingDaily: 5,
      remainingMonthly: -1,
      featureType,
      featureLimit: 5,
      featureUsage: 0,
      featureRemaining: 5
    };
  }
}

/**
 * ユーザーのAI使用量リミットをチェック（レガシー互換）
 */
export async function checkAIUsageLimit(userId: string): Promise<UsageCheckResult> {
  // 新方式にデリゲート（デフォルトはspeedモード）
  return checkAICreditLimit(userId, 'speed');
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
 * AI使用量を記録（ハイブリッドクレジット対応 & 機能タイプ対応）
 */
export async function logAIUsage(params: LogAIUsageParams): Promise<string | null> {
  const supabase = getServiceClient();

  if (!supabase) {
    return null;
  }

  try {
    // ハイブリッドクレジットシステムに対応
    if (params.usageType) {
      const modelUsed = params.modelUsed || 'gemini-2.5-flash-lite';
      const inputTokens = params.inputTokens || 0;
      const outputTokens = params.outputTokens || 0;
      
      const { data, error } = await supabase.rpc('log_ai_credit_usage', {
        p_user_id: params.userId,
        p_action_type: params.actionType,
        p_usage_type: params.usageType,
        p_service: params.service || 'kdl',
        p_model_used: modelUsed,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
        p_metadata: params.metadata || null,
      });

      if (error) {
        console.error('Failed to log AI credit usage:', error);
        return null;
      }

      // コストを計算して更新（RPC関数がコスト計算をしていないため）
      if (data && (inputTokens > 0 || outputTokens > 0)) {
        const estimatedCostJpy = calculateEstimatedCostJpy(modelUsed, inputTokens, outputTokens);
        await supabase
          .from('ai_usage_logs')
          .update({ 
            estimated_cost_jpy: estimatedCostJpy,
            ...(params.featureType ? { feature_type: params.featureType } : {})
          })
          .eq('id', data);
      } else if (params.featureType && data) {
        // feature_typeのみ更新
        await supabase
          .from('ai_usage_logs')
          .update({ feature_type: params.featureType })
          .eq('id', data);
      }

      return data;
    }

    // 機能タイプを含む直接INSERT（新しい機能）
    if (params.featureType) {
      const modelUsed = params.modelUsed || 'gpt-4o-mini';
      const inputTokens = params.inputTokens || 0;
      const outputTokens = params.outputTokens || 0;
      const estimatedCostJpy = calculateEstimatedCostJpy(modelUsed, inputTokens, outputTokens);

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .insert({
          user_id: params.userId,
          action_type: params.actionType,
          service: params.service || 'profile',
          model_used: modelUsed,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          estimated_cost_jpy: estimatedCostJpy,
          metadata: params.metadata || null,
          feature_type: params.featureType,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to log AI usage with feature type:', error);
        return null;
      }

      return data?.id || null;
    }

    // レガシーシステム（後方互換性）
    const { data, error } = await supabase.rpc('log_ai_usage', {
      p_user_id: params.userId,
      p_action_type: params.actionType,
      p_service: params.service || 'kdl',
      p_model_used: params.modelUsed || 'gemini-2.5-flash-lite',
      p_input_tokens: params.inputTokens || 0,
      p_output_tokens: params.outputTokens || 0,
      p_metadata: params.metadata || null,
    });

    if (error) {
      console.error('Failed to log AI usage via RPC:', error);
      
      // RPC関数がない場合（42883）は直接INSERTを試みる
      if (error.code === '42883' || error.code === 'PGRST202') {
        
        // コスト計算（簡易版）
        const modelUsed = params.modelUsed || 'gemini-2.5-flash-lite';
        const inputTokens = params.inputTokens || 0;
        const outputTokens = params.outputTokens || 0;
        let estimatedCostJpy = 0;
        
        if (modelUsed.includes('gemini-2.5-flash-lite') || modelUsed.includes('gemini-1.5-flash') || modelUsed.includes('gemini-2.0-flash-lite')) {
          estimatedCostJpy = (inputTokens * 0.10 / 1000000 + outputTokens * 0.40 / 1000000) * 150;
        } else if (modelUsed.includes('gemini-2.5-flash') || modelUsed.includes('gemini-2.0-flash')) {
          estimatedCostJpy = (inputTokens * 0.30 / 1000000 + outputTokens * 2.50 / 1000000) * 150;
        } else if (modelUsed.includes('gemini-2.5-pro') || modelUsed.includes('gemini-1.5-pro') || modelUsed.includes('gemini-2.0-pro')) {
          estimatedCostJpy = (inputTokens * 1.25 / 1000000 + outputTokens * 10.00 / 1000000) * 150;
        } else if (modelUsed.includes('gpt-4o-mini')) {
          estimatedCostJpy = (inputTokens * 0.15 / 1000000 + outputTokens * 0.60 / 1000000) * 150;
        } else if (modelUsed.includes('gpt-4o')) {
          estimatedCostJpy = (inputTokens * 2.50 / 1000000 + outputTokens * 10.00 / 1000000) * 150;
        }
        
        const { data: insertData, error: insertError } = await supabase
          .from('ai_usage_logs')
          .insert({
            user_id: params.userId,
            action_type: params.actionType,
            service: params.service || 'kdl',
            model_used: modelUsed,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            estimated_cost_jpy: estimatedCostJpy,
            metadata: params.metadata || null,
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error('Failed to log AI usage via direct INSERT:', insertError);
          return null;
        }
        
        return insertData?.id || null;
      }
      
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error logging AI usage:', err);
    return null;
  }
}

/**
 * リミットチェック付きでAI使用を実行するラッパー（ハイブリッドクレジット対応）
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
    mode?: 'quality' | 'speed';  // ハイブリッドクレジット用
  }
): Promise<T> {
  // モード指定がある場合はハイブリッドクレジットチェック
  const mode = options?.mode || 'speed';
  const usageCheck = await checkAICreditLimit(userId, mode);

  if (!usageCheck.isWithinLimit) {
    // Premium枠がない場合、Standard枠へのフォールバック提案
    if (mode === 'quality' && usageCheck.canUseStandard) {
      throw new Error(
        '高品質AIの本日の使用上限に達しました。高速AIモードをお試しください。'
      );
    }
    
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
    usageType: mode === 'quality' ? 'premium' : 'standard',
  }).catch(console.error);

  return result;
}

/**
 * ユーザーの使用量サマリーを取得（フロントエンド表示用・ハイブリッドクレジット対応）
 */
export async function getAIUsageSummary(userId: string): Promise<{
  daily: { used: number; limit: number; remaining: number };
  monthly: { used: number; limit: number; remaining: number };
  premium?: { used: number; limit: number; remaining: number };
  standard?: { used: number; limit: number; remaining: number };
} | null> {
  const result = await checkAICreditLimit(userId, 'speed');

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
    premium: result.premiumUsage !== undefined ? {
      used: result.premiumUsage,
      limit: result.premiumLimit || 0,
      remaining: result.remainingPremium === Infinity ? -1 : (result.remainingPremium || 0),
    } : undefined,
    standard: result.standardUsage !== undefined ? {
      used: result.standardUsage,
      limit: result.standardLimit || 0,
      remaining: result.remainingStandard === Infinity ? -1 : (result.remainingStandard || 0),
    } : undefined,
  };
}


