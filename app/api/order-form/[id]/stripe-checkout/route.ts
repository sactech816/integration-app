import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-12-15.clover' as any });

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: Stripe Checkoutセッション作成
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { submissionId, email } = await request.json();

    if (!submissionId || !email) {
      return NextResponse.json({ error: 'submissionId と email は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // フォーム取得
    const { data: form } = await supabase
      .from('order_forms')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (!form) {
      return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer_email: email,
      metadata: {
        formId: id,
        submissionId,
        type: 'order_form',
      },
      success_url: `${siteUrl}/order-form/${form.slug}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/order-form/${form.slug}`,
    };

    if (form.stripe_price_id) {
      // 既存のStripe Price IDを使用
      sessionConfig.mode = form.payment_type === 'subscription' ? 'subscription' : 'payment';
      sessionConfig.line_items = [{ price: form.stripe_price_id, quantity: 1 }];
    } else {
      // JPYの最低金額は50円
      if (!form.price || form.price < 50) {
        return NextResponse.json({ error: 'Stripeの最低決済金額は50円です。金額を50円以上に設定してください。' }, { status: 400 });
      }
      // インライン価格で作成
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{
        price_data: {
          currency: 'jpy',
          product_data: { name: form.title },
          unit_amount: form.price,
        },
        quantity: 1,
      }];
    }

    // Stripe Connect (Direct charges): 売り手が直接決済を回収
    let stripeAccountId: string | null = null;

    if (form.user_id) {
      const { data: connectData } = await supabase
        .from('user_stripe_connect')
        .select('stripe_account_id, charges_enabled, platform_fee_percent')
        .eq('user_id', form.user_id)
        .eq('charges_enabled', true)
        .single();

      if (connectData) {
        stripeAccountId = connectData.stripe_account_id;

        // Proプラン判定: Pro会員は手数料0%
        let feePercent = connectData.platform_fee_percent || 5;

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, plan_tier, plan_name')
          .eq('user_id', form.user_id)
          .eq('service', 'makers')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const now = new Date().toISOString();
        const { data: monitor } = await supabase
          .from('monitor_users')
          .select('monitor_plan_type')
          .eq('user_id', form.user_id)
          .eq('service', 'makers')
          .lte('monitor_start_at', now)
          .gt('monitor_expires_at', now)
          .limit(1)
          .maybeSingle();

        const isProUser = !!monitor ||
          (subscription?.status === 'active' && (
            subscription.plan_tier === 'pro' ||
            subscription.plan_name?.toLowerCase().includes('pro') ||
            subscription.plan_name?.toLowerCase().includes('プロ')
          ));

        if (isProUser) {
          feePercent = 0;
        }

        const applicationFee = Math.round(form.price * (feePercent / 100));
        if (applicationFee > 0) {
          if (sessionConfig.mode === 'subscription') {
            sessionConfig.subscription_data = {
              ...sessionConfig.subscription_data,
              application_fee_percent: feePercent,
            };
          } else {
            sessionConfig.payment_intent_data = {
              ...sessionConfig.payment_intent_data,
              application_fee_amount: applicationFee,
            };
          }
        }
      }
    }

    // Direct charges: 接続済みアカウントで直接決済、未接続はプラットフォームで決済
    const session = stripeAccountId
      ? await stripe.checkout.sessions.create(sessionConfig, { stripeAccount: stripeAccountId })
      : await stripe.checkout.sessions.create(sessionConfig);

    // submissionにStripeセッションIDを記録
    await supabase
      .from('order_form_submissions')
      .update({ payment_reference: session.id, payment_provider: 'stripe' })
      .eq('id', submissionId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Order Form Stripe Checkout] Error:', error);
    return NextResponse.json({ error: 'Checkoutセッション作成に失敗しました' }, { status: 500 });
  }
}
