import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

/**
 * Stripe Customer Portal セッション作成
 * ユーザーが自分でプラン変更・解約・支払い方法の更新を行える
 */
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // subscriptions テーブルから Stripe Customer ID を取得
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('metadata')
      .eq('user_id', userId)
      .eq('service', 'makers')
      .eq('status', 'active')
      .maybeSingle();

    const stripeCustomerId = subscription?.metadata?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'アクティブなサブスクリプションが見つかりません' },
        { status: 404 }
      );
    }

    let origin = req.headers.get('origin');
    if (!origin) {
      const referer = req.headers.get('referer');
      if (referer) origin = new URL(referer).origin;
    }
    if (!origin || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/dashboard?view=settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Portal Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
