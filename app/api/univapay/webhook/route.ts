import { NextResponse } from 'next/server';
import { getUnivaPayClient, UnivaPayWebhookEvent } from '@/lib/univapay';
import { createClient } from '@supabase/supabase-js';
import { recordAffiliateConversion, getAffiliateServiceSetting } from '@/app/actions/affiliate';

/**
 * UnivaPay Webhook エンドポイント
 * 
 * UnivaPayからのイベント通知を受信し、サブスクリプション状態を更新します。
 * 
 * 対応イベント:
 * - subscription.created: 新規サブスクリプション作成
 * - subscription.updated: サブスクリプション更新
 * - subscription.canceled: サブスクリプションキャンセル
 * - charge.succeeded: 課金成功
 * - charge.failed: 課金失敗
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

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-univapay-signature') || '';
    const webhookSecret = process.env.UNIVAPAY_WEBHOOK_SECRET;

    // 署名検証（シークレットが設定されている場合のみ）
    if (webhookSecret && signature) {
      const client = getUnivaPayClient();
      const isValid = client.verifyWebhookSignature(rawBody, signature, webhookSecret);
      
      if (!isValid) {
        console.error('❌ Webhook signature verification failed');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event: UnivaPayWebhookEvent = JSON.parse(rawBody);
    
    console.log(`📥 Received UnivaPay webhook: ${event.event}`);
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    const supabase = getSupabaseAdmin();

    // イベントタイプに応じた処理
    switch (event.event) {
      case 'subscription.created': {
        const { id, status, metadata, amount } = event.data;
        const userId = metadata?.userId;
        const service = metadata?.service || 'donation';
        const period = metadata?.period || 'monthly';
        const planTier = metadata?.planTier || 'standard';
        const referralCode = metadata?.referralCode;
        const email = metadata?.email;
        
        if (userId && userId !== 'anonymous') {
          // 汎用subscriptionsテーブルに書き込み
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            subscription_id: id,
            status: status,
            service: service,
            period: period,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,service',
          });
          
          // KDLサービスの場合はkdl_subscriptionsテーブルにも書き込み
          if (service === 'kdl') {
            // 期間終了日を計算（月額: 1ヶ月後、年額: 1年後）
            const now = new Date();
            const currentPeriodEnd = new Date(now);
            if (period === 'yearly') {
              currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
            } else {
              currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
            }
            
            // プラン表示名を生成
            const planNameMap: Record<string, string> = {
              'lite': 'ライト',
              'standard': 'スタンダード',
              'pro': 'プロ',
              'business': 'ビジネス',
              'enterprise': 'エンタープライズ',
              'initial_trial': '初回トライアル',
              'initial_standard': '初回スタンダード',
              'initial_business': '初回ビジネス',
            };
            const periodName = period === 'yearly' ? '年額' : '月額';
            const planName = `KDL ${planNameMap[planTier] || planTier} ${periodName}`;
            
            await supabase.from('kdl_subscriptions').upsert({
              id: id,
              user_id: userId,
              provider: 'univapay',
              status: status === 'active' ? 'active' : 'pending',
              amount: amount || 0,
              currency: 'jpy',
              period: period,
              plan_tier: planTier,
              plan_name: planName,
              email: email,
              current_period_start: now.toISOString(),
              current_period_end: currentPeriodEnd.toISOString(),
              next_payment_date: currentPeriodEnd.toISOString(),
              metadata: { referralCode, originalStatus: status },
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
            }, {
              onConflict: 'id',
            });
            
            console.log(`✅ KDL Subscription created in kdl_subscriptions: ${id}, plan: ${planTier}, period: ${period}`);
          }
          
          console.log(`✅ Subscription created for user ${userId}: ${id}`);
          
          // アフィリエイト成約を記録（KDLおよびメインサイト対応）
          // 1. まずmetadataからのreferralCodeを試す
          // 2. なければpendingレコードからメールアドレスでマッチング
          let finalReferralCode = referralCode;
          let finalPlanTier = planTier;
          let finalPeriod = period;
          
          // metadataにreferralCodeがない場合、pendingレコードを検索
          if (!finalReferralCode && email) {
            try {
              const { data: pendingMatch } = await supabase.rpc('match_pending_affiliate', {
                p_email: email.toLowerCase(),
                p_service: service,
                p_subscription_id: id,
              });
              
              if (pendingMatch && pendingMatch.length > 0) {
                finalReferralCode = pendingMatch[0].referral_code;
                finalPlanTier = pendingMatch[0].plan_tier || planTier;
                finalPeriod = pendingMatch[0].plan_period || period;
                console.log(`✅ Matched pending affiliate: ref=${finalReferralCode}, email=${email}`);
              }
            } catch (pendingErr) {
              console.warn('⚠️ Failed to match pending affiliate:', pendingErr);
            }
          }
          
          if (finalReferralCode) {
            try {
              // サービス設定から報酬率を取得
              const serviceSetting = await getAffiliateServiceSetting(service);
              const commissionRate = serviceSetting.data?.commission_rate || 20;
              const isEnabled = serviceSetting.data?.enabled ?? true;

              if (isEnabled) {
                console.log(`📊 Affiliate service setting for ${service}: rate=${commissionRate}%, enabled=${isEnabled}`);
                
                const result = await recordAffiliateConversion(
                  finalReferralCode,
                  service,
                  id,
                  userId,
                  finalPlanTier,
                  finalPeriod,
                  amount || 0
                );
                if (result.success) {
                  console.log(`✅ Affiliate conversion recorded: ${result.conversionId}`);
                } else {
                  console.warn(`⚠️ Failed to record affiliate conversion: ${result.error}`);
                }
              } else {
                console.log(`ℹ️ Affiliate is disabled for service: ${service}`);
              }
            } catch (affErr) {
              console.error('Affiliate conversion error:', affErr);
            }
          }
        }
        break;
      }

      case 'subscription.updated': {
        const { id, status, metadata } = event.data;
        const userId = metadata?.userId;
        const service = metadata?.service || 'donation';
        
        if (userId && userId !== 'anonymous') {
          // 汎用subscriptionsテーブルを更新
          await supabase
            .from('subscriptions')
            .update({
              status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', id);
          
          // KDLサービスの場合はkdl_subscriptionsも更新
          if (service === 'kdl') {
            await supabase
              .from('kdl_subscriptions')
              .update({
                status: status === 'active' ? 'active' : status,
                updated_at: new Date().toISOString(),
              })
              .eq('id', id);
            
            console.log(`✅ KDL Subscription updated in kdl_subscriptions: ${id} -> ${status}`);
          }
          
          console.log(`✅ Subscription updated: ${id} -> ${status}`);
        }
        break;
      }

      case 'subscription.canceled': {
        const { id, metadata } = event.data;
        const userId = metadata?.userId;
        const service = metadata?.service || 'donation';
        
        if (userId && userId !== 'anonymous') {
          const now = new Date().toISOString();
          
          // 汎用subscriptionsテーブルを更新
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: now,
              updated_at: now,
            })
            .eq('subscription_id', id);
          
          // KDLサービスの場合はkdl_subscriptionsも更新
          if (service === 'kdl') {
            await supabase
              .from('kdl_subscriptions')
              .update({
                status: 'canceled',
                canceled_at: now,
                updated_at: now,
              })
              .eq('id', id);
            
            console.log(`✅ KDL Subscription canceled in kdl_subscriptions: ${id}`);
          }
          
          console.log(`✅ Subscription canceled: ${id}`);
        }
        break;
      }

      case 'charge.succeeded': {
        const { id, amount, metadata } = event.data;
        const userId = metadata?.userId;
        const service = metadata?.service || 'donation';
        
        // 課金成功をログに記録
        console.log(`✅ Charge succeeded: ${id}, amount: ${amount}, user: ${userId}, service: ${service}`);
        
        // 必要に応じて課金履歴テーブルに記録
        // await supabase.from('payment_history').insert({...});
        break;
      }

      case 'charge.failed': {
        const { id, metadata } = event.data;
        const userId = metadata?.userId;
        
        console.warn(`⚠️ Charge failed: ${id}, user: ${userId}`);
        // 必要に応じて失敗通知などの処理を追加
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.event}`);
    }

    // UnivaPayへの応答（200を返すことでイベント受信を確認）
    return NextResponse.json({ received: true });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('🔥 Webhook processing error:', error);
    
    // エラーでも200を返すことで、UnivaPayのリトライを防ぐ
    // ただし、重要なエラーの場合は500を返してリトライさせることも検討
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ヘルスチェック用（オプション）
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'UnivaPay Webhook',
    timestamp: new Date().toISOString(),
  });
}
