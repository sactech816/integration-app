import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: クリックトラッキング＆リダイレクト
 * メール内リンクをこのエンドポイント経由にし、クリックを記録後にリダイレクト
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sequenceId = searchParams.get('sid');
  const stepId = searchParams.get('stepId');
  const subscriberId = searchParams.get('sub');
  const url = searchParams.get('url');

  // リダイレクト先がない場合はトップページへ
  const redirectUrl = url || process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  try {
    if (sequenceId && stepId && subscriberId && url) {
      const supabase = getServiceClient();
      if (supabase) {
        await supabase.from('step_email_tracking').insert({
          sequence_id: sequenceId,
          step_id: stepId,
          subscriber_id: subscriberId,
          event_type: 'click',
          link_url: url,
        });
      }
    }
  } catch (err) {
    console.error('[Step Email Track Click] Error:', err);
  }

  // 常にリダイレクト（エラーでも）
  return NextResponse.redirect(redirectUrl, 302);
}
