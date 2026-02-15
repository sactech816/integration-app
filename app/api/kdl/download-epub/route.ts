import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EPub } from 'epub-gen-memory';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================
// Types
// ============================================

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

// ============================================
// CSS Style
// ============================================

const EPUB_CSS = `
body {
  font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
  line-height: 1.9;
  color: #333;
  margin: 0;
  padding: 0 1em;
}
h1 {
  font-size: 1.8em;
  text-align: center;
  color: #2c3e50;
  margin: 2em 0 0.5em;
}
h2 {
  font-size: 1.4em;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  background-color: #ecf0f1;
  padding: 0.6em 0;
  border-top: 3px solid #3498db;
  border-bottom: 3px solid #3498db;
  margin: 1.5em 0 1em;
}
h3 {
  font-size: 1.1em;
  font-weight: bold;
  color: #34495e;
  background-color: #f8f9fa;
  padding: 0.4em 0.6em;
  border-left: 4px solid #3498db;
  margin: 1.2em 0 0.6em;
}
p {
  font-size: 1em;
  margin-bottom: 0.8em;
  text-indent: 1em;
}
.subtitle {
  text-align: center;
  font-size: 1.1em;
  color: #7f8c8d;
  margin-top: -0.5em;
}
.chapter-summary {
  font-style: italic;
  color: #7f8c8d;
  padding: 0.5em;
  background-color: #f9f9f9;
  border-left: 3px solid #bdc3c7;
  margin-bottom: 1em;
}
ul, ol {
  margin: 0.6em 0;
  padding-left: 1.5em;
}
li {
  margin-bottom: 0.3em;
}
strong {
  font-weight: bold;
}
em {
  font-style: italic;
}
blockquote {
  margin: 0.8em 1.5em;
  padding-left: 0.8em;
  border-left: 3px solid #bdc3c7;
  font-style: italic;
  background-color: #f9f9f9;
}
hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 1.5em 0;
}
.unwritten {
  color: #999;
  font-style: italic;
}
`;

// ============================================
// HTML Sanitize
// ============================================

function sanitizeHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br>/gi, '<br/>')
    .replace(/<hr>/gi, '<hr/>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================
// EPUB Chapter Builders
// ============================================

function buildTitlePageHtml(book: Book): string {
  let html = `<h1>${escapeHtml(book.title)}</h1>`;
  if (book.subtitle) {
    html += `<p class="subtitle">${escapeHtml(book.subtitle)}</p>`;
  }
  return html;
}

function buildChapterHtml(chapter: Chapter, sections: Section[]): string {
  let html = `<h2>${escapeHtml(chapter.title)}</h2>`;

  if (chapter.summary) {
    html += `<div class="chapter-summary">${escapeHtml(chapter.summary)}</div>`;
  }

  const chapterSections = sections
    .filter(s => s.chapter_id === chapter.id)
    .sort((a, b) => a.order_index - b.order_index);

  for (const section of chapterSections) {
    html += `<h3>${escapeHtml(section.title)}</h3>`;
    if (section.content) {
      html += sanitizeHtml(section.content);
    } else {
      html += `<p class="unwritten">（未執筆）</p>`;
    }
  }

  return html;
}

// ============================================
// EPUB Generator
// ============================================

async function generateEpub(book: Book, chapters: Chapter[], sections: Section[]): Promise<Buffer> {
  const epubChapters: { title: string; content: string }[] = [];

  // タイトルページ
  epubChapters.push({
    title: book.title,
    content: buildTitlePageHtml(book),
  });

  // 各章
  for (const chapter of chapters) {
    epubChapters.push({
      title: chapter.title,
      content: buildChapterHtml(chapter, sections),
    });
  }

  const epub = new EPub({
    title: book.title,
    author: '',
    publisher: '',
    lang: 'ja',
    tocTitle: '目次',
    css: EPUB_CSS,
    description: book.subtitle || undefined,
  }, epubChapters);

  return await epub.genEpub();
}

// ============================================
// Demo
// ============================================

async function generateDemoEpub(): Promise<Buffer> {
  const book: Book = { id: 'demo', title: 'デモ用サンプル書籍', subtitle: 'Kindle執筆システムの使い方' };
  const chapters: Chapter[] = [
    { id: 'ch1', book_id: 'demo', title: '第1章　はじめに', summary: 'この本の概要と目的', order_index: 0 },
    { id: 'ch2', book_id: 'demo', title: '第2章　基本操作', summary: 'システムの基本的な使い方', order_index: 1 },
    { id: 'ch3', book_id: 'demo', title: '第3章　応用テクニック', summary: 'より効率的な執筆のために', order_index: 2 },
  ];
  const sections: Section[] = [
    { id: 's1', chapter_id: 'ch1', title: 'この本の目的', order_index: 0, content: '<p>この本では、Kindle執筆システムの使い方を学びます。</p>' },
    { id: 's2', chapter_id: 'ch1', title: '対象読者', order_index: 1, content: '<p>Kindle出版を始めたい方を対象としています。</p>' },
    { id: 's3', chapter_id: 'ch2', title: '目次の作成', order_index: 0, content: '<p>まずは本の構造を決めましょう。</p>' },
    { id: 's4', chapter_id: 'ch2', title: '執筆エディタの使い方', order_index: 1, content: '<p>リッチテキストエディタを使って、<strong>見出し</strong>や箇条書きなど、読みやすい文章を作成できます。</p><ul><li>太字やイタリックの装飾</li><li>見出しの挿入</li><li>箇条書きリスト</li></ul>' },
    { id: 's5', chapter_id: 'ch3', title: 'AIアシスタントの活用', order_index: 0, content: '<p>AI執筆ボタンを使えば、節の内容を自動生成できます。</p>' },
    { id: 's6', chapter_id: 'ch3', title: 'まとめ', order_index: 1, content: '<p>本書で学んだテクニックを活用して、効率的にKindle本を執筆してください。</p>' },
  ];
  return generateEpub(book, chapters, sections);
}

// ============================================
// API Handler
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('book_id');

    if (!bookId) {
      return NextResponse.json({ error: 'book_idが必要です' }, { status: 400 });
    }

    // デモモード
    if (bookId.startsWith('demo-book-') || !supabaseUrl || !supabaseServiceKey) {
      const buffer = await generateDemoEpub();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/epub+zip',
          'Content-Disposition': 'attachment; filename="demo-sample-book.epub"',
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. 本の情報を取得
    const { data: bookData, error: bookError } = await supabase
      .from('kdl_books')
      .select('id, title, subtitle')
      .eq('id', bookId)
      .single();

    if (bookError || !bookData) {
      return NextResponse.json({
        error: `本が見つかりません${bookError ? ` (${bookError.code}: ${bookError.message})` : ''}`
      }, { status: 404 });
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

    // 4. EPUB生成
    const buffer = await generateEpub(bookData as Book, chapters, sections);

    const safeFileName = encodeURIComponent(bookData.title.replace(/[<>:"/\\|?*]/g, '_')) + '.epub';

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename*=UTF-8''${safeFileName}`,
      },
    });

  } catch (error: any) {
    console.error('EPUB export error:', error);
    return NextResponse.json(
      { error: 'EPUBファイルの生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}
