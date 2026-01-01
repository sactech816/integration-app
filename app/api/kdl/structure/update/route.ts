import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface UpdateChapterRequest {
  type: 'chapter';
  chapterId: string;
  title: string;
}

interface UpdateSectionRequest {
  type: 'section';
  sectionId: string;
  title: string;
}

type UpdateRequest = UpdateChapterRequest | UpdateSectionRequest;

export async function PUT(request: Request) {
  try {
    const body: UpdateRequest = await request.json();

    if (!supabaseUrl || !supabaseServiceKey) {
      // デモモード
      return NextResponse.json({
        message: '更新されました（デモモード）',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (body.type === 'chapter') {
      const { chapterId, title } = body;

      if (!chapterId || !title) {
        return NextResponse.json(
          { error: 'chapterIdとtitleは必須です' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('kdl_chapters')
        .update({ 
          title,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapterId);

      if (error) {
        throw new Error('章のタイトル更新に失敗しました: ' + error.message);
      }

      return NextResponse.json({
        message: '章のタイトルが更新されました',
      });
    } else if (body.type === 'section') {
      const { sectionId, title } = body;

      if (!sectionId || !title) {
        return NextResponse.json(
          { error: 'sectionIdとtitleは必須です' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('kdl_sections')
        .update({ 
          title,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sectionId);

      if (error) {
        throw new Error('節のタイトル更新に失敗しました: ' + error.message);
      }

      return NextResponse.json({
        message: '節のタイトルが更新されました',
      });
    }

    return NextResponse.json(
      { error: 'typeは"chapter"または"section"である必要があります' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Update structure error:', error);
    return NextResponse.json(
      { error: error.message || '更新に失敗しました' },
      { status: 500 }
    );
  }
}










