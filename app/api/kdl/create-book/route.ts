import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 型定義
interface Section {
  title: string;
}

interface Chapter {
  title: string;
  summary: string;
  sections: Section[];
}

interface TargetInfo {
  profile: string;
  merits: string[];
  benefits: string[];
  differentiation: string[];
  usp: string;
}

interface CreateBookRequest {
  title: string;
  subtitle?: string;
  target?: TargetInfo;
  chapters: Chapter[];
  userId?: string;
}

export async function POST(request: Request) {
  try {
    const body: CreateBookRequest = await request.json();
    const { title, subtitle, target, chapters, userId } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルを入力してください' },
        { status: 400 }
      );
    }

    if (!chapters || chapters.length === 0) {
      return NextResponse.json(
        { error: '目次（章）を設定してください' },
        { status: 400 }
      );
    }

    // Supabaseの設定確認
    if (!supabaseUrl || !supabaseServiceKey) {
      // デモモード: Supabaseが設定されていない場合はモックIDを返す
      console.log('Supabase not configured, returning mock response');
      return NextResponse.json({
        bookId: 'demo-book-' + Date.now(),
        message: '本が作成されました（デモモード）'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. kdl_books テーブルに本を保存
    const bookData = {
      title,
      subtitle: subtitle || null,
      target_profile: target?.profile || null,
      target_merits: target?.merits || [],
      target_benefits: target?.benefits || [],
      target_differentiation: target?.differentiation || [],
      target_usp: target?.usp || null,
      user_id: userId || null,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: book, error: bookError } = await supabase
      .from('kdl_books')
      .insert(bookData)
      .select()
      .single();

    if (bookError) {
      console.error('Book insert error:', bookError);
      throw new Error('本の保存に失敗しました: ' + bookError.message);
    }

    const bookId = book.id;

    // 2. kdl_chapters テーブルに章を保存
    const chapterInserts = chapters.map((chapter, index) => ({
      book_id: bookId,
      title: chapter.title,
      summary: chapter.summary || null,
      order_index: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: insertedChapters, error: chaptersError } = await supabase
      .from('kdl_chapters')
      .insert(chapterInserts)
      .select();

    if (chaptersError) {
      console.error('Chapters insert error:', chaptersError);
      // ロールバック: 本を削除
      await supabase.from('kdl_books').delete().eq('id', bookId);
      throw new Error('章の保存に失敗しました: ' + chaptersError.message);
    }

    // 3. kdl_sections テーブルに節を保存
    const sectionInserts: {
      chapter_id: string;
      title: string;
      content: string;
      order_index: number;
      created_at: string;
      updated_at: string;
    }[] = [];

    chapters.forEach((chapter, chapterIndex) => {
      const insertedChapter = insertedChapters?.find(
        (c: { order_index: number }) => c.order_index === chapterIndex
      );
      
      if (insertedChapter && chapter.sections) {
        chapter.sections.forEach((section, sectionIndex) => {
          sectionInserts.push({
            chapter_id: insertedChapter.id,
            title: section.title,
            content: '', // 初期は空
            order_index: sectionIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });
      }
    });

    if (sectionInserts.length > 0) {
      const { error: sectionsError } = await supabase
        .from('kdl_sections')
        .insert(sectionInserts);

      if (sectionsError) {
        console.error('Sections insert error:', sectionsError);
        // ロールバック: 章と本を削除
        await supabase.from('kdl_chapters').delete().eq('book_id', bookId);
        await supabase.from('kdl_books').delete().eq('id', bookId);
        throw new Error('節の保存に失敗しました: ' + sectionsError.message);
      }
    }

    return NextResponse.json({
      bookId,
      message: '本が作成されました',
      chaptersCount: chapters.length,
      sectionsCount: sectionInserts.length,
    });

  } catch (error: any) {
    console.error('Create book error:', error);
    return NextResponse.json(
      { error: '本の作成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

