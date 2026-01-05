import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアント（サービスロール）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Webhookシークレット（オプション）
const WEBHOOK_SECRET = process.env.UNIVAPAY_WEBHOOK_SECRET;

/**
 * UnivaPay Webhookイベントタイプ
 */
type WebhookEventType = 
  | 'subscription.created'      // 定期課金作成
  | 'subscription.payment'      // 定期課金成功
  | 'subscription.failed'       // 定期課金失敗
  | 'subscription.suspended'    // 定期課金一時停止
  | 'subscription.completed'    // 定期課金完了
  | 'subscription.canceled'     // 定期課金永久停止
  | 'charge.updated'            // 課金情報/ステータス更新
  | 'cancel.completed';         // キャンセル完了

interface WebhookPayload {
  event: WebhookEventType;
  data: {
    id: string;
    status: string;
    amount?: number;
    currency?: string;
    period?: string;
    nextPaymentDate?: string;
    metadata?: {
      userId?: string;
      email?: string;
      planName?: string;
      source?: string;
      [key: string]: string | undefined;
    };
    subscription?: {
      id: string;
      status: string;
    };
    [key: string]: unknown;
  };
  createdAt: string;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // 署名検証（Webhookシークレットが設定されている場合）
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get('x-univapay-signature') || '';
      
      // 署名検証（簡易版 - 本番では適切な検証を実装）
      // UnivaPayの公式ドキュメントに従って実装
      if (!signature) {
        console.warn('⚠️ Webhook signature missing');
        // 開発中は警告のみ、本番では拒否
        // return NextResponse.json({ error: 'Signature required' }, { status: 401 });
      }
    }

    const payload: WebhookPayload = JSON.parse(rawBody);
    const { event, data } = payload;

    console.log(`📥 UnivaPay Webhook received: ${event}`, {
      id: data.id,
      status: data.status,
    });

    // イベント別処理
    switch (event) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      
      case 'subscription.payment':
        await handleSubscriptionPayment(data);
        break;
      
      case 'subscription.failed':
        await handleSubscriptionFailed(data);
        break;
      
      case 'subscription.suspended':
        await handleSubscriptionSuspended(data);
        break;
      
      case 'subscription.completed':
      case 'subscription.canceled':
      case 'cancel.completed':
        await handleSubscriptionCanceled(data);
        break;
      
      case 'charge.updated':
        await handleChargeUpdated(data);
        break;
      
      default:
        console.log(`⚠️ Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('🔥 UnivaPay Webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook処理に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * サブスクリプション作成時の処理
 */
async function handleSubscriptionCreated(data: WebhookPayload['data']) {
  console.log('✅ Subscription created:', data.id);
  
  if (!supabase) {
    console.warn('⚠️ Supabase not configured, skipping DB update');
    return;
  }

  const userId = data.metadata?.userId;
  
  // subscriptionsテーブルに保存
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      id: data.id,
      user_id: userId !== 'anonymous' ? userId : null,
      provider: 'univapay',
      status: 'active',
      amount: data.amount,
      currency: data.currency || 'jpy',
      period: data.period || 'monthly',
      plan_name: data.metadata?.planName,
      email: data.metadata?.email,
      next_payment_date: data.nextPaymentDate,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error('❌ Failed to save subscription:', error);
  }
}

/**
 * サブスクリプション決済成功時の処理
 */
async function handleSubscriptionPayment(data: WebhookPayload['data']) {
  console.log('💰 Subscription payment success:', data.id);
  
  if (!supabase) {
    console.warn('⚠️ Supabase not configured, skipping DB update');
    return;
  }

  // 支払い履歴を記録
  const { error: paymentError } = await supabase
    .from('subscription_payments')
    .insert({
      subscription_id: data.subscription?.id || data.id,
      amount: data.amount,
      currency: data.currency || 'jpy',
      status: 'success',
      paid_at: new Date().toISOString(),
    });

  if (paymentError) {
    console.error('❌ Failed to save payment record:', paymentError);
  }

  // サブスクリプションの次回決済日を更新
  const subscriptionId = data.subscription?.id || data.id;
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      next_payment_date: data.nextPaymentDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (updateError) {
    console.error('❌ Failed to update subscription:', updateError);
  }
}

/**
 * サブスクリプション決済失敗時の処理
 */
async function handleSubscriptionFailed(data: WebhookPayload['data']) {
  console.log('❌ Subscription payment failed:', data.id);
  
  if (!supabase) return;

  const subscriptionId = data.subscription?.id || data.id;
  
  // ステータスを更新
  await supabase
    .from('subscriptions')
    .update({
      status: 'payment_failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  // 支払い失敗履歴を記録
  await supabase
    .from('subscription_payments')
    .insert({
      subscription_id: subscriptionId,
      amount: data.amount,
      currency: data.currency || 'jpy',
      status: 'failed',
      paid_at: new Date().toISOString(),
    });
}

/**
 * サブスクリプション一時停止時の処理
 */
async function handleSubscriptionSuspended(data: WebhookPayload['data']) {
  console.log('⏸️ Subscription suspended:', data.id);
  
  if (!supabase) return;

  await supabase
    .from('subscriptions')
    .update({
      status: 'suspended',
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id);
}

/**
 * サブスクリプションキャンセル時の処理
 */
async function handleSubscriptionCanceled(data: WebhookPayload['data']) {
  console.log('🚫 Subscription canceled:', data.id);
  
  if (!supabase) return;

  const subscriptionId = data.subscription?.id || data.id;
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);
}

/**
 * 課金情報更新時の処理
 */
async function handleChargeUpdated(data: WebhookPayload['data']) {
  console.log('🔄 Charge updated:', data.id, data.status);
  
  // 必要に応じて追加の処理を実装
}


