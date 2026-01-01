import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import HTMLtoDOCX from 'html-to-docx';

// サーバーサイド用のSupabaseクライアント
// Service Role Keyを使用してRLSをバイパス（anon keyでは認証が必要なためデータにアクセスできない）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Section {
  id: string;
  chapter_id: string;
  title: string;
  content: string | null;
  order_index: number;
}

interface Chapter {
  id: string;
  book_id: string;
  title: string;
  summary: string | null;
  order_index: number;
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
}

/**
 * HTMLコンテンツをサニタイズ・正規化する
 * 閉じタグがない等の問題を修正
 */
function sanitizeHtml(html: string | null): string {
  if (!html) return '';
  
  // 基本的なHTMLサニタイズ
  let sanitized = html
    // 自己終了タグを正規化
    .replace(/<br>/gi, '<br/>')
    .replace(/<hr>/gi, '<hr/>')
    // 空のタグを削除
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '');
  
  return sanitized;
}

/**
 * 本のデータをHTML文字列に変換
 */
function buildBookHtml(book: Book, chapters: Chapter[], sections: Section[]): string {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Merriweather', 'Georgia', serif; line-height: 1.8; }
        h1 { font-size: 28pt; text-align: center; margin-bottom: 20pt; }
        h2 { font-size: 20pt; margin-top: 24pt; margin-bottom: 12pt; page-break-before: always; }
        h2:first-of-type { page-break-before: avoid; }
        h3 { font-size: 14pt; margin-top: 18pt; margin-bottom: 8pt; }
        p { font-size: 11pt; margin-bottom: 10pt; text-indent: 1em; }
        .chapter-summary { font-style: italic; color: #666; margin-bottom: 16pt; }
        .page-break { page-break-after: always; }
        ul, ol { margin: 10pt 0; padding-left: 24pt; }
        li { margin-bottom: 6pt; }
        strong { font-weight: bold; }
        blockquote { margin: 12pt 24pt; padding-left: 12pt; border-left: 3px solid #ccc; font-style: italic; }
      </style>
    </head>
    <body>
  `;

  // タイトルページ
  html += `<h1>${escapeHtml(book.title)}</h1>`;
  if (book.subtitle) {
    html += `<p style="text-align: center; font-size: 14pt; margin-top: -10pt;">${escapeHtml(book.subtitle)}</p>`;
  }
  
  // 改ページ
  html += `<div class="page-break"></div>`;

  // 各章を追加
  for (const chapter of chapters) {
    // 章の開始前に改ページ（最初の章以外）
    if (chapter.order_index > 0) {
      html += `<div class="page-break"></div>`;
    }

    // 章タイトル
    html += `<h2>${escapeHtml(chapter.title)}</h2>`;
    
    // 章の概要
    if (chapter.summary) {
      html += `<p class="chapter-summary">${escapeHtml(chapter.summary)}</p>`;
    }

    // この章の節を取得
    const chapterSections = sections
      .filter(s => s.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index);

    // 各節を追加
    for (const section of chapterSections) {
      html += `<h3>${escapeHtml(section.title)}</h3>`;
      
      if (section.content) {
        // コンテンツをサニタイズして追加
        html += sanitizeHtml(section.content);
      } else {
        html += `<p>（未執筆）</p>`;
      }
    }
  }

  html += `
    </body>
    </html>
  `;

  return html;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('book_id');

    console.log('[download-docx] Request received, book_id:', bookId);
    console.log('[download-docx] Supabase URL configured:', !!supabaseUrl);
    console.log('[download-docx] Supabase Service Key configured:', !!supabaseServiceKey);

    if (!bookId) {
      return NextResponse.json({ error: 'book_idが必要です' }, { status: 400 });
    }

    // デモモードチェック
    if (bookId.startsWith('demo-book-') || !supabaseUrl || !supabaseServiceKey) {
      console.log('[download-docx] Demo mode detected or Supabase not configured');
      // デモ用のWordファイルを生成
      const demoHtml = buildDemoHtml();
      const docxBuffer = await HTMLtoDOCX(demoHtml, null, {
        title: 'デモ用サンプル書籍',
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });

      // BufferをUint8Arrayに変換（Next.js互換性のため）
      const uint8Array = new Uint8Array(docxBuffer as Buffer);

      return new NextResponse(uint8Array, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="demo-sample-book.docx"',
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[download-docx] Supabase client created with service key, fetching book...');

    // 1. 本の情報を取得
    const { data: bookData, error: bookError } = await supabase
      .from('kdl_books')
      .select('id, title, subtitle')
      .eq('id', bookId)
      .single();

    console.log('[download-docx] Book query result:', { data: bookData, error: bookError });

    if (bookError) {
      console.error('[download-docx] Book fetch error:', bookError);
      return NextResponse.json({ 
        error: `本が見つかりません (${bookError.code}: ${bookError.message})` 
      }, { status: 404 });
    }
    
    if (!bookData) {
      return NextResponse.json({ error: '本が見つかりません' }, { status: 404 });
    }

    // 2. 章を取得
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('kdl_chapters')
      .select('id, book_id, title, summary, order_index')
      .eq('book_id', bookId)
      .order('order_index', { ascending: true });

    if (chaptersError) {
      throw new Error('章の取得に失敗しました: ' + chaptersError.message);
    }

    const chapters = chaptersData || [];
    const chapterIds = chapters.map(ch => ch.id);

    // 3. 節を取得
    let sections: Section[] = [];
    if (chapterIds.length > 0) {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('kdl_sections')
        .select('id, chapter_id, title, content, order_index')
        .in('chapter_id', chapterIds)
        .order('order_index', { ascending: true });

      if (sectionsError) {
        throw new Error('節の取得に失敗しました: ' + sectionsError.message);
      }

      sections = sectionsData || [];
    }

    // 4. HTMLを構築
    const html = buildBookHtml(bookData as Book, chapters, sections);

    // 5. Wordに変換
    const docxBuffer = await HTMLtoDOCX(html, null, {
      title: bookData.title,
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // BufferをUint8Arrayに変換（Next.js互換性のため）
    const uint8Array = new Uint8Array(docxBuffer as Buffer);

    // ファイル名をサニタイズ（日本語対応）
    const safeFileName = encodeURIComponent(bookData.title.replace(/[<>:"/\\|?*]/g, '_')) + '.docx';

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${safeFileName}`,
      },
    });

  } catch (error: any) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { error: 'Wordファイルの生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

/**
 * デモ用HTML生成
 */
function buildDemoHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Merriweather', 'Georgia', serif; line-height: 1.8; }
        h1 { font-size: 28pt; text-align: center; margin-bottom: 20pt; }
        h2 { font-size: 20pt; margin-top: 24pt; margin-bottom: 12pt; }
        h3 { font-size: 14pt; margin-top: 18pt; margin-bottom: 8pt; }
        p { font-size: 11pt; margin-bottom: 10pt; }
      </style>
    </head>
    <body>
      <h1>デモ用サンプル書籍</h1>
      <p style="text-align: center; font-size: 14pt;">Kindle執筆システムの使い方</p>
      
      <div style="page-break-after: always;"></div>
      
      <h2>第1章　はじめに</h2>
      <p style="font-style: italic; color: #666;">この本の概要と目的</p>
      
      <h3>この本の目的</h3>
      <p>この本では、Kindle執筆システムの使い方を学びます。効率的な執筆フローから、AIを活用した執筆術まで、幅広くカバーしています。</p>
      
      <h3>対象読者</h3>
      <p>Kindle出版を始めたい方、執筆の効率化を図りたい方を対象としています。</p>
      
      <h3>本書の構成</h3>
      <p>全3章構成で、基本操作から応用テクニックまで段階的に学べます。</p>
      
      <div style="page-break-after: always;"></div>
      
      <h2>第2章　基本操作</h2>
      <p style="font-style: italic; color: #666;">システムの基本的な使い方</p>
      
      <h3>目次の作成</h3>
      <p>まずは本の構造を決めましょう。章と節を追加して、目次を作成します。</p>
      
      <h3>章と節の管理</h3>
      <p>左サイドバーから章と節を管理できます。ドラッグ＆ドロップで順序を変更することも可能です。</p>
      
      <h3>執筆エディタの使い方</h3>
      <p>リッチテキストエディタを使って、見出しや箇条書きなど、読みやすい文章を作成できます。</p>
      
      <div style="page-break-after: always;"></div>
      
      <h2>第3章　応用テクニック</h2>
      <p style="font-style: italic; color: #666;">より効率的な執筆のために</p>
      
      <h3>効率的な執筆フロー</h3>
      <p>まず全体の構成を固め、その後各節を執筆していくのが効率的です。</p>
      
      <h3>AIアシスタントの活用</h3>
      <p>AI執筆ボタンを使えば、節の内容を自動生成できます。生成された内容をベースに編集しましょう。</p>
      
      <h3>まとめ</h3>
      <p>本書で学んだテクニックを活用して、効率的にKindle本を執筆してください。</p>
    </body>
    </html>
  `;
}



