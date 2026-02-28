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

    // Stripe Connect: フォームオーナーが接続済みの場合、売上を直接送金
    if (sessionConfig.mode === 'payment' && form.user_id) {
      const { data: connectData } = await supabase
        .from('user_stripe_connect')
        .select('stripe_account_id, charges_enabled, platform_fee_percent')
        .eq('user_id', form.user_id)
        .eq('charges_enabled', true)
        .single();

      if (connectData) {
        const feePercent = connectData.platform_fee_percent || 5;
        const applicationFee = Math.round(form.price * (feePercent / 100));
        sessionConfig.payment_intent_data = {
          transfer_data: {
            destination: connectData.stripe_account_id,
          },
          application_fee_amount: applicationFee,
        };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

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
