import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * PATCH: ステップ更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: sequenceId, stepId } = await params;
    const body = await request.json();
    const { userId, subject, htmlContent, textContent, delayDays, stepOrder } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // シーケンス所有者チェック
    const { data: sequence } = await supabase
      .from('step_email_sequences')
      .select('id')
      .eq('id', sequenceId)
      .eq('user_id', userId)
      .single();

    if (!sequence) {
      return NextResponse.json({ error: 'シーケンスが見つかりません' }, { status: 404 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (subject !== undefined) updateData.subject = subject;
    if (htmlContent !== undefined) updateData.html_content = htmlContent;
    if (textContent !== undefined) updateData.text_content = textContent;
    if (delayDays !== undefined) updateData.delay_days = delayDays;
    if (stepOrder !== undefined) updateData.step_order = stepOrder;

    const { data, error } = await supabase
      .from('step_email_steps')
      .update(updateData)
      .eq('id', stepId)
      .eq('sequence_id', sequenceId)
      .select()
      .single();

    if (error) {
      console.error('[Step Email Step] Update error:', error);
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ step: data });
  } catch (error) {
    console.error('[Step Email Step] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: ステップ削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: sequenceId, stepId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // シーケンス所有者チェック
    const { data: sequence } = await supabase
      .from('step_email_sequences')
      .select('id')
      .eq('id', sequenceId)
      .eq('user_id', userId)
      .single();

    if (!sequence) {
      return NextResponse.json({ error: 'シーケンスが見つかりません' }, { status: 404 });
    }

    const { error } = await supabase
      .from('step_email_steps')
      .delete()
      .eq('id', stepId)
      .eq('sequence_id', sequenceId);

    if (error) {
      console.error('[Step Email Step] Delete error:', error);
      return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
    }

    // 残りのステップの step_order を再採番
    const { data: remainingSteps } = await supabase
      .from('step_email_steps')
      .select('id, step_order')
      .eq('sequence_id', sequenceId)
      .order('step_order', { ascending: true });

    if (remainingSteps) {
      for (let i = 0; i < remainingSteps.length; i++) {
        if (remainingSteps[i].step_order !== i) {
          await supabase
            .from('step_email_steps')
            .update({ step_order: i })
            .eq('id', remainingSteps[i].id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Step Email Step] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
