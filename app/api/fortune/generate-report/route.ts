/**
 * Fortune プレミアムレポート AI生成
 * POST /api/fortune/generate-report
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { createAIProvider } from '@/lib/ai-provider';
import { getAdminEmails } from '@/lib/constants';
import { logAIUsage } from '@/lib/ai-usage';
import { buildFortuneReportSystemPrompt, buildFortuneReportUserPrompt } from '@/lib/fortune/report-prompt';
import type { FortuneResult } from '@/lib/fortune/calculation';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
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
      return NextResponse.json({ error: '鑑定結果IDが必要です' }, { status: 400 });
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(e => user.email?.toLowerCase() === e.toLowerCase());

    // 結果取得（管理者はService Role ClientでRLSバイパス）
    const readClient = isAdmin
      ? (getServiceClient() || supabase)
      : supabase;

    let query = readClient
      .from('fortune_results')
      .select('*')
      .eq('id', resultId);
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    const { data: row, error } = await query.single();

    if (error || !row) {
      console.error('[Fortune generate-report] Query failed:', { resultId, isAdmin, error: error?.message, code: error?.code });
      return NextResponse.json({ error: '鑑定結果が見つかりません' }, { status: 404 });
    }

    if (!row.report_purchased && !isAdmin) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    // キャッシュ確認
    if (row.report_content) {
      return NextResponse.json({ html: row.report_content, cached: true });
    }

    // fortune_contents からdetailed_contentを取得
    const snapshot: FortuneResult = row.result_snapshot;
    const contentKeys = [
      snapshot.nineStar.year,
      snapshot.nineStar.month,
      snapshot.numerology.lifePath,
      snapshot.fourPillars.heavenlyStem,
    ];

    const serviceClient = getServiceClient();
    const { data: contents } = await (serviceClient || supabase)
      .from('fortune_contents')
      .select('result_key, title, content_md, category, detailed_content')
      .in('result_key', contentKeys);

    // AI生成
    const provider = createAIProvider({
      preferProvider: 'gemini',
      model: 'gemini-2.5-flash',
    });

    const systemPrompt = buildFortuneReportSystemPrompt();
    const userPrompt = buildFortuneReportUserPrompt(
      snapshot,
      row.birth_year,
      row.birth_month,
      row.birth_day,
      contents || []
    );

    const aiResponse = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 8192,
      responseFormat: 'text',
    });

    const reportHtml = aiResponse.content;

    // DB保存（管理者は他ユーザーの結果を更新する場合があるため、対象user_idで保存）
    const targetUserId = row.user_id;
    const dbClient = isAdmin && targetUserId !== user.id
      ? getServiceClient() || supabase
      : supabase;
    await dbClient
      .from('fortune_results')
      .update({
        report_content: reportHtml,
        report_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', resultId)
      .eq('user_id', targetUserId);

    // AI使用量ログ
    await logAIUsage({
      userId: user.id,
      actionType: 'fortune_report',
      service: 'fortune',
      modelUsed: aiResponse.model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
    });

    // レポート生成完了メール送信（非ブロッキング）
    if (user.email) {
      const reportUrl = `${SITE_URL}/fortune/report/${resultId}`;
      const birthLabel = `${row.birth_year}年${row.birth_month}月${row.birth_day}日`;
      resend.emails.send({
        from: '生年月日占い <support@makers.tokyo>',
        to: user.email,
        subject: '【生年月日占い】プレミアム鑑定レポートが完成しました',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; font-size: 22px; margin: 0 0 8px;">生年月日占い</h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">プレミアム鑑定レポート</p>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 15px; line-height: 1.8; margin: 0 0 16px;">プレミアム鑑定レポートが完成しました！</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">鑑定対象: <strong style="color: #4F46E5; font-size: 16px;">${birthLabel}生まれ</strong></p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${reportUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">レポートを見る</a>
              </div>
              <p style="font-size: 13px; color: #6b7280; margin: 16px 0 0; text-align: center;">レポートページから「PDF保存 / 印刷」ボタンでPDFとして保存できます。</p>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #9ca3af; font-size: 10px; margin: 0;">集客メーカー <a href="${SITE_URL}/" style="color: #4F46E5;">makers.tokyo</a></p>
            </div>
          </div>
        `,
      }).catch(err => console.error('[Fortune] Report email error:', err));
    }

    return NextResponse.json({ html: reportHtml, cached: false });
  } catch (err: any) {
    console.error('Fortune report generation error:', err);
    return NextResponse.json({ error: err.message || 'レポート生成に失敗しました' }, { status: 500 });
  }
}
