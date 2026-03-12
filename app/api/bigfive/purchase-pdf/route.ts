/**
 * Big Five PDF購入 — Stripe Checkout
 * POST /api/bigfive/purchase-pdf
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

// テストタイプ別料金
const PDF_PRICES: Record<string, number> = {
  simple: 500,    // ¥500
  full: 1000,     // ¥1,000
  detailed: 2000, // ¥2,000
};

const PDF_DESCRIPTIONS: Record<string, string> = {
  simple: '簡易診断 AIプレミアムレポート（5特性分析・16タイプ診断付き）',
  full: '本格診断 AIプレミアムレポート（30ファセット詳細分析・DISC・キャリアガイダンス付き）',
  detailed: '詳細診断 AIプレミアムレポート（完全版 Big Five + エニアグラム + DISC 総合分析）',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { resultId } = await request.json();

    if (!resultId) {
      return NextResponse.json({ error: '診断結果IDが必要です' }, { status: 400 });
    }

    // 結果の所有者確認（test_typeも取得）
    const { data: result } = await supabase
      .from('bigfive_results')
      .select('id, user_id, pdf_purchased, test_type')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (!result) {
      return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 });
    }

    if (result.pdf_purchased) {
      return NextResponse.json({ error: '既に購入済みです', alreadyPurchased: true }, { status: 400 });
    }

    const testType = result.test_type || 'simple';
    const price = PDF_PRICES[testType] || PDF_PRICES.simple;
    const description = PDF_DESCRIPTIONS[testType] || PDF_DESCRIPTIONS.simple;

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
            name: 'Big Five 性格診断 プレミアムレポート',
            description,
          },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/bigfive/result/${resultId}?payment=success`,
      cancel_url: `${origin}/bigfive/result/${resultId}?payment=cancel`,
      customer_email: user.email,
      metadata: {
        type: 'bigfive_pdf',
        resultId,
        userId: user.id,
        testType,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('BigFive PDF purchase error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
