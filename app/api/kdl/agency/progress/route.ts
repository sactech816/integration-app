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

    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // このユーザーが代理店に割り当てられているか確認
    const { data: assignment } = await supabase
      .from('kdl_agency_users')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('user_id', targetUserId)
      .single();

    if (!assignment) {
      return NextResponse.json({ error: 'User not assigned to this agency' }, { status: 403 });
    }

    // ユーザー情報取得
    const { data: userData } = await supabase.auth.admin.getUserById(targetUserId);
    const userEmail = userData?.user?.email || 'Unknown';

    // 書籍一覧を取得
    const { data: books, error: booksError } = await supabase
      .from('kdl_books')
      .select('id, title, subtitle, status, created_at, updated_at')
      .eq('user_id', targetUserId)
      .order('updated_at', { ascending: false });

    if (booksError) throw booksError;

    if (!books || books.length === 0) {
      return NextResponse.json({
        user_id: targetUserId,
        user_email: userEmail,
        books: [],
      });
    }

    const bookIds = books.map(b => b.id);

    // 章を取得
    const { data: chapters } = await supabase
      .from('kdl_chapters')
      .select('id, book_id, title, order_index')
      .in('book_id', bookIds)
      .order('order_index', { ascending: true });

    // 節を取得
    const { data: sections } = await supabase
      .from('kdl_sections')
      .select('id, book_id, chapter_id, title, content, order_index')
      .in('book_id', bookIds)
      .order('order_index', { ascending: true });

    // 書籍ごとに章と節を構造化
    const booksWithProgress = books.map(book => {
      const bookChapters = (chapters || [])
        .filter(c => c.book_id === book.id)
        .map(chapter => {
          const chapterSections = (sections || [])
            .filter(s => s.book_id === book.id && s.chapter_id === chapter.id)
            .map(section => ({
              id: section.id,
              title: section.title,
              order_index: section.order_index,
              is_completed: !!(section.content && section.content.length >= 100),
              content_length: section.content?.length || 0,
              content: section.content || '',
            }));

          return {
            id: chapter.id,
            title: chapter.title,
            order_index: chapter.order_index,
            sections: chapterSections,
            total_sections: chapterSections.length,
            completed_sections: chapterSections.filter(s => s.is_completed).length,
          };
        });

      const totalSections = bookChapters.reduce((sum, c) => sum + c.total_sections, 0);
      const completedSections = bookChapters.reduce((sum, c) => sum + c.completed_sections, 0);

      return {
        ...book,
        chapters: bookChapters,
        total_sections: totalSections,
        completed_sections: completedSections,
        progress_percentage: totalSections > 0
          ? Math.round((completedSections / totalSections) * 1000) / 10
          : 0,
      };
    });

    return NextResponse.json({
      user_id: targetUserId,
      user_email: userEmail,
      books: booksWithProgress,
    });
  } catch (error: any) {
    console.error('Get agency progress error:', error);
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
  }
}
