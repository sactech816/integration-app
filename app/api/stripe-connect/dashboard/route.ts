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
 * POST: Stripe Express ダッシュボードのログインリンク生成
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

    const { data: record } = await supabase
      .from('user_stripe_connect')
      .select('stripe_account_id')
      .eq('user_id', userId)
      .single();

    if (!record) {
      return NextResponse.json({ error: 'Stripe Connect が未接続です' }, { status: 404 });
    }

    const loginLink = await stripe.accounts.createLoginLink(record.stripe_account_id);

    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error('[Stripe Connect Dashboard] Error:', error);
    return NextResponse.json(
      { error: 'ダッシュボードリンクの生成に失敗しました' },
      { status: 500 }
    );
  }
}
