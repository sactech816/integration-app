import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { recordAffiliateConversion, getAffiliateServiceSetting } from '@/app/actions/affiliate';
import { addPoints, PRO_MONTHLY_POINTS } from '@/lib/points';

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
        
        // ── ポイント購入（一回払い）の処理 ──
        if (session.mode === 'payment' && session.metadata?.type === 'point_purchase') {
          const userId = session.metadata?.userId;
          const packId = session.metadata?.packId;
          const points = parseInt(session.metadata?.points || '0', 10);

          if (userId && points > 0) {
            const result = await addPoints(userId, points, 'purchase', `${packId} ポイント購入`, {
              stripe_session_id: session.id,
              pack_id: packId,
              amount_paid: session.amount_total,
            });
            console.log(`✅ Points purchased: user=${userId}, points=${points}, success=${result.success}`);
          }
          break;
        }

        // ── サブスクリプションモードの処理 ──
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
            
            // アフィリエイト成約を記録（メールアドレスからpendingレコードを検索）
            const email = session.customer_email;
            if (email) {
              try {
                // pendingレコードを検索
                const { data: pendingMatch } = await supabase.rpc('match_pending_affiliate', {
                  p_email: email.toLowerCase(),
                  p_service: 'makers',
                  p_subscription_id: subscriptionId,
                });
                
                if (pendingMatch && pendingMatch.length > 0) {
                  const referralCode = pendingMatch[0].referral_code;
                  console.log(`✅ Matched pending affiliate: ref=${referralCode}, email=${email}`);
                  
                  // サービス設定から報酬率を取得
                  const serviceSetting = await getAffiliateServiceSetting('makers');
                  const isEnabled = serviceSetting.data?.enabled ?? true;

                  if (isEnabled) {
                    const result = await recordAffiliateConversion(
                      referralCode,
                      'makers',
                      subscriptionId,
                      userId,
                      'pro',
                      'monthly',
                      amount
                    );
                    if (result.success) {
                      console.log(`✅ Affiliate conversion recorded: ${result.conversionId}`);
                    } else {
                      console.warn(`⚠️ Failed to record affiliate conversion: ${result.error}`);
                    }
                  }
                }
              } catch (affErr) {
                console.error('Affiliate conversion error:', affErr);
              }
            }
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
        const invoicePaid = event.data.object as any;
        console.log(`✅ Invoice paid: ${invoicePaid.id}, amount: ${invoicePaid.amount_paid}`);

        // Proプラン月次更新時にポイントを付与
        // billing_reason: 'subscription_cycle' = 月次更新、'subscription_create' = 初回作成
        const billingReason = invoicePaid.billing_reason;
        const invoiceSubId = invoicePaid.subscription as string | undefined;
        if (invoiceSubId && (billingReason === 'subscription_cycle' || billingReason === 'subscription_create')) {
          try {
            // サブスクリプションからuserIdを取得
            const sub = await stripe.subscriptions.retrieve(invoiceSubId);
            const userId = sub.metadata?.userId;
            const planId = sub.metadata?.planId;

            if (userId && userId !== 'anonymous' && planId === 'makers_pro_monthly') {
              const month = new Date().toISOString().slice(0, 7); // YYYY-MM
              const result = await addPoints(
                userId,
                PRO_MONTHLY_POINTS,
                'grant_monthly',
                `プロプラン月次ポイント付与（${month}）`,
                { subscription_id: invoiceSubId, month, billing_reason: billingReason }
              );
              console.log(`✅ Monthly points granted: user=${userId}, points=${PRO_MONTHLY_POINTS}, success=${result.success}`);
            }
          } catch (pointErr) {
            console.error('Monthly points grant error:', pointErr);
          }
        }
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
