import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * アフィリエイト決済前保存APIエンドポイント
 * 
 * 決済ボタンクリック時に、メールアドレスと紹介コードを一時保存
 * Webhook受信時にメールアドレスでマッチングしてアフィリエイト成約を記録
 */

// Supabaseクライアントを取得
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, serviceKey);
}

/**
 * POST: 決済前に紹介コードを保存
 */
export async function POST(request: NextRequest) {
  try {
    const { email, referralCode, service, planTier, planPeriod, userId } = await request.json();

    // バリデーション
    if (!email || !referralCode) {
      return NextResponse.json(
        { error: 'email and referralCode are required' },
        { status: 400 }
      );
    }

    // メールアドレスを小文字に正規化
    const normalizedEmail = email.toLowerCase().trim();

    const supabase = getSupabaseAdmin();

    // 同じメールアドレス・サービスの古いpendingレコードを期限切れにする
    await supabase
      .from('pending_affiliate_conversions')
      .update({ status: 'expired' })
      .eq('email', normalizedEmail)
      .eq('service', service || 'kdl')
      .eq('status', 'pending');

    // 新しいレコードを作成
    const { data, error } = await supabase
      .from('pending_affiliate_conversions')
      .insert({
        email: normalizedEmail,
        referral_code: referralCode,
        service: service || 'kdl',
        plan_tier: planTier || null,
        plan_period: planPeriod || null,
        user_id: userId || null,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save pending affiliate:', error);
      return NextResponse.json(
        { error: 'Failed to save pending affiliate' },
        { status: 500 }
      );
    }

    console.log(`✅ Pending affiliate saved: email=${normalizedEmail}, ref=${referralCode}, service=${service}`);

    return NextResponse.json({
      success: true,
      id: data.id,
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Pending affiliate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET: マッチング処理（Webhookから呼び出し用）
 * クエリパラメータ: email, service, subscriptionId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const service = searchParams.get('service') || 'kdl';
    const subscriptionId = searchParams.get('subscriptionId');

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    // RPC関数を呼び出してマッチング
    const { data, error } = await supabase.rpc('match_pending_affiliate', {
      p_email: normalizedEmail,
      p_service: service,
      p_subscription_id: subscriptionId || null,
    });

    if (error) {
      console.error('Match pending affiliate error:', error);
      return NextResponse.json(
        { error: 'Failed to match pending affiliate' },
        { status: 500 }
      );
    }

    // 結果を返す
    if (data && data.length > 0) {
      const match = data[0];
      console.log(`✅ Pending affiliate matched: email=${normalizedEmail}, ref=${match.referral_code}`);
      return NextResponse.json({
        found: true,
        referralCode: match.referral_code,
        planTier: match.plan_tier,
        planPeriod: match.plan_period,
      });
    }

    return NextResponse.json({
      found: false,
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Match pending affiliate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
