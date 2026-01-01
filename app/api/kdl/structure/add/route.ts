import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface AddChapterRequest {
  type: 'chapter';
  bookId: string;
  title: string;
  orderIndex?: number;
}

interface AddSectionRequest {
  type: 'section';
  bookId: string;
  chapterId: string;
  title: string;
  orderIndex?: number;
}

type AddRequest = AddChapterRequest | AddSectionRequest;

export async function POST(request: Request) {
  try {
    const body: AddRequest = await request.json();

    if (!supabaseUrl || !supabaseServiceKey) {
      // デモモード
      return NextResponse.json({
        id: 'demo-' + Date.now(),
        message: '追加されました（デモモード）',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (body.type === 'chapter') {
      const { bookId, title, orderIndex } = body;

      if (!bookId || !title) {
        return NextResponse.json(
          { error: 'bookIdとtitleは必須です' },
          { status: 400 }
        );
      }

      // 現在の最大order_indexを取得
      let newOrderIndex = orderIndex;
      if (newOrderIndex === undefined) {
        const { data: existingChapters } = await supabase
          .from('kdl_chapters')
          .select('order_index')
          .eq('book_id', bookId)
          .order('order_index', { ascending: false })
          .limit(1);

        newOrderIndex = (existingChapters?.[0]?.order_index ?? -1) + 1;
      } else {
        // 挿入位置以降の章のorder_indexをインクリメント
        await supabase.rpc('increment_chapter_order', {
          p_book_id: bookId,
          p_from_index: newOrderIndex,
        }).catch(() => {
          // RPCがない場合は手動で更新
        });
        
        // 手動でインクリメント
        const { data: chaptersToUpdate } = await supabase
          .from('kdl_chapters')
          .select('id, order_index')
          .eq('book_id', bookId)
          .gte('order_index', newOrderIndex)
          .order('order_index', { ascending: false });

        if (chaptersToUpdate) {
          for (const ch of chaptersToUpdate) {
            await supabase
              .from('kdl_chapters')
              .update({ order_index: ch.order_index + 1 })
              .eq('id', ch.id);
          }
        }
      }

      // 章を挿入
      const { data: chapter, error } = await supabase
        .from('kdl_chapters')
        .insert({
          book_id: bookId,
          title,
          summary: null,
          order_index: newOrderIndex,
        })
        .select()
        .single();

      if (error) {
        throw new Error('章の追加に失敗しました: ' + error.message);
      }

      return NextResponse.json({
        id: chapter.id,
        message: '章が追加されました',
        chapter,
      });
    } else if (body.type === 'section') {
      const { bookId, chapterId, title, orderIndex } = body;

      if (!bookId || !chapterId || !title) {
        return NextResponse.json(
          { error: 'bookId, chapterId, titleは必須です' },
          { status: 400 }
        );
      }

      // 現在の最大order_indexを取得
      let newOrderIndex = orderIndex;
      if (newOrderIndex === undefined) {
        const { data: existingSections } = await supabase
          .from('kdl_sections')
          .select('order_index')
          .eq('chapter_id', chapterId)
          .order('order_index', { ascending: false })
          .limit(1);

        newOrderIndex = (existingSections?.[0]?.order_index ?? -1) + 1;
      } else {
        // 挿入位置以降の節のorder_indexをインクリメント
        const { data: sectionsToUpdate } = await supabase
          .from('kdl_sections')
          .select('id, order_index')
          .eq('chapter_id', chapterId)
          .gte('order_index', newOrderIndex)
          .order('order_index', { ascending: false });

        if (sectionsToUpdate) {
          for (const sec of sectionsToUpdate) {
            await supabase
              .from('kdl_sections')
              .update({ order_index: sec.order_index + 1 })
              .eq('id', sec.id);
          }
        }
      }

      // 節を挿入
      const { data: section, error } = await supabase
        .from('kdl_sections')
        .insert({
          book_id: bookId,
          chapter_id: chapterId,
          title,
          content: '',
          order_index: newOrderIndex,
        })
        .select()
        .single();

      if (error) {
        throw new Error('節の追加に失敗しました: ' + error.message);
      }

      return NextResponse.json({
        id: section.id,
        message: '節が追加されました',
        section,
      });
    }

    return NextResponse.json(
      { error: 'typeは"chapter"または"section"である必要があります' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Add structure error:', error);
    return NextResponse.json(
      { error: error.message || '追加に失敗しました' },
      { status: 500 }
    );
  }
}






