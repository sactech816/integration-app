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
 * - 該当コンテンツへの購入があればtrue
 * - 管理者メールに含まれればtrue
 */
export async function hasProAccess(
  userId: string,
  userEmail: string | undefined,
  contentId: string,
  contentType: ContentType
): Promise<{ hasAccess: boolean; reason?: string }> {
  try {
    // 管理者チェック
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (userEmail && adminEmails.includes(userEmail)) {
      return { hasAccess: true, reason: 'admin' };
    }

    // 購入履歴チェック
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
 * コンテンツへの総寄付額を取得
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





























