/**
 * KDL教育コンテンツAPI
 * GET: コンテンツ一覧・詳細取得
 * POST: コンテンツ作成（管理者のみ）
 * PUT: コンテンツ更新（管理者のみ）
 * DELETE: コンテンツ削除（管理者のみ）
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
async function isAdmin(supabase: ReturnType<typeof createClient>, token: string): Promise<boolean> {
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
  basics: '執筆基礎',
  kdp: 'KDP入門',
  marketing: 'マーケティング',
  ai_tips: 'AI活用術',
  advanced: '上級テクニック',
  case_study: '成功事例',
};

/**
 * GET: コンテンツ一覧・詳細取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const category = searchParams.get('category');
    const contentType = searchParams.get('type');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    const userId = searchParams.get('userId');

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 単一コンテンツ取得
    if (contentId) {
      const { data: content, error } = await supabase
        .from('kdl_education_contents')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      // 閲覧数をインクリメント
      await supabase
        .from('kdl_education_contents')
        .update({ view_count: (content.view_count || 0) + 1 })
        .eq('id', contentId);

      // ユーザーの進捗を取得
      let progress = null;
      if (userId) {
        const { data } = await supabase
          .from('kdl_education_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('content_id', contentId)
          .single();
        progress = data;
      }

      return NextResponse.json({
        content: {
          ...content,
          category_label: CATEGORY_LABELS[content.category] || content.category,
        },
        progress,
      });
    }

    // コンテンツ一覧取得
    let query = supabase
      .from('kdl_education_contents')
      .select('id, title, description, content_type, category, thumbnail_url, duration_minutes, difficulty, is_premium, view_count, created_at, is_published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    // フィルター
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (contentType && contentType !== 'all') {
      query = query.eq('content_type', contentType);
    }

    const { data: contents, error } = await query;

    if (error) {
      console.error('Failed to fetch contents:', error);
      return NextResponse.json({ error: 'Failed to fetch contents' }, { status: 500 });
    }

    // ユーザーの進捗を取得
    let progressMap: Record<string, any> = {};
    if (userId && contents) {
      const contentIds = contents.map(c => c.id);
      const { data: progressData } = await supabase
        .from('kdl_education_progress')
        .select('*')
        .eq('user_id', userId)
        .in('content_id', contentIds);

      if (progressData) {
        progressData.forEach(p => {
          progressMap[p.content_id] = p;
        });
      }
    }

    // カテゴリ表示名を追加
    const enrichedContents = (contents || []).map(content => ({
      ...content,
      category_label: CATEGORY_LABELS[content.category] || content.category,
      progress: progressMap[content.id] || null,
    }));

    return NextResponse.json({
      contents: enrichedContents,
      categories: CATEGORY_LABELS,
    });
  } catch (error) {
    console.error('GET education contents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: コンテンツ作成（管理者のみ）
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
    const { title, description, content_type, category, body: contentBody, video_url, thumbnail_url, duration_minutes, difficulty, tags, is_published, is_premium, required_plan, sort_order } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser(token);

    const { data, error } = await supabase
      .from('kdl_education_contents')
      .insert({
        title,
        description,
        content_type: content_type || 'article',
        category,
        body: contentBody,
        video_url,
        thumbnail_url,
        duration_minutes,
        difficulty: difficulty || 'beginner',
        tags,
        is_published: is_published || false,
        is_premium: is_premium || false,
        required_plan,
        sort_order: sort_order || 0,
        published_at: is_published ? new Date().toISOString() : null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create content:', error);
      return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
    }

    return NextResponse.json({ success: true, content: data });
  } catch (error) {
    console.error('POST education content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT: コンテンツ更新（管理者のみ）
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

    // 管理者チェック
    if (!await isAdmin(supabase, token)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // 公開フラグが変更された場合、published_atを更新
    if (updateData.is_published === true) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('kdl_education_contents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update content:', error);
      return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }

    return NextResponse.json({ success: true, content: data });
  } catch (error) {
    console.error('PUT education content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: コンテンツ削除（管理者のみ）
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
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
      .from('kdl_education_contents')
      .delete()
      .eq('id', contentId);

    if (error) {
      console.error('Failed to delete content:', error);
      return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE education content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
