import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * LINE Webhook署名を検証
 */
function verifySignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

/**
 * LINE APIからユーザープロフィールを取得
 */
async function getLineProfile(userId: string, accessToken: string) {
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * POST: LINE Webhookイベント受信
 * URL: /api/line/webhook?ownerId=xxx
 * ownerIdでどのユーザーのLINE公式アカウントかを識別
 */
export async function POST(request: NextRequest) {
  try {
    const ownerId = request.nextUrl.searchParams.get('ownerId');
    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // LINE公式アカウント設定を取得
    const { data: lineAccount } = await supabase
      .from('line_accounts')
      .select('*')
      .eq('user_id', ownerId)
      .eq('is_active', true)
      .single();

    if (!lineAccount) {
      return NextResponse.json({ error: 'LINE account not found' }, { status: 404 });
    }

    // リクエストボディを取得
    const rawBody = await request.text();
    const signature = request.headers.get('x-line-signature') || '';

    // 署名検証
    if (!verifySignature(rawBody, signature, lineAccount.channel_secret)) {
      console.error('[LINE Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];

    for (const event of events) {
      const lineUserId = event.source?.userId;
      if (!lineUserId) continue;

      if (event.type === 'follow') {
        // 友だち追加イベント
        const profile = await getLineProfile(lineUserId, lineAccount.channel_access_token);

        // source_type / source_id をリッチメニューやLIFFから受け取る場合はここで処理
        // デフォルトは 'direct'
        await supabase
          .from('line_friends')
          .upsert({
            owner_id: ownerId,
            line_user_id: lineUserId,
            display_name: profile?.displayName || null,
            picture_url: profile?.pictureUrl || null,
            status_message: profile?.statusMessage || null,
            source_type: 'direct',
            status: 'active',
            followed_at: new Date().toISOString(),
            unfollowed_at: null,
          }, { onConflict: 'owner_id,line_user_id' });

        console.log(`[LINE Webhook] Follow: ${lineUserId} -> owner: ${ownerId}`);

      } else if (event.type === 'unfollow') {
        // ブロック/友だち解除イベント
        await supabase
          .from('line_friends')
          .update({
            status: 'unfollowed',
            unfollowed_at: new Date().toISOString(),
          })
          .eq('owner_id', ownerId)
          .eq('line_user_id', lineUserId);

        console.log(`[LINE Webhook] Unfollow: ${lineUserId} -> owner: ${ownerId}`);
      }
    }

    // LINE APIは200を返す必要がある
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LINE Webhook] Error:', error);
    // LINE APIは200を返す必要がある（エラー時も）
    return NextResponse.json({ success: true });
  }
}
