import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ★修正: 管理者権限（Service Role）でSupabaseを操作する
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ここが変わりました
);

export async function POST(req) {
  try {
    const { sessionId, quizId, userId } = await req.json();
    console.log('🔍 決済検証リクエスト:', { sessionId, quizId, userId });

    // 1. Stripeに問い合わせて、本当に支払い済みか確認
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('💳 Stripe決済ステータス:', session.payment_status);
    
    if (session.payment_status !== 'paid') {
      console.error('❌ 決済未完了:', session.payment_status);
      return NextResponse.json({ error: 'Payment not completed', status: session.payment_status }, { status: 400 });
    }

    // 2. 既に記録済みかチェック（重複防止）
    const { data: existing } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existing) {
      console.log('ℹ️ 既に記録済みの決済:', sessionId);
      return NextResponse.json({ success: true, message: 'Already recorded' });
    }

    // 3. Supabaseに購入履歴を記録（管理者権限で実行）
    const purchaseData = {
        user_id: userId,
        quiz_id: parseInt(quizId),
        stripe_session_id: sessionId,
        amount: session.amount_total
    };
    
    console.log('📝 購入履歴を挿入:', purchaseData);
    
    const { data, error } = await supabaseAdmin.from('purchases').insert([purchaseData]).select();

    if (error) {
        console.error("❌ Supabase挿入エラー:", error);
        console.error("❌ エラー詳細:", JSON.stringify(error, null, 2));
        throw error;
    }

    console.log('✅ 購入履歴を記録完了:', data);
    
    // 挿入後、実際に記録されているか確認
    const { data: verification, error: verifyError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', parseInt(quizId));
    
    if (verifyError) {
        console.error('❌ 購入履歴の確認エラー:', verifyError);
    } else {
        console.log('🔍 購入履歴の確認:', verification);
    }
    
    return NextResponse.json({ success: true, data, verification });
  } catch (err) {
    console.error("❌ Verify API エラー:", err);
    return NextResponse.json({ error: err.message, details: err }, { status: 500 });
  }
}