import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: ファネルイベントを記録
 */
export async function POST(request: NextRequest) {
  try {
    const { funnelId, stepId, sessionId, eventType } = await request.json();

    if (!funnelId || !stepId || !sessionId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validEvents = ['view', 'cta_click', 'complete'];
    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('funnel_analytics')
      .insert({
        funnel_id: funnelId,
        step_id: stepId,
        session_id: sessionId,
        event_type: eventType,
      });

    if (error) {
      console.error('[Funnel Track] Error:', error);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Funnel Track] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
