import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = getServiceClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

async function verifyOrderParticipant(supabase: any, orderId: string, userId: string) {
  const { data: order } = await supabase
    .from('marketplace_orders')
    .select('buyer_id, seller_id')
    .eq('id', orderId)
    .single();

  if (!order) return null;
  if (order.buyer_id !== userId && order.seller_id !== userId) return null;
  return order;
}

// GET: メッセージ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: orderId } = await params;
    const supabase = getServiceClient()!;

    const order = await verifyOrderParticipant(supabase, orderId, user.id);
    if (!order) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    let query = supabase
      .from('marketplace_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (before) query = query.lt('created_at', before);

    const { data: messages, error } = await query;
    if (error) throw error;

    return NextResponse.json({ messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: メッセージ送信
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: orderId } = await params;
    const supabase = getServiceClient()!;

    const order = await verifyOrderParticipant(supabase, orderId, user.id);
    if (!order) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 });
    }

    const senderType = order.buyer_id === user.id ? 'buyer' : 'seller';

    const { data, error } = await supabase
      .from('marketplace_messages')
      .insert({
        order_id: orderId,
        sender_id: user.id,
        sender_type: senderType,
        content: body.content.trim(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: 既読にする
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: orderId } = await params;
    const supabase = getServiceClient()!;

    const order = await verifyOrderParticipant(supabase, orderId, user.id);
    if (!order) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 相手のメッセージのみ既読にする
    const { error } = await supabase
      .from('marketplace_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
