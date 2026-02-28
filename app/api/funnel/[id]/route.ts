import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ファネル詳細（ステップ込み）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');
    const isPublic = request.nextUrl.searchParams.get('public') === 'true';

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let query = supabase
      .from('funnels')
      .select('*, funnel_steps(*)');

    // slug or UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    if (!isPublic && userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: 'ファネルが見つかりません' }, { status: 404 });
    }

    // ステップをorder_indexでソート
    if (data.funnel_steps) {
      data.funnel_steps.sort((a: any, b: any) => a.order_index - b.order_index);
    }

    return NextResponse.json({ funnel: data });
  } catch (error) {
    console.error('[Funnel Detail] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH: ファネル更新（ステップ含む）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, name, description, status, steps } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // ファネル本体を更新
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('funnels')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Funnel Update] Error:', error);
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
    }

    // ステップの更新（全入れ替え方式）
    if (steps !== undefined) {
      await supabase.from('funnel_steps').delete().eq('funnel_id', id);

      if (steps.length > 0) {
        const stepInserts = steps.map((s: any, i: number) => ({
          funnel_id: id,
          order_index: i,
          name: s.name,
          step_type: s.stepType || s.step_type,
          content_ref: s.contentRef || s.content_ref || null,
          cta_label: s.ctaLabel || s.cta_label || '次へ進む',
        }));

        await supabase.from('funnel_steps').insert(stepInserts);
      }
    }

    return NextResponse.json({ funnel: data });
  } catch (error) {
    console.error('[Funnel Update] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: ファネル削除
 */
export async function DELETE(
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

    const { error } = await supabase.from('funnels').delete().eq('id', id).eq('user_id', userId);
    if (error) {
      return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Funnel Delete] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
