import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

// 代理店認証ヘルパー
async function authenticateAgency(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { error: 'Unauthorized', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const supabase = getServiceClient();
  if (!supabase) return { error: 'Database not configured', status: 500 };

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { error: 'Invalid token', status: 401 };

  const { data: agency } = await supabase
    .from('kdl_agencies')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!agency) return { error: 'Not an agency', status: 403 };

  return { user, agency, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAgency(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user, agency, supabase } = auth;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const bookId = searchParams.get('book_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('kdl_feedbacks')
      .select('*')
      .eq('agency_user_id', user.id)
      .order('created_at', { ascending: false });

    if (bookId) query = query.eq('book_id', bookId);
    if (status) query = query.eq('status', status);

    const { data: feedbacks, error } = await query;
    if (error) throw error;

    // フィードバック対象の書籍・節の情報を追加
    const enrichedFeedbacks = [];
    for (const feedback of feedbacks || []) {
      let bookTitle = '';
      let sectionTitle = '';
      let userEmail = '';

      const { data: book } = await supabase
        .from('kdl_books')
        .select('title, user_id')
        .eq('id', feedback.book_id)
        .single();

      if (book) {
        bookTitle = book.title;
        // userIdフィルタ適用
        if (userId && book.user_id !== userId) continue;

        const { data: userData } = await supabase.auth.admin.getUserById(book.user_id);
        userEmail = userData?.user?.email || 'Unknown';
      }

      if (feedback.section_id) {
        const { data: section } = await supabase
          .from('kdl_sections')
          .select('title')
          .eq('id', feedback.section_id)
          .single();
        sectionTitle = section?.title || '';
      }

      enrichedFeedbacks.push({
        ...feedback,
        book_title: bookTitle,
        section_title: sectionTitle,
        user_email: userEmail,
      });
    }

    return NextResponse.json({ feedbacks: enrichedFeedbacks });
  } catch (error: any) {
    console.error('Get feedbacks error:', error);
    return NextResponse.json({ error: 'Failed to get feedbacks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAgency(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user, agency, supabase } = auth;

    const body = await request.json();
    const { book_id, section_id, feedback_type, content, quoted_text } = body;

    if (!book_id || !content) {
      return NextResponse.json(
        { error: 'book_id and content are required' },
        { status: 400 }
      );
    }

    // 書籍が担当ユーザーのものか確認
    const { data: book } = await supabase
      .from('kdl_books')
      .select('user_id')
      .eq('id', book_id)
      .single();

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const { data: assignment } = await supabase
      .from('kdl_agency_users')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('user_id', book.user_id)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { error: 'Book owner is not assigned to this agency' },
        { status: 403 }
      );
    }

    const { data: feedback, error } = await supabase
      .from('kdl_feedbacks')
      .insert({
        book_id,
        section_id: section_id || null,
        agency_user_id: user.id,
        feedback_type: feedback_type || 'comment',
        content,
        quoted_text: quoted_text || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('Create feedback error:', error);
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}
