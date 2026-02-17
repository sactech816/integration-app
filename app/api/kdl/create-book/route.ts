import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { checkKdlLimits } from '@/lib/kdl-usage-check';

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  tocPatternId?: string; // 目次パターンID（執筆スタイルのデフォルト決定用）
  userId?: string;
  sectionContents?: Record<string, string>; // "chapterIdx-sectionIdx" -> HTML content（インポート用）
}

export async function POST(request: Request) {
  try {
    const body: CreateBookRequest = await request.json();
    const { title, subtitle, target, chapters, tocPatternId, userId } = body;

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

    // Service Role Keyを使用（RLSをバイパス）
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 認証済みユーザーのIDを取得
    let authenticatedUserId: string | null = null;
    
    // リクエストからユーザーIDが渡されている場合はそれを使用
    if (userId) {
      authenticatedUserId = userId;
    } else {
      // Cookieからセッショントークンを取得してユーザーを認証
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;
        const refreshToken = cookieStore.get('sb-refresh-token')?.value;
        
        if (accessToken && supabaseAnonKey) {
          const authClient = createClient(supabaseUrl, supabaseAnonKey);
          
          if (refreshToken) {
            await authClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
          
          const { data: { user } } = await authClient.auth.getUser(accessToken);
          if (user) {
            authenticatedUserId = user.id;
          }
        }
      } catch (authError) {
        console.log('Auth error (non-critical):', authError);
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'ログインが必要です。ログインしてから再度お試しください。' },
        { status: 401 }
      );
    }

    // 書籍作成数の制限チェック
    const limits = await checkKdlLimits(authenticatedUserId);
    if (!limits.bookCreation.canCreate) {
      return NextResponse.json(
        { 
          error: limits.bookCreation.message, 
          code: 'BOOK_LIMIT_EXCEEDED',
          used: limits.bookCreation.used,
          limit: limits.bookCreation.limit,
        },
        { status: 429 }
      );
    }

    // 1. kdl_books テーブルに本を保存
    let bookData: Record<string, any> = {
      title,
      subtitle: subtitle || null,
      status: 'draft',
      user_id: authenticatedUserId,
    };
    
    // ターゲット情報をJSON形式で保存（target_infoカラムがある場合）
    if (target) {
      bookData.target_info = target;
    }
    
    // 目次パターンIDを保存（toc_pattern_idカラムがある場合）
    if (tocPatternId) {
      bookData.toc_pattern_id = tocPatternId;
    }

    let book: any;
    let bookError: any;

    // まずtarget_info付きで試行
    const result1 = await supabase
      .from('kdl_books')
      .insert(bookData)
      .select()
      .single();

    if (result1.error) {
      // カラムがない場合、それを除外してリトライ
      let needsRetry = false;
      
      if (result1.error.message.includes('target_info')) {
        console.log('target_info column not found, retrying without it');
        delete bookData.target_info;
        needsRetry = true;
      }
      
      if (result1.error.message.includes('toc_pattern_id')) {
        console.log('toc_pattern_id column not found, retrying without it');
        delete bookData.toc_pattern_id;
        needsRetry = true;
      }
      
      if (needsRetry) {
        const result2 = await supabase
          .from('kdl_books')
          .insert(bookData)
          .select()
          .single();
        
        book = result2.data;
        bookError = result2.error;
      } else {
        book = result1.data;
        bookError = result1.error;
      }
    } else {
      book = result1.data;
      bookError = result1.error;
    }

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
      book_id: string;
      chapter_id: string;
      title: string;
      content: string;
      order_index: number;
    }[] = [];

    chapters.forEach((chapter, chapterIndex) => {
      const insertedChapter = insertedChapters?.find(
        (c: { order_index: number }) => c.order_index === chapterIndex
      );
      
      if (insertedChapter && chapter.sections) {
        chapter.sections.forEach((section, sectionIndex) => {
          // インポート時にsectionContentsが指定されていればコンテンツを設定
          const contentKey = `${chapterIndex}-${sectionIndex}`;
          const importedContent = body.sectionContents?.[contentKey] || '';
          sectionInserts.push({
            book_id: bookId,
            chapter_id: insertedChapter.id,
            title: section.title,
            content: importedContent, // インポート時は本文が入る、通常は空
            order_index: sectionIndex,
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

