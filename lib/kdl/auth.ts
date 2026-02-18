/**
 * KDL認証ユーティリティ
 * 将来の独立化時に、認証システムを差し替えられるように抽象化
 */

import { getAdminEmails } from '@/lib/constants';
import type { KdlUserRole } from './config';

/**
 * ユーザーが管理者かどうかを判定
 */
export function isKdlAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  
  const adminEmails = getAdminEmails();
  return adminEmails.some((adminEmail: string) =>
    email.toLowerCase() === adminEmail.toLowerCase()
  );
}

/**
 * ユーザーのKDLロールを判定
 * TODO: 代理店判定のロジックを追加
 */
export async function getKdlUserRole(
  userId: string,
  email: string | undefined | null,
  supabase: any
): Promise<KdlUserRole> {
  // 管理者チェック
  if (isKdlAdmin(email)) {
    return 'admin';
  }
  
  // 代理店チェック（DBから取得）
  if (supabase) {
    try {
      const { data: agencyData } = await supabase
        .from('kdl_agencies')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (agencyData) {
        return 'agency';
      }
    } catch {
      // テーブルが存在しない場合などはスキップ
    }
  }
  
  return 'user';
}

/**
 * KDLへのアクセス権があるかチェック
 */
export async function hasKdlAccess(
  userId: string,
  supabase: any
): Promise<{ hasAccess: boolean; reason: string }> {
  if (!supabase) {
    return { hasAccess: false, reason: 'no_supabase' };
  }
  
  try {
    // 1. 課金ユーザーチェック
    const { data: subscription } = await supabase
      .from('kdl_subscriptions')
      .select('status, plan_tier')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();
    
    if (subscription) {
      return { hasAccess: true, reason: 'subscription' };
    }
    
    // 2. モニターユーザーチェック
    const now = new Date().toISOString();
    const { data: monitor } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type')
      .eq('user_id', userId)
      .lte('monitor_start_at', now)
      .gt('monitor_expires_at', now)
      .order('monitor_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (monitor) {
      return { hasAccess: true, reason: 'monitor' };
    }
    
    return { hasAccess: false, reason: 'no_subscription' };
  } catch (error) {
    console.error('KDL access check error:', error);
    return { hasAccess: false, reason: 'error' };
  }
}

/**
 * プランティアを取得
 */
export async function getKdlPlanTier(
  userId: string,
  supabase: any
): Promise<string> {
  if (!supabase) {
    return 'none';
  }
  
  try {
    // 1. 課金ユーザーチェック
    const { data: subscription } = await supabase
      .from('kdl_subscriptions')
      .select('plan_tier')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();
    
    if (subscription?.plan_tier) {
      return subscription.plan_tier;
    }
    
    // 2. モニターユーザーチェック
    const now = new Date().toISOString();
    const { data: monitor } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type')
      .eq('user_id', userId)
      .lte('monitor_start_at', now)
      .gt('monitor_expires_at', now)
      .order('monitor_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (monitor?.monitor_plan_type) {
      return monitor.monitor_plan_type;
    }
    
    return 'none';
  } catch (error) {
    console.error('Get KDL plan tier error:', error);
    return 'none';
  }
}
