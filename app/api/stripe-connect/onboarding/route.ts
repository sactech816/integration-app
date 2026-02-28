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
 * POST: Stripe Connect Express アカウント作成 & オンボーディングURL生成
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

    // 既存の Connect レコード確認
    const { data: existing } = await supabase
      .from('user_stripe_connect')
      .select('*')
      .eq('user_id', userId)
      .single();

    let stripeAccountId: string;

    if (existing) {
      // 既存アカウントがある場合はそのまま使用
      stripeAccountId = existing.stripe_account_id;
    } else {
      // 新規 Express アカウント作成
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'JP',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId,
          platform: 'makers_tokyo',
        },
      });

      stripeAccountId = account.id;

      // DB に保存
      await supabase.from('user_stripe_connect').insert({
        user_id: userId,
        stripe_account_id: account.id,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      });
    }

    // オンボーディング URL 生成
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/order-form/dashboard?stripe_connect=refresh`,
      return_url: `${siteUrl}/order-form/dashboard?stripe_connect=complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('[Stripe Connect Onboarding] Error:', error);
    return NextResponse.json(
      { error: 'Stripe Connect のセットアップに失敗しました' },
      { status: 500 }
    );
  }
}
