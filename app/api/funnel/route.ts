import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMakersSubscriptionStatus, getFunnelLimit } from '@/lib/subscription';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ユーザーのファネル一覧
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('funnels')
      .select('*, funnel_steps(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Funnel] Error:', error);
      return NextResponse.json({ error: 'ファネル一覧の取得に失敗しました' }, { status: 500 });
    }

    const funnels = (data || []).map((f: any) => ({
      ...f,
      step_count: f.funnel_steps?.[0]?.count || 0,
      funnel_steps: undefined,
    }));

    return NextResponse.json({ funnels });
  } catch (error) {
    console.error('[Funnel] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: 新しいファネル作成
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, name, description } = await request.json();

    if (!userId || !name) {
      return NextResponse.json({ error: 'userId と name は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // ファネル作成数制限チェック
    const subscription = await getMakersSubscriptionStatus(userId);
    const limit = getFunnelLimit(subscription.planTier);
    if (limit !== -1) {
      const { count } = await supabase
        .from('funnels')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if ((count || 0) >= limit) {
        return NextResponse.json(
          { error: `${subscription.planTier === 'free' ? 'フリープラン' : 'ご利用中のプラン'}ではファネルは${limit}個まで作成できます。上位プランにアップグレードすると、より多く作成できます。` },
          { status: 403 }
        );
      }
    }

    const slug = `funnel-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('funnels')
      .insert({
        user_id: userId,
        name,
        slug,
        description: description || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('[Funnel] Insert error:', error);
      return NextResponse.json({ error: 'ファネル作成に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ funnel: data });
  } catch (error) {
    console.error('[Funnel] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
