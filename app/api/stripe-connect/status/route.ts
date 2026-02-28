import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: Stripe Connect 接続状態を確認
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: record } = await supabase
      .from('user_stripe_connect')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!record) {
      return NextResponse.json({
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        platformFeePercent: 5,
      });
    }

    // Stripe から最新状態を取得
    try {
      const account = await stripe.accounts.retrieve(record.stripe_account_id);

      const chargesEnabled = account.charges_enabled ?? false;
      const payoutsEnabled = account.payouts_enabled ?? false;
      const detailsSubmitted = account.details_submitted ?? false;

      // DB を最新に更新
      if (
        chargesEnabled !== record.charges_enabled ||
        payoutsEnabled !== record.payouts_enabled ||
        detailsSubmitted !== record.details_submitted
      ) {
        await supabase
          .from('user_stripe_connect')
          .update({
            charges_enabled: chargesEnabled,
            payouts_enabled: payoutsEnabled,
            details_submitted: detailsSubmitted,
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id);
      }

      return NextResponse.json({
        connected: true,
        chargesEnabled,
        payoutsEnabled,
        detailsSubmitted,
        stripeAccountId: record.stripe_account_id,
        platformFeePercent: record.platform_fee_percent || 5,
      });
    } catch {
      // Stripe API エラーの場合は DB の値をそのまま返す
      return NextResponse.json({
        connected: true,
        chargesEnabled: record.charges_enabled,
        payoutsEnabled: record.payouts_enabled,
        detailsSubmitted: record.details_submitted,
        stripeAccountId: record.stripe_account_id,
        platformFeePercent: record.platform_fee_percent || 5,
      });
    }
  } catch (error) {
    console.error('[Stripe Connect Status] Error:', error);
    return NextResponse.json({ error: 'ステータス取得に失敗しました' }, { status: 500 });
  }
}
