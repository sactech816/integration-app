import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * トライアルオファー表示判定API
 * GET /api/trial/check?userId=xxx
 *
 * レスポンス:
 * - shouldShow: boolean — モーダルを表示すべきか
 * - settings: trial_settings の内容
 * - alreadyUsed: boolean — 過去に利用済みか
 */

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase configuration is missing');
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ shouldShow: false, reason: 'no userId' });
    }

    const supabase = getSupabaseAdmin();

    // 1. トライアル設定を取得
    const { data: settings } = await supabase
      .from('trial_settings')
      .select('*')
      .limit(1)
      .single();

    if (!settings || !settings.trial_enabled) {
      return NextResponse.json({ shouldShow: false, reason: 'trial disabled' });
    }

    // キャンペーン期間チェック
    const now = new Date();
    if (settings.campaign_start_at && new Date(settings.campaign_start_at) > now) {
      return NextResponse.json({ shouldShow: false, reason: 'campaign not started' });
    }
    if (settings.campaign_end_at && new Date(settings.campaign_end_at) < now) {
      return NextResponse.json({ shouldShow: false, reason: 'campaign ended' });
    }

    // 2. 既にトライアル利用済みかチェック
    const { data: existingOffer } = await supabase
      .from('trial_offers')
      .select('id, accepted_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingOffer) {
      return NextResponse.json({
        shouldShow: false,
        reason: 'already used',
        alreadyUsed: true,
      });
    }

    // 3. 既に有料プランに加入しているかチェック
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status, plan_tier')
      .eq('user_id', userId)
      .eq('service', 'makers')
      .eq('status', 'active')
      .maybeSingle();

    if (subscription) {
      return NextResponse.json({
        shouldShow: false,
        reason: 'already subscribed',
      });
    }

    // 4. ユーザーの登録日からN日経過しているかチェック
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (!userData?.user) {
      return NextResponse.json({ shouldShow: false, reason: 'user not found' });
    }

    const createdAt = new Date(userData.user.created_at);
    const daysSinceRegistration = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceRegistration < settings.trial_delay_days) {
      return NextResponse.json({
        shouldShow: false,
        reason: 'too early',
        daysRemaining: settings.trial_delay_days - daysSinceRegistration,
      });
    }

    // 5. 表示OK
    return NextResponse.json({
      shouldShow: true,
      settings: {
        trialPrice: settings.trial_price,
        trialMessage: settings.trial_message,
        targetPlans: settings.target_plans,
        stripeCouponIds: settings.stripe_coupon_ids,
      },
      alreadyUsed: false,
    });
  } catch (err: any) {
    console.error('Trial check error:', err);
    return NextResponse.json(
      { shouldShow: false, error: err.message },
      { status: 500 }
    );
  }
}
