import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * GET: 開封トラッキングピクセル
 * メールに埋め込まれた1x1画像を読み込んだ時に開封を記録
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sequenceId = searchParams.get('sid');
    const stepId = searchParams.get('stepId');
    const subscriberId = searchParams.get('sub');

    if (sequenceId && stepId && subscriberId) {
      const supabase = getServiceClient();
      if (supabase) {
        // 同じ開封は1回だけ記録（重複防止）
        const { data: existing } = await supabase
          .from('step_email_tracking')
          .select('id')
          .eq('sequence_id', sequenceId)
          .eq('step_id', stepId)
          .eq('subscriber_id', subscriberId)
          .eq('event_type', 'open')
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from('step_email_tracking').insert({
            sequence_id: sequenceId,
            step_id: stepId,
            subscriber_id: subscriberId,
            event_type: 'open',
          });
        }
      }
    }
  } catch (err) {
    console.error('[Step Email Track Open] Error:', err);
  }

  // 常にピクセル画像を返す（エラーでも）
  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
