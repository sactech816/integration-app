import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.error("❌ Stripe API Key is missing!");
}

const stripe = new Stripe(apiKey || '');

export async function POST(req) {
  try {
    const { amount, userId, email } = await req.json();
    
    // 金額チェック（500円〜100,000円）
    let finalAmount = parseInt(amount);
    if (isNaN(finalAmount) || finalAmount < 500 || finalAmount > 100000) {
      return NextResponse.json(
        { error: '金額は500円〜100,000円の範囲で指定してください。' },
        { status: 400 }
      );
    }

    let origin = req.headers.get('origin');
    if (!origin) {
      origin = req.headers.get('referer');
      if (origin) {
        origin = new URL(origin).origin;
      }
    }
    if (!origin || origin === 'null') {
      origin = 'https://shindan-quiz.makers.tokyo'; // 本番URL
    }

    console.log(`🎁 Starting Donation Checkout: ${finalAmount}JPY / User:${userId || 'anonymous'}`);

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: '診断クイズメーカーへの寄付',
              description: 'サービスの運営・開発へのご支援ありがとうございます',
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/donation?status=success`,
      cancel_url: `${origin}/donation?status=cancel`,
      metadata: {
        type: 'donation',
        userId: userId || 'anonymous',
      },
    };

    // メールアドレスがある場合のみ設定
    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("🔥 Stripe Donation Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

