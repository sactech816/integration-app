import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface DeleteChapterRequest {
  type: 'chapter';
  chapterId: string;
  bookId: string;
}

interface DeleteSectionRequest {
  type: 'section';
  sectionId: string;
  chapterId: string;
}

type DeleteRequest = DeleteChapterRequest | DeleteSectionRequest;

export async function DELETE(request: Request) {
  try {
    const body: DeleteRequest = await request.json();

    if (!supabaseUrl || !supabaseServiceKey) {
      // デモモード
      return NextResponse.json({
        message: '削除されました（デモモード）',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (body.type === 'chapter') {
      const { chapterId, bookId } = body;

      if (!chapterId || !bookId) {
        return NextResponse.json(
          { error: 'chapterIdとbookIdは必須です' },
          { status: 400 }
        );
      }

      // 削除する章のorder_indexを取得
      const { data: chapterToDelete } = await supabase
        .from('kdl_chapters')
        .select('order_index')
        .eq('id', chapterId)
        .single();

      // 章に属する節を先に削除
      await supabase
        .from('kdl_sections')
        .delete()
        .eq('chapter_id', chapterId);

      // 章を削除
      const { error } = await supabase
        .from('kdl_chapters')
        .delete()
        .eq('id', chapterId);

      if (error) {
        throw new Error('章の削除に失敗しました: ' + error.message);
      }

      // 削除した章より後のorder_indexをデクリメント
      if (chapterToDelete) {
        const { data: chaptersToUpdate } = await supabase
          .from('kdl_chapters')
          .select('id, order_index')
          .eq('book_id', bookId)
          .gt('order_index', chapterToDelete.order_index)
          .order('order_index', { ascending: true });

        if (chaptersToUpdate) {
          for (const ch of chaptersToUpdate) {
            await supabase
              .from('kdl_chapters')
              .update({ order_index: ch.order_index - 1 })
              .eq('id', ch.id);
          }
        }
      }

      return NextResponse.json({
        message: '章が削除されました',
      });
    } else if (body.type === 'section') {
      const { sectionId, chapterId } = body;

      if (!sectionId || !chapterId) {
        return NextResponse.json(
          { error: 'sectionIdとchapterIdは必須です' },
          { status: 400 }
        );
      }

      // 削除する節のorder_indexを取得
      const { data: sectionToDelete } = await supabase
        .from('kdl_sections')
        .select('order_index')
        .eq('id', sectionId)
        .single();

      // 節を削除
      const { error } = await supabase
        .from('kdl_sections')
        .delete()
        .eq('id', sectionId);

      if (error) {
        throw new Error('節の削除に失敗しました: ' + error.message);
      }

      // 削除した節より後のorder_indexをデクリメント
      if (sectionToDelete) {
        const { data: sectionsToUpdate } = await supabase
          .from('kdl_sections')
          .select('id, order_index')
          .eq('chapter_id', chapterId)
          .gt('order_index', sectionToDelete.order_index)
          .order('order_index', { ascending: true });

        if (sectionsToUpdate) {
          for (const sec of sectionsToUpdate) {
            await supabase
              .from('kdl_sections')
              .update({ order_index: sec.order_index - 1 })
              .eq('id', sec.id);
          }
        }
      }

      return NextResponse.json({
        message: '節が削除されました',
      });
    }

    return NextResponse.json(
      { error: 'typeは"chapter"または"section"である必要があります' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Delete structure error:', error);
    return NextResponse.json(
      { error: error.message || '削除に失敗しました' },
      { status: 500 }
    );
  }
}










