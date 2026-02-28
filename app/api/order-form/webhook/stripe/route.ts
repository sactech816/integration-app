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
 * POST: Stripe Webhook（申し込みフォーム決済完了処理）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    const webhookSecret = process.env.ORDER_FORM_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        console.error('[Order Form Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
      }
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        // order_form用かチェック
        if (metadata?.type !== 'order_form' || !metadata?.submissionId) {
          break;
        }

        await supabase
          .from('order_form_submissions')
          .update({
            payment_status: 'paid',
            payment_provider: 'stripe',
            payment_reference: session.id,
            amount_paid: session.amount_total || 0,
          })
          .eq('id', metadata.submissionId);

        console.log('[Order Form Webhook] Payment completed for submission:', metadata.submissionId);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata?.type !== 'order_form' || !metadata?.submissionId) {
          break;
        }

        await supabase
          .from('order_form_submissions')
          .update({ payment_status: 'failed' })
          .eq('id', metadata.submissionId);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Order Form Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
