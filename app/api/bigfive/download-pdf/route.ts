/**
 * Big Five プレミアムレポート PDF ダウンロード
 * POST /api/bigfive/download-pdf — レポートHTML→PDF生成＋Storage保存＋署名URL返却
 * GET  /api/bigfive/download-pdf?id=<resultId> — 既存PDFの署名URL返却
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateAndStorePdf, getSignedPdfUrl } from '@/lib/bigfive/generate-pdf';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Big Five 性格診断 <support@makers.tokyo>';

/**
 * GET: 既存PDFの署名付きURLを取得（マイページ再DL用）
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    const { data: result } = await supabase
      .from('bigfive_results')
      .select('id, pdf_purchased, pdf_storage_path, report_content')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!result) {
      return NextResponse.json({ error: '結果が見つかりません' }, { status: 404 });
    }

    if (!result.pdf_purchased) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    // PDFがまだ生成されていない場合
    if (!result.pdf_storage_path) {
      if (!result.report_content) {
        return NextResponse.json({ error: 'レポートがまだ生成されていません。先にレポートを生成してください。' }, { status: 400 });
      }
      // レポートHTMLが存在するなら PDF を今生成
      const { storagePath, error: genError } = await generateAndStorePdf(user.id, id, result.report_content);
      if (genError) {
        return NextResponse.json({ error: genError }, { status: 500 });
      }
      const { url, error: urlError } = await getSignedPdfUrl(storagePath, 3600);
      if (urlError) {
        return NextResponse.json({ error: urlError }, { status: 500 });
      }
      return NextResponse.json({ url });
    }

    // 既存PDFの署名URLを返す
    const { url, error: urlError } = await getSignedPdfUrl(result.pdf_storage_path, 3600);
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[BigFive Download PDF] GET error:', err);
    return NextResponse.json({ error: err.message || 'エラーが発生しました' }, { status: 500 });
  }
}

/**
 * POST: レポートHTML → PDF生成 → Storage保存 → メール送信 → 署名URL返却
 */
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

    const { data: result } = await supabase
      .from('bigfive_results')
      .select('id, pdf_purchased, pdf_storage_path, report_content, mbti_code')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (!result) {
      return NextResponse.json({ error: '結果が見つかりません' }, { status: 404 });
    }

    if (!result.pdf_purchased) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    if (!result.report_content) {
      return NextResponse.json({ error: 'レポートがまだ生成されていません' }, { status: 400 });
    }

    // 既にPDFがある場合は署名URLを返すだけ
    if (result.pdf_storage_path) {
      const { url, error: urlError } = await getSignedPdfUrl(result.pdf_storage_path, 3600);
      if (urlError) {
        return NextResponse.json({ error: urlError }, { status: 500 });
      }
      return NextResponse.json({ url, cached: true });
    }

    // PDF生成 + Storage保存
    const { storagePath, error: genError } = await generateAndStorePdf(
      user.id,
      resultId,
      result.report_content
    );

    if (genError) {
      return NextResponse.json({ error: genError }, { status: 500 });
    }

    // 署名URL取得（ダウンロード用: 1時間）
    const { url, error: urlError } = await getSignedPdfUrl(storagePath, 3600);
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 500 });
    }

    // メール送信（署名URL: 7日間有効）
    const { url: emailUrl } = await getSignedPdfUrl(storagePath, 7 * 24 * 3600);
    if (emailUrl && user.email) {
      await sendPdfEmail(user.email, emailUrl, result.mbti_code || '');
    }

    return NextResponse.json({ url, cached: false });
  } catch (err: any) {
    console.error('[BigFive Download PDF] POST error:', err);
    return NextResponse.json({ error: err.message || 'PDF生成に失敗しました' }, { status: 500 });
  }
}

/**
 * PDF リンク付きメール送信
 */
async function sendPdfEmail(to: string, pdfUrl: string, mbtiCode: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `【Big Five 性格診断】プレミアムレポートのダウンロードリンク`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #6366f1, #7c3aed); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 22px; margin: 0 0 8px;">Big Five 性格診断</h1>
            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">プレミアムレポート</p>
          </div>

          <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 15px; line-height: 1.8; margin: 0 0 16px;">
              プレミアムレポートをご購入いただきありがとうございます。
            </p>
            ${mbtiCode ? `<p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">パーソナリティタイプ: <strong style="color: #4f46e5; font-size: 16px;">${mbtiCode}</strong></p>` : ''}

            <div style="text-align: center; margin: 24px 0;">
              <a href="${pdfUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">
                PDFレポートをダウンロード
              </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0; text-align: center;">
              ※ このリンクは7日間有効です。期限切れの場合は<a href="https://makers.tokyo/dashboard?view=bigfive" style="color: #6366f1;">マイページ</a>から再ダウンロードできます。
            </p>
          </div>

          <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px;">このメールはBig Five性格診断から自動送信されています</p>
            <p style="color: #9ca3af; font-size: 10px; margin: 0;">
              集客メーカー <a href="https://makers.tokyo/" style="color: #6366f1;">makers.tokyo</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[BigFive] Email send error:', err);
    // メール送信失敗はブロッキングにしない
  }
}
