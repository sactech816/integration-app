import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ユーザーのメルマガリスト一覧を取得
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
      .from('newsletter_lists')
      .select(`
        *,
        newsletter_subscribers(count),
        newsletter_campaigns(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Newsletter Lists] Error:', error);
      return NextResponse.json({ error: 'リスト取得に失敗しました' }, { status: 500 });
    }

    // subscriber/campaign countを整形
    const lists = (data || []).map((list: any) => ({
      ...list,
      subscriber_count: list.newsletter_subscribers?.[0]?.count || 0,
      campaign_count: list.newsletter_campaigns?.[0]?.count || 0,
      newsletter_subscribers: undefined,
      newsletter_campaigns: undefined,
    }));

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('[Newsletter Lists] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: 新しいメルマガリストを作成（Resend Audience も同時に作成）
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, name, description, fromName, fromEmail } = await request.json();

    if (!userId || !name) {
      return NextResponse.json({ error: 'userId と name は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Resend Audience を作成
    let resendAudienceId: string | null = null;
    try {
      const audience = await resend.audiences.create({ name: `${name} (${userId.slice(0, 8)})` });
      resendAudienceId = audience.data?.id || null;
    } catch (err) {
      console.error('[Newsletter] Resend Audience creation failed:', err);
      // Resend失敗でもDB側は作成する
    }

    const { data, error } = await supabase
      .from('newsletter_lists')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        from_name: fromName || null,
        from_email: fromEmail || null,
        resend_audience_id: resendAudienceId,
      })
      .select()
      .single();

    if (error) {
      console.error('[Newsletter Lists] Insert error:', error);
      return NextResponse.json({ error: 'リスト作成に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ list: data });
  } catch (error) {
    console.error('[Newsletter Lists] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
