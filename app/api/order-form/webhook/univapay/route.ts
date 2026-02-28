import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: UnivaPay Webhook（申し込みフォーム決済完了処理）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const eventType = body.event || body.type;
    const metadata = body.metadata || body.data?.metadata || {};

    // order_form用かチェック
    if (metadata?.type !== 'order_form' || !metadata?.submissionId) {
      return NextResponse.json({ received: true });
    }

    if (eventType === 'charge.succeeded' || eventType === 'subscription.created') {
      await supabase
        .from('order_form_submissions')
        .update({
          payment_status: 'paid',
          payment_provider: 'univapay',
          payment_reference: body.id || body.data?.id || '',
          amount_paid: body.amount || body.data?.amount || 0,
        })
        .eq('id', metadata.submissionId);

      console.log('[Order Form UnivaPay Webhook] Payment completed for submission:', metadata.submissionId);
    } else if (eventType === 'charge.failed') {
      await supabase
        .from('order_form_submissions')
        .update({ payment_status: 'failed' })
        .eq('id', metadata.submissionId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Order Form UnivaPay Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
