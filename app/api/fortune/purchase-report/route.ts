/**
 * Fortune プレミアムレポート購入 — Stripe Checkout
 * POST /api/fortune/purchase-report
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

const PRICE = 500; // ¥500 一律

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { resultId } = await request.json();

    if (!resultId) {
      return NextResponse.json({ error: '鑑定結果IDが必要です' }, { status: 400 });
    }

    // 結果の所有者確認
    const { data: result } = await supabase
      .from('fortune_results')
      .select('id, user_id, report_purchased')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (!result) {
      return NextResponse.json({ error: '鑑定結果が見つかりません' }, { status: 404 });
    }

    if (result.report_purchased) {
      return NextResponse.json({ error: '既に購入済みです', alreadyPurchased: true }, { status: 400 });
    }

    let origin = request.headers.get('origin');
    if (!origin) {
      const referer = request.headers.get('referer');
      if (referer) origin = new URL(referer).origin;
    }
    if (!origin || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: '生年月日占い プレミアム鑑定レポート',
            description: '九星気学・数秘術・四柱推命の総合AI鑑定レポート（PDF付き）',
          },
          unit_amount: PRICE,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/fortune/result/${resultId}?payment=success`,
      cancel_url: `${origin}/fortune/result/${resultId}?payment=cancel`,
      customer_email: user.email,
      metadata: {
        type: 'fortune_report',
        resultId,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Fortune report purchase error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
