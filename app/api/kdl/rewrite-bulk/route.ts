import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkKdlLimits } from '@/lib/kdl-usage-check';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 文体スタイル名のマッピング
const STYLE_NAMES: Record<string, string> = {
  descriptive: '説明文',
  narrative: '物語',
  dialogue: '対話形式',
  qa: 'Q&A',
  workbook: 'ワークブック',
};

/**
 * POST: 書籍のコピーを作成し、リライト準備を行う
 * クライアント側からセクション単位で /api/kdl/rewrite-section を呼ぶ前準備
 */
export async function POST(request: Request) {
  try {
    const { book_id, target_style } = await request.json();

    if (!book_id || !target_style) {
      return NextResponse.json(
        { error: 'book_id と target_style を指定してください' },
        { status: 400 }
      );
    }

    if (!STYLE_NAMES[target_style]) {
      return NextResponse.json(
        { error: '無効な文体スタイルです' },
        { status: 400 }
      );
    }

    // デモモード判定
    const isDemo = book_id.startsWith('demo-book-') || !supabaseUrl || !supabaseServiceKey;

    if (isDemo) {
      return NextResponse.json({
        newBookId: 'demo-book-rewrite-' + Date.now(),
        totalSections: 3,
        sections: [
          { id: 'demo-sec-1', title: 'セクション1', chapterId: 'demo-ch-1', chapterTitle: '第1章', originalContent: '<p>サンプルテキスト1</p>' },
          { id: 'demo-sec-2', title: 'セクション2', chapterId: 'demo-ch-1', chapterTitle: '第1章', originalContent: '<p>サンプルテキスト2</p>' },
          { id: 'demo-sec-3', title: 'セクション3', chapterId: 'demo-ch-2', chapterTitle: '第2章', originalContent: '<p>サンプルテキスト3</p>' },
        ],
        isDemo: true,
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // ユーザー認証
    const cookieStore = await cookies();
    const authClient = createServerClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 使用量チェック
    const limits = await checkKdlLimits(user.id);
    if (!limits.bookCreation.canCreate) {
      return NextResponse.json(
        { error: limits.bookCreation.message, code: 'BOOK_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }

    // 元書籍を取得
    const { data: sourceBook, error: bookError } = await supabase
      .from('kdl_books')
      .select('id, title, subtitle, target_info, toc_pattern_id, user_id')
      .eq('id', book_id)
      .single();

    if (bookError || !sourceBook) {
      return NextResponse.json({ error: '書籍が見つかりません' }, { status: 404 });
    }

    // 権限チェック
    if (sourceBook.user_id !== user.id) {
      return NextResponse.json({ error: 'この書籍を編集する権限がありません' }, { status: 403 });
    }

    // 元の章を取得
    const { data: sourceChapters } = await supabase
      .from('kdl_chapters')
      .select('id, title, summary, order_index')
      .eq('book_id', book_id)
      .order('order_index', { ascending: true });

    if (!sourceChapters || sourceChapters.length === 0) {
      return NextResponse.json({ error: '章が見つかりません' }, { status: 400 });
    }

    // 元のセクションを取得
    const chapterIds = sourceChapters.map(ch => ch.id);
    const { data: sourceSections } = await supabase
      .from('kdl_sections')
      .select('id, chapter_id, title, content, order_index')
      .in('chapter_id', chapterIds)
      .order('order_index', { ascending: true });

    if (!sourceSections || sourceSections.length === 0) {
      return NextResponse.json({ error: 'セクションが見つかりません' }, { status: 400 });
    }

    // 1. 新しい書籍を作成
    const styleName = STYLE_NAMES[target_style];
    const { data: newBook, error: createBookError } = await supabase
      .from('kdl_books')
      .insert({
        title: `${sourceBook.title}（${styleName}版）`,
        subtitle: sourceBook.subtitle,
        user_id: user.id,
        status: 'draft',
        target_info: sourceBook.target_info,
        toc_pattern_id: sourceBook.toc_pattern_id,
        source_book_id: book_id,
        rewrite_style: target_style,
        rewrite_status: 'pending',
      })
      .select('id')
      .single();

    if (createBookError || !newBook) {
      throw new Error('書籍コピーの作成に失敗しました: ' + (createBookError?.message || ''));
    }

    // 2. 章をコピー
    const chapterIdMap: Record<string, string> = {};
    for (const chapter of sourceChapters) {
      const { data: newChapter, error: chapterError } = await supabase
        .from('kdl_chapters')
        .insert({
          book_id: newBook.id,
          title: chapter.title,
          summary: chapter.summary,
          order_index: chapter.order_index,
        })
        .select('id')
        .single();

      if (chapterError || !newChapter) {
        throw new Error('章コピーの作成に失敗しました');
      }
      chapterIdMap[chapter.id] = newChapter.id;
    }

    // 3. セクションをコピー（content は空にする。リライト後に埋める）
    const sectionResults: Array<{
      id: string;
      title: string;
      chapterId: string;
      chapterTitle: string;
      originalContent: string;
    }> = [];

    for (const section of sourceSections) {
      const newChapterId = chapterIdMap[section.chapter_id];
      const chapter = sourceChapters.find(ch => ch.id === section.chapter_id);

      const { data: newSection, error: sectionError } = await supabase
        .from('kdl_sections')
        .insert({
          book_id: newBook.id,
          chapter_id: newChapterId,
          title: section.title,
          content: '', // 空にする（リライト後に埋める）
          order_index: section.order_index,
        })
        .select('id')
        .single();

      if (sectionError || !newSection) {
        throw new Error('セクションコピーの作成に失敗しました');
      }

      sectionResults.push({
        id: newSection.id,
        title: section.title,
        chapterId: newChapterId,
        chapterTitle: chapter?.title || '',
        originalContent: section.content || '',
      });
    }

    // 4. ステータスを in_progress に更新
    await supabase
      .from('kdl_books')
      .update({ rewrite_status: 'in_progress' })
      .eq('id', newBook.id);

    return NextResponse.json({
      newBookId: newBook.id,
      totalSections: sectionResults.length,
      sections: sectionResults,
    });
  } catch (error: any) {
    console.error('Rewrite bulk error:', error);
    return NextResponse.json(
      { error: '文体変換の初期化に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
