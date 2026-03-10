/**
 * ポイントシステム ユーティリティ
 *
 * ポイントの残高確認・消費・加算・コスト取得を行う
 * DBの排他制御はSupabaseのRPC関数（consume_points / add_points）で保証
 */

import { createClient } from '@supabase/supabase-js';

// ─── 型定義 ───

export interface PointBalance {
  balance: number;
  totalPurchased: number;
  totalConsumed: number;
  totalGranted: number;
}

export interface PointTransaction {
  id: string;
  type: 'purchase' | 'consume' | 'grant_monthly' | 'grant_bonus' | 'refund' | 'expire';
  amount: number;
  balanceAfter: number;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface PointPack {
  id: string;
  name: string;
  points: number;
  price: number;
  bonusPoints: number;
  totalPoints: number; // points + bonusPoints
}

export interface PointCost {
  serviceType: string;
  action: string;
  cost: number;
  description: string | null;
}

export interface ConsumeResult {
  success: boolean;
  error?: 'insufficient_balance' | 'no_points_record' | 'pro_user' | string;
  balance?: number;
  consumed?: number;
  transactionId?: string;
}

export interface AddResult {
  success: boolean;
  error?: string;
  balance?: number;
  added?: number;
  transactionId?: string;
}

// Proプランの月次ポイント付与量
export const PRO_MONTHLY_POINTS = 1500;

// ─── Admin Supabaseクライアント取得 ───

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

// ─── ポイント残高取得 ───

export async function getPointBalance(userId: string): Promise<PointBalance> {
  const supabase = getAdminClient();

  const { data } = await supabase
    .from('user_points')
    .select('balance, total_purchased, total_consumed, total_granted')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    return { balance: 0, totalPurchased: 0, totalConsumed: 0, totalGranted: 0 };
  }

  return {
    balance: data.balance,
    totalPurchased: data.total_purchased,
    totalConsumed: data.total_consumed,
    totalGranted: data.total_granted,
  };
}

// ─── ポイント消費 ───

export async function consumePoints(
  userId: string,
  amount: number,
  description?: string,
  metadata?: Record<string, any>
): Promise<ConsumeResult> {
  const supabase = getAdminClient();

  const { data, error } = await supabase.rpc('consume_points', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description || null,
    p_metadata: metadata || {},
  });

  if (error) {
    console.error('consumePoints error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: data.success,
    error: data.error,
    balance: data.balance,
    consumed: data.consumed,
    transactionId: data.transaction_id,
  };
}

// ─── ポイント加算 ───

export async function addPoints(
  userId: string,
  amount: number,
  type: 'purchase' | 'grant_monthly' | 'grant_bonus' | 'refund' = 'purchase',
  description?: string,
  metadata?: Record<string, any>
): Promise<AddResult> {
  const supabase = getAdminClient();

  const { data, error } = await supabase.rpc('add_points', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description || null,
    p_metadata: metadata || {},
  });

  if (error) {
    console.error('addPoints error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: data.success,
    error: data.error,
    balance: data.balance,
    added: data.added,
    transactionId: data.transaction_id,
  };
}

// ─── ツールのポイントコスト取得 ───

export async function getPointCost(serviceType: string, action: string = 'save'): Promise<number> {
  const supabase = getAdminClient();

  const { data } = await supabase
    .from('point_costs')
    .select('cost')
    .eq('service_type', serviceType)
    .eq('action', action)
    .eq('is_active', true)
    .maybeSingle();

  return data?.cost ?? 0;
}

// ─── 全ポイントコスト一覧取得 ───

export async function getAllPointCosts(): Promise<PointCost[]> {
  const supabase = getAdminClient();

  const { data } = await supabase
    .from('point_costs')
    .select('service_type, action, cost, description')
    .eq('is_active', true)
    .order('service_type');

  return (data || []).map(row => ({
    serviceType: row.service_type,
    action: row.action,
    cost: row.cost,
    description: row.description,
  }));
}

// ─── ポイントパック一覧取得 ───

export async function getPointPacks(): Promise<PointPack[]> {
  const supabase = getAdminClient();

  const { data } = await supabase
    .from('point_packs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    points: row.points,
    price: row.price,
    bonusPoints: row.bonus_points,
    totalPoints: row.points + row.bonus_points,
  }));
}

// ─── 取引履歴取得 ───

export async function getPointTransactions(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<PointTransaction[]> {
  const supabase = getAdminClient();

  const { data } = await supabase
    .from('point_transactions')
    .select('id, type, amount, balance_after, description, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return (data || []).map(row => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    balanceAfter: row.balance_after,
    description: row.description,
    metadata: row.metadata,
    createdAt: row.created_at,
  }));
}

// ─── ポイント消費チェック（Proユーザーはバイパス） ───

export async function checkAndConsumePoints(
  userId: string,
  serviceType: string,
  action: string = 'save',
  isPro: boolean = false,
  contentId?: string
): Promise<ConsumeResult> {
  // Proユーザーはポイント消費不要
  if (isPro) {
    return { success: true, error: 'pro_user', balance: -1, consumed: 0 };
  }

  const cost = await getPointCost(serviceType, action);

  // コストが0の場合は消費不要
  if (cost === 0) {
    return { success: true, consumed: 0 };
  }

  const result = await consumePoints(userId, cost, `${serviceType} ${action}`, {
    service_type: serviceType,
    action,
    content_id: contentId,
  });

  // user_points レコードが存在しない場合は自動作成して再試行
  if (!result.success && result.error === 'no_points_record') {
    const supabase = getAdminClient();
    await supabase
      .from('user_points')
      .insert({ user_id: userId, balance: 0 })
      .single();

    // 残高0なので insufficient_balance を返す
    return { success: false, error: 'insufficient_balance', balance: 0, consumed: 0 };
  }

  return result;
}
