/**
 * 補助金申請書AI作成 購入 — Stripe Checkout
 * POST /api/subsidy/purchase-report
 * Body: { resultId, subsidyKey }
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

const PRICE = 1500; // ¥1,500（仮価格 — 後日調整）

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { resultId, subsidyKey } = await request.json();

    if (!resultId || !subsidyKey) {
      return NextResponse.json({ error: '診断結果IDと補助金キーが必要です' }, { status: 400 });
    }

    // 結果の所有者確認
    const { data: result } = await supabase
      .from('subsidy_results')
      .select('id, user_id, report_purchased')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (!result) {
      return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 });
    }

    if (result.report_purchased) {
      return NextResponse.json({ error: '既に購入済みです', alreadyPurchased: true }, { status: 400 });
    }

    // 補助金名取得
    const { data: subsidy } = await supabase
      .from('subsidy_master')
      .select('name')
      .eq('subsidy_key', subsidyKey)
      .single();

    const subsidyName = subsidy?.name || subsidyKey;

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
            name: `補助金申請書AIドラフト — ${subsidyName}`,
            description: '事業情報をもとにAIが申請書の主要セクションを自動生成します',
          },
          unit_amount: PRICE,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/subsidy/result/${resultId}?payment=success&subsidy=${subsidyKey}`,
      cancel_url: `${origin}/subsidy/result/${resultId}?payment=cancel`,
      customer_email: user.email,
      metadata: {
        type: 'subsidy_report',
        resultId,
        userId: user.id,
        subsidyKey,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Subsidy report purchase error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
