import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { MakersPlanTier } from '@/lib/subscription';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error("❌ Stripe API Key is missing!");
}

const stripe = new Stripe(apiKey || '', {
  apiVersion: '2025-12-15.clover' as any,
});

// 集客メーカーのサブスクリプションプラン定義
interface MakersStripePlan {
  id: string;
  tier: MakersPlanTier;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'month';
  envPriceId?: string; // 環境変数名（StripeのPrice ID）
}

const MAKERS_PLANS: Record<string, MakersStripePlan> = {
  makers_standard_monthly: {
    id: 'makers_standard_monthly',
    tier: 'standard',
    name: 'スタンダード',
    description: '集客メーカー スタンダード（月額）- AI利用（月30回）、アクセス解析、CSV出力',
    amount: 1980,
    currency: 'jpy',
    interval: 'month',
    envPriceId: 'STRIPE_STANDARD_PLAN_PRICE_ID',
  },
  makers_business_monthly: {
    id: 'makers_business_monthly',
    tier: 'business',
    name: 'ビジネス',
    description: '集客メーカー ビジネス（月額）- AI無制限、HTMLダウンロード、埋め込みコード発行など',
    amount: 4980,
    currency: 'jpy',
    interval: 'month',
    envPriceId: 'STRIPE_BUSINESS_PLAN_PRICE_ID',
  },
  makers_premium_monthly: {
    id: 'makers_premium_monthly',
    tier: 'premium',
    name: 'プレミアム',
    description: '集客メーカー プレミアム（月額）- 全機能解放、大量配信、優先サポート',
    amount: 9800,
    currency: 'jpy',
    interval: 'month',
    envPriceId: 'STRIPE_PREMIUM_PLAN_PRICE_ID',
  },
  // レガシー互換: 旧プロプランID → businessにマッピング
  makers_pro_monthly: {
    id: 'makers_pro_monthly',
    tier: 'business',
    name: 'ビジネス',
    description: '集客メーカー ビジネス（月額）- AI無制限、HTMLダウンロード、埋め込みコード発行など',
    amount: 4980,
    currency: 'jpy',
    interval: 'month',
    envPriceId: 'STRIPE_PRO_PLAN_PRICE_ID',
  },
};

export async function POST(req: Request) {
  try {
    const { userId, email, planId } = await req.json();

    // プランIDの検証
    const plan = MAKERS_PLANS[planId || 'makers_business_monthly'];
    if (!plan) {
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

    console.log(`🚀 Starting ${plan.name} Subscription Checkout: ${plan.amount}JPY/month / User:${userId || 'anonymous'}`);

    // Stripeの価格IDを環境変数から取得（設定されていない場合は動的に価格を作成）
    let priceId = plan.envPriceId ? process.env[plan.envPriceId] : undefined;

    // 価格IDが設定されていない場合は、インライン価格データを使用
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        }];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${origin}/?payment=success&plan=${plan.tier}`,
      cancel_url: `${origin}/?payment=cancel`,
      metadata: {
        type: 'subscription',
        planId: plan.id,
        planTier: plan.tier,
        planName: plan.name,
        userId: userId || 'anonymous',
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planTier: plan.tier,
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

// プラン一覧を取得
export async function GET() {
  const plans = Object.values(MAKERS_PLANS)
    .filter(p => p.id !== 'makers_pro_monthly') // レガシーIDは除外
    .map(p => ({
      id: p.id,
      tier: p.tier,
      name: p.name,
      description: p.description,
      amount: p.amount,
      currency: p.currency,
      interval: p.interval,
      formattedPrice: `¥${p.amount.toLocaleString()}/月`,
    }));

  return NextResponse.json({ plans });
}
