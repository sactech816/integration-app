import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * LINE Messaging APIでメッセージを送信
 */
async function sendLineMessage(accessToken: string, to: string, messages: unknown[]) {
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ to, messages }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`LINE API error: ${res.status} ${errorBody}`);
  }

  return true;
}

/**
 * POST: メッセージを配信
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, messageId } = await request.json();

    if (!userId || !messageId) {
      return NextResponse.json({ error: 'userId, messageId は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // LINE公式アカウント設定を取得
    const { data: lineAccount } = await supabase
      .from('line_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (!lineAccount) {
      return NextResponse.json({ error: 'LINE公式アカウントが設定されていません' }, { status: 400 });
    }

    // メッセージを取得
    const { data: message } = await supabase
      .from('line_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .single();

    if (!message) {
      return NextResponse.json({ error: 'メッセージが見つからないか、既に送信済みです' }, { status: 404 });
    }

    // 配信対象の友だちを取得
    let friendsQuery = supabase
      .from('line_friends')
      .select('*')
      .eq('owner_id', userId)
      .eq('status', 'active');

    // セグメント配信
    if (message.target_type === 'segment' && message.target_filter) {
      const filter = message.target_filter;
      if (filter.source_type) {
        friendsQuery = friendsQuery.eq('source_type', filter.source_type);
      }
      if (filter.source_id) {
        friendsQuery = friendsQuery.eq('source_id', filter.source_id);
      }
    }

    const { data: friends } = await friendsQuery;

    if (!friends || friends.length === 0) {
      return NextResponse.json({ error: '配信対象の友だちがいません' }, { status: 400 });
    }

    // LINE Message Objectを構築
    const lineMessages = [message.content];

    let successCount = 0;
    let failureCount = 0;

    // 各友だちに送信（バッチ処理）
    for (const friend of friends) {
      try {
        await sendLineMessage(
          lineAccount.channel_access_token,
          friend.line_user_id,
          lineMessages
        );

        // 送信ログ記録
        await supabase.from('line_send_logs').insert({
          message_id: messageId,
          friend_id: friend.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

        successCount++;
      } catch (err) {
        console.error(`[LINE Send] Failed for ${friend.line_user_id}:`, err);

        await supabase.from('line_send_logs').insert({
          message_id: messageId,
          friend_id: friend.id,
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unknown error',
        });

        failureCount++;
      }
    }

    // メッセージのステータスを更新
    await supabase
      .from('line_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: friends.length,
        success_count: successCount,
        failure_count: failureCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    return NextResponse.json({
      success: true,
      sent_count: friends.length,
      success_count: successCount,
      failure_count: failureCount,
    });
  } catch (error) {
    console.error('[LINE Send] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
