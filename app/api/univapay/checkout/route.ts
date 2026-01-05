import { NextResponse } from 'next/server';
import { getUnivaPayClient, isUnivaPayConfigured, SUBSCRIPTION_PLANS } from '@/lib/univapay';

export async function POST(req: Request) {
  try {
    // UnivaPay設定チェック
    if (!isUnivaPayConfigured()) {
      return NextResponse.json(
        { error: 'UnivaPay APIが設定されていません' },
        { status: 500 }
      );
    }

    const { planId, amount, userId, email, transactionToken } = await req.json();

    // プランIDまたは金額の検証
    let finalAmount: number;
    let planName: string;

    if (planId) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return NextResponse.json(
          { error: '無効なプランIDです' },
          { status: 400 }
        );
      }
      finalAmount = plan.amount;
      planName = plan.description;
    } else if (amount) {
      finalAmount = parseInt(amount);
      if (isNaN(finalAmount) || finalAmount < 500 || finalAmount > 100000) {
        return NextResponse.json(
          { error: '金額は500円〜100,000円の範囲で指定してください' },
          { status: 400 }
        );
      }
      planName = `月額${finalAmount.toLocaleString()}円サポート`;
    } else {
      return NextResponse.json(
        { error: 'プランIDまたは金額が必要です' },
        { status: 400 }
      );
    }

    // トランザクショントークンが必要（UnivaPay.jsでカード情報入力後に取得）
    if (!transactionToken) {
      return NextResponse.json(
        { error: 'トランザクショントークンが必要です' },
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

    console.log(`🔄 Starting UnivaPay Subscription: ${finalAmount}JPY/月 / User:${userId || 'anonymous'}`);

    const client = getUnivaPayClient();
    
    // サブスクリプションを作成
    const subscription = await client.createSubscription({
      email: email || '',
      amount: finalAmount,
      currency: 'jpy',
      period: 'monthly',
      metadata: {
        userId: userId || 'anonymous',
        planName,
        source: 'donation_page',
      },
      successUrl: `${origin}/donation?status=success&type=subscription`,
      cancelUrl: `${origin}/donation?status=cancel`,
    });

    console.log(`✅ Subscription created: ${subscription.id}`);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('🔥 UnivaPay Subscription Error:', error);
    return NextResponse.json(
      { error: error.message || 'サブスクリプションの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// サブスクリプションプラン一覧を取得
export async function GET() {
  return NextResponse.json({
    plans: SUBSCRIPTION_PLANS,
  });
}


