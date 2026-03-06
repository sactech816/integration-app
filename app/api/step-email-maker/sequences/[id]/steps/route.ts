import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: ステップ追加
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sequenceId } = await params;
    const { userId, stepOrder, delayDays, subject, htmlContent, textContent } = await request.json();

    if (!userId || !subject) {
      return NextResponse.json({ error: 'userId, subject は必須です' }, { status: 400 });
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

    // step_order を自動計算（指定がなければ末尾に追加）
    let order = stepOrder;
    if (order === undefined || order === null) {
      const { data: existingSteps } = await supabase
        .from('step_email_steps')
        .select('step_order')
        .eq('sequence_id', sequenceId)
        .order('step_order', { ascending: false })
        .limit(1);

      order = existingSteps && existingSteps.length > 0 ? existingSteps[0].step_order + 1 : 0;
    }

    const { data, error } = await supabase
      .from('step_email_steps')
      .insert({
        sequence_id: sequenceId,
        step_order: order,
        delay_days: delayDays ?? order, // デフォルトはステップ番号と同じ日数
        subject,
        html_content: htmlContent || '',
        text_content: textContent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Step Email Steps] Insert error:', error);
      return NextResponse.json({ error: 'ステップ追加に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ step: data });
  } catch (error) {
    console.error('[Step Email Steps] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT: ステップ一括更新（並び替え）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sequenceId } = await params;
    const { userId, steps } = await request.json();

    if (!userId || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'userId, steps は必須です' }, { status: 400 });
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

    // 各ステップを更新
    for (const step of steps) {
      await supabase
        .from('step_email_steps')
        .update({
          step_order: step.step_order,
          delay_days: step.delay_days,
          updated_at: new Date().toISOString(),
        })
        .eq('id', step.id)
        .eq('sequence_id', sequenceId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Step Email Steps] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
