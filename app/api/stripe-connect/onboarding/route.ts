import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: Stripe Connect Express アカウント作成 & オンボーディングURL生成
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY が設定されていません' }, { status: 500 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

    // 既存の Connect レコード確認
    const { data: existing, error: selectError } = await supabase
      .from('user_stripe_connect')
      .select('*')
      .eq('user_id', userId)
      .single();

    // テーブルが存在しない場合のエラーチェック（PGRST116 = no rows found は正常）
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[Stripe Connect] DB select error:', selectError);
      return NextResponse.json(
        { error: `データベースエラー: ${selectError.message}` },
        { status: 500 }
      );
    }

    let stripeAccountId: string;

    if (existing) {
      // 既存アカウントがある場合はそのまま使用
      stripeAccountId = existing.stripe_account_id;
    } else {
      // 新規 Express アカウント作成
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'JP',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId,
          platform: 'makers_tokyo',
        },
      });

      stripeAccountId = account.id;

      // DB に保存
      const { error: insertError } = await supabase.from('user_stripe_connect').insert({
        user_id: userId,
        stripe_account_id: account.id,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      });
      if (insertError) {
        console.error('[Stripe Connect] DB insert error:', insertError);
        // Stripeアカウントは作成済みなのでオンボーディングは続行
      }
    }

    // オンボーディング URL 生成
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/order-form/dashboard?stripe_connect=refresh`,
      return_url: `${siteUrl}/order-form/dashboard?stripe_connect=complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('[Stripe Connect Onboarding] Error:', error);
    let message = 'Stripe Connect のセットアップに失敗しました';
    if (error?.type?.startsWith('Stripe')) {
      message = `Stripe エラー: ${error.message}`;
    } else if (error?.message) {
      message = `エラー: ${error.message}`;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
