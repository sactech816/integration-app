import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ステップslugからファネル情報+全ステップを取得
 * /api/funnel/step-by-slug?slug=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const stepSlug = request.nextUrl.searchParams.get('slug');
    if (!stepSlug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // ステップを取得
    const { data: step, error: stepError } = await supabase
      .from('funnel_steps')
      .select('*, funnels!inner(id, name, slug, status)')
      .eq('slug', stepSlug)
      .single();

    if (stepError || !step) {
      return NextResponse.json({ error: 'ステップが見つかりません' }, { status: 404 });
    }

    const funnel = (step as any).funnels;

    // ファネルが公開中かチェック
    if (funnel.status !== 'active') {
      return NextResponse.json({ error: 'このファネルは現在非公開です' }, { status: 403 });
    }

    // ファネルの全ステップを取得
    const { data: allSteps } = await supabase
      .from('funnel_steps')
      .select('*')
      .eq('funnel_id', funnel.id)
      .order('order_index', { ascending: true });

    const currentIndex = (allSteps || []).findIndex((s: any) => s.slug === stepSlug);

    return NextResponse.json({
      funnel: {
        id: funnel.id,
        name: funnel.name,
        slug: funnel.slug,
      },
      step,
      currentIndex,
      totalSteps: (allSteps || []).length,
      allSteps: allSteps || [],
    });
  } catch (error) {
    console.error('[FunnelStepBySlug] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
