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

// 書籍の進捗情報を含む型
interface BookWithProgress {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  chapters_count: number;
  sections_count: number;
  completed_sections_count: number;
}

// ユーザーごとにグループ化した書籍データ
interface UserBooks {
  user_id: string;
  user_email: string;
  books: BookWithProgress[];
  total_books: number;
  total_sections: number;
  completed_sections: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 全書籍を取得
    const { data: books, error: booksError } = await supabase
      .from('kdl_books')
      .select('id, title, subtitle, status, user_id, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (booksError) {
      throw booksError;
    }

    if (!books || books.length === 0) {
      return NextResponse.json({
        userBooks: [],
        stats: {
          totalBooks: 0,
          totalUsers: 0,
          totalSections: 0,
          completedSections: 0,
        },
      });
    }

    // 書籍IDを抽出
    const bookIds = books.map((b) => b.id);

    // 各書籍の章数を取得
    const { data: chapters, error: chaptersError } = await supabase
      .from('kdl_chapters')
      .select('id, book_id')
      .in('book_id', bookIds);

    if (chaptersError) {
      console.error('Chapters fetch error:', chaptersError);
    }

    // 各書籍の節数と執筆済み節数を取得
    const { data: sections, error: sectionsError } = await supabase
      .from('kdl_sections')
      .select('id, book_id, content')
      .in('book_id', bookIds);

    if (sectionsError) {
      console.error('Sections fetch error:', sectionsError);
    }

    // 章数をbook_idでグループ化
    const chaptersCountMap: Record<string, number> = {};
    (chapters || []).forEach((chapter) => {
      chaptersCountMap[chapter.book_id] = (chaptersCountMap[chapter.book_id] || 0) + 1;
    });

    // 節数と執筆済み節数をbook_idでグループ化
    const sectionsCountMap: Record<string, number> = {};
    const completedSectionsCountMap: Record<string, number> = {};
    (sections || []).forEach((section) => {
      sectionsCountMap[section.book_id] = (sectionsCountMap[section.book_id] || 0) + 1;
      // contentが空でない場合は執筆済みとカウント
      if (section.content && section.content.trim().length > 0) {
        completedSectionsCountMap[section.book_id] = (completedSectionsCountMap[section.book_id] || 0) + 1;
      }
    });

    // ユーザーIDを抽出（重複排除）
    const userIds = [...new Set(books.map((b) => b.user_id).filter(Boolean))];

    // ユーザー情報を取得（auth.usersから）
    const usersMap: Record<string, string> = {};
    for (const userId of userIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData?.user?.email) {
          usersMap[userId] = userData.user.email;
        }
      } catch (e) {
        // 取得できない場合はスキップ
      }
    }

    // 書籍に進捗情報を追加
    const booksWithProgress: BookWithProgress[] = books.map((book) => ({
      ...book,
      user_email: usersMap[book.user_id] || 'Unknown',
      chapters_count: chaptersCountMap[book.id] || 0,
      sections_count: sectionsCountMap[book.id] || 0,
      completed_sections_count: completedSectionsCountMap[book.id] || 0,
    }));

    // ユーザーごとにグループ化
    const userBooksMap: Record<string, UserBooks> = {};
    booksWithProgress.forEach((book) => {
      const userId = book.user_id || 'unknown';
      if (!userBooksMap[userId]) {
        userBooksMap[userId] = {
          user_id: userId,
          user_email: book.user_email || 'Unknown',
          books: [],
          total_books: 0,
          total_sections: 0,
          completed_sections: 0,
        };
      }
      userBooksMap[userId].books.push(book);
      userBooksMap[userId].total_books++;
      userBooksMap[userId].total_sections += book.sections_count;
      userBooksMap[userId].completed_sections += book.completed_sections_count;
    });

    // 配列に変換してソート（書籍数の多い順）
    const userBooks = Object.values(userBooksMap).sort(
      (a, b) => b.total_books - a.total_books
    );

    // 統計情報
    const stats = {
      totalBooks: books.length,
      totalUsers: userIds.length,
      totalSections: Object.values(sectionsCountMap).reduce((sum, count) => sum + count, 0),
      completedSections: Object.values(completedSectionsCountMap).reduce((sum, count) => sum + count, 0),
    };

    return NextResponse.json({
      userBooks,
      stats,
    });
  } catch (error: any) {
    console.error('Get KDL books error:', error);
    return NextResponse.json(
      { error: 'Failed to get books' },
      { status: 500 }
    );
  }
}

