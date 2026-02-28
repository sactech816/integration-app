import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ファネルのCV分析データ
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // ファネル所有者チェック
    const { data: funnel } = await supabase
      .from('funnels')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!funnel) {
      return NextResponse.json({ error: 'ファネルが見つかりません' }, { status: 404 });
    }

    // ステップ一覧を取得
    const { data: steps } = await supabase
      .from('funnel_steps')
      .select('id, name, order_index')
      .eq('funnel_id', id)
      .order('order_index');

    if (!steps || steps.length === 0) {
      return NextResponse.json({ analytics: [] });
    }

    // 各ステップのイベントカウントを取得
    const stepAnalytics = await Promise.all(
      steps.map(async (step) => {
        const { count: viewCount } = await supabase
          .from('funnel_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('step_id', step.id)
          .eq('event_type', 'view');

        const { count: clickCount } = await supabase
          .from('funnel_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('step_id', step.id)
          .eq('event_type', 'cta_click');

        const { count: completeCount } = await supabase
          .from('funnel_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('step_id', step.id)
          .eq('event_type', 'complete');

        return {
          stepId: step.id,
          name: step.name,
          orderIndex: step.order_index,
          views: viewCount || 0,
          clicks: clickCount || 0,
          completes: completeCount || 0,
        };
      })
    );

    return NextResponse.json({ analytics: stepAnalytics });
  } catch (error) {
    console.error('[Funnel Analytics] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
