import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    const { swipePageId, title, price, stripePriceId } = await req.json();

    if (!swipePageId) {
      return NextResponse.json({ error: 'swipePageId is required' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      success_url: `${origin}/swipe/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/swipe/checkout/cancel`,
      metadata: {
        swipePageId,
        type: 'swipe_page',
      },
    };

    if (stripePriceId) {
      // 既存Price IDを使用
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{ price: stripePriceId, quantity: 1 }];
    } else if (price && price > 0) {
      // インライン価格
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{
        price_data: {
          currency: 'jpy',
          product_data: { name: title || 'スワイプページ商品' },
          unit_amount: price,
        },
        quantity: 1,
      }];
    } else {
      return NextResponse.json({ error: '価格が設定されていません' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: '決済セッションの作成に失敗しました' },
      { status: 500 }
    );
  }
}
