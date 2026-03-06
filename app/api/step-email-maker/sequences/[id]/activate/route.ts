import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: シーケンスを有効化（既存購読者を進捗に登録）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sequenceId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // シーケンス取得＆所有者チェック
    const { data: sequence } = await supabase
      .from('step_email_sequences')
      .select('*, step_email_steps(id)')
      .eq('id', sequenceId)
      .eq('user_id', userId)
      .single();

    if (!sequence) {
      return NextResponse.json({ error: 'シーケンスが見つかりません' }, { status: 404 });
    }

    if (!sequence.step_email_steps || sequence.step_email_steps.length === 0) {
      return NextResponse.json({ error: 'ステップが1つもありません。先にステップを追加してください。' }, { status: 400 });
    }

    // シーケンスをactive に更新
    await supabase
      .from('step_email_sequences')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', sequenceId);

    // リストの購読者を取得
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('list_id', sequence.list_id)
      .eq('status', 'subscribed');

    if (subscribers && subscribers.length > 0) {
      // 既存の進捗がない購読者のみ登録
      const { data: existingProgress } = await supabase
        .from('step_email_progress')
        .select('subscriber_id')
        .eq('sequence_id', sequenceId);

      const existingIds = new Set((existingProgress || []).map((p: any) => p.subscriber_id));
      const newSubscribers = subscribers.filter((s: any) => !existingIds.has(s.id));

      if (newSubscribers.length > 0) {
        const progressRows = newSubscribers.map((s: any) => ({
          sequence_id: sequenceId,
          subscriber_id: s.id,
          current_step: 0,
          status: 'active',
        }));

        // バッチインサート（100件ずつ）
        for (let i = 0; i < progressRows.length; i += 100) {
          const batch = progressRows.slice(i, i + 100);
          await supabase.from('step_email_progress').insert(batch);
        }
      }
    }

    return NextResponse.json({
      success: true,
      enrolledCount: subscribers?.length || 0,
    });
  } catch (error) {
    console.error('[Step Email Activate] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
