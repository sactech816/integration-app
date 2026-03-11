/**
 * サブスクリプション管理ユーティリティ
 * ユーザーのサブスク状態を確認・管理
 */

import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

// ========================================
// サービス別プラン定義
// ========================================

// Kindle（KDL）のプランTier
export type PlanTier = 'none' | 'lite' | 'standard' | 'pro' | 'business' | 'enterprise';

// 集客メーカーのプランTier（階層順）
// guest < free < standard < business < premium
export type MakersPlanTier = 'guest' | 'free' | 'standard' | 'business' | 'premium';

// レガシー互換: 旧 'pro' は 'business' にマッピング
export type MakersPlanTierLegacy = MakersPlanTier | 'pro';

// ティアのレベル値（数値が大きいほど上位）
const MAKERS_TIER_LEVEL: Record<MakersPlanTier, number> = {
  guest: 0,
  free: 1,
  standard: 2,   // ¥1,980/月
  business: 3,    // ¥4,980/月（旧Pro）
  premium: 4,     // ¥9,800/月
};

/**
 * レガシーの 'pro' を 'business' に変換する
 * DB上に 'pro' が残っている場合のマイグレーション用
 */
export function normalizeMakersPlanTier(tier: MakersPlanTierLegacy | string | null | undefined): MakersPlanTier {
  if (!tier) return 'free';
  if (tier === 'pro') return 'business';
  if (tier in MAKERS_TIER_LEVEL) return tier as MakersPlanTier;
  return 'free';
}

/**
 * ユーザーのティアが要求ティア以上かチェック
 * 例: hasAccess('business', 'standard') → true（businessはstandard以上）
 */
export function hasMakersAccess(userTier: MakersPlanTier, requiredTier: MakersPlanTier): boolean {
  return MAKERS_TIER_LEVEL[userTier] >= MAKERS_TIER_LEVEL[requiredTier];
}

/**
 * 有料プラン（standard以上）かどうか
 */
export function hasMakersPaidPlan(tier: MakersPlanTier): boolean {
  return hasMakersAccess(tier, 'standard');
}

/**
 * レガシー互換: isPro相当（business以上）
 */
export function isMakersProOrHigher(tier: MakersPlanTier): boolean {
  return hasMakersAccess(tier, 'business');
}

// サービス種別
export type ServiceType = 'makers' | 'kdl';

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  nameJa: string;
  monthlyPrice: number;
  yearlyPrice: number;
  dailyAILimit: number;      // -1 = 無制限（レガシー互換用）
  monthlyAILimit: number;    // -1 = 無制限（レガシー互換用）
  // 新ハイブリッドクレジットシステム
  premiumCreditsDaily: number;   // 高品質AI枠（Claude, o1等）の1日あたり回数
  standardCreditsDaily: number;  // 通常AI枠（Gemini Flash等）の1日あたり回数
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
    premiumCreditsDaily: 0,      // Premium枠なし
    standardCreditsDaily: 3,     // Standard枠のみ3回
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
    premiumCreditsDaily: 0,      // Premium枠なし
    standardCreditsDaily: 20,    // Standard枠20回
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
    dailyAILimit: 30,
    monthlyAILimit: 900,
    premiumCreditsDaily: 0,      // Premium枠なし
    standardCreditsDaily: 30,    // Standard枠30回
    aiModel: 'gpt-4o-mini',
    aiModelDisplay: '標準AI+',
    supportLevel: 'メール優先サポート',
    features: [
      'AI執筆サポート（30回/日）',
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
    premiumCreditsDaily: 20,     // Premium枠20回
    standardCreditsDaily: 80,    // Standard枠80回（合計100回）
    aiModel: 'gpt-4o-mini',
    aiModelDisplay: '高性能AI',
    supportLevel: 'チャットサポート',
    features: [
      'AI執筆サポート（100回/日）',
      '高品質AI 20回/日',
      '高速AI 80回/日',
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
    premiumCreditsDaily: 50,     // Premium枠50回
    standardCreditsDaily: -1,    // Standard枠無制限
    aiModel: 'gpt-4o',
    aiModelDisplay: '最高性能AI',
    supportLevel: 'グループコンサル月1回',
    features: [
      'AI執筆サポート（無制限）',
      '高品質AI 50回/日',
      '高速AI 無制限',
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
    premiumCreditsDaily: -1,     // Premium枠無制限
    standardCreditsDaily: -1,    // Standard枠無制限
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
      return 'gemini-2.5-flash-lite';
    case 'gpt-4o-mini':
      return 'gpt-4o-mini';
    case 'gpt-4o':
      return 'gpt-4o';
    case 'custom':
      return process.env.ENTERPRISE_AI_MODEL || 'gpt-4o';
    default:
      return 'gemini-2.5-flash-lite';
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
  // モニターユーザー情報
  isMonitor?: boolean;
  monitorExpiresAt?: string;
  monitorSource?: 'subscription' | 'monitor' | 'none';
}

/**
 * ユーザーのサブスク状態を取得（モニター優先）
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
      isMonitor: false,
      monitorSource: 'none',
    };
  }

  try {
    // モニター権限をチェック（有効期限内のもの、KDLサービス限定）
    const now = new Date().toISOString();
    console.log('[getSubscriptionStatus] Checking monitor for user:', userId, 'now:', now);
    
    const { data: monitorData, error: monitorError } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type, monitor_expires_at, service')
      .eq('user_id', userId)
      .eq('service', 'kdl')
      .lte('monitor_start_at', now)
      .gt('monitor_expires_at', now)
      .order('monitor_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[getSubscriptionStatus] Monitor result:', monitorData, 'error:', monitorError);

    // モニター権限がある場合はそれを優先
    if (monitorData) {
      return {
        hasActiveSubscription: true,
        subscription: null,
        planType: 'monthly', // モニターの場合は便宜上monthly扱い
        planTier: monitorData.monitor_plan_type as PlanTier,
        isMonitor: true,
        monitorExpiresAt: monitorData.monitor_expires_at,
        monitorSource: 'monitor',
      };
    }

    // モニター権限がない場合は通常のサブスクリプションをチェック
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
        isMonitor: false,
        monitorSource: 'none',
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
      isMonitor: false,
      monitorSource: 'subscription',
    };
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    return {
      hasActiveSubscription: false,
      subscription: null,
      planType: 'none',
      planTier: 'none',
      isMonitor: false,
      monitorSource: 'none',
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

// ========================================
// 集客メーカー用サブスクリプション状態
// ========================================

export interface MakersSubscriptionStatus {
  hasActiveSubscription: boolean;
  planTier: MakersPlanTier;
  isMonitor: boolean;
  monitorExpiresAt?: string;
  subscriptionId?: string;
  // service_plansテーブルから取得した数量制限
  gamificationLimit?: number;
  aiDailyLimit?: number;
}

/**
 * 集客メーカーのサブスク状態を取得（モニター優先）
 * service_plansから数量制限も取得
 */
export async function getMakersSubscriptionStatus(userId: string): Promise<MakersSubscriptionStatus> {
  const supabase = getServiceClient();

  if (!supabase) {
    return {
      hasActiveSubscription: false,
      planTier: 'free',
      isMonitor: false,
      gamificationLimit: 0,
      aiDailyLimit: 0,
    };
  }

  // service_plansから数量制限を取得するヘルパー関数
  const getPlanLimits = async (planTier: MakersPlanTier): Promise<{ gamificationLimit: number; aiDailyLimit: number }> => {
    const { data: planData } = await supabase
      .from('service_plans')
      .select('gamification_limit, ai_daily_limit')
      .eq('service', 'makers')
      .eq('plan_tier', planTier)
      .eq('is_active', true)
      .single();

    // DBから取得できなければデフォルト値を返す（MAKERS_PLAN_DEFINITIONSから取得）
    const planDef = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;

    return {
      gamificationLimit: planData?.gamification_limit ?? planDef.gamificationLimit,
      aiDailyLimit: planData?.ai_daily_limit ?? planDef.aiDailyLimit,
    };
  };

  try {
    const now = new Date().toISOString();
    
    // 1. まずモニター権限をチェック（集客メーカーサービス限定）
    const { data: monitorData } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type, monitor_expires_at')
      .eq('user_id', userId)
      .eq('service', 'makers')
      .lte('monitor_start_at', now)
      .gt('monitor_expires_at', now)
      .order('monitor_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // モニター権限がある場合はそれを優先
    if (monitorData) {
      // モニターのplan_typeを正規化（'pro' → 'business'）
      const monitorTier = normalizeMakersPlanTier(monitorData.monitor_plan_type);
      const limits = await getPlanLimits(monitorTier);
      return {
        hasActiveSubscription: true,
        planTier: monitorTier,
        isMonitor: true,
        monitorExpiresAt: monitorData.monitor_expires_at,
        ...limits,
      };
    }

    // 2. 通常のサブスクリプションをチェック（集客メーカーサービス限定）
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status, plan_name, plan_tier')
      .eq('user_id', userId)
      .eq('service', 'makers')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscription) {
      // plan_tierカラムを優先、なければplan_nameから判定
      let planTier: MakersPlanTier = 'free';
      if (subscription.plan_tier) {
        planTier = normalizeMakersPlanTier(subscription.plan_tier);
      } else {
        // レガシー互換: plan_nameからの判定
        const pn = subscription.plan_name?.toLowerCase() || '';
        if (pn.includes('premium') || pn.includes('プレミアム')) {
          planTier = 'premium';
        } else if (pn.includes('business') || pn.includes('ビジネス') || pn.includes('pro') || pn.includes('プロ')) {
          planTier = 'business';
        } else if (pn.includes('standard') || pn.includes('スタンダード')) {
          planTier = 'standard';
        }
      }
      const limits = await getPlanLimits(planTier);

      return {
        hasActiveSubscription: true,
        planTier,
        isMonitor: false,
        subscriptionId: subscription.id,
        ...limits,
      };
    }

    // サブスクもモニターもない場合
    const limits = await getPlanLimits('free');
    return {
      hasActiveSubscription: false,
      planTier: 'free',
      isMonitor: false,
      ...limits,
    };
  } catch (err) {
    console.error('Error fetching makers subscription status:', err);
    return {
      hasActiveSubscription: false,
      planTier: 'free',
      isMonitor: false,
      gamificationLimit: 0,
      aiDailyLimit: 0,
    };
  }
}

/**
 * クライアントサイドで集客メーカーのサブスク状態を取得
 */
export async function fetchMakersSubscriptionStatus(userId: string): Promise<MakersSubscriptionStatus> {
  try {
    const response = await fetch(`/api/makers/subscription-status?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch makers subscription status');
    }
    return await response.json();
  } catch (err) {
    console.error('Error fetching makers subscription status:', err);
    return {
      hasActiveSubscription: false,
      planTier: 'free',
      isMonitor: false,
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
    // ハイブリッドクレジット
    premiumCreditsDaily: plan.premiumCreditsDaily,
    standardCreditsDaily: plan.standardCreditsDaily,
    canExport: planTier !== 'none',
    watermark: planTier === 'none',
    maxBooks: planTier === 'none' ? 1 : -1,
    aiModel: plan.aiModel,
    aiModelDisplay: plan.aiModelDisplay,
    supportLevel: plan.supportLevel,
  };
}

/**
 * プランTierからハイブリッドクレジット情報を取得
 */
export function getAICreditsForPlan(planTier: PlanTier): {
  premium: number;
  standard: number;
  hasPremiumAccess: boolean;
} {
  const plan = PLAN_DEFINITIONS[planTier];
  
  return {
    premium: plan.premiumCreditsDaily,
    standard: plan.standardCreditsDaily,
    hasPremiumAccess: plan.premiumCreditsDaily > 0 || plan.premiumCreditsDaily === -1,
  };
}

// ========================================
// ゲーミフィケーション作成数制限（フォールバック用）
// ========================================

/**
 * KDLプランごとのゲーム作成数制限（フォールバック）
 */
export const GAMIFICATION_LIMITS: Record<PlanTier, number> = {
  none: 1,        // 無料: 1件まで
  lite: 3,        // ライト: 3件まで
  standard: 5,    // スタンダード: 5件まで
  pro: 10,        // プロ: 10件まで
  business: 50,   // ビジネス: 50件まで
  enterprise: 999, // エンタープライズ: 無制限
};

/**
 * 集客メーカープランごとのゲーム作成数制限（フォールバック）
 */
export const MAKERS_GAMIFICATION_LIMITS: Record<MakersPlanTier, number> = {
  guest: 0,       // ゲスト: 作成不可
  free: 0,        // フリー: 作成不可
  standard: 0,    // スタンダード: 作成不可
  business: -1,   // ビジネス: 無制限
  premium: -1,    // プレミアム: 無制限
};

/**
 * ゲーム作成数制限を取得（KDL用）
 */
export function getGamificationLimit(planTier: PlanTier): number {
  return GAMIFICATION_LIMITS[planTier] || 1;
}

/**
 * ゲーム作成数制限を取得（集客メーカー用）
 */
export function getMakersGamificationLimit(planTier: MakersPlanTier): number {
  return MAKERS_GAMIFICATION_LIMITS[planTier] || 0;
}

/**
 * ゲーム作成が可能かチェック
 */
export function canCreateGamification(planTier: PlanTier, currentCount: number): boolean {
  const limit = getGamificationLimit(planTier);
  return currentCount < limit;
}

/**
 * ゲーム作成が可能かチェック（集客メーカー用）
 */
export function canCreateMakersGamification(planTier: MakersPlanTier, currentCount: number): boolean {
  const limit = getMakersGamificationLimit(planTier);
  if (limit === -1) return true; // 無制限
  return currentCount < limit;
}

// ========================================
// 集客メーカープラン定義（フォールバック用）
// ========================================

export interface MakersPlanDefinition {
  id: MakersPlanTier;
  name: string;
  nameJa: string;
  price: number;
  priceType: 'monthly' | 'one_time';
  canCreate: boolean;
  canEdit: boolean;
  canUseAI: boolean;
  canUseAnalytics: boolean;
  canUseGamification: boolean;
  canDownloadHtml: boolean;
  canEmbed: boolean;
  canHideCopyright: boolean;
  canUseAffiliate: boolean;
  aiDailyLimit: number;
  toolCreationLimit: number;      // 汎用ツール作成上限（-1 = 無制限）
  gamificationLimit: number;
  newsletterMonthlyLimit: number; // 月間メルマガ送信数制限（-1 = 無制限）
  newsletterListLimit: number;    // メルマガリスト作成数制限（-1 = 無制限）
  funnelLimit: number;            // ファネル作成数制限（-1 = 無制限）
  features: string[];
}

export const MAKERS_PLAN_DEFINITIONS: Record<MakersPlanTier, MakersPlanDefinition> = {
  guest: {
    id: 'guest',
    name: 'Guest',
    nameJa: 'ゲスト',
    price: 0,
    priceType: 'one_time',
    canCreate: true,
    canEdit: false,
    canUseAI: false,
    canUseAnalytics: false,
    canUseGamification: false,
    canDownloadHtml: false,
    canEmbed: false,
    canHideCopyright: false,
    canUseAffiliate: false,
    aiDailyLimit: 0,
    toolCreationLimit: 1,
    gamificationLimit: 0,
    newsletterMonthlyLimit: 0,
    newsletterListLimit: 0,
    funnelLimit: 0,
    features: ['新規作成', 'ポータル掲載', 'URL発行'],
  },
  free: {
    id: 'free',
    name: 'Free',
    nameJa: 'フリープラン',
    price: 0,
    priceType: 'monthly',
    canCreate: true,
    canEdit: true,
    canUseAI: false,
    canUseAnalytics: false,
    canUseGamification: false,
    canDownloadHtml: false,
    canEmbed: false,
    canHideCopyright: false,
    canUseAffiliate: true,
    aiDailyLimit: 0,
    toolCreationLimit: 1,
    gamificationLimit: 0,
    newsletterMonthlyLimit: 0,
    newsletterListLimit: 1,
    funnelLimit: 1,
    features: ['新規作成', 'ポータル掲載', 'URL発行', '編集・更新', 'アフィリエイト機能'],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    nameJa: 'スタンダード',
    price: 1980,
    priceType: 'monthly',
    canCreate: true,
    canEdit: true,
    canUseAI: true,
    canUseAnalytics: true,
    canUseGamification: false,
    canDownloadHtml: true,
    canEmbed: true,
    canHideCopyright: false,
    canUseAffiliate: true,
    aiDailyLimit: 10,
    toolCreationLimit: 10,
    gamificationLimit: 0,
    newsletterMonthlyLimit: 0,
    newsletterListLimit: 3,
    funnelLimit: 3,
    features: [
      '新規作成', 'ポータル掲載', 'URL発行', '編集・更新',
      'アフィリエイト機能', 'AI利用（1日10回）', 'アクセス解析',
      'HTMLダウンロード', '埋め込みコード発行', 'ファネル（3件）',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    nameJa: 'ビジネス',
    price: 4980,
    priceType: 'monthly',
    canCreate: true,
    canEdit: true,
    canUseAI: true,
    canUseAnalytics: true,
    canUseGamification: true,
    canDownloadHtml: true,
    canEmbed: true,
    canHideCopyright: true,
    canUseAffiliate: true,
    aiDailyLimit: 50,
    toolCreationLimit: -1, // 無制限
    gamificationLimit: -1, // 無制限
    newsletterMonthlyLimit: 500,
    newsletterListLimit: -1, // 無制限
    funnelLimit: -1, // 無制限
    features: [
      '新規作成', 'ポータル掲載', 'URL発行', '編集・更新',
      'アフィリエイト機能', 'アクセス解析', 'AI利用（1日50回）',
      'ゲーミフィケーション（無制限）', 'HTMLダウンロード',
      '埋め込みコード発行', 'コピーライト非表示',
      'メルマガ（月500通）', 'お問い合わせ',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    nameJa: 'プレミアム',
    price: 9800,
    priceType: 'monthly',
    canCreate: true,
    canEdit: true,
    canUseAI: true,
    canUseAnalytics: true,
    canUseGamification: true,
    canDownloadHtml: true,
    canEmbed: true,
    canHideCopyright: true,
    canUseAffiliate: true,
    aiDailyLimit: 200,
    toolCreationLimit: -1, // 無制限
    gamificationLimit: -1, // 無制限
    newsletterMonthlyLimit: 1000,
    newsletterListLimit: -1, // 無制限
    funnelLimit: -1, // 無制限
    features: [
      '新規作成', 'ポータル掲載', 'URL発行', '編集・更新',
      'アフィリエイト機能', 'アクセス解析', 'AI利用（1日200回）',
      'ゲーミフィケーション（無制限）', 'HTMLダウンロード',
      '埋め込みコード発行', 'コピーライト非表示',
      'メルマガ（月1,000通）', 'お問い合わせ',
      '優先サポート', 'カスタムドメイン',
    ],
  },
};

// ========================================
// DB連携関数
// ========================================

/**
 * サービス別プラン設定をDBから取得（クライアントサイド用）
 */
export async function fetchServicePlans(service: ServiceType): Promise<any[]> {
  try {
    const response = await fetch(`/api/settings/plans?service=${service}`);
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    const data = await response.json();
    return data.plans?.[service] || [];
  } catch (err) {
    console.error('Error fetching service plans:', err);
    // フォールバック
    if (service === 'makers') {
      return Object.values(MAKERS_PLAN_DEFINITIONS);
    }
    return Object.values(PLAN_DEFINITIONS);
  }
}

/**
 * 集客メーカーのユーザープランを判定
 * @param isLoggedIn ログイン状態
 * @param subscriptionTier サブスクリプションのティア（省略時はfree）
 */
export function getMakersPlanTier(
  isLoggedIn: boolean,
  subscriptionTier?: MakersPlanTier | MakersPlanTierLegacy | boolean
): MakersPlanTier {
  if (!isLoggedIn) return 'guest';
  // レガシー互換: boolean の場合 true → business, false → free
  if (typeof subscriptionTier === 'boolean') {
    return subscriptionTier ? 'business' : 'free';
  }
  return normalizeMakersPlanTier(subscriptionTier);
}

/**
 * 集客メーカーの機能制限を取得
 */
export function getMakersFeatureLimits(planTier: MakersPlanTier): MakersPlanDefinition {
  return MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.guest;
}

// ========================================
// メルマガ送信制限
// ========================================

/**
 * 当月のメルマガ送信数を取得
 */
export async function getNewsletterUsage(userId: string): Promise<number> {
  const supabase = getServiceClient();
  if (!supabase) return 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data } = await supabase
    .from('newsletter_send_logs')
    .select('sent_count')
    .eq('user_id', userId)
    .gte('sent_at', monthStart);

  return (data || []).reduce((sum: number, log: { sent_count: number }) => sum + log.sent_count, 0);
}

/**
 * メルマガ送信可否チェック（送信可能な残数を返す）
 */
export async function checkNewsletterSendLimit(
  userId: string,
  planTier: MakersPlanTier,
  requestedCount: number
): Promise<{ canSend: boolean; remaining: number; limit: number; used: number }> {
  // 管理者は無制限
  const supabase = getServiceClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (user?.email) {
      const adminEmails = getAdminEmails();
      const isAdmin = adminEmails.some(
        (e: string) => e.toLowerCase() === user.email!.toLowerCase()
      );
      if (isAdmin) {
        return { canSend: true, remaining: -1, limit: -1, used: 0 };
      }
    }
  }

  const plan = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;
  const limit = plan.newsletterMonthlyLimit;

  if (limit === -1) {
    return { canSend: true, remaining: -1, limit: -1, used: 0 };
  }

  if (limit === 0) {
    return { canSend: false, remaining: 0, limit: 0, used: 0 };
  }

  const used = await getNewsletterUsage(userId);
  const remaining = Math.max(0, limit - used);
  const canSend = remaining >= requestedCount;

  return { canSend, remaining, limit, used };
}

/**
 * メルマガリスト作成数制限チェック
 */
export function getNewsletterListLimit(planTier: MakersPlanTier): number {
  const plan = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;
  return plan.newsletterListLimit;
}

/**
 * ファネル作成数制限チェック
 */
export function getFunnelLimit(planTier: MakersPlanTier): number {
  const plan = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;
  return plan.funnelLimit;
}

// ========================================
// ツール作成数制限（統一チェック）
// ========================================

/** 常に無制限のツール（toolCreationLimitを適用しない） */
export const UNLIMITED_TOOLS = new Set([
  'attendance',
  'marketplace',
  'order-form',
]);

/** 専用の制限を持つツール（toolCreationLimitではなく個別関数で制御） */
export const SPECIAL_LIMIT_TOOLS = new Set([
  'funnel',
  'newsletter',
  'gamification',
]);

/** ツール種別→テーブル名マッピング */
export const TOOL_TABLE_MAP: Record<string, { table: string; userIdColumn: string; extraFilter?: Record<string, string> }> = {
  profile:            { table: 'profiles', userIdColumn: 'user_id' },
  business:           { table: 'business_projects', userIdColumn: 'user_id' },
  quiz:               { table: 'quizzes', userIdColumn: 'user_id', extraFilter: { quiz_type: 'business' } },
  entertainment_quiz: { table: 'quizzes', userIdColumn: 'user_id', extraFilter: { quiz_type: 'entertainment' } },
  salesletter:        { table: 'sales_letters', userIdColumn: 'user_id' },
  survey:             { table: 'surveys', userIdColumn: 'user_id' },
  booking:            { table: 'booking_menus', userIdColumn: 'user_id' },
  webinar:            { table: 'webinar_lps', userIdColumn: 'user_id' },
  onboarding:         { table: 'onboarding_modals', userIdColumn: 'user_id' },
  thumbnail:          { table: 'thumbnails', userIdColumn: 'user_id' },
  sns_post:           { table: 'sns_posts', userIdColumn: 'user_id' },
  'step-email':       { table: 'step_email_sequences', userIdColumn: 'user_id' },
  site:               { table: 'sites', userIdColumn: 'user_id' },
};

/** ツール日本語名 */
export const TOOL_NAME_JA: Record<string, string> = {
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
  quiz: '診断クイズ',
  entertainment_quiz: 'エンタメ診断',
  salesletter: 'セールスレター',
  survey: 'アンケート',
  booking: '予約メニュー',
  webinar: 'ウェビナーLP',
  onboarding: 'ガイドメーカー',
  thumbnail: 'サムネイル',
  sns_post: 'SNS投稿',
  'step-email': 'ステップメール',
  site: 'ホームページメーカー',
  funnel: 'ファネル',
  newsletter: 'メルマガリスト',
  gamification: 'ゲーミフィケーション',
  attendance: '出欠表',
  marketplace: 'スキルマーケット',
  'order-form': 'フォームメーカー',
};

/**
 * 汎用ツール作成数制限チェック
 * UNLIMITED_TOOLS/SPECIAL_LIMIT_TOOLS以外の全ツールに適用
 */
export async function checkToolCreationLimit(
  userId: string,
  planTier: MakersPlanTier,
  toolType: string
): Promise<{ allowed: boolean; current: number; limit: number; message?: string }> {
  // 常に無制限のツール
  if (UNLIMITED_TOOLS.has(toolType)) {
    return { allowed: true, current: 0, limit: -1 };
  }

  // 専用の制限を持つツール
  if (SPECIAL_LIMIT_TOOLS.has(toolType)) {
    // funnel/newsletter/gamificationは専用関数を使うべき
    // ここではフォールバックとしてtoolCreationLimitで判定
    const planDef = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;
    if (toolType === 'funnel') {
      const limit = planDef.funnelLimit;
      if (limit === -1) return { allowed: true, current: 0, limit: -1 };
      if (limit === 0) return { allowed: false, current: 0, limit: 0, message: planLimitErrorMessage(toolType, limit, planTier) };
    }
    if (toolType === 'newsletter') {
      const limit = planDef.newsletterListLimit;
      if (limit === -1) return { allowed: true, current: 0, limit: -1 };
      if (limit === 0) return { allowed: false, current: 0, limit: 0, message: planLimitErrorMessage(toolType, limit, planTier) };
    }
    if (toolType === 'gamification') {
      const limit = getMakersGamificationLimit(planTier);
      if (limit === -1) return { allowed: true, current: 0, limit: -1 };
      if (limit === 0) return { allowed: false, current: 0, limit: 0, message: planLimitErrorMessage(toolType, limit, planTier) };
    }
    // 制限ありの場合はDB countが必要 → 各専用ルートで処理
    return { allowed: true, current: 0, limit: -1 };
  }

  const planDef = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;
  const limit = planDef.toolCreationLimit;

  // 無制限プラン
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 };
  }

  const toolConfig = TOOL_TABLE_MAP[toolType];
  if (!toolConfig) {
    console.warn(`[checkToolCreationLimit] Unknown tool type: ${toolType}`);
    return { allowed: true, current: 0, limit: -1 };
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return { allowed: true, current: 0, limit: -1 };
  }

  let query = supabase
    .from(toolConfig.table)
    .select('*', { count: 'exact', head: true })
    .eq(toolConfig.userIdColumn, userId);

  if (toolConfig.extraFilter) {
    for (const [key, value] of Object.entries(toolConfig.extraFilter)) {
      query = query.eq(key, value);
    }
  }

  const { count } = await query;
  const current = count || 0;

  if (current >= limit) {
    return { allowed: false, current, limit, message: planLimitErrorMessage(toolType, limit, planTier) };
  }

  return { allowed: true, current, limit };
}

/**
 * 統一エラーメッセージ生成
 */
export function planLimitErrorMessage(
  toolType: string,
  limit: number,
  planTier: MakersPlanTier
): string {
  const toolName = TOOL_NAME_JA[toolType] || toolType;
  const tierName = MAKERS_PLAN_DEFINITIONS[planTier]?.nameJa || planTier;

  if (limit === 0) {
    return `${toolName}は上位プランでご利用いただけます。料金ページでプラン詳細をご確認ください。`;
  }
  return `${tierName}では${toolName}は${limit}個まで作成できます。上位プランにアップグレードすると、より多く作成できます。`;
}

/**
 * 汎用ツール作成上限を取得
 */
export function getToolCreationLimit(planTier: MakersPlanTier): number {
  const plan = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;
  return plan.toolCreationLimit;
}

