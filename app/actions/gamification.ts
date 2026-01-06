'use server';

import { createClient } from '@supabase/supabase-js';
import { getOrCreateSessionId, getSessionId } from '@/lib/session';
import {
  GamificationCampaign,
  UserPointBalance,
  PointLog,
  GachaPrize,
  UserPrize,
  UserStamp,
  GachaResult,
  CampaignStats,
  CampaignType,
  CampaignSettings,
  GachaAnimationType,
  StampRallySettings,
} from '@/lib/types';

// サーバーサイド用Supabaseクライアント
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) return null;
  
  // Service Role Keyがあればそれを使用（RLSバイパス）、なければAnon Key
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// ユーザー認証情報を取得
async function getUserAuth(): Promise<{ userId: string | null }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { userId: null };
  
  // サーバーサイドではセッションからユーザー情報を取得できないため、
  // クライアントから渡されたuserIdを使用するか、匿名セッションを使用
  return { userId: null };
}

// =============================================
// キャンペーン管理
// =============================================

/**
 * キャンペーン一覧を取得
 */
export async function getCampaigns(ownerId?: string): Promise<GamificationCampaign[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  let query = supabase.from('gamification_campaigns').select('*');
  
  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('[Gamification] Get campaigns error:', error);
    return [];
  }
  
  return data || [];
}

/**
 * キャンペーンを取得
 */
export async function getCampaign(campaignId: string): Promise<GamificationCampaign | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('gamification_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();
  
  if (error) {
    console.error('[Gamification] Get campaign error:', error);
    return null;
  }
  
  return data;
}

/**
 * キャンペーンを作成
 */
export async function createCampaign(
  ownerId: string,
  title: string,
  campaignType: CampaignType,
  settings: CampaignSettings,
  options?: {
    description?: string;
    animationType?: GachaAnimationType;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ success: boolean; campaign?: GamificationCampaign; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const { data, error } = await supabase
    .from('gamification_campaigns')
    .insert({
      owner_id: ownerId,
      title,
      description: options?.description,
      campaign_type: campaignType,
      animation_type: options?.animationType,
      settings,
      start_date: options?.startDate,
      end_date: options?.endDate,
      status: 'active',
    })
    .select()
    .single();
  
  if (error) {
    console.error('[Gamification] Create campaign error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, campaign: data };
}

/**
 * キャンペーンを更新
 */
export async function updateCampaign(
  campaignId: string,
  updates: Partial<Pick<GamificationCampaign, 'title' | 'description' | 'status' | 'animation_type' | 'settings' | 'start_date' | 'end_date'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const { error } = await supabase
    .from('gamification_campaigns')
    .update(updates)
    .eq('id', campaignId);
  
  if (error) {
    console.error('[Gamification] Update campaign error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * キャンペーンを削除
 */
export async function deleteCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const { error } = await supabase
    .from('gamification_campaigns')
    .delete()
    .eq('id', campaignId);
  
  if (error) {
    console.error('[Gamification] Delete campaign error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// =============================================
// ポイント管理
// =============================================

/**
 * ポイント残高を取得
 */
export async function getPointBalance(userId?: string): Promise<UserPointBalance | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  const sessionId = userId ? null : await getSessionId();
  
  if (!userId && !sessionId) {
    return null;
  }
  
  const { data, error } = await supabase.rpc('get_user_point_balance', {
    p_user_id: userId || null,
    p_session_id: sessionId,
  });
  
  if (error) {
    console.error('[Gamification] Get point balance error:', error);
    return null;
  }
  
  if (data && data.length > 0) {
    return {
      id: '',
      user_id: userId,
      session_id: sessionId,
      current_points: data[0].current_points,
      total_accumulated_points: data[0].total_accumulated_points,
    };
  }
  
  return {
    id: '',
    user_id: userId,
    session_id: sessionId,
    current_points: 0,
    total_accumulated_points: 0,
  };
}

/**
 * ポイントを追加/減算
 */
export async function updatePoints(
  changeAmount: number,
  eventType: string,
  options?: {
    userId?: string;
    campaignId?: string;
    eventData?: Record<string, unknown>;
  }
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const sessionId = options?.userId ? null : await getOrCreateSessionId();
  
  const { data, error } = await supabase.rpc('update_user_points', {
    p_user_id: options?.userId || null,
    p_session_id: sessionId,
    p_change_amount: changeAmount,
    p_campaign_id: options?.campaignId || null,
    p_event_type: eventType,
    p_event_data: options?.eventData || {},
  });
  
  if (error) {
    console.error('[Gamification] Update points error:', error);
    return { success: false, error: error.message };
  }
  
  if (data && data.length > 0 && data[0].success) {
    return { success: true, newBalance: data[0].new_balance };
  }
  
  return { success: false, error: 'Insufficient points' };
}

// =============================================
// スタンプラリー
// =============================================

/**
 * スタンプを取得（重複チェック付き）
 */
export async function acquireStamp(
  campaignId: string,
  stampId: string,
  stampIndex: number,
  userId?: string
): Promise<{ success: boolean; alreadyAcquired?: boolean; newBalance?: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const sessionId = userId ? null : await getOrCreateSessionId();
  
  // 重複チェック
  const { data: isAcquired } = await supabase.rpc('check_stamp_acquired', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
    p_stamp_id: stampId,
  });
  
  if (isAcquired) {
    return { success: false, alreadyAcquired: true };
  }
  
  // キャンペーン設定を取得
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }
  
  const settings = campaign.settings as StampRallySettings;
  const pointsPerStamp = settings.points_per_stamp || 1;
  
  // ポイントを付与
  const result = await updatePoints(pointsPerStamp, 'stamp_get', {
    userId,
    campaignId,
    eventData: { stamp_id: stampId, stamp_index: stampIndex },
  });
  
  if (!result.success) {
    return result;
  }
  
  // コンプリートチェック
  const stamps = await getUserStamps(campaignId, userId);
  if (stamps.length + 1 >= (settings.total_stamps || 10)) {
    // コンプリートボーナス付与
    if (settings.completion_bonus) {
      await updatePoints(settings.completion_bonus, 'stamp_completion', {
        userId,
        campaignId,
        eventData: { completed: true },
      });
    }
  }
  
  return { success: true, newBalance: result.newBalance };
}

/**
 * ユーザーのスタンプ取得状況を取得
 */
export async function getUserStamps(campaignId: string, userId?: string): Promise<UserStamp[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const sessionId = userId ? null : await getSessionId();
  
  if (!userId && !sessionId) {
    return [];
  }
  
  const { data, error } = await supabase.rpc('get_user_stamps', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
  });
  
  if (error) {
    console.error('[Gamification] Get user stamps error:', error);
    return [];
  }
  
  return data || [];
}

// =============================================
// ログインボーナス
// =============================================

/**
 * ログインボーナスを取得（今日まだ取得していない場合）
 */
export async function claimLoginBonus(
  campaignId: string,
  userId?: string
): Promise<{ success: boolean; alreadyClaimed?: boolean; points?: number; newBalance?: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const sessionId = userId ? null : await getOrCreateSessionId();
  
  // 今日すでに取得済みかチェック
  const { data: alreadyClaimed } = await supabase.rpc('check_login_bonus_today', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
  });
  
  if (alreadyClaimed) {
    return { success: false, alreadyClaimed: true };
  }
  
  // キャンペーン設定を取得
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }
  
  const settings = campaign.settings as { points_per_day?: number };
  const pointsPerDay = settings.points_per_day || 1;
  
  // ポイントを付与
  const result = await updatePoints(pointsPerDay, 'login_bonus', {
    userId,
    campaignId,
    eventData: { date: new Date().toISOString() },
  });
  
  if (!result.success) {
    return result;
  }
  
  return { success: true, points: pointsPerDay, newBalance: result.newBalance };
}

/**
 * 今日ログインボーナスを取得済みかチェック
 */
export async function checkLoginBonusClaimed(campaignId: string, userId?: string): Promise<boolean> {
  const supabase = getSupabaseServer();
  if (!supabase) return true; // エラー時は取得済みとして扱う
  
  const sessionId = userId ? null : await getSessionId();
  
  if (!userId && !sessionId) {
    return false; // セッションがない場合は未取得
  }
  
  const { data } = await supabase.rpc('check_login_bonus_today', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
  });
  
  return data || false;
}

// =============================================
// ガチャ/抽選
// =============================================

/**
 * ガチャを回す
 */
export async function playGacha(
  campaignId: string,
  userId?: string
): Promise<GachaResult> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error_code: 'campaign_not_found' };
  }
  
  const sessionId = userId ? null : await getOrCreateSessionId();
  
  const { data, error } = await supabase.rpc('play_gacha', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
  });
  
  if (error) {
    console.error('[Gamification] Play gacha error:', error);
    return { success: false, error_code: 'campaign_not_found' };
  }
  
  if (data && data.length > 0) {
    const result = data[0];
    return {
      success: result.success,
      error_code: result.error_code,
      prize_id: result.prize_id,
      prize_name: result.prize_name,
      prize_image_url: result.prize_image_url,
      is_winning: result.is_winning,
      new_balance: result.new_balance,
    };
  }
  
  return { success: false, error_code: 'campaign_not_found' };
}

/**
 * ガチャ景品一覧を取得
 */
export async function getGachaPrizes(campaignId: string): Promise<GachaPrize[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('gacha_prizes')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('[Gamification] Get gacha prizes error:', error);
    return [];
  }
  
  return data || [];
}

/**
 * ガチャ景品を追加
 */
export async function addGachaPrize(
  campaignId: string,
  name: string,
  probability: number,
  isWinning: boolean,
  options?: {
    description?: string;
    imageUrl?: string;
    stock?: number;
    displayOrder?: number;
  }
): Promise<{ success: boolean; prize?: GachaPrize; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const { data, error } = await supabase
    .from('gacha_prizes')
    .insert({
      campaign_id: campaignId,
      name,
      description: options?.description,
      image_url: options?.imageUrl,
      probability,
      is_winning: isWinning,
      stock: options?.stock,
      display_order: options?.displayOrder || 0,
    })
    .select()
    .single();
  
  if (error) {
    console.error('[Gamification] Add gacha prize error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, prize: data };
}

/**
 * ガチャ景品を更新
 */
export async function updateGachaPrize(
  prizeId: string,
  updates: Partial<Pick<GachaPrize, 'name' | 'description' | 'image_url' | 'probability' | 'is_winning' | 'stock' | 'display_order'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const { error } = await supabase
    .from('gacha_prizes')
    .update(updates)
    .eq('id', prizeId);
  
  if (error) {
    console.error('[Gamification] Update gacha prize error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * ガチャ景品を削除
 */
export async function deleteGachaPrize(prizeId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, error: 'Database not configured' };
  }
  
  const { error } = await supabase
    .from('gacha_prizes')
    .delete()
    .eq('id', prizeId);
  
  if (error) {
    console.error('[Gamification] Delete gacha prize error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * ユーザーの獲得景品一覧を取得
 */
export async function getUserPrizes(userId?: string): Promise<UserPrize[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const sessionId = userId ? null : await getSessionId();
  
  if (!userId && !sessionId) {
    return [];
  }
  
  let query = supabase
    .from('user_prizes')
    .select(`
      *,
      prize:gacha_prizes(*)
    `)
    .order('created_at', { ascending: false });
  
  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('[Gamification] Get user prizes error:', error);
    return [];
  }
  
  return data || [];
}

// =============================================
// 統計
// =============================================

/**
 * キャンペーン統計を取得
 */
export async function getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  const { data, error } = await supabase.rpc('get_campaign_stats', {
    p_campaign_id: campaignId,
  });
  
  if (error) {
    console.error('[Gamification] Get campaign stats error:', error);
    return null;
  }
  
  if (data && data.length > 0) {
    return {
      total_participants: Number(data[0].total_participants) || 0,
      total_points_distributed: Number(data[0].total_points_distributed) || 0,
      total_gacha_plays: Number(data[0].total_gacha_plays) || 0,
      total_prizes_won: Number(data[0].total_prizes_won) || 0,
    };
  }
  
  return null;
}

/**
 * ポイント履歴を取得
 */
export async function getPointLogs(
  userId?: string,
  limit: number = 50
): Promise<PointLog[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const sessionId = userId ? null : await getSessionId();
  
  if (!userId && !sessionId) {
    return [];
  }
  
  let query = supabase
    .from('point_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('[Gamification] Get point logs error:', error);
    return [];
  }
  
  return data || [];
}

// =============================================
// アクティブなログインボーナスキャンペーンを取得
// =============================================

/**
 * アクティブなログインボーナスキャンペーンを取得
 */
export async function getActiveLoginBonusCampaign(): Promise<GamificationCampaign | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('gamification_campaigns')
    .select('*')
    .eq('campaign_type', 'login_bonus')
    .eq('status', 'active')
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .limit(1)
    .single();
  
  if (error) {
    // No active campaign found
    return null;
  }
  
  return data;
}

