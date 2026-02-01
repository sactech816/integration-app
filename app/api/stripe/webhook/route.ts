import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * Stripe Webhook エンドポイント
 * 
 * Stripeからのイベント通知を受信し、サブスクリプション状態を更新します。
 * 
 * 対応イベント:
 * - checkout.session.completed: チェックアウト完了
 * - customer.subscription.created: サブスクリプション作成
 * - customer.subscription.updated: サブスクリプション更新
 * - customer.subscription.deleted: サブスクリプション削除
 * - invoice.paid: 請求書支払い完了
 * - invoice.payment_failed: 請求書支払い失敗
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Supabaseクライアントを取得
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    // 署名検証
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error('❌ Stripe Webhook signature verification failed:', err.message);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    } else {
      // 開発環境では署名検証をスキップ
      event = JSON.parse(body);
      console.warn('⚠️ Stripe Webhook running without signature verification');
    }

    console.log(`📥 Received Stripe webhook: ${event.type}`);

    const supabase = getSupabaseAdmin();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // サブスクリプションモードの場合のみ処理
        if (session.mode === 'subscription') {
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;
          const planName = session.metadata?.planName || 'プロプラン';
          const subscriptionId = session.subscription as string;
          
          console.log(`✅ Checkout completed: user=${userId}, plan=${planId}, subscription=${subscriptionId}`);
          
          if (userId && userId !== 'anonymous' && subscriptionId) {
            // Stripeからサブスクリプション詳細を取得
            const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as any;
            const amount = session.amount_total || 3980;
            
            // 次回決済日を計算
            const periodEnd = subscriptionData.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
            const periodStart = subscriptionData.current_period_start || Math.floor(Date.now() / 1000);
            const nextPaymentDate = new Date(periodEnd * 1000).toISOString();
            
            await supabase.from('subscriptions').upsert({
              id: subscriptionId,
              user_id: userId,
              subscription_id: subscriptionId,
              provider: 'stripe',
              status: subscriptionData.status === 'active' ? 'active' : 'pending',
              amount: amount,
              currency: 'jpy',
              service: 'makers',
              period: 'monthly',
              plan_name: planName,
              email: session.customer_email || null,
              next_payment_date: nextPaymentDate,
              metadata: { 
                planId, 
                stripeCustomerId: session.customer,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,service',
            });
            
            console.log(`✅ Subscription recorded for user ${userId}: ${subscriptionId}`);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscriptionData = event.data.object as any;
        const userId = subscriptionData.metadata?.userId;
        
        if (userId && userId !== 'anonymous') {
          const periodEnd = subscriptionData.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
          const nextPaymentDate = new Date(periodEnd * 1000).toISOString();
          
          await supabase.from('subscriptions')
            .update({
              status: subscriptionData.status,
              next_payment_date: nextPaymentDate,
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionData.id);
          
          console.log(`✅ Subscription ${event.type}: ${subscriptionData.id} -> ${subscriptionData.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionData = event.data.object as any;
        const userId = subscriptionData.metadata?.userId;
        
        if (userId && userId !== 'anonymous') {
          await supabase.from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionData.id);
          
          console.log(`✅ Subscription deleted: ${subscriptionData.id}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`✅ Invoice paid: ${invoice.id}, amount: ${invoice.amount_paid}`);
        // 必要に応じて課金履歴を記録
        break;
      }

      case 'invoice.payment_failed': {
        const invoiceData = event.data.object as any;
        console.warn(`⚠️ Invoice payment failed: ${invoiceData.id}`);
        
        // サブスクリプションのステータスを更新
        if (invoiceData.subscription) {
          await supabase.from('subscriptions')
            .update({
              status: 'payment_failed',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', invoiceData.subscription as string);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('🔥 Stripe Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ヘルスチェック用
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Stripe Webhook',
    timestamp: new Date().toISOString(),
  });
}
