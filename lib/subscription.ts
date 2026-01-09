/**
 * サブスクリプション管理ユーティリティ
 * ユーザーのサブスク状態を確認・管理
 */

import { createClient } from '@supabase/supabase-js';

// ========================================
// プラン定義
// ========================================

export type PlanTier = 'none' | 'lite' | 'standard' | 'pro' | 'business' | 'enterprise';

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  nameJa: string;
  monthlyPrice: number;
  yearlyPrice: number;
  dailyAILimit: number;      // -1 = 無制限
  monthlyAILimit: number;    // -1 = 無制限
  aiModel: 'gemini-flash' | 'gpt-4o-mini' | 'gpt-4o' | 'custom';
  aiModelDisplay: string;    // LP表示用（曖昧表現）
  supportLevel: string;
  features: string[];
}

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  none: {
    id: 'none',
    name: 'Free Trial',
    nameJa: '無料トライアル',
    monthlyPrice: 0,
    yearlyPrice: 0,
    dailyAILimit: 3,
    monthlyAILimit: 10,
    aiModel: 'gemini-flash',
    aiModelDisplay: 'お試しAI',
    supportLevel: 'なし',
    features: ['お試し3回/日', '書籍1冊まで'],
  },
  lite: {
    id: 'lite',
    name: 'Lite',
    nameJa: 'ライト',
    monthlyPrice: 2980,
    yearlyPrice: 29800,
    dailyAILimit: 20,
    monthlyAILimit: 300,
    aiModel: 'gemini-flash',
    aiModelDisplay: '標準AI',
    supportLevel: 'メールサポート',
    features: [
      'AI執筆サポート（20回/日）',
      '標準AI',
      '書籍数無制限',
      'KDP形式エクスポート',
      'メールサポート',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    nameJa: 'スタンダード',
    monthlyPrice: 4980,
    yearlyPrice: 49800,
    dailyAILimit: 50,
    monthlyAILimit: 500,
    aiModel: 'gpt-4o-mini',
    aiModelDisplay: '標準AI+',
    supportLevel: 'メール優先サポート',
    features: [
      'AI執筆サポート（50回/日）',
      '標準AI+',
      '書籍数無制限',
      'KDP形式エクスポート',
      'メール優先サポート',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameJa: 'プロ',
    monthlyPrice: 9800,
    yearlyPrice: 98000,
    dailyAILimit: 100,
    monthlyAILimit: 1000,
    aiModel: 'gpt-4o-mini',
    aiModelDisplay: '高性能AI',
    supportLevel: 'チャットサポート',
    features: [
      'AI執筆サポート（100回/日）',
      '高性能AI',
      '書籍数無制限',
      'KDP形式エクスポート',
      'チャットサポート',
      '新機能の先行アクセス',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    nameJa: 'ビジネス',
    monthlyPrice: 29800,
    yearlyPrice: 298000,
    dailyAILimit: -1,  // 無制限
    monthlyAILimit: -1, // 無制限
    aiModel: 'gpt-4o',
    aiModelDisplay: '最高性能AI',
    supportLevel: 'グループコンサル月1回',
    features: [
      'AI執筆サポート（無制限）',
      '最高性能AI',
      '書籍数無制限',
      'KDP形式エクスポート',
      'グループコンサル（月1回）',
      '優先サポート',
      '新機能の先行アクセス',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    nameJa: 'エンタープライズ',
    monthlyPrice: -1,  // 要相談
    yearlyPrice: -1,   // 要相談
    dailyAILimit: -1,
    monthlyAILimit: -1,
    aiModel: 'custom',
    aiModelDisplay: 'カスタムAI環境',
    supportLevel: '専任サポート',
    features: [
      'カスタムAI環境',
      '専任サポート',
      'API連携',
      'チーム利用',
      'カスタム機能開発',
    ],
  },
};

// プラン価格からプランTierを判定
export function getPlanTierFromAmount(amount: number, period: 'monthly' | 'yearly'): PlanTier {
  const plans = Object.values(PLAN_DEFINITIONS);
  
  for (const plan of plans) {
    const price = period === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    if (price === amount) {
      return plan.id;
    }
  }
  
  // 既存の月額/年間プランはスタンダードとして扱う
  if (period === 'monthly' && amount === 4980) return 'standard';
  if (period === 'yearly' && (amount === 39800 || amount === 49800)) return 'standard';
  
  return 'none';
}

// AIモデル名を取得
export function getAIModelForPlan(planTier: PlanTier): string {
  const plan = PLAN_DEFINITIONS[planTier];
  
  switch (plan.aiModel) {
    case 'gemini-flash':
      return 'gemini-1.5-flash';
    case 'gpt-4o-mini':
      return 'gpt-4o-mini';
    case 'gpt-4o':
      return 'gpt-4o';
    case 'custom':
      return process.env.ENTERPRISE_AI_MODEL || 'gpt-4o';
    default:
      return 'gemini-1.5-flash';
  }
}

// AIプロバイダーを取得
export function getAIProviderForPlan(planTier: PlanTier): 'openai' | 'gemini' {
  const plan = PLAN_DEFINITIONS[planTier];
  
  if (plan.aiModel === 'gemini-flash') {
    return 'gemini';
  }
  return 'openai';
}

// サーバーサイド用Supabaseクライアント
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

export interface Subscription {
  id: string;
  provider: string;
  status: string;
  amount: number;
  period: string;
  planName: string | null;
  nextPaymentDate: string | null;
  createdAt: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
  planType: 'monthly' | 'yearly' | 'none';
  planTier: PlanTier;
}

/**
 * ユーザーのサブスク状態を取得
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = getServiceClient();

  if (!supabase) {
    // Supabaseが利用不可の場合はデフォルト値を返す
    return {
      hasActiveSubscription: false,
      subscription: null,
      planType: 'none',
      planTier: 'none',
    };
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, provider, status, amount, period, plan_name, next_payment_date, created_at, plan_tier')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        planType: 'none',
        planTier: 'none',
      };
    }

    const subscription: Subscription = {
      id: data.id,
      provider: data.provider,
      status: data.status,
      amount: data.amount,
      period: data.period,
      planName: data.plan_name,
      nextPaymentDate: data.next_payment_date,
      createdAt: data.created_at,
    };

    const planType = data.period === 'yearly' ? 'yearly' : 'monthly';
    
    // plan_tierがDBにあればそれを使用、なければ金額から判定
    const planTier: PlanTier = data.plan_tier || getPlanTierFromAmount(data.amount, planType);

    return {
      hasActiveSubscription: true,
      subscription,
      planType,
      planTier,
    };
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    return {
      hasActiveSubscription: false,
      subscription: null,
      planType: 'none',
      planTier: 'none',
    };
  }
}

/**
 * クライアントサイドでサブスク状態を取得するAPI
 */
export async function fetchSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const response = await fetch(`/api/subscription/status?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }
    return await response.json();
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    return {
      hasActiveSubscription: false,
      subscription: null,
      planType: 'none',
      planTier: 'none',
    };
  }
}

/**
 * サブスクの機能制限を取得（レガシー互換）
 */
export function getFeatureLimits(planType: 'monthly' | 'yearly' | 'none') {
  const limits = {
    none: {
      canUseAI: false,
      dailyAILimit: 3, // お試し3回
      monthlyAILimit: 10,
      canExport: false,
      watermark: true,
      maxBooks: 1,
    },
    monthly: {
      canUseAI: true,
      dailyAILimit: 50,
      monthlyAILimit: 500,
      canExport: true,
      watermark: false,
      maxBooks: -1, // 無制限
    },
    yearly: {
      canUseAI: true,
      dailyAILimit: 100,
      monthlyAILimit: -1, // 無制限
      canExport: true,
      watermark: false,
      maxBooks: -1,
    },
  };

  return limits[planType];
}

/**
 * プランTierから機能制限を取得（新方式）
 */
export function getFeatureLimitsByTier(planTier: PlanTier) {
  const plan = PLAN_DEFINITIONS[planTier];
  
  return {
    canUseAI: planTier !== 'none',
    dailyAILimit: plan.dailyAILimit,
    monthlyAILimit: plan.monthlyAILimit,
    canExport: planTier !== 'none',
    watermark: planTier === 'none',
    maxBooks: planTier === 'none' ? 1 : -1,
    aiModel: plan.aiModel,
    aiModelDisplay: plan.aiModelDisplay,
    supportLevel: plan.supportLevel,
  };
}


