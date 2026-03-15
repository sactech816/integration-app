/**
 * Fortune プレミアムレポート PDF ダウンロード
 * POST /api/fortune/download-pdf — レポートHTML→PDF生成＋Storage保存＋署名URL返却
 * GET  /api/fortune/download-pdf?id=<resultId> — 既存PDFの署名URL返却
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { generateAndStorePdf, getSignedPdfUrl } from '@/lib/fortune/generate-pdf';
import { getAdminEmails } from '@/lib/constants';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = '生年月日占い <support@makers.tokyo>';

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

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(e => user.email?.toLowerCase() === e.toLowerCase());

    // 管理者はService Role ClientでRLSバイパス
    const readClient = isAdmin
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : supabase;

    let queryGet = readClient
      .from('fortune_results')
      .select('id, user_id, report_purchased, pdf_storage_path, report_content')
      .eq('id', id);
    if (!isAdmin) {
      queryGet = queryGet.eq('user_id', user.id);
    }
    const { data: result } = await queryGet.single();

    if (!result) {
      return NextResponse.json({ error: '結果が見つかりません' }, { status: 404 });
    }

    if (!result.report_purchased && !isAdmin) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    if (!result.pdf_storage_path) {
      if (!result.report_content) {
        return NextResponse.json({ error: 'レポートがまだ生成されていません。先にレポートを生成してください。' }, { status: 400 });
      }
      const getTargetUserId = (result as any).user_id || user.id;
      const { storagePath, error: genError } = await generateAndStorePdf(getTargetUserId, id, result.report_content);
      if (genError) {
        return NextResponse.json({ error: genError }, { status: 500 });
      }
      const { url, error: urlError } = await getSignedPdfUrl(storagePath, 3600);
      if (urlError) {
        return NextResponse.json({ error: urlError }, { status: 500 });
      }
      return NextResponse.json({ url });
    }

    const { url, error: urlError } = await getSignedPdfUrl(result.pdf_storage_path, 3600);
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[Fortune Download PDF] GET error:', err);
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
      return NextResponse.json({ error: '鑑定結果IDが必要です' }, { status: 400 });
    }

    const adminEmailsPost = getAdminEmails();
    const isAdminPost = adminEmailsPost.some(e => user.email?.toLowerCase() === e.toLowerCase());

    // 管理者はService Role ClientでRLSバイパス
    const readClientPost = isAdminPost
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : supabase;

    let queryPost = readClientPost
      .from('fortune_results')
      .select('id, user_id, report_purchased, pdf_storage_path, report_content, birth_year, birth_month, birth_day')
      .eq('id', resultId);
    if (!isAdminPost) {
      queryPost = queryPost.eq('user_id', user.id);
    }
    const { data: result } = await queryPost.single();

    if (!result) {
      return NextResponse.json({ error: '結果が見つかりません' }, { status: 404 });
    }

    if (!result.report_purchased && !isAdminPost) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    if (!result.report_content) {
      return NextResponse.json({ error: 'レポートがまだ生成されていません' }, { status: 400 });
    }

    if (result.pdf_storage_path) {
      const { url, error: urlError } = await getSignedPdfUrl(result.pdf_storage_path, 3600);
      if (urlError) {
        return NextResponse.json({ error: urlError }, { status: 500 });
      }
      return NextResponse.json({ url, cached: true });
    }

    const postTargetUserId = (result as any).user_id || user.id;
    const { storagePath, error: genError } = await generateAndStorePdf(
      postTargetUserId,
      resultId,
      result.report_content
    );

    if (genError) {
      return NextResponse.json({ error: genError }, { status: 500 });
    }

    const { url, error: urlError } = await getSignedPdfUrl(storagePath, 3600);
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 500 });
    }

    // メール送信
    const { url: emailUrl } = await getSignedPdfUrl(storagePath, 7 * 24 * 3600);
    if (emailUrl && user.email) {
      const birthLabel = `${result.birth_year}年${result.birth_month}月${result.birth_day}日`;
      await sendPdfEmail(user.email, emailUrl, birthLabel);
    }

    return NextResponse.json({ url, cached: false });
  } catch (err: any) {
    console.error('[Fortune Download PDF] POST error:', err);
    return NextResponse.json({ error: err.message || 'PDF生成に失敗しました' }, { status: 500 });
  }
}

async function sendPdfEmail(to: string, pdfUrl: string, birthLabel: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `【生年月日占い】プレミアム鑑定レポートのダウンロードリンク`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 22px; margin: 0 0 8px;">生年月日占い</h1>
            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">プレミアム鑑定レポート</p>
          </div>

          <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 15px; line-height: 1.8; margin: 0 0 16px;">
              プレミアム鑑定レポートをご購入いただきありがとうございます。
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">
              鑑定対象: <strong style="color: #4F46E5; font-size: 16px;">${birthLabel}生まれ</strong>
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${pdfUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">
                PDFレポートをダウンロード
              </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0; text-align: center;">
              ※ このリンクは7日間有効です。期限切れの場合は<a href="https://makers.tokyo/dashboard?view=fortune" style="color: #4F46E5;">マイページ</a>から再ダウンロードできます。
            </p>
          </div>

          <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px;">このメールは生年月日占いから自動送信されています</p>
            <p style="color: #9ca3af; font-size: 10px; margin: 0;">
              集客メーカー <a href="https://makers.tokyo/" style="color: #4F46E5;">makers.tokyo</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Fortune] Email send error:', err);
  }
}
