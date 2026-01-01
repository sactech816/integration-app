import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe APIキーが設定されていません' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      priceId, 
      amount,
      successUrl, 
      cancelUrl, 
      metadata,
      contentId,
      contentType,
      mode = 'payment'
    } = body;

    // priceIdまたはamountが必要
    if (!priceId && !amount) {
      return NextResponse.json({ error: '価格IDまたは金額が必要です' }, { status: 400 });
    }

    // line_itemsを構築
    let line_items;

    if (priceId) {
      // 既存の価格IDを使用
      line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else if (amount) {
      // 開発支援モード: 動的な金額を使用
      const amountInYen = parseInt(amount, 10);
      if (isNaN(amountInYen) || amountInYen < 100) {
        return NextResponse.json({ error: '金額は100円以上で指定してください' }, { status: 400 });
      }

      line_items = [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'Support',
              description: contentType 
                ? `${contentType === 'quiz' ? '診断クイズ' : contentType === 'profile' ? 'プロフィールLP' : 'ビジネスLP'}への応援`
                : '作成者への応援',
            },
            unit_amount: amountInYen,
          },
          quantity: 1,
        },
      ];
    }

    // メタデータを構築
    const sessionMetadata = {
      ...metadata,
      content_id: contentId || '',
      content_type: contentType || '',
    };

    // サイトURLを取得（環境変数がない場合はリクエストから取得）
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Stripeセッション作成
    const session = await stripe.checkout.sessions.create({
      mode: mode,
      payment_method_types: ['card'],
      line_items,
      success_url: successUrl || `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/dashboard?payment=cancel`,
      metadata: sessionMetadata,
      // 日本語対応
      locale: 'ja',
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'チェックアウトセッションの作成に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
}
