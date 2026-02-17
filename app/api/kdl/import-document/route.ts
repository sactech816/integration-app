import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import mammoth from 'mammoth';

/**
 * POST: アップロードされた文書（.txt / .docx）からテキストを抽出する
 * FormData { file: File } または JSON { text: string } を受け付ける
 */
export async function POST(request: Request) {
  try {
    // ユーザー認証
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const cookieStore = await cookies();
      const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: { getAll() { return cookieStore.getAll(); } },
      });
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
      }
    }

    const contentType = request.headers.get('content-type') || '';
    let extractedText = '';

    if (contentType.includes('multipart/form-data')) {
      // ファイルアップロードモード
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
      }

      const fileName = file.name.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileName.endsWith('.txt')) {
        // テキストファイル
        extractedText = buffer.toString('utf-8');
      } else if (fileName.endsWith('.docx')) {
        // DOCXファイル
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else {
        return NextResponse.json(
          { error: '対応していないファイル形式です。.txt または .docx ファイルをアップロードしてください。' },
          { status: 400 }
        );
      }
    } else {
      // テキスト貼り付けモード
      const body = await request.json();
      if (!body.text || body.text.trim().length === 0) {
        return NextResponse.json({ error: 'テキストが空です' }, { status: 400 });
      }
      extractedText = body.text;
    }

    // テキストのクリーンアップ
    extractedText = extractedText.trim();

    if (extractedText.length === 0) {
      return NextResponse.json({ error: '抽出されたテキストが空です' }, { status: 400 });
    }

    // 文字数とワード数を計算
    const charCount = extractedText.length;
    // 日本語のワード数は文字数で代用（スペース区切りの英単語はカウント）
    const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;

    return NextResponse.json({
      text: extractedText,
      charCount,
      wordCount,
    });
  } catch (error: any) {
    console.error('Import document error:', error);
    return NextResponse.json(
      { error: '文書の解析に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
