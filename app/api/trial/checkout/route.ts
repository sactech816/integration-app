import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { MakersPlanTier } from '@/lib/subscription';

/**
 * トライアル付きチェックアウトAPI
 * POST /api/trial/checkout
 *
 * Body: { userId, email, planId, source }
 * - planId: 'makers_standard_monthly' | 'makers_business_monthly' | 'makers_premium_monthly'
 * - source: 'auto' | 'admin' | 'email'
 *
 * 通常のcheckoutと同じだが、Stripeクーポンを自動適用する
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase configuration is missing');
  return createClient(url, key);
}

interface MakersStripePlan {
  id: string;
  tier: MakersPlanTier;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'month';
  envPriceId?: string;
}

const MAKERS_PLANS: Record<string, MakersStripePlan> = {
  makers_standard_monthly: {
    id: 'makers_standard_monthly',
    tier: 'standard',
    name: 'スタンダード',
    description: '集客メーカー スタンダード（月額）- お試しキャンペーン',
    amount: 1980,
    currency: 'jpy',
    interval: 'month',
    envPriceId: 'STRIPE_STANDARD_PLAN_PRICE_ID',
  },
  makers_business_monthly: {
    id: 'makers_business_monthly',
    tier: 'business',
    name: 'ビジネス',
    description: '集客メーカー ビジネス（月額）- お試しキャンペーン',
    amount: 4980,
    currency: 'jpy',
    interval: 'month',
    envPriceId: 'STRIPE_BUSINESS_PLAN_PRICE_ID',
  },
  makers_premium_monthly: {
    id: 'makers_premium_monthly',
    tier: 'premium',
    name: 'プレミアム',
    description: '集客メーカー プレミアム（月額）- お試しキャンペーン',
    amount: 9800,
    currency: 'jpy',
    interval: 'month',
    envPriceId: 'STRIPE_PREMIUM_PLAN_PRICE_ID',
  },
};

export async function POST(req: Request) {
  try {
    const { userId, email, planId, source = 'auto' } = await req.json();

    const plan = MAKERS_PLANS[planId || 'makers_business_monthly'];
    if (!plan) {
      return NextResponse.json({ error: '無効なプランIDです' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. 既にトライアル利用済みかチェック（二重防止）
    if (userId) {
      const { data: existingOffer } = await supabase
        .from('trial_offers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingOffer) {
        return NextResponse.json(
          { error: 'お試しキャンペーンは既にご利用済みです' },
          { status: 400 }
        );
      }
    }

    // 2. トライアル設定からクーポンIDを取得
    const { data: settings } = await supabase
      .from('trial_settings')
      .select('trial_price, stripe_coupon_ids')
      .limit(1)
      .single();

    const couponIds = settings?.stripe_coupon_ids || {};
    const couponId = couponIds[plan.tier];

    if (!couponId) {
      return NextResponse.json(
        { error: `${plan.name}プランのお試しクーポンが設定されていません。管理者にお問い合わせください。` },
        { status: 400 }
      );
    }

    // 3. origin取得
    let origin = req.headers.get('origin');
    if (!origin) {
      const referer = req.headers.get('referer');
      if (referer) origin = new URL(referer).origin;
    }
    if (!origin || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }

    console.log(`🎁 Starting Trial Checkout: ${plan.name} (first month ¥${settings?.trial_price || 500}) / User:${userId || 'anonymous'}`);

    // 4. Stripe Price ID取得
    const priceId = plan.envPriceId ? process.env[plan.envPriceId] : undefined;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
            recurring: { interval: plan.interval },
          },
          quantity: 1,
        }];

    // 5. Checkout Session作成（クーポン付き）
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      discounts: [{ coupon: couponId }],
      success_url: `${origin}/?payment=success&plan=${plan.tier}&trial=1`,
      cancel_url: `${origin}/?payment=cancel`,
      metadata: {
        type: 'subscription',
        planId: plan.id,
        planTier: plan.tier,
        planName: plan.name,
        userId: userId || 'anonymous',
        isTrial: 'true',
        trialSource: source,
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planTier: plan.tier,
          userId: userId || 'anonymous',
          isTrial: 'true',
        },
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // 6. trial_offersにレコード作成（offered状態、accepted_atはnull）
    if (userId) {
      await supabase.from('trial_offers').upsert({
        user_id: userId,
        plan_tier: plan.tier,
        trial_price: settings?.trial_price || 500,
        stripe_coupon_id: couponId,
        stripe_session_id: session.id,
        source,
        offered_at: new Date().toISOString(),
        accepted_at: null,
      }, {
        onConflict: 'user_id',
      });
    }

    console.log(`✅ Trial Checkout Session created: ${session.id}`);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('🔥 Trial Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
