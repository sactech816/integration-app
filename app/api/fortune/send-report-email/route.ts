/**
 * Fortune レポートページリンクをメールで送信
 * POST /api/fortune/send-report-email
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = '生年月日占い <support@makers.tokyo>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

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

    // 結果確認
    const { data: result } = await supabase
      .from('fortune_results')
      .select('id, report_purchased, report_content, birth_year, birth_month, birth_day')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (!result) {
      return NextResponse.json({ error: '結果が見つかりません' }, { status: 404 });
    }

    if (!result.report_purchased) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    if (!result.report_content) {
      return NextResponse.json({ error: 'レポートがまだ生成されていません' }, { status: 400 });
    }

    if (!user.email) {
      return NextResponse.json({ error: 'メールアドレスが登録されていません' }, { status: 400 });
    }

    const reportUrl = `${SITE_URL}/fortune/report/${resultId}`;
    const birthLabel = `${result.birth_year}年${result.birth_month}月${result.birth_day}日`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: '【生年月日占い】プレミアム鑑定レポートのご案内',
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
              <a href="${reportUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">
                レポートを見る
              </a>
            </div>

            <p style="font-size: 13px; color: #6b7280; margin: 16px 0 0; text-align: center;">
              レポートページから「PDF保存 / 印刷」ボタンでPDFとして保存できます。
            </p>

            <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0; text-align: center;">
              ※ ログインが必要です。<a href="${SITE_URL}/dashboard?view=fortune" style="color: #4F46E5;">マイページ</a>からいつでもアクセスできます。
            </p>
          </div>

          <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px;">このメールは生年月日占いから自動送信されています</p>
            <p style="color: #9ca3af; font-size: 10px; margin: 0;">
              集客メーカー <a href="${SITE_URL}/" style="color: #4F46E5;">makers.tokyo</a>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Fortune] Send report email error:', err);
    return NextResponse.json({ error: 'メール送信に失敗しました' }, { status: 500 });
  }
}
