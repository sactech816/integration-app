/**
 * サブスクリプション管理ユーティリティ
 * ユーザーのサブスク状態を確認・管理
 */

import { createClient } from '@supabase/supabase-js';

// ========================================
// サービス別プラン定義
// ========================================

// Kindle（KDL）のプランTier
export type PlanTier = 'none' | 'lite' | 'standard' | 'pro' | 'business' | 'enterprise';

// 集客メーカーのプランTier
export type MakersPlanTier = 'guest' | 'free' | 'pro';

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
    // モニター権限をチェック（有効期限内のもの）
    const { data: monitorData } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type, monitor_expires_at')
      .eq('user_id', userId)
      .lte('monitor_start_at', new Date().toISOString())
      .gt('monitor_expires_at', new Date().toISOString())
      .single();

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
  pro: 10,        // プロ: 10件まで（DBから取得可能）
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
  gamificationLimit: number;
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
    gamificationLimit: 0,
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
    canUseAffiliate: false,
    aiDailyLimit: 0,
    gamificationLimit: 0,
    features: ['新規作成', 'ポータル掲載', 'URL発行', '編集・更新', 'アフィリエイト機能'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameJa: 'プロプラン',
    price: 3980,
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
    aiDailyLimit: -1, // 無制限
    gamificationLimit: -1, // 無制限
    features: [
      '新規作成', 'ポータル掲載', 'URL発行', '編集・更新',
      'アフィリエイト機能', 'アクセス解析', 'AI利用（優先）',
      'ゲーミフィケーション（無制限）', 'HTMLダウンロード',
      '埋め込みコード発行', 'コピーライト非表示',
      'お問い合わせ', '各種セミナー参加', 'グループコンサル',
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
 */
export function getMakersPlanTier(
  isLoggedIn: boolean,
  hasProSubscription: boolean
): MakersPlanTier {
  if (!isLoggedIn) return 'guest';
  if (hasProSubscription) return 'pro';
  return 'free';
}

/**
 * 集客メーカーの機能制限を取得
 */
export function getMakersFeatureLimits(planTier: MakersPlanTier): MakersPlanDefinition {
  return MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.guest;
}


