import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface MoveChapterRequest {
  type: 'chapter';
  chapterId: string;
  bookId: string;
  direction: 'up' | 'down';
}

interface MoveSectionRequest {
  type: 'section';
  sectionId: string;
  chapterId: string;
  direction: 'up' | 'down';
}

type MoveRequest = MoveChapterRequest | MoveSectionRequest;

export async function POST(request: Request) {
  try {
    const body: MoveRequest = await request.json();

    if (!supabaseUrl || !supabaseServiceKey) {
      // デモモード
      return NextResponse.json({
        message: '移動しました（デモモード）',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (body.type === 'chapter') {
      const { chapterId, bookId, direction } = body;

      if (!chapterId || !bookId || !direction) {
        return NextResponse.json(
          { error: 'chapterId, bookId, directionは必須です' },
          { status: 400 }
        );
      }

      // 現在の章を取得
      const { data: currentChapter } = await supabase
        .from('kdl_chapters')
        .select('id, order_index')
        .eq('id', chapterId)
        .single();

      if (!currentChapter) {
        return NextResponse.json(
          { error: '章が見つかりません' },
          { status: 404 }
        );
      }

      const currentIndex = currentChapter.order_index;
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // 移動先の章を取得
      const { data: targetChapter } = await supabase
        .from('kdl_chapters')
        .select('id, order_index')
        .eq('book_id', bookId)
        .eq('order_index', newIndex)
        .single();

      if (!targetChapter) {
        return NextResponse.json(
          { error: direction === 'up' ? 'これ以上上に移動できません' : 'これ以上下に移動できません' },
          { status: 400 }
        );
      }

      // 順番を入れ替え（トランザクション的に実行）
      // 1. 移動元を一時的な値に
      await supabase
        .from('kdl_chapters')
        .update({ order_index: -999 })
        .eq('id', currentChapter.id);

      // 2. 移動先を移動元の位置に
      await supabase
        .from('kdl_chapters')
        .update({ order_index: currentIndex })
        .eq('id', targetChapter.id);

      // 3. 移動元を移動先の位置に
      await supabase
        .from('kdl_chapters')
        .update({ order_index: newIndex })
        .eq('id', currentChapter.id);

      return NextResponse.json({
        message: '章の順番が変更されました',
      });
    } else if (body.type === 'section') {
      const { sectionId, chapterId, direction } = body;

      if (!sectionId || !chapterId || !direction) {
        return NextResponse.json(
          { error: 'sectionId, chapterId, directionは必須です' },
          { status: 400 }
        );
      }

      // 現在の節を取得
      const { data: currentSection } = await supabase
        .from('kdl_sections')
        .select('id, order_index')
        .eq('id', sectionId)
        .single();

      if (!currentSection) {
        return NextResponse.json(
          { error: '節が見つかりません' },
          { status: 404 }
        );
      }

      const currentIndex = currentSection.order_index;
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // 移動先の節を取得
      const { data: targetSection } = await supabase
        .from('kdl_sections')
        .select('id, order_index')
        .eq('chapter_id', chapterId)
        .eq('order_index', newIndex)
        .single();

      if (!targetSection) {
        return NextResponse.json(
          { error: direction === 'up' ? 'これ以上上に移動できません' : 'これ以上下に移動できません' },
          { status: 400 }
        );
      }

      // 順番を入れ替え（トランザクション的に実行）
      // 1. 移動元を一時的な値に
      await supabase
        .from('kdl_sections')
        .update({ order_index: -999 })
        .eq('id', currentSection.id);

      // 2. 移動先を移動元の位置に
      await supabase
        .from('kdl_sections')
        .update({ order_index: currentIndex })
        .eq('id', targetSection.id);

      // 3. 移動元を移動先の位置に
      await supabase
        .from('kdl_sections')
        .update({ order_index: newIndex })
        .eq('id', currentSection.id);

      return NextResponse.json({
        message: '節の順番が変更されました',
      });
    }

    return NextResponse.json(
      { error: 'typeは"chapter"または"section"である必要があります' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Move structure error:', error);
    return NextResponse.json(
      { error: error.message || '移動に失敗しました' },
      { status: 500 }
    );
  }
}





