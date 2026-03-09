import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPointPacks } from '@/lib/points';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

/**
 * ポイント購入 Checkout セッション作成
 * POST /api/points/purchase
 * Body: { userId, email, packId }
 */
export async function POST(req: Request) {
  try {
    const { userId, email, packId } = await req.json();

    if (!userId || !packId) {
      return NextResponse.json({ error: 'userId and packId are required' }, { status: 400 });
    }

    // ポイントパック情報を取得
    const packs = await getPointPacks();
    const pack = packs.find(p => p.id === packId);

    if (!pack) {
      return NextResponse.json({ error: '無効なポイントパックです' }, { status: 400 });
    }

    let origin = req.headers.get('origin');
    if (!origin) {
      const referer = req.headers.get('referer');
      if (referer) origin = new URL(referer).origin;
    }
    if (!origin || origin === 'null') {
      origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `${pack.name}${pack.bonusPoints > 0 ? `（+${pack.bonusPoints}ボーナス）` : ''}`,
            description: `集客メーカー ポイント購入 — ${pack.totalPoints}pt`,
          },
          unit_amount: pack.price,
        },
        quantity: 1,
      }],
      mode: 'payment', // サブスクではなく一回払い
      success_url: `${origin}/dashboard?payment=points_success&pack=${packId}`,
      cancel_url: `${origin}/dashboard?payment=cancel`,
      metadata: {
        type: 'point_purchase',
        userId,
        packId,
        points: String(pack.totalPoints),
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Points purchase error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
