import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  PageBreak,
  TableOfContents,
  Footer,
  PageNumber,
  LevelFormat,
  convertInchesToTwip,
} from 'docx';

// サーバーサイド用のSupabaseクライアント
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
// Style Constants
// ============================================

const COLORS = {
  primary: '3498db',
  dark: '2c3e50',
  darkSlate: '34495e',
  gray: '7f8c8d',
  lightGray: 'ecf0f1',
  veryLightGray: 'f8f9fa',
  summaryBorder: 'bdc3c7',
  body: '333333',
};

// ============================================
// HTML Utilities
// ============================================

function sanitizeHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br>/gi, '<br/>')
    .replace(/<hr>/gi, '<hr/>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '');
}

/**
 * セクションコンテンツの先頭にある見出しタグが、セクションタイトルと一致または類似する場合に除去する
 */
function stripLeadingHeading(html: string, sectionTitle: string): string {
  const trimmed = html.trim();
  const headingMatch = trimmed.match(/^<(h[1-3])(\s[^>]*)?>(.+?)<\/\1>/i);
  if (!headingMatch) return html;

  const headingText = headingMatch[3].replace(/<[^>]*>/g, '').trim();
  const normalizedTitle = sectionTitle.replace(/\s+/g, '').trim();
  const normalizedHeading = headingText.replace(/\s+/g, '').trim();

  // 完全一致、または一方が他方を含む場合はスキップ
  if (
    normalizedTitle === normalizedHeading ||
    normalizedTitle.includes(normalizedHeading) ||
    normalizedHeading.includes(normalizedTitle)
  ) {
    return trimmed.slice(headingMatch[0].length).trim();
  }

  return html;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * ネストを考慮して閉じタグの位置を見つける
 */
function findClose(html: string, start: number, tag: string): number {
  let depth = 1;
  let pos = start;

  while (pos < html.length) {
    const next = html.indexOf('<', pos);
    if (next === -1) return -1;

    const closeRe = new RegExp(`^<\\/${tag}\\s*>`, 'i');
    const openRe = new RegExp(`^<${tag}(\\s[^>]*)?>`, 'i');

    const closeMatch = html.slice(next).match(closeRe);
    if (closeMatch) {
      depth--;
      if (depth === 0) return next;
      pos = next + closeMatch[0].length;
      continue;
    }

    const openMatch = html.slice(next).match(openRe);
    if (openMatch && !openMatch[0].endsWith('/>')) {
      depth++;
      pos = next + openMatch[0].length;
      continue;
    }

    pos = next + 1;
  }

  return -1;
}

// ============================================
// HTML → TextRun[] (インライン要素のパース)
// ============================================

interface InlineStyle {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
}

function parseInline(html: string, style: InlineStyle = {}): TextRun[] {
  const runs: TextRun[] = [];
  let pos = 0;

  while (pos < html.length) {
    const tagStart = html.indexOf('<', pos);

    if (tagStart === -1) {
      const text = decodeEntities(html.slice(pos));
      if (text.trim()) runs.push(new TextRun({ text, ...style }));
      break;
    }

    if (tagStart > pos) {
      const text = decodeEntities(html.slice(pos, tagStart));
      if (text) runs.push(new TextRun({ text, ...style }));
    }

    // <br/> or <br>
    const brMatch = html.slice(tagStart).match(/^<br\s*\/?>/i);
    if (brMatch) {
      runs.push(new TextRun({ break: 1, ...style }));
      pos = tagStart + brMatch[0].length;
      continue;
    }

    // Opening tag
    const openMatch = html.slice(tagStart).match(/^<(\w+)(\s[^>]*)?\s*>/);
    if (!openMatch) {
      pos = tagStart + 1;
      continue;
    }

    const tagName = openMatch[1].toLowerCase();
    const afterOpen = tagStart + openMatch[0].length;
    const closePos = findClose(html, afterOpen, tagName);

    if (closePos === -1) {
      pos = afterOpen;
      continue;
    }

    const inner = html.slice(afterOpen, closePos);
    const newStyle = { ...style };
    if (tagName === 'strong' || tagName === 'b') newStyle.bold = true;
    if (tagName === 'em' || tagName === 'i') newStyle.italics = true;
    if (tagName === 's' || tagName === 'del' || tagName === 'strike') newStyle.strike = true;

    // <a> タグはテキストのみ抽出
    runs.push(...parseInline(inner, newStyle));
    pos = closePos + `</${tagName}>`.length;
  }

  return runs;
}

// ============================================
// HTML → Paragraph[] (ブロック要素のパース)
// ============================================

function parseBlocks(html: string, ctx: { isQuote?: boolean; olInstance: number } = { olInstance: 0 }): { paragraphs: Paragraph[]; olInstance: number } {
  if (!html || !html.trim()) return { paragraphs: [], olInstance: ctx.olInstance };

  const elements: Paragraph[] = [];
  const normalized = html.replace(/\r?\n/g, ' ').trim();
  let pos = 0;
  let olInstance = ctx.olInstance;

  while (pos < normalized.length) {
    // Skip whitespace
    while (pos < normalized.length && /\s/.test(normalized[pos]) && normalized[pos] !== '<') pos++;
    if (pos >= normalized.length) break;

    if (normalized[pos] !== '<') {
      // Bare text
      const nextTag = normalized.indexOf('<', pos);
      const text = (nextTag === -1 ? normalized.slice(pos) : normalized.slice(pos, nextTag)).trim();
      if (text) {
        elements.push(new Paragraph({
          children: [new TextRun(decodeEntities(text))],
          spacing: { after: 100 },
        }));
      }
      pos = nextTag === -1 ? normalized.length : nextTag;
      continue;
    }

    // Self-closing tags
    const hrMatch = normalized.slice(pos).match(/^<hr\s*\/?>/i);
    if (hrMatch) {
      elements.push(new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
        spacing: { before: 200, after: 200 },
      }));
      pos += hrMatch[0].length;
      continue;
    }

    const brMatch = normalized.slice(pos).match(/^<br\s*\/?>/i);
    if (brMatch) {
      pos += brMatch[0].length;
      continue;
    }

    // Opening tag
    const tagMatch = normalized.slice(pos).match(/^<(\w+)(\s[^>]*)?\s*>/);
    if (!tagMatch) {
      pos++;
      continue;
    }

    const tagName = tagMatch[1].toLowerCase();
    const fullOpen = tagMatch[0];
    const afterOpen = pos + fullOpen.length;
    const closePos = findClose(normalized, afterOpen, tagName);

    if (closePos === -1) {
      pos = afterOpen;
      continue;
    }

    const inner = normalized.slice(afterOpen, closePos);
    const closeTagLen = `</${tagName}>`.length;

    switch (tagName) {
      case 'p': {
        const runs = ctx.isQuote ? parseInline(inner, { italics: true }) : parseInline(inner);
        if (runs.length > 0) {
          elements.push(new Paragraph({
            children: runs,
            spacing: { after: 100 },
            indent: ctx.isQuote
              ? { left: convertInchesToTwip(0.5) }
              : { firstLine: convertInchesToTwip(0.3) },
            ...(ctx.isQuote ? {
              border: { left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.summaryBorder } },
              shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F9F9F9' },
            } : {}),
          }));
        }
        break;
      }

      case 'h1': {
        elements.push(new Paragraph({
          children: parseInline(inner),
          heading: HeadingLevel.HEADING_3,
        }));
        break;
      }
      case 'h2': {
        elements.push(new Paragraph({
          children: parseInline(inner),
          heading: HeadingLevel.HEADING_4,
        }));
        break;
      }
      case 'h3': {
        elements.push(new Paragraph({
          children: parseInline(inner),
          heading: HeadingLevel.HEADING_5,
        }));
        break;
      }

      case 'ul': {
        const items = extractListItems(inner);
        for (const itemHtml of items) {
          elements.push(new Paragraph({
            children: parseInline(itemHtml),
            numbering: { reference: 'bullet-list', level: 0 },
            spacing: { after: 120 },
          }));
        }
        break;
      }
      case 'ol': {
        const items = extractListItems(inner);
        const currentInstance = olInstance++;
        for (const itemHtml of items) {
          elements.push(new Paragraph({
            children: parseInline(itemHtml),
            numbering: { reference: 'ordered-list', level: 0, instance: currentInstance },
            spacing: { after: 120 },
          }));
        }
        break;
      }

      case 'blockquote': {
        const result = parseBlocks(inner, { isQuote: true, olInstance });
        elements.push(...result.paragraphs);
        olInstance = result.olInstance;
        break;
      }

      case 'div': {
        const result = parseBlocks(inner, { ...ctx, olInstance });
        elements.push(...result.paragraphs);
        olInstance = result.olInstance;
        break;
      }

      default: {
        const runs = parseInline(inner);
        if (runs.length > 0) {
          elements.push(new Paragraph({ children: runs, spacing: { after: 100 } }));
        }
      }
    }

    pos = closePos + closeTagLen;
  }

  return { paragraphs: elements, olInstance };
}

/**
 * <ul>/<ol> 内の <li> 要素を抽出
 */
function extractListItems(html: string): string[] {
  const items: string[] = [];
  let pos = 0;

  while (pos < html.length) {
    const liStart = html.toLowerCase().indexOf('<li', pos);
    if (liStart === -1) break;

    const liOpenEnd = html.indexOf('>', liStart);
    if (liOpenEnd === -1) break;

    const contentStart = liOpenEnd + 1;
    const liClose = findClose(html, contentStart, 'li');
    if (liClose === -1) { pos = contentStart; continue; }

    let content = html.slice(contentStart, liClose).trim();
    // <p> で囲まれている場合はアンラップ
    const pMatch = content.match(/^<p(\s[^>]*)?>(.+)<\/p>$/i);
    if (pMatch) content = pMatch[2];

    // 空のリストアイテムをスキップ（空白行の原因）
    const textOnly = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (textOnly.length > 0) {
      items.push(content);
    }
    pos = liClose + '</li>'.length;
  }

  return items;
}

// ============================================
// Document Builder
// ============================================

function createBookDocument(book: Book, chapters: Chapter[], sections: Section[]): Document {
  const children: (Paragraph | TableOfContents)[] = [];

  // ========== タイトルページ ==========
  children.push(
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      children: [new TextRun({
        text: book.title,
        bold: true,
        size: 56, // 28pt
        color: COLORS.dark,
        font: '游ゴシック',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  if (book.subtitle) {
    children.push(new Paragraph({
      children: [new TextRun({
        text: book.subtitle,
        size: 28, // 14pt
        color: COLORS.gray,
        font: '游ゴシック',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }));
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========== 目次ページ ==========
  children.push(
    new Paragraph({
      children: [new TextRun({
        text: '目次',
        bold: true,
        size: 48, // 24pt
        color: COLORS.dark,
        font: '游ゴシック',
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new TableOfContents("TOC", {
      hyperlink: true,
      headingStyleRange: "1-2",
    }),
  );

  // 手動テキスト目次（TOCフィールドが更新されない環境向けフォールバック）
  children.push(
    new Paragraph({ spacing: { before: 400 } }),
  );
  for (const chapter of chapters) {
    children.push(new Paragraph({
      children: [new TextRun({
        text: chapter.title,
        bold: true,
        size: 24,
        color: COLORS.dark,
        font: '游ゴシック',
      })],
      spacing: { before: 200, after: 80 },
    }));
    const chSections = sections
      .filter(s => s.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index);
    for (const sec of chSections) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: `  ${sec.title}`,
          size: 22,
          color: COLORS.gray,
          font: '游ゴシック',
        })],
        spacing: { after: 40 },
        indent: { left: convertInchesToTwip(0.3) },
      }));
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ========== 本文 ==========
  let olInstance = 0;

  for (const chapter of chapters) {
    // 章見出し（Heading 1）
    children.push(new Paragraph({
      children: [new TextRun({ text: chapter.title })],
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
    }));

    // 章の概要
    if (chapter.summary) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: chapter.summary,
          italics: true,
          color: COLORS.gray,
          size: 20, // 10pt
        })],
        spacing: { after: 320 },
        indent: { left: convertInchesToTwip(0.1) },
        border: { left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.summaryBorder } },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F9F9F9' },
      }));
    }

    // この章の節
    const chapterSections = sections
      .filter(s => s.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index);

    for (const section of chapterSections) {
      // 節見出し（Heading 2）
      children.push(new Paragraph({
        children: [new TextRun({ text: section.title })],
        heading: HeadingLevel.HEADING_2,
      }));

      // 節の内容（先頭の重複見出しを除去）
      if (section.content) {
        const cleanedContent = stripLeadingHeading(sanitizeHtml(section.content), section.title);
        const result = parseBlocks(cleanedContent, { olInstance });
        children.push(...result.paragraphs);
        olInstance = result.olInstance;
      } else {
        children.push(new Paragraph({
          children: [new TextRun({ text: '（未執筆）', italics: true, color: COLORS.gray })],
          spacing: { after: 100 },
        }));
      }
    }
  }

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            size: 22, // 11pt
            font: '游ゴシック',
            color: COLORS.body,
          },
          paragraph: {
            spacing: { line: 312, after: 100 }, // 1.3倍行間（書籍向け）
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 36, // 18pt
            bold: true,
            color: COLORS.dark,
            font: '游ゴシック',
          },
          paragraph: {
            spacing: { before: 240, after: 200, line: 276 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary },
            },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 28, // 14pt
            bold: true,
            color: COLORS.darkSlate,
            font: '游ゴシック',
          },
          paragraph: {
            spacing: { before: 300, after: 160, line: 276 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary },
            },
            indent: { left: convertInchesToTwip(0.08) },
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 26, // 13pt
            bold: true,
            color: COLORS.darkSlate,
            font: '游ゴシック',
          },
          paragraph: {
            spacing: { before: 280, after: 120, line: 276 },
          },
        },
        {
          id: 'Heading4',
          name: 'Heading 4',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 24, // 12pt
            bold: true,
            color: COLORS.darkSlate,
            font: '游ゴシック',
          },
          paragraph: {
            spacing: { before: 240, after: 100, line: 276 },
          },
        },
        {
          id: 'Heading5',
          name: 'Heading 5',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 23,
            bold: true,
            color: '666666',
            font: '游ゴシック',
          },
          paragraph: {
            spacing: { before: 200, after: 80, line: 276 },
          },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
              },
            },
          }],
        },
        {
          reference: 'ordered-list',
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
              },
            },
          }],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.25),
            right: convertInchesToTwip(1),
          },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: COLORS.gray,
                }),
              ],
            }),
          ],
        }),
      },
      children,
    }],
    features: {
      updateFields: true, // Word起動時にTOCを自動更新
    },
  });
}

// ============================================
// Demo Document
// ============================================

function createDemoDocument(): Document {
  const demoBook: Book = { id: 'demo', title: 'デモ用サンプル書籍', subtitle: 'Kindle執筆システムの使い方' };
  const demoChapters: Chapter[] = [
    { id: 'ch1', book_id: 'demo', title: '第1章　はじめに', summary: 'この本の概要と目的', order_index: 0 },
    { id: 'ch2', book_id: 'demo', title: '第2章　基本操作', summary: 'システムの基本的な使い方', order_index: 1 },
    { id: 'ch3', book_id: 'demo', title: '第3章　応用テクニック', summary: 'より効率的な執筆のために', order_index: 2 },
  ];
  const demoSections: Section[] = [
    { id: 's1', chapter_id: 'ch1', title: 'この本の目的', order_index: 0, content: '<p>この本では、Kindle執筆システムの使い方を学びます。効率的な執筆フローから、AIを活用した執筆術まで、幅広くカバーしています。</p>' },
    { id: 's2', chapter_id: 'ch1', title: '対象読者', order_index: 1, content: '<p>Kindle出版を始めたい方、執筆の効率化を図りたい方を対象としています。</p>' },
    { id: 's3', chapter_id: 'ch1', title: '本書の構成', order_index: 2, content: '<p>全3章構成で、基本操作から応用テクニックまで段階的に学べます。</p>' },
    { id: 's4', chapter_id: 'ch2', title: '目次の作成', order_index: 0, content: '<p>まずは本の構造を決めましょう。章と節を追加して、目次を作成します。</p>' },
    { id: 's5', chapter_id: 'ch2', title: '章と節の管理', order_index: 1, content: '<p>左サイドバーから章と節を管理できます。ドラッグ＆ドロップで順序を変更することも可能です。</p>' },
    { id: 's6', chapter_id: 'ch2', title: '執筆エディタの使い方', order_index: 2, content: '<p>リッチテキストエディタを使って、<strong>見出し</strong>や<em>箇条書き</em>など、読みやすい文章を作成できます。</p><ul><li>太字やイタリックの装飾</li><li>見出しの挿入</li><li>箇条書きリスト</li></ul>' },
    { id: 's7', chapter_id: 'ch3', title: '効率的な執筆フロー', order_index: 0, content: '<p>まず全体の構成を固め、その後各節を執筆していくのが効率的です。</p>' },
    { id: 's8', chapter_id: 'ch3', title: 'AIアシスタントの活用', order_index: 1, content: '<p>AI執筆ボタンを使えば、節の内容を自動生成できます。生成された内容をベースに編集しましょう。</p>' },
    { id: 's9', chapter_id: 'ch3', title: 'まとめ', order_index: 2, content: '<p>本書で学んだテクニックを活用して、効率的にKindle本を執筆してください。</p>' },
  ];

  return createBookDocument(demoBook, demoChapters, demoSections);
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
      const doc = createDemoDocument();
      const buffer = await Packer.toBuffer(doc);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="demo-sample-book.docx"',
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

    // 4. Wordドキュメント生成
    const doc = createBookDocument(bookData as Book, chapters, sections);
    const buffer = await Packer.toBuffer(doc);

    const safeFileName = encodeURIComponent(bookData.title.replace(/[<>:"/\\|?*]/g, '_')) + '.docx';

    return new NextResponse(new Uint8Array(buffer), {
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
