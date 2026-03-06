import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: 進捗一覧取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sequenceId } = await params;
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

    const { data, error } = await supabase
      .from('step_email_progress')
      .select('*, newsletter_subscribers(email, name, status)')
      .eq('sequence_id', sequenceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Step Email Progress] Error:', error);
      return NextResponse.json({ error: '進捗の取得に失敗しました' }, { status: 500 });
    }

    const progress = (data || []).map((p: any) => ({
      ...p,
      subscriber_email: p.newsletter_subscribers?.email || '',
      subscriber_name: p.newsletter_subscribers?.name || '',
      subscriber_status: p.newsletter_subscribers?.status || '',
      newsletter_subscribers: undefined,
    }));

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('[Step Email Progress] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
