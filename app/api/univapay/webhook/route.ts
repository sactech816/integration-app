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

// LP専用プランの金額からプラン情報を推定
const LP_PLAN_AMOUNT_MAP: Record<number, { planTier: string; periodMonths: number; planName: string }> = {
  49800:  { planTier: 'initial_trial',    periodMonths: 1, planName: 'KDL 1ヶ月トライアル' },
  99800:  { planTier: 'initial_standard', periodMonths: 3, planName: 'KDL 3ヶ月スタンダード' },
  198000: { planTier: 'initial_business', periodMonths: 6, planName: 'KDL ビジネス（初回）' },
};

/**
 * メールアドレスからSupabaseユーザーIDを検索
 * 1. DB関数（find_user_id_by_email）を優先
 * 2. フォールバックとしてauth admin APIを使用
 */
async function findUserIdByEmail(supabase: any, email: string): Promise<string | null> {
  if (!email) return null;
  try {
    // 方法1: DB関数で効率的に検索（SQLマイグレーション適用後に有効）
    const { data: rpcResult, error: rpcError } = await supabase.rpc('find_user_id_by_email', {
      target_email: email.toLowerCase(),
    });
    if (!rpcError && rpcResult) {
      return rpcResult;
    }

    // 方法2: フォールバック - auth admin APIで検索
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error || !data?.users) {
      console.warn('⚠️ Failed to list users for email lookup:', error?.message);
      return null;
    }
    const match = data.users.find((u: any) =>
      u.email?.toLowerCase() === email.toLowerCase()
    );
    return match?.id || null;
  } catch (err) {
    console.error('Error finding user by email:', err);
    return null;
  }
}

/**
 * kdl_subscriptions にレコードを作成するヘルパー
 */
async function createKdlSubscription(
  supabase: any,
  params: {
    id: string;
    userId: string;
    email: string | null;
    amount: number;
    planTier: string;
    period: string;
    planName: string;
    periodMonths: number;
    status: string;
    referralCode?: string;
  }
) {
  const now = new Date();
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + params.periodMonths);

  await supabase.from('kdl_subscriptions').upsert({
    id: params.id,
    user_id: params.userId,
    provider: 'univapay',
    status: params.status === 'active' ? 'active' : 'pending',
    amount: params.amount,
    currency: 'jpy',
    period: params.period,
    plan_tier: params.planTier,
    plan_name: params.planName,
    email: params.email,
    current_period_start: now.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
    next_payment_date: currentPeriodEnd.toISOString(),
    metadata: { referralCode: params.referralCode, originalStatus: params.status },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }, {
    onConflict: 'id',
  });

  console.log(`✅ KDL Subscription created: ${params.id}, plan: ${params.planTier}, user: ${params.userId}`);
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
        let userId = metadata?.userId;
        let service = metadata?.service || 'donation';
        let period = metadata?.period || 'monthly';
        let planTier = metadata?.planTier || 'standard';
        const referralCode = metadata?.referralCode;
        let email = metadata?.email;

        // LP経由の決済: metadataにuserIdがない場合、金額からプラン情報を推定
        const lpPlan = amount ? LP_PLAN_AMOUNT_MAP[amount] : null;
        if (lpPlan && !userId) {
          service = 'kdl';
          planTier = lpPlan.planTier;
          console.log(`📋 LP plan detected by amount (¥${amount}): ${lpPlan.planName}`);
        }

        // userIdが無い場合、メールアドレスからユーザーを検索
        if ((!userId || userId === 'anonymous') && email) {
          const foundUserId = await findUserIdByEmail(supabase, email);
          if (foundUserId) {
            userId = foundUserId;
            console.log(`✅ Found user by email (${email}): ${userId}`);
          } else {
            console.warn(`⚠️ No user found for email: ${email}. Subscription will need manual linking.`);
          }
        }

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
            const periodMonths = lpPlan?.periodMonths
              || (period === 'yearly' ? 12 : 1);
            const planName = lpPlan?.planName
              || (() => {
                const planNameMap: Record<string, string> = {
                  'lite': 'ライト', 'standard': 'スタンダード', 'pro': 'プロ',
                  'business': 'ビジネス', 'enterprise': 'エンタープライズ',
                  'initial_trial': '初回トライアル', 'initial_standard': '初回スタンダード',
                  'initial_business': '初回ビジネス',
                };
                const periodName = period === 'yearly' ? '年額' : '月額';
                return `KDL ${planNameMap[planTier] || planTier} ${periodName}`;
              })();

            await createKdlSubscription(supabase, {
              id,
              userId,
              email: email || null,
              amount: amount || 0,
              planTier,
              period,
              planName,
              periodMonths,
              status,
              referralCode,
            });
          }

          console.log(`✅ Subscription created for user ${userId}: ${id}`);

          // アフィリエイト成約を記録
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
        } else {
          // ユーザーが見つからない場合でもログに記録
          console.warn(`⚠️ Subscription created but no user found: id=${id}, email=${email || 'none'}, amount=${amount}`);
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
        let chargeUserId = metadata?.userId;
        const chargeService = metadata?.service || 'donation';
        const chargeEmail = metadata?.email;

        console.log(`✅ Charge succeeded: ${id}, amount: ${amount}, user: ${chargeUserId}, service: ${chargeService}`);

        // LP経由の一括払い: 金額からKDLプランを推定
        const chargeLpPlan = amount ? LP_PLAN_AMOUNT_MAP[amount] : null;
        if (chargeLpPlan) {
          // userIdが無い場合、メールアドレスからユーザーを検索
          if ((!chargeUserId || chargeUserId === 'anonymous') && chargeEmail) {
            const foundId = await findUserIdByEmail(supabase, chargeEmail);
            if (foundId) {
              chargeUserId = foundId;
              console.log(`✅ Found user by email for charge (${chargeEmail}): ${chargeUserId}`);
            }
          }

          if (chargeUserId && chargeUserId !== 'anonymous') {
            // kdl_subscriptionsテーブルに書き込み
            await createKdlSubscription(supabase, {
              id,
              userId: chargeUserId,
              email: chargeEmail || null,
              amount: amount || 0,
              planTier: chargeLpPlan.planTier,
              period: 'monthly',
              planName: chargeLpPlan.planName,
              periodMonths: chargeLpPlan.periodMonths,
              status: 'active',
            });

            // 汎用subscriptionsテーブルにも書き込み
            await supabase.from('subscriptions').upsert({
              user_id: chargeUserId,
              subscription_id: id,
              status: 'active',
              service: 'kdl',
              period: 'monthly',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,service',
            });

            console.log(`✅ KDL subscription created from charge: ${id}, plan: ${chargeLpPlan.planName}`);

            // アフィリエイトpendingマッチング
            if (chargeEmail) {
              try {
                const { data: pendingMatch } = await supabase.rpc('match_pending_affiliate', {
                  p_email: chargeEmail.toLowerCase(),
                  p_service: 'kdl',
                  p_subscription_id: id,
                });
                if (pendingMatch && pendingMatch.length > 0) {
                  const serviceSetting = await getAffiliateServiceSetting('kdl');
                  if (serviceSetting.data?.enabled !== false) {
                    await recordAffiliateConversion(
                      pendingMatch[0].referral_code,
                      'kdl',
                      id,
                      chargeUserId,
                      chargeLpPlan.planTier,
                      'monthly',
                      amount || 0
                    );
                  }
                }
              } catch (affErr) {
                console.warn('⚠️ Affiliate matching error on charge:', affErr);
              }
            }
          } else {
            console.warn(`⚠️ KDL charge succeeded but no user found: id=${id}, email=${chargeEmail || 'none'}, amount=${amount}`);
          }
        }
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
