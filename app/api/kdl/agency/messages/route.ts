import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 代理店チェック
    const { data: agency } = await supabase
      .from('kdl_agencies')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!agency) {
      return NextResponse.json({ error: 'Not an agency' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id');

    if (targetUserId) {
      // 特定ユーザーとの会話を取得
      const { data: assignment } = await supabase
        .from('kdl_agency_users')
        .select('id')
        .eq('agency_id', agency.id)
        .eq('user_id', targetUserId)
        .single();

      if (!assignment) {
        return NextResponse.json({ error: 'User not assigned to this agency' }, { status: 403 });
      }

      const limit = parseInt(searchParams.get('limit') || '50');
      const before = searchParams.get('before');

      let query = supabase
        .from('kdl_messages')
        .select('*')
        .eq('agency_id', agency.id)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data: messages, error } = await query;
      if (error) throw error;

      // 未読数を計算
      const unreadCount = (messages || []).filter(
        m => m.sender_id !== user.id && !m.is_read
      ).length;

      return NextResponse.json({ messages: messages || [], unreadCount });
    }

    // 全会話のサマリーを取得（ユーザーごとにグループ化）
    const { data: agencyUsers } = await supabase
      .from('kdl_agency_users')
      .select('user_id, note, status')
      .eq('agency_id', agency.id)
      .eq('status', 'active');

    if (!agencyUsers || agencyUsers.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const conversations = [];
    for (const au of agencyUsers) {
      const { data: userData } = await supabase.auth.admin.getUserById(au.user_id);
      const userEmail = userData?.user?.email || 'Unknown';

      // 最新メッセージを取得
      const { data: lastMessage } = await supabase
        .from('kdl_messages')
        .select('content, sender_type, created_at, is_read')
        .eq('agency_id', agency.id)
        .eq('user_id', au.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 未読数を取得
      const { count: unreadCount } = await supabase
        .from('kdl_messages')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', agency.id)
        .eq('user_id', au.user_id)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      conversations.push({
        user_id: au.user_id,
        user_email: userEmail,
        note: au.note,
        last_message: lastMessage ? {
          content: lastMessage.content,
          sender_type: lastMessage.sender_type,
          created_at: lastMessage.created_at,
          is_read: lastMessage.is_read,
        } : null,
        unread_count: unreadCount || 0,
      });
    }

    // 最新メッセージ順にソート（未読を優先）
    conversations.sort((a, b) => {
      if (a.unread_count > 0 && b.unread_count === 0) return -1;
      if (a.unread_count === 0 && b.unread_count > 0) return 1;
      const aTime = a.last_message?.created_at || '0';
      const bTime = b.last_message?.created_at || '0';
      return bTime.localeCompare(aTime);
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, content, related_book_id } = body;

    if (!user_id || !content) {
      return NextResponse.json(
        { error: 'user_id and content are required' },
        { status: 400 }
      );
    }

    // 代理店チェック
    const { data: agency } = await supabase
      .from('kdl_agencies')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!agency) {
      return NextResponse.json({ error: 'Not an agency' }, { status: 403 });
    }

    // このユーザーが割り当てられているか確認
    const { data: assignment } = await supabase
      .from('kdl_agency_users')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('user_id', user_id)
      .single();

    if (!assignment) {
      return NextResponse.json({ error: 'User not assigned to this agency' }, { status: 403 });
    }

    const { data: message, error } = await supabase
      .from('kdl_messages')
      .insert({
        agency_id: agency.id,
        user_id: user_id,
        sender_id: user.id,
        sender_type: 'agency',
        content,
        related_book_id: related_book_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
