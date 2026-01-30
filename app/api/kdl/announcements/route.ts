/**
 * KDLお知らせAPI
 * GET: お知らせ一覧・詳細取得
 * POST: お知らせ作成（管理者のみ）
 * PUT: お知らせ更新（管理者のみ）・既読マーク
 * DELETE: お知らせ削除（管理者のみ）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// 管理者チェック
async function isAdmin(supabase: NonNullable<ReturnType<typeof getServiceClient>>, token: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user?.email) return false;
    
    const adminEmails = getAdminEmails();
    return adminEmails.some(email => user.email?.toLowerCase() === email.toLowerCase());
  } catch {
    return false;
  }
}

// カテゴリ表示名
const CATEGORY_LABELS: Record<string, string> = {
  info: 'お知らせ',
  update: 'アップデート',
  maintenance: 'メンテナンス',
  campaign: 'キャンペーン',
  important: '重要',
};

// カテゴリ色
const CATEGORY_COLORS: Record<string, string> = {
  info: 'blue',
  update: 'green',
  maintenance: 'yellow',
  campaign: 'purple',
  important: 'red',
};

/**
 * GET: お知らせ一覧・詳細取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('id');
    const category = searchParams.get('category');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 単一お知らせ取得
    if (announcementId) {
      const { data: announcement, error } = await supabase
        .from('kdl_announcements')
        .select('*')
        .eq('id', announcementId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
      }

      // 既読情報を取得
      let isRead = false;
      if (userId) {
        const { data: readData } = await supabase
          .from('kdl_announcement_reads')
          .select('id')
          .eq('user_id', userId)
          .eq('announcement_id', announcementId)
          .single();
        isRead = !!readData;
      }

      return NextResponse.json({
        announcement: {
          ...announcement,
          category_label: CATEGORY_LABELS[announcement.category] || announcement.category,
          category_color: CATEGORY_COLORS[announcement.category] || 'gray',
          is_read: isRead,
        },
      });
    }

    // お知らせ一覧取得
    let query = supabase
      .from('kdl_announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    // フィルター
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
      // 有効期間内のもののみ
      const now = new Date().toISOString();
      query = query.or(`start_at.is.null,start_at.lte.${now}`);
      query = query.or(`end_at.is.null,end_at.gte.${now}`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: announcements, error } = await query;

    if (error) {
      console.error('Failed to fetch announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    // ユーザーの既読情報を取得
    let readMap: Record<string, boolean> = {};
    if (userId && announcements) {
      const announcementIds = announcements.map(a => a.id);
      const { data: readData } = await supabase
        .from('kdl_announcement_reads')
        .select('announcement_id')
        .eq('user_id', userId)
        .in('announcement_id', announcementIds);

      if (readData) {
        readData.forEach(r => {
          readMap[r.announcement_id] = true;
        });
      }
    }

    // カテゴリ情報と既読状態を追加
    const enrichedAnnouncements = (announcements || []).map(announcement => ({
      ...announcement,
      category_label: CATEGORY_LABELS[announcement.category] || announcement.category,
      category_color: CATEGORY_COLORS[announcement.category] || 'gray',
      is_read: readMap[announcement.id] || false,
    }));

    // 未読数を計算
    const unreadCount = enrichedAnnouncements.filter(a => !a.is_read).length;

    return NextResponse.json({
      announcements: enrichedAnnouncements,
      unreadCount,
      categories: CATEGORY_LABELS,
    });
  } catch (error) {
    console.error('GET announcements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: お知らせ作成（管理者のみ）
 */
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

    // 管理者チェック
    if (!await isAdmin(supabase, token)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, category, priority, is_published, is_pinned, target_plans, target_roles, start_at, end_at } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser(token);

    const { data, error } = await supabase
      .from('kdl_announcements')
      .insert({
        title,
        content,
        category: category || 'info',
        priority: priority || 0,
        is_published: is_published || false,
        is_pinned: is_pinned || false,
        target_plans,
        target_roles,
        start_at,
        end_at,
        published_at: is_published ? new Date().toISOString() : null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create announcement:', error);
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    return NextResponse.json({ success: true, announcement: data });
  } catch (error) {
    console.error('POST announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT: お知らせ更新（管理者）または既読マーク（ユーザー）
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    
    // 既読マーク
    if (body.action === 'mark_read') {
      const { announcement_id, user_id } = body;
      
      if (!announcement_id || !user_id) {
        return NextResponse.json({ error: 'announcement_id and user_id are required' }, { status: 400 });
      }

      // upsertで既読を記録
      const { error } = await supabase
        .from('kdl_announcement_reads')
        .upsert({
          user_id,
          announcement_id,
          read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,announcement_id',
        });

      if (error) {
        console.error('Failed to mark as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // お知らせ更新（管理者のみ）
    if (!await isAdmin(supabase, token)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    // 公開フラグが変更された場合、published_atを更新
    if (updateData.is_published === true) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('kdl_announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update announcement:', error);
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }

    return NextResponse.json({ success: true, announcement: data });
  } catch (error) {
    console.error('PUT announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: お知らせ削除（管理者のみ）
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('id');

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 管理者チェック
    if (!await isAdmin(supabase, token)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { error } = await supabase
      .from('kdl_announcements')
      .delete()
      .eq('id', announcementId);

    if (error) {
      console.error('Failed to delete announcement:', error);
      return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
