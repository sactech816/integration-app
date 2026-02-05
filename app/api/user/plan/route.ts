/**
 * ユーザープラン権限API
 * ログインユーザーの集客メーカープラン権限を取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サービスロールクライアント
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

export interface UserPlanResponse {
  planTier: 'guest' | 'free' | 'pro';
  canHideCopyright: boolean;
  canUseAI: boolean;
  canUseAnalytics: boolean;
  canUseGamification: boolean;
  canDownloadHtml: boolean;
  canEmbed: boolean;
  isProUser: boolean;
  // 数量制限
  gamificationLimit: number;
  aiDailyLimit: number;
}

/**
 * GET: ユーザーのプラン権限を取得
 * クエリパラメータ: userId
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // ゲストユーザー（未ログイン）
    if (!userId) {
      return NextResponse.json<UserPlanResponse>({
        planTier: 'guest',
        canHideCopyright: false,
        canUseAI: false,
        canUseAnalytics: false,
        canUseGamification: false,
        canDownloadHtml: false,
        canEmbed: false,
        isProUser: false,
        gamificationLimit: 0,
        aiDailyLimit: 0,
      });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 1. ユーザーのサブスクリプション状態を確認（集客メーカーサービス限定）
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_tier, plan_name')
      .eq('user_id', userId)
      .eq('service', 'makers')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 2. モニターユーザーかどうかも確認（集客メーカーサービス限定）
    const now = new Date().toISOString();
    const { data: monitor } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type')
      .eq('user_id', userId)
      .eq('service', 'makers')
      .lte('monitor_start_at', now)
      .gt('monitor_expires_at', now)
      .single();

    // プランTierを判定
    let planTier: 'guest' | 'free' | 'pro' = 'free';
    
    // モニターユーザーはProとして扱う（集客メーカーのモニター権限があれば全てPro扱い）
    if (monitor) {
      planTier = 'pro';
    }
    // アクティブなサブスクリプションがある場合
    else if (subscription?.status === 'active') {
      // plan_tierがproの場合、またはplan_nameにproが含まれる場合
      if (subscription.plan_tier === 'pro' || 
          subscription.plan_name?.toLowerCase().includes('pro') ||
          subscription.plan_name?.toLowerCase().includes('プロ')) {
        planTier = 'pro';
      }
    }

    // 3. service_plansテーブルからプラン権限を取得（数量制限も含む）
    const { data: planSettings } = await supabase
      .from('service_plans')
      .select('can_hide_copyright, can_use_ai, can_use_analytics, can_use_gamification, can_download_html, can_embed, gamification_limit, ai_daily_limit')
      .eq('service', 'makers')
      .eq('plan_tier', planTier)
      .eq('is_active', true)
      .single();

    // フォールバック値（service_plansテーブルがない場合）
    const defaultPermissions = {
      guest: {
        canHideCopyright: false,
        canUseAI: false,
        canUseAnalytics: false,
        canUseGamification: false,
        canDownloadHtml: false,
        canEmbed: false,
        gamificationLimit: 0,
        aiDailyLimit: 0,
      },
      free: {
        canHideCopyright: false,
        canUseAI: false,
        canUseAnalytics: false,
        canUseGamification: false,
        canDownloadHtml: false,
        canEmbed: false,
        gamificationLimit: 0,
        aiDailyLimit: 0,
      },
      pro: {
        canHideCopyright: true,
        canUseAI: true,
        canUseAnalytics: true,
        canUseGamification: true,
        canDownloadHtml: true,
        canEmbed: true,
        gamificationLimit: 10,
        aiDailyLimit: -1, // 無制限
      },
    };

    // DBから取得した場合はその値を使用、なければフォールバック
    const defaults = defaultPermissions[planTier];

    return NextResponse.json<UserPlanResponse>({
      planTier,
      canHideCopyright: planSettings?.can_hide_copyright ?? defaults.canHideCopyright,
      canUseAI: planSettings?.can_use_ai ?? defaults.canUseAI,
      canUseAnalytics: planSettings?.can_use_analytics ?? defaults.canUseAnalytics,
      canUseGamification: planSettings?.can_use_gamification ?? defaults.canUseGamification,
      canDownloadHtml: planSettings?.can_download_html ?? defaults.canDownloadHtml,
      canEmbed: planSettings?.can_embed ?? defaults.canEmbed,
      isProUser: planTier === 'pro',
      gamificationLimit: planSettings?.gamification_limit ?? defaults.gamificationLimit,
      aiDailyLimit: planSettings?.ai_daily_limit ?? defaults.aiDailyLimit,
    });
  } catch (error: unknown) {
    console.error('User plan API error:', error);
    // エラー時はフリープランとして返す
    return NextResponse.json<UserPlanResponse>({
      planTier: 'free',
      canHideCopyright: false,
      canUseAI: false,
      canUseAnalytics: false,
      canUseGamification: false,
      canDownloadHtml: false,
      canEmbed: false,
      isProUser: false,
      gamificationLimit: 0,
      aiDailyLimit: 0,
    });
  }
}
