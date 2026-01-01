'use server';

import { createClient } from '@supabase/supabase-js';
import { ContentType } from './analytics';

// サーバーサイド用Supabaseクライアント
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) return null;
  
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// 購入データの型定義
export interface Purchase {
  id: number;
  user_id: string;
  content_id: string;
  content_type: ContentType;
  stripe_session_id: string;
  amount: number;
  created_at: string;
}

/**
 * ユーザーの購入履歴を取得
 */
export async function getUserPurchases(
  userId: string,
  contentType?: ContentType
): Promise<Purchase[]> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return [];
    }

    let query = supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Purchases] Fetch error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Purchases] Unexpected error:', error);
    return [];
  }
}

/**
 * 特定のコンテンツに対する購入があるか確認
 */
export async function hasPurchase(
  userId: string,
  contentId: string,
  contentType: ContentType
): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return false;
    }

    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .limit(1);

    if (error) {
      console.error('[Purchases] Check error:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('[Purchases] Unexpected error:', error);
    return false;
  }
}

/**
 * Pro機能が利用可能か確認
 * - 管理者メールに含まれればtrue（全コンテンツ）
 * - パートナーで自分が作成したコンテンツであればtrue
 * - 該当コンテンツへの購入があればtrue
 */
export async function hasProAccess(
  userId: string,
  userEmail: string | undefined,
  contentId: string,
  contentType: ContentType,
  contentOwnerId?: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  try {
    // 1. 管理者チェック
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (userEmail && adminEmails.includes(userEmail)) {
      return { hasAccess: true, reason: 'admin' };
    }

    // 2. パートナーチェック（自分が作成したコンテンツのみ）
    if (contentOwnerId && userId === contentOwnerId) {
      const isPartner = await checkIsPartner(userId);
      if (isPartner) {
        return { hasAccess: true, reason: 'partner' };
      }
    }

    // 3. 購入履歴チェック
    const purchased = await hasPurchase(userId, contentId, contentType);
    if (purchased) {
      return { hasAccess: true, reason: 'purchased' };
    }

    return { hasAccess: false };
  } catch (error) {
    console.error('[Purchases] Pro access check error:', error);
    return { hasAccess: false };
  }
}

/**
 * コンテンツへの総支援額を取得
 */
export async function getTotalDonations(
  contentId: string,
  contentType: ContentType
): Promise<number> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return 0;
    }

    const { data, error } = await supabase
      .from('purchases')
      .select('amount')
      .eq('content_id', contentId)
      .eq('content_type', contentType);

    if (error) {
      console.error('[Purchases] Sum error:', error);
      return 0;
    }

    const total = data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return total;
  } catch (error) {
    console.error('[Purchases] Unexpected error:', error);
    return 0;
  }
}

/**
 * 購入統計を取得
 */
export async function getPurchaseStats(
  userId: string
): Promise<{
  totalAmount: number;
  totalPurchases: number;
  byContentType: Record<ContentType, number>;
}> {
  try {
    const purchases = await getUserPurchases(userId);

    const totalAmount = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPurchases = purchases.length;
    
    const byContentType = purchases.reduce((acc, p) => {
      const type = p.content_type as ContentType;
      acc[type] = (acc[type] || 0) + (p.amount || 0);
      return acc;
    }, { quiz: 0, profile: 0, business: 0 } as Record<ContentType, number>);

    return {
      totalAmount,
      totalPurchases,
      byContentType
    };
  } catch (error) {
    console.error('[Purchases] Stats error:', error);
    return {
      totalAmount: 0,
      totalPurchases: 0,
      byContentType: { quiz: 0, profile: 0, business: 0 }
    };
  }
}

/**
 * パートナーステータスを確認
 */
export async function checkIsPartner(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return false;
    }

    // user_rolesテーブルからパートナーステータスを取得
    const { data, error } = await supabase
      .from('user_roles')
      .select('is_partner')
      .eq('user_id', userId)
      .single();

    if (error) {
      // レコードが存在しない場合はfalse
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('[Partner] Check error:', error);
      return false;
    }

    return data?.is_partner || false;
  } catch (error) {
    console.error('[Partner] Unexpected error:', error);
    return false;
  }
}

/**
 * パートナーステータスを設定（管理者のみ）
 */
export async function setPartnerStatus(
  userId: string,
  isPartner: boolean,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // RPC関数を呼び出してパートナーステータスを設定
    const { data, error } = await supabase.rpc('set_partner_status', {
      target_user_id: userId,
      partner_status: isPartner,
      note: note || null
    });

    if (error) {
      console.error('[Partner] Set status error:', error);
      return { success: false, error: error.message };
    }

    return { success: data || false };
  } catch (error) {
    console.error('[Partner] Unexpected error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * 全ユーザーとそのロール情報を取得（管理者用）
 */
export async function getAllUsersWithRoles(): Promise<{
  users: Array<{
    user_id: string;
    email: string;
    is_partner: boolean;
    partner_since: string | null;
    partner_note: string | null;
    user_created_at: string;
    total_purchases: number;
    total_donated: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { users: [], error: 'Supabase not configured' };
    }

    // RPC関数を呼び出して全ユーザー情報を取得
    const { data, error } = await supabase.rpc('get_all_users_with_roles');

    if (error) {
      console.error('[Partner] Get users error:', error);
      return { users: [], error: error.message };
    }

    return { users: data || [] };
  } catch (error) {
    console.error('[Partner] Unexpected error:', error);
    return { users: [], error: String(error) };
  }
}






















































