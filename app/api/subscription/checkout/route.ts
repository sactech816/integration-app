import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error("❌ Stripe API Key is missing!");
}

const stripe = new Stripe(apiKey || '', {
  apiVersion: '2025-12-15.clover' as any,
});

// プロプランの定義
const PRO_PLAN = {
  id: 'makers_pro_monthly',
  name: 'プロプラン',
  description: '集客メーカー プロプラン（月額）- AI優先利用、HTMLダウンロード、埋め込みコード発行など',
  amount: 3980,
  currency: 'jpy',
  interval: 'month' as const,
};

export async function POST(req: Request) {
  try {
    const { userId, email, planId } = await req.json();

    // 現在はプロプランのみ対応
    if (planId && planId !== 'makers_pro_monthly') {
      return NextResponse.json(
        { error: '無効なプランIDです' },
        { status: 400 }
      );
    }

    let origin = req.headers.get('origin');
    if (!origin) {
      const referer = req.headers.get('referer');
      if (referer) {
        origin = new URL(referer).origin;
      }
    }
    if (!origin || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }

    console.log(`🚀 Starting Pro Plan Subscription Checkout: ${PRO_PLAN.amount}JPY/month / User:${userId || 'anonymous'}`);

    // Stripeの価格IDを環境変数から取得（設定されていない場合は動的に価格を作成）
    let priceId = process.env.STRIPE_PRO_PLAN_PRICE_ID;

    // 価格IDが設定されていない場合は、インライン価格データを使用
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: PRO_PLAN.currency,
            product_data: {
              name: PRO_PLAN.name,
              description: PRO_PLAN.description,
            },
            unit_amount: PRO_PLAN.amount,
            recurring: {
              interval: PRO_PLAN.interval,
            },
          },
          quantity: 1,
        }];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${origin}/?payment=success&plan=pro`,
      cancel_url: `${origin}/?payment=cancel`,
      metadata: {
        type: 'subscription',
        planId: PRO_PLAN.id,
        planName: PRO_PLAN.name,
        userId: userId || 'anonymous',
      },
      subscription_data: {
        metadata: {
          planId: PRO_PLAN.id,
          userId: userId || 'anonymous',
        },
      },
    };

    // メールアドレスがある場合のみ設定
    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`✅ Stripe Checkout Session created: ${session.id}`);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });

  } catch (err: any) {
    console.error("🔥 Stripe Subscription Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// プラン情報を取得
export async function GET() {
  return NextResponse.json({
    plan: {
      id: PRO_PLAN.id,
      name: PRO_PLAN.name,
      description: PRO_PLAN.description,
      amount: PRO_PLAN.amount,
      currency: PRO_PLAN.currency,
      interval: PRO_PLAN.interval,
      formattedPrice: `¥${PRO_PLAN.amount.toLocaleString()}/月`,
    },
  });
}
