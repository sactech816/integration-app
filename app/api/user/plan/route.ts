/**
 * ユーザープラン権限API
 * ログインユーザーの集客メーカープラン権限を取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  type MakersPlanTier,
  normalizeMakersPlanTier,
  isMakersProOrHigher,
  hasMakersPaidPlan,
  MAKERS_PLAN_DEFINITIONS,
} from '@/lib/subscription';

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
  planTier: MakersPlanTier;
  canHideCopyright: boolean;
  canUseAI: boolean;
  canUseAnalytics: boolean;
  canUseGamification: boolean;
  canDownloadHtml: boolean;
  canEmbed: boolean;
  /** business以上（旧isPro互換） */
  isProUser: boolean;
  /** standard以上の有料プラン */
  isPaidUser: boolean;
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
        isPaidUser: false,
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
      .order('monitor_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // プランTierを判定
    let planTier: MakersPlanTier = 'free';

    // モニターユーザーはbusiness扱い（旧Pro互換）
    if (monitor) {
      planTier = normalizeMakersPlanTier(monitor.monitor_plan_type);
    }
    // アクティブなサブスクリプションがある場合
    else if (subscription?.status === 'active') {
      if (subscription.plan_tier) {
        // plan_tierカラムを優先（正規化付き）
        planTier = normalizeMakersPlanTier(subscription.plan_tier);
      } else {
        // レガシー互換: plan_nameからの判定
        const pn = subscription.plan_name?.toLowerCase() || '';
        if (pn.includes('premium') || pn.includes('プレミアム')) {
          planTier = 'premium';
        } else if (pn.includes('business') || pn.includes('ビジネス') || pn.includes('pro') || pn.includes('プロ')) {
          planTier = 'business';
        } else if (pn.includes('standard') || pn.includes('スタンダード')) {
          planTier = 'standard';
        }
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

    // フォールバック値（MAKERS_PLAN_DEFINITIONSから取得）
    const planDef = MAKERS_PLAN_DEFINITIONS[planTier] || MAKERS_PLAN_DEFINITIONS.free;

    return NextResponse.json<UserPlanResponse>({
      planTier,
      canHideCopyright: planSettings?.can_hide_copyright ?? planDef.canHideCopyright,
      canUseAI: planSettings?.can_use_ai ?? planDef.canUseAI,
      canUseAnalytics: planSettings?.can_use_analytics ?? planDef.canUseAnalytics,
      canUseGamification: planSettings?.can_use_gamification ?? planDef.canUseGamification,
      canDownloadHtml: planSettings?.can_download_html ?? planDef.canDownloadHtml,
      canEmbed: planSettings?.can_embed ?? planDef.canEmbed,
      isProUser: isMakersProOrHigher(planTier),
      isPaidUser: hasMakersPaidPlan(planTier),
      gamificationLimit: planSettings?.gamification_limit ?? planDef.gamificationLimit,
      aiDailyLimit: planSettings?.ai_daily_limit ?? planDef.aiDailyLimit,
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
      isPaidUser: false,
      gamificationLimit: 0,
      aiDailyLimit: 0,
    });
  }
}
