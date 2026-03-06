import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: シーケンス詳細（ステップ含む）
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

    const { data, error } = await supabase
      .from('step_email_sequences')
      .select('*, newsletter_lists(name, from_name, from_email), step_email_steps(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'シーケンスが見つかりません' }, { status: 404 });
    }

    // ステップをstep_orderでソート
    const steps = (data.step_email_steps || []).sort((a: any, b: any) => a.step_order - b.step_order);

    // 進捗統計を取得
    const { data: progressData } = await supabase
      .from('step_email_progress')
      .select('status')
      .eq('sequence_id', id);

    const progressStats = {
      active: (progressData || []).filter((p: any) => p.status === 'active').length,
      completed: (progressData || []).filter((p: any) => p.status === 'completed').length,
      paused: (progressData || []).filter((p: any) => p.status === 'paused').length,
      total: (progressData || []).length,
    };

    return NextResponse.json({
      sequence: {
        ...data,
        list_name: data.newsletter_lists?.name || '',
        from_name: data.newsletter_lists?.from_name || '',
        from_email: data.newsletter_lists?.from_email || '',
        newsletter_lists: undefined,
        step_email_steps: undefined,
      },
      steps,
      progressStats,
    });
  } catch (error) {
    console.error('[Step Email Sequence] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH: シーケンス更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, name, description, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('step_email_sequences')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Step Email Sequence] Update error:', error);
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ sequence: data });
  } catch (error) {
    console.error('[Step Email Sequence] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: シーケンス削除
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

    const { error } = await supabase
      .from('step_email_sequences')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[Step Email Sequence] Delete error:', error);
      return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Step Email Sequence] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
