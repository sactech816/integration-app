import { NextResponse } from 'next/server';
import { getUnivaPayClient, UnivaPayWebhookEvent } from '@/lib/univapay';
import { createClient } from '@supabase/supabase-js';

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
        const { id, status, metadata } = event.data;
        const userId = metadata?.userId;
        const service = metadata?.service || 'donation';
        const period = metadata?.period || 'monthly';
        
        if (userId && userId !== 'anonymous') {
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
          
          console.log(`✅ Subscription created for user ${userId}: ${id}`);
        }
        break;
      }

      case 'subscription.updated': {
        const { id, status, metadata } = event.data;
        const userId = metadata?.userId;
        
        if (userId && userId !== 'anonymous') {
          await supabase
            .from('subscriptions')
            .update({
              status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', id);
          
          console.log(`✅ Subscription updated: ${id} -> ${status}`);
        }
        break;
      }

      case 'subscription.canceled': {
        const { id, metadata } = event.data;
        const userId = metadata?.userId;
        
        if (userId && userId !== 'anonymous') {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', id);
          
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
