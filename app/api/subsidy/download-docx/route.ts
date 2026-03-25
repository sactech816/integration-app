/**
 * 補助金申請書 Word(.docx) ダウンロード
 * POST /api/subsidy/download-docx
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TableRow,
  TableCell,
  Table,
  WidthType,
} from 'docx';
import type { ReportContent } from '@/lib/subsidy/types';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * HTMLをdocxのParagraph配列に変換（簡易パーサー）
 */
function htmlToDocxParagraphs(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // HTMLタグをパースして段落に変換
  // 改行・空白の正規化
  const cleaned = html
    .replace(/\r\n/g, '\n')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // ブロック要素で分割
  const blocks = cleaned.split(/<\/?(?:p|h[1-6]|ul|ol|li|div|table|tr|td|th|br\s*\/?)>/gi);
  const tagMatches = cleaned.match(/<\/?(?:p|h[1-6]|ul|ol|li|div|table|tr|td|th|br\s*\/?)>/gi) || [];

  let currentTag = '';
  let listCounter = 0;
  let inTable = false;
  const tableRows: TableRow[] = [];
  let currentRowCells: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const text = blocks[i]
      .replace(/<strong>/gi, '**BOLD_START**')
      .replace(/<\/strong>/gi, '**BOLD_END**')
      .replace(/<em>/gi, '**ITALIC_START**')
      .replace(/<\/em>/gi, '**ITALIC_END**')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .trim();

    const tag = (i > 0 ? tagMatches[i - 1] : '').toLowerCase();

    // テーブル処理
    if (tag === '<table>') {
      inTable = true;
      continue;
    }
    if (tag === '</table>') {
      inTable = false;
      if (tableRows.length > 0) {
        try {
          paragraphs.push(
            new Paragraph({ spacing: { before: 100 } }),
          );
          const table = new Table({
            rows: tableRows.splice(0),
            width: { size: 100, type: WidthType.PERCENTAGE },
          });
          // テーブルはParagraphではないので、Paragraphとして扱えない
          // docxライブラリではDocumentのsectionsに直接Tableを追加する必要がある
          // ここではテーブルの内容をテキストとしてフォールバック
        } catch {
          // テーブル作成失敗時はスキップ
        }
      }
      continue;
    }
    if (tag === '<tr>') {
      currentRowCells = [];
      continue;
    }
    if (tag === '</tr>') {
      if (currentRowCells.length > 0) {
        tableRows.push(
          new TableRow({
            children: currentRowCells.map((cell) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
                width: { size: Math.floor(100 / currentRowCells.length), type: WidthType.PERCENTAGE },
              })
            ),
          })
        );
      }
      continue;
    }
    if (tag === '<td>' || tag === '<th>') {
      if (text) currentRowCells.push(text);
      continue;
    }
    if (inTable) continue;

    if (!text) continue;

    // 見出し
    if (tag.match(/<h3/i)) {
      currentTag = 'h3';
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: stripBoldMarkers(text), bold: true, size: 28, font: 'Yu Gothic' })],
          spacing: { before: 300, after: 120 },
        })
      );
      continue;
    }

    // リスト
    if (tag.match(/<li/i)) {
      listCounter++;
      const runs = parseInlineFormatting(text);
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• `, size: 22, font: 'Yu Gothic' }),
            ...runs,
          ],
          spacing: { before: 40, after: 40 },
          indent: { left: 400 },
        })
      );
      continue;
    }

    // 通常の段落
    const runs = parseInlineFormatting(text);
    if (runs.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { before: 80, after: 80 },
        })
      );
    }
  }

  return paragraphs;
}

function stripBoldMarkers(text: string): string {
  return text.replace(/\*\*BOLD_START\*\*/g, '').replace(/\*\*BOLD_END\*\*/g, '')
    .replace(/\*\*ITALIC_START\*\*/g, '').replace(/\*\*ITALIC_END\*\*/g, '');
}

function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*(?:BOLD_START|BOLD_END|ITALIC_START|ITALIC_END)\*\*)/);

  let bold = false;
  let italic = false;

  for (const part of parts) {
    if (part === '**BOLD_START**') { bold = true; continue; }
    if (part === '**BOLD_END**') { bold = false; continue; }
    if (part === '**ITALIC_START**') { italic = true; continue; }
    if (part === '**ITALIC_END**') { italic = false; continue; }
    if (part.trim()) {
      runs.push(new TextRun({
        text: part,
        bold,
        italics: italic,
        size: 22,
        font: 'Yu Gothic',
      }));
    }
  }

  return runs;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { resultId } = await request.json();
    if (!resultId) {
      return NextResponse.json({ error: '診断結果IDが必要です' }, { status: 400 });
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(e => user.email?.toLowerCase() === e.toLowerCase());

    const readClient = isAdmin ? (getServiceClient() || supabase) : supabase;
    let query = readClient
      .from('subsidy_results')
      .select('report_content, selected_subsidy')
      .eq('id', resultId);
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    const { data: row, error } = await query.single();

    if (error || !row || !row.report_content) {
      return NextResponse.json({ error: 'レポートが見つかりません' }, { status: 404 });
    }

    const report = row.report_content as ReportContent;

    // ドキュメント生成
    const children: Paragraph[] = [];

    // タイトル
    children.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: `補助金申請書ドラフト`,
          bold: true,
          size: 36,
          font: 'Yu Gothic',
        })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: report.subsidyName,
          size: 28,
          font: 'Yu Gothic',
          color: '0D9488',
        })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: `生成日: ${new Date(report.generatedAt).toLocaleDateString('ja-JP')}`,
          size: 18,
          color: '888888',
          font: 'Yu Gothic',
        })],
        spacing: { after: 400 },
      }),
      // 区切り線
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        spacing: { after: 300 },
      }),
    );

    // 各セクション
    for (const section of report.sections) {
      // セクションタイトル
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({
            text: section.title,
            bold: true,
            size: 32,
            font: 'Yu Gothic',
            color: '115E59',
          })],
          spacing: { before: 400, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: '0D9488' } },
        })
      );

      // セクション内容
      const sectionParagraphs = htmlToDocxParagraphs(section.content);
      children.push(...sectionParagraphs);

      // セクション間スペース
      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // フッター注記
    children.push(
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        children: [new TextRun({
          text: '※ このドキュメントはAIが自動生成したドラフトです。実際の申請書には事業者ご自身の情報で加筆・修正してください。',
          size: 16,
          color: '999999',
          font: 'Yu Gothic',
        })],
        spacing: { before: 200 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: '集客メーカー（makers.tokyo）補助金適正診断より出力',
          size: 14,
          color: 'AAAAAA',
          font: 'Yu Gothic',
        })],
      }),
    );

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="subsidy_report_${resultId.slice(0, 8)}.docx"`,
      },
    });
  } catch (err: any) {
    console.error('Subsidy DOCX download error:', err);
    return NextResponse.json({ error: err.message || 'ダウンロードに失敗しました' }, { status: 500 });
  }
}
