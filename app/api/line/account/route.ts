import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ユーザーのLINE公式アカウント設定を取得
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
      .from('line_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[LINE Account] Error:', error);
      return NextResponse.json({ error: '設定の取得に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ account: data || null });
  } catch (error) {
    console.error('[LINE Account] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: LINE公式アカウント設定を作成/更新（upsert）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, channelId, channelSecret, channelAccessToken, botBasicId, displayName, friendAddMessage } = body;

    if (!userId || !channelId || !channelSecret || !channelAccessToken) {
      return NextResponse.json({ error: 'userId, channelId, channelSecret, channelAccessToken は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // アクセストークンの検証（LINE API にリクエストして確認）
    const verifyRes = await fetch('https://api.line.me/v2/bot/info', {
      headers: { 'Authorization': `Bearer ${channelAccessToken}` },
    });

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'チャネルアクセストークンが無効です。LINE Developersで確認してください。' }, { status: 400 });
    }

    const botInfo = await verifyRes.json();

    const { data, error } = await supabase
      .from('line_accounts')
      .upsert({
        user_id: userId,
        channel_id: channelId,
        channel_secret: channelSecret,
        channel_access_token: channelAccessToken,
        bot_basic_id: botBasicId || botInfo.basicId || null,
        display_name: displayName || botInfo.displayName || null,
        friend_add_message: friendAddMessage || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('[LINE Account] Upsert error:', error);
      return NextResponse.json({ error: '設定の保存に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ account: data });
  } catch (error) {
    console.error('[LINE Account] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: LINE公式アカウント設定を削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('line_accounts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[LINE Account] Delete error:', error);
      return NextResponse.json({ error: '設定の削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LINE Account] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
