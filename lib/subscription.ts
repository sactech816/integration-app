/**
 * サブスクリプション管理ユーティリティ
 * ユーザーのサブスク状態を確認・管理
 */

import { createClient } from '@supabase/supabase-js';

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
    };
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, provider, status, amount, period, plan_name, next_payment_date, created_at')
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

    return {
      hasActiveSubscription: true,
      subscription,
      planType: data.period === 'yearly' ? 'yearly' : 'monthly',
    };
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    return {
      hasActiveSubscription: false,
      subscription: null,
      planType: 'none',
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
    };
  }
}

/**
 * サブスクの機能制限を取得
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


