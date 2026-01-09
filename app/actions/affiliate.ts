'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// アフィリエイト情報の型定義
export type AffiliateInfo = {
  id: string;
  referral_code: string;
  display_name: string | null;
  commission_rate: number;
  status: string;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  unpaid_earnings: number;
  created_at: string;
};

export type AffiliateStats = {
  affiliate_id: string;
  referral_code: string;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  unpaid_earnings: number;
  this_month_clicks: number;
  this_month_conversions: number;
  this_month_earnings: number;
};

export type AffiliateConversion = {
  id: string;
  service_type: string;
  plan_tier: string;
  plan_period: string;
  plan_amount: number;
  commission_amount: number;
  status: string;
  converted_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
};

// アフィリエイター登録
export async function registerAffiliate(userId: string, displayName?: string): Promise<{
  success: boolean;
  data?: AffiliateInfo;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('register_affiliate', {
      p_user_id: userId,
      p_display_name: displayName || null,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      // 登録後の詳細情報を取得（戻り値のカラム名はout_プレフィックス付き）
      const affiliateId = data[0].out_affiliate_id || data[0].affiliate_id;
      const { data: affiliateData, error: fetchError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', affiliateId)
        .single();

      if (fetchError) throw fetchError;

      return { success: true, data: affiliateData };
    }

    return { success: false, error: '登録に失敗しました' };
  } catch (error: any) {
    console.error('Register affiliate error:', error);
    return { success: false, error: error.message };
  }
}

// アフィリエイト情報を取得
export async function getAffiliateInfo(userId: string): Promise<{
  success: boolean;
  data?: AffiliateInfo;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return { success: true, data: undefined };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Get affiliate info error:', error);
    return { success: false, error: error.message };
  }
}

// アフィリエイト統計を取得
export async function getAffiliateStats(userId: string): Promise<{
  success: boolean;
  data?: AffiliateStats;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('get_affiliate_stats', {
      p_user_id: userId,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      return { success: true, data: data[0] };
    }

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('Get affiliate stats error:', error);
    return { success: false, error: error.message };
  }
}

// 成果履歴を取得
export async function getAffiliateConversions(userId: string, limit: number = 20): Promise<{
  success: boolean;
  data?: AffiliateConversion[];
  error?: string;
}> {
  try {
    // まずアフィリエイトIDを取得
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (affiliateError) {
      if (affiliateError.code === 'PGRST116') {
        return { success: true, data: [] };
      }
      throw affiliateError;
    }

    // 成果履歴を取得
    const { data, error } = await supabase
      .from('affiliate_conversions')
      .select('id, service_type, plan_tier, plan_period, plan_amount, commission_amount, status, converted_at, confirmed_at, paid_at')
      .eq('affiliate_id', affiliate.id)
      .order('converted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get affiliate conversions error:', error);
    return { success: false, error: error.message };
  }
}

// クリックを記録（APIルートから呼び出し用）
export async function recordAffiliateClick(
  referralCode: string,
  landingPage: string,
  serviceType: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
): Promise<{ success: boolean; clickId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('record_affiliate_click', {
      p_referral_code: referralCode,
      p_landing_page: landingPage,
      p_service_type: serviceType,
      p_ip_address: ipAddress || null,
      p_user_agent: userAgent || null,
      p_referrer: referrer || null,
    });

    if (error) throw error;

    return { success: true, clickId: data };
  } catch (error: any) {
    console.error('Record affiliate click error:', error);
    return { success: false, error: error.message };
  }
}

// 成約を記録（決済完了時に呼び出し）
export async function recordAffiliateConversion(
  referralCode: string,
  serviceType: string,
  subscriptionId: string,
  customerUserId: string,
  planTier: string,
  planPeriod: string,
  planAmount: number
): Promise<{ success: boolean; conversionId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('record_affiliate_conversion', {
      p_referral_code: referralCode,
      p_service_type: serviceType,
      p_subscription_id: subscriptionId,
      p_customer_user_id: customerUserId,
      p_plan_tier: planTier,
      p_plan_period: planPeriod,
      p_plan_amount: planAmount,
    });

    if (error) throw error;

    return { success: true, conversionId: data };
  } catch (error: any) {
    console.error('Record affiliate conversion error:', error);
    return { success: false, error: error.message };
  }
}

// 紹介コードの検証
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  affiliateId?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('referral_code', code)
      .single();

    if (error || !data) {
      return { valid: false };
    }

    return {
      valid: data.status === 'active',
      affiliateId: data.id,
    };
  } catch (error) {
    console.error('Validate referral code error:', error);
    return { valid: false };
  }
}

// 管理者用：全アフィリエイター一覧取得
export async function getAllAffiliates(): Promise<{
  success: boolean;
  data?: (AffiliateInfo & { email?: string })[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select(`
        *,
        users:user_id (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ユーザー情報を整形
    const formattedData = data?.map(item => ({
      ...item,
      email: (item.users as any)?.email,
      users: undefined,
    }));

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Get all affiliates error:', error);
    return { success: false, error: error.message };
  }
}

// 管理者用：報酬率を更新
export async function updateCommissionRate(
  affiliateId: string,
  newRate: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('affiliates')
      .update({ commission_rate: newRate })
      .eq('id', affiliateId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Update commission rate error:', error);
    return { success: false, error: error.message };
  }
}

// 管理者用：成果を確定
export async function confirmConversion(
  conversionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('affiliate_conversions')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', conversionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Confirm conversion error:', error);
    return { success: false, error: error.message };
  }
}

// 管理者用：支払い完了
export async function markConversionPaid(
  conversionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 成果情報を取得
    const { data: conversion, error: fetchError } = await supabase
      .from('affiliate_conversions')
      .select('affiliate_id, commission_amount')
      .eq('id', conversionId)
      .single();

    if (fetchError) throw fetchError;

    // 成果を支払い済みに更新
    const { error: updateError } = await supabase
      .from('affiliate_conversions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', conversionId);

    if (updateError) throw updateError;

    // アフィリエイターの未払い報酬を減らす
    const { error: affiliateError } = await supabase.rpc('update_affiliate_unpaid', {
      p_affiliate_id: conversion.affiliate_id,
      p_amount: conversion.commission_amount,
    });

    // RPCがない場合は直接更新
    if (affiliateError) {
      await supabase
        .from('affiliates')
        .update({
          unpaid_earnings: supabase.rpc('decrement_unpaid', { amount: conversion.commission_amount }),
        })
        .eq('id', conversion.affiliate_id);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Mark conversion paid error:', error);
    return { success: false, error: error.message };
  }
}

