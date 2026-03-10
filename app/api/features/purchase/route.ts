/**
 * 単品購入のStripe Checkout API
 * POST /api/features/purchase
 * Body: { userId, productId, contentId?, contentType? }
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, email, productId, contentId, contentType } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'userId and productId are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // 商品情報を取得
    const { data: product, error: productError } = await supabase
      .from('feature_products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: '指定された商品が見つかりません' },
        { status: 404 }
      );
    }

    let origin = request.headers.get('origin');
    if (!origin) {
      const referer = request.headers.get('referer');
      if (referer) {
        origin = new URL(referer).origin;
      }
    }
    if (!origin || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }

    console.log(`🚀 Feature Purchase Checkout: ${product.name} ¥${product.price} / User:${userId}`);

    // Stripe Checkout セッション作成（都度課金）
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = product.stripe_price_id
      ? [{ price: product.stripe_price_id, quantity: 1 }]
      : [{
          price_data: {
            currency: 'jpy',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        }];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/dashboard?payment=feature_success&product=${productId}`,
      cancel_url: `${origin}/dashboard?payment=cancel`,
      metadata: {
        type: 'feature_purchase',
        productId: product.id,
        userId,
        contentId: contentId || '',
        contentType: contentType || '',
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`✅ Feature Purchase Session created: ${session.id}`);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('🔥 Feature Purchase Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 購入可能な機能一覧を取得
export async function GET() {
  try {
    const supabase = getServiceClient();

    const { data: products } = await supabase
      .from('feature_products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    return NextResponse.json({ products: products || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
