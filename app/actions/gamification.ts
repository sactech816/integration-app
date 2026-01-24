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
  UserGamificationSettings,
  WelcomeBonusResult,
  MissionProgressWithDetails,
  MissionUpdateResult,
  MissionRewardResult,
  AllMissionsBonusCheck,
  DailyMission,
  MissionType,
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
  if (!supabase) {
    console.error('[Gamification] Database not configured for getPointBalance');
    return null;
  }
  
  const sessionId = userId ? null : await getSessionId();
  
  console.log('[Gamification] getPointBalance called:', { userId, sessionId });
  
  if (!userId && !sessionId) {
    console.warn('[Gamification] No userId or sessionId available');
    return null;
  }
  
  const { data, error } = await supabase.rpc('get_user_point_balance', {
    p_user_id: userId || null,
    p_session_id: sessionId,
  });
  
  if (error) {
    console.error('[Gamification] Get point balance error:', error);
    console.error('[Gamification] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  
  console.log('[Gamification] Point balance response:', data);
  
  if (data && data.length > 0) {
    return {
      id: '',
      user_id: userId,
      session_id: sessionId,
      current_points: data[0].current_points,
      total_accumulated_points: data[0].total_accumulated_points,
    };
  }
  
  // データがない場合は初期値を返す
  console.log('[Gamification] No balance found, returning default 0');
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
    console.error('[Gamification] Database not configured');
    return { success: false, error: 'Database not configured' };
  }
  
  const sessionId = options?.userId ? null : await getOrCreateSessionId();
  
  // デバッグログ
  console.log('[Gamification] updatePoints called:', {
    changeAmount,
    eventType,
    userId: options?.userId,
    sessionId,
    campaignId: options?.campaignId,
    eventData: options?.eventData,
  });
  
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
    console.error('[Gamification] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { success: false, error: error.message };
  }
  
  console.log('[Gamification] Update points response:', data);
  
  if (data && data.length > 0 && data[0].success) {
    console.log('[Gamification] Points updated successfully:', {
      newBalance: data[0].new_balance,
      logId: data[0].log_id,
    });
    return { success: true, newBalance: data[0].new_balance };
  }
  
  console.warn('[Gamification] Points update failed:', data);
  return { success: false, error: 'Insufficient points or update failed' };
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
    console.error('[Gamification] Database not configured for acquireStamp');
    return { success: false, error: 'Database not configured' };
  }
  
  const sessionId = userId ? null : await getOrCreateSessionId();
  
  console.log('[Gamification] acquireStamp called:', { campaignId, stampId, stampIndex, userId, sessionId });
  
  // 重複チェック
  const { data: isAcquired } = await supabase.rpc('check_stamp_acquired', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
    p_stamp_id: stampId,
  });
  
  console.log('[Gamification] Stamp already acquired:', isAcquired);
  
  if (isAcquired) {
    return { success: false, alreadyAcquired: true };
  }
  
  // キャンペーン設定を取得
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    console.error('[Gamification] Campaign not found:', campaignId);
    return { success: false, error: 'Campaign not found' };
  }
  
  const settings = campaign.settings as StampRallySettings;
  const pointsPerStamp = settings.points_per_stamp || 1;
  
  console.log('[Gamification] Granting', pointsPerStamp, 'points for stamp');
  
  // ポイントを付与
  const result = await updatePoints(pointsPerStamp, 'stamp_get', {
    userId,
    campaignId,
    eventData: { stamp_id: stampId, stamp_index: stampIndex },
  });
  
  if (!result.success) {
    console.error('[Gamification] Failed to grant stamp points:', result.error);
    return result;
  }
  
  // コンプリートチェック
  const stamps = await getUserStamps(campaignId, userId);
  console.log('[Gamification] Total stamps acquired:', stamps.length, '/', settings.total_stamps);
  
  if (stamps.length + 1 >= (settings.total_stamps || 10)) {
    // コンプリートボーナス付与
    if (settings.completion_bonus) {
      console.log('[Gamification] Granting completion bonus:', settings.completion_bonus);
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
    console.error('[Gamification] Database not configured for claimLoginBonus');
    return { success: false, error: 'Database not configured' };
  }
  
  const sessionId = userId ? null : await getOrCreateSessionId();
  
  console.log('[Gamification] claimLoginBonus called:', { campaignId, userId, sessionId });
  
  // 今日すでに取得済みかチェック
  const { data: alreadyClaimed } = await supabase.rpc('check_login_bonus_today', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
  });
  
  console.log('[Gamification] Login bonus already claimed today:', alreadyClaimed);
  
  if (alreadyClaimed) {
    return { success: false, alreadyClaimed: true };
  }
  
  // キャンペーン設定を取得
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    console.error('[Gamification] Campaign not found:', campaignId);
    return { success: false, error: 'Campaign not found' };
  }
  
  const settings = campaign.settings as { points_per_day?: number };
  const pointsPerDay = settings.points_per_day || 1;
  
  console.log('[Gamification] Granting login bonus:', pointsPerDay, 'points');
  
  // ポイントを付与
  const result = await updatePoints(pointsPerDay, 'login_bonus', {
    userId,
    campaignId,
    eventData: { date: new Date().toISOString() },
  });
  
  if (!result.success) {
    console.error('[Gamification] Failed to grant login bonus:', result.error);
    return result;
  }
  
  console.log('[Gamification] Login bonus granted successfully');
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
    console.error('[Gamification] Database not configured for playGacha');
    return { success: false, error_code: 'campaign_not_found' };
  }
  
  const sessionId = userId ? null : await getOrCreateSessionId();
  
  console.log('[Gamification] playGacha called:', { campaignId, userId, sessionId });
  
  const { data, error } = await supabase.rpc('play_gacha', {
    p_user_id: userId || null,
    p_session_id: sessionId,
    p_campaign_id: campaignId,
  });
  
  if (error) {
    console.error('[Gamification] Play gacha error:', error);
    console.error('[Gamification] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { success: false, error_code: 'campaign_not_found' };
  }
  
  console.log('[Gamification] Play gacha response:', data);
  
  if (data && data.length > 0) {
    const result = data[0];
    console.log('[Gamification] Gacha result details:', {
      success: result.success,
      error_code: result.error_code,
      prize_name: result.prize_name,
      is_winning: result.is_winning,
      new_balance: result.new_balance,
      points_won: result.points_won,
    });
    return {
      success: result.success,
      error_code: result.error_code,
      prize_id: result.prize_id,
      prize_name: result.prize_name,
      prize_image_url: result.prize_image_url,
      is_winning: result.is_winning,
      new_balance: result.new_balance,
      points_won: result.points_won || 0,
    };
  }
  
  console.warn('[Gamification] No data returned from play_gacha');
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

// =============================================
// ゲーミフィケーション v2 機能
// =============================================

/**
 * ウェルカムボーナスを取得（既存ユーザーも対象）
 */
export async function claimWelcomeBonus(userId: string): Promise<WelcomeBonusResult> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, points_granted: 0, already_claimed: false, message: 'Database not configured' };
  }
  
  const { data, error } = await supabase.rpc('claim_welcome_bonus', {
    p_user_id: userId,
  });
  
  if (error) {
    console.error('[Gamification] Claim welcome bonus error:', error);
    return { success: false, points_granted: 0, already_claimed: false, message: error.message };
  }
  
  if (data && data.length > 0) {
    return {
      success: data[0].success,
      points_granted: data[0].points_granted,
      already_claimed: data[0].already_claimed,
      message: data[0].message,
    };
  }
  
  return { success: false, points_granted: 0, already_claimed: false, message: 'Unknown error' };
}

/**
 * ユーザーのゲーミフィケーション設定を取得
 */
export async function getUserGamificationSettings(userId: string): Promise<UserGamificationSettings | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  const { data, error } = await supabase.rpc('get_or_create_user_gamification_settings', {
    p_user_id: userId,
  });
  
  if (error) {
    console.error('[Gamification] Get user settings error:', error);
    return null;
  }
  
  return data;
}

/**
 * ユーザーの通知設定を更新
 */
export async function updateUserNotificationSettings(
  userId: string,
  settings: Partial<Pick<UserGamificationSettings, 
    'hide_login_bonus_toast' | 
    'hide_welcome_toast' | 
    'hide_stamp_notifications' | 
    'hide_mission_notifications' | 
    'hide_point_notifications'
  >>
): Promise<UserGamificationSettings | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  
  const { data, error } = await supabase.rpc('update_user_notification_settings', {
    p_user_id: userId,
    p_hide_login_bonus_toast: settings.hide_login_bonus_toast,
    p_hide_welcome_toast: settings.hide_welcome_toast,
    p_hide_stamp_notifications: settings.hide_stamp_notifications,
    p_hide_mission_notifications: settings.hide_mission_notifications,
    p_hide_point_notifications: settings.hide_point_notifications,
  });
  
  if (error) {
    console.error('[Gamification] Update notification settings error:', error);
    return null;
  }
  
  return data;
}

/**
 * 管理者設定を取得
 */
export async function getAdminGamificationSetting(settingKey: string): Promise<Record<string, unknown>> {
  const supabase = getSupabaseServer();
  if (!supabase) return {};
  
  const { data, error } = await supabase.rpc('get_admin_gamification_setting', {
    p_setting_key: settingKey,
  });
  
  if (error) {
    console.error('[Gamification] Get admin setting error:', error);
    return {};
  }
  
  return data || {};
}

/**
 * 管理者設定を更新
 */
export async function updateAdminGamificationSetting(
  settingKey: string,
  settingValue: Record<string, unknown>,
  updatedBy: string
): Promise<boolean> {
  const supabase = getSupabaseServer();
  if (!supabase) return false;
  
  const { error } = await supabase.rpc('update_admin_gamification_setting', {
    p_setting_key: settingKey,
    p_setting_value: settingValue,
    p_updated_by: updatedBy,
  });
  
  if (error) {
    console.error('[Gamification] Update admin setting error:', error);
    return false;
  }
  
  return true;
}

/**
 * 全ての管理者設定を取得
 */
export async function getAllAdminGamificationSettings(): Promise<Record<string, Record<string, unknown>>> {
  const supabase = getSupabaseServer();
  if (!supabase) return {};
  
  const { data, error } = await supabase
    .from('admin_gamification_settings')
    .select('*');
  
  if (error) {
    console.error('[Gamification] Get all admin settings error:', error);
    return {};
  }
  
  const settings: Record<string, Record<string, unknown>> = {};
  for (const item of data || []) {
    settings[item.setting_key] = item.setting_value;
  }
  
  return settings;
}

// =============================================
// デイリーミッション
// =============================================

/**
 * 今日のミッション進捗を取得
 */
export async function getTodayMissionsProgress(userId: string): Promise<MissionProgressWithDetails[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const { data, error } = await supabase.rpc('get_today_missions_progress', {
    p_user_id: userId,
  });
  
  if (error) {
    console.error('[Gamification] Get today missions error:', error);
    return [];
  }
  
  return data || [];
}

/**
 * ミッション進捗を更新
 */
export async function updateMissionProgress(
  userId: string,
  missionType: MissionType,
  increment: number = 1
): Promise<MissionUpdateResult[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const { data, error } = await supabase.rpc('update_mission_progress', {
    p_user_id: userId,
    p_mission_type: missionType,
    p_increment: increment,
  });
  
  if (error) {
    console.error('[Gamification] Update mission progress error:', error);
    return [];
  }
  
  return data || [];
}

/**
 * ミッション報酬を受け取る
 */
export async function claimMissionReward(
  userId: string,
  missionId: string
): Promise<MissionRewardResult> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, points_granted: 0, error_message: 'Database not configured' };
  }
  
  const { data, error } = await supabase.rpc('claim_mission_reward', {
    p_user_id: userId,
    p_mission_id: missionId,
  });
  
  if (error) {
    console.error('[Gamification] Claim mission reward error:', error);
    return { success: false, points_granted: 0, error_message: error.message };
  }
  
  if (data && data.length > 0) {
    return {
      success: data[0].success,
      points_granted: data[0].points_granted,
      error_message: data[0].error_message,
    };
  }
  
  return { success: false, points_granted: 0, error_message: 'Unknown error' };
}

/**
 * 全ミッション達成ボーナスをチェック
 */
export async function checkAllMissionsBonus(userId: string): Promise<AllMissionsBonusCheck> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { all_completed: false, bonus_available: false, bonus_points: 0 };
  }
  
  const { data, error } = await supabase.rpc('check_all_missions_bonus', {
    p_user_id: userId,
  });
  
  if (error) {
    console.error('[Gamification] Check all missions bonus error:', error);
    return { all_completed: false, bonus_available: false, bonus_points: 0 };
  }
  
  if (data && data.length > 0) {
    return {
      all_completed: data[0].all_completed,
      bonus_available: data[0].bonus_available,
      bonus_points: data[0].bonus_points,
    };
  }
  
  return { all_completed: false, bonus_available: false, bonus_points: 0 };
}

/**
 * 全ミッション達成ボーナスを受け取る
 */
export async function claimAllMissionsBonus(userId: string): Promise<MissionRewardResult> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { success: false, points_granted: 0, error_message: 'Database not configured' };
  }
  
  const { data, error } = await supabase.rpc('claim_all_missions_bonus', {
    p_user_id: userId,
  });
  
  if (error) {
    console.error('[Gamification] Claim all missions bonus error:', error);
    return { success: false, points_granted: 0, error_message: error.message };
  }
  
  if (data && data.length > 0) {
    return {
      success: data[0].success,
      points_granted: data[0].points_granted,
      error_message: data[0].error_message,
    };
  }
  
  return { success: false, points_granted: 0, error_message: 'Unknown error' };
}

/**
 * デイリーミッション一覧を取得
 */
export async function getDailyMissions(): Promise<DailyMission[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('[Gamification] Get daily missions error:', error);
    return [];
  }
  
  return data || [];
}


