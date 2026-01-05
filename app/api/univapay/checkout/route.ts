import { NextResponse } from 'next/server';
import { getUnivaPayClient, isUnivaPayConfigured, SUBSCRIPTION_PLANS, KDL_PLANS } from '@/lib/univapay';
import { createClient } from '@supabase/supabase-js';

// 設定から価格を取得
async function getKDLPrices(): Promise<{ monthly: number; yearly: number }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    return { monthly: 4980, yearly: 39800 }; // デフォルト値
  }
  
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'kdl_prices')
    .single();
  
  if (data?.value) {
    return data.value as { monthly: number; yearly: number };
  }
  
  return { monthly: 4980, yearly: 39800 };
}

export async function POST(req: Request) {
  try {
    // UnivaPay設定チェック
    if (!isUnivaPayConfigured()) {
      return NextResponse.json(
        { error: 'UnivaPay APIが設定されていません' },
        { status: 500 }
      );
    }

    const { planId, amount, userId, email, transactionToken, isSubscription, period, planName: customPlanName } = await req.json();

    // プランIDまたは金額の検証
    let finalAmount: number;
    let planName: string;
    let subscriptionPeriod: 'monthly' | 'yearly' = 'monthly';
    let service: string = 'donation';

    // KDL用プラン（monthly/yearly）の場合
    if (planId === 'monthly' || planId === 'yearly') {
      const prices = await getKDLPrices();
      finalAmount = planId === 'yearly' ? prices.yearly : prices.monthly;
      planName = planId === 'yearly' ? 'KDL 年間プラン' : 'KDL 月額プラン';
      subscriptionPeriod = planId;
      service = 'kdl';
    }
    // KDL用プラン（kdl_monthly/kdl_yearly）の場合
    else if (planId === 'kdl_monthly' || planId === 'kdl_yearly') {
      const prices = await getKDLPrices();
      finalAmount = planId === 'kdl_yearly' ? prices.yearly : prices.monthly;
      planName = planId === 'kdl_yearly' ? 'KDL 年間プラン' : 'KDL 月額プラン';
      subscriptionPeriod = planId === 'kdl_yearly' ? 'yearly' : 'monthly';
      service = 'kdl';
    }
    // ドネーション用プラン
    else if (planId) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return NextResponse.json(
          { error: '無効なプランIDです' },
          { status: 400 }
        );
      }
      finalAmount = plan.amount;
      planName = plan.description;
      service = 'donation';
    } 
    // 金額直接指定（カスタム金額）
    else if (amount) {
      finalAmount = parseInt(amount);
      if (isNaN(finalAmount) || finalAmount < 500 || finalAmount > 100000) {
        return NextResponse.json(
          { error: '金額は500円〜100,000円の範囲で指定してください' },
          { status: 400 }
        );
      }
      planName = customPlanName || `月額${finalAmount.toLocaleString()}円サポート`;
      if (period === 'year' || period === 'yearly') {
        subscriptionPeriod = 'yearly';
      }
      service = 'kdl';
    } else {
      return NextResponse.json(
        { error: 'プランIDまたは金額が必要です' },
        { status: 400 }
      );
    }

    // トランザクショントークンが必要（UnivaPay.jsでカード情報入力後に取得）
    // ※トークンなしでもチェックアウトURLを返す方式に変更
    // if (!transactionToken) {
    //   return NextResponse.json(
    //     { error: 'トランザクショントークンが必要です' },
    //     { status: 400 }
    //   );
    // }

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

    console.log(`🔄 Starting UnivaPay Subscription: ${finalAmount}JPY/${subscriptionPeriod} / User:${userId || 'anonymous'} / Service:${service}`);

    // サービスに応じたリダイレクト先
    const successUrl = service === 'kdl'
      ? `${origin}/kindle?payment=success&plan=${subscriptionPeriod}`
      : `${origin}/donation?status=success&type=subscription`;
    const cancelUrl = service === 'kdl'
      ? `${origin}/kindle/lp?payment=cancel`
      : `${origin}/donation?status=cancel`;

    // トランザクショントークンがある場合は直接サブスクリプション作成
    if (transactionToken) {
      const client = getUnivaPayClient();
      
      // サブスクリプションを作成
      const subscription = await client.createSubscription({
        email: email || '',
        amount: finalAmount,
        currency: 'jpy',
        period: subscriptionPeriod,
        metadata: {
          userId: userId || 'anonymous',
          planName,
          service,
          source: service === 'kdl' ? 'kdl_subscription' : 'donation_page',
        },
        successUrl,
        cancelUrl,
      });

      console.log(`✅ Subscription created: ${subscription.id}`);

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
      });
    }

    // トークンがない場合はチェックアウトURL生成（UnivaPay Hosted Checkout）
    // UnivaPay の Hosted Checkout URL を生成
    const checkoutParams = new URLSearchParams({
      amount: finalAmount.toString(),
      currency: 'jpy',
      email: email || '',
      'metadata[userId]': userId || 'anonymous',
      'metadata[planName]': planName,
      'metadata[service]': service,
      'metadata[period]': subscriptionPeriod,
      successUrl,
      cancelUrl,
    });

    // UnivaPay のホステッドチェックアウトURL
    // 実際のURLはUnivaPay管理画面で確認が必要
    const univaPayCheckoutBase = process.env.UNIVAPAY_CHECKOUT_URL || 'https://checkout.univapay.com';
    const storeId = process.env.UNIVAPAY_STORE_ID;
    
    if (!storeId) {
      // ストアIDがない場合は仮のチェックアウトURLを返す（開発用）
      console.warn('⚠️ UNIVAPAY_STORE_ID not set. Using placeholder checkout URL.');
      return NextResponse.json({
        success: true,
        checkoutUrl: `${origin}/kindle/lp?checkout=pending&amount=${finalAmount}&plan=${subscriptionPeriod}`,
        message: 'UnivaPay Store ID が設定されていません。管理画面で設定してください。',
      });
    }

    const checkoutUrl = `${univaPayCheckoutBase}/${storeId}?${checkoutParams.toString()}`;
    
    console.log(`✅ Checkout URL generated for ${service}: ${checkoutUrl}`);

    return NextResponse.json({
      success: true,
      checkoutUrl,
      amount: finalAmount,
      period: subscriptionPeriod,
      planName,
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


