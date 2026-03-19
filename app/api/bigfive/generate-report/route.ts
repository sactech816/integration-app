/**
 * Big Five プレミアムレポート AI生成
 * POST /api/bigfive/generate-report
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { createAIProvider } from '@/lib/ai-provider';
import { getAdminEmails } from '@/lib/constants';
import { logAIUsage } from '@/lib/ai-usage';
import { buildReportSystemPrompt, buildReportUserPrompt } from '@/lib/bigfive/report-prompt';
import { FACET_LABELS } from '@/lib/bigfive/calculate';
import type { BigFiveResult, FacetScore, MBTIType } from '@/lib/bigfive/calculate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

// DBの行データからBigFiveResultオブジェクトを復元
function reconstructResult(row: any): BigFiveResult {
  const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

  const traits = {} as BigFiveResult['traits'];
  for (const key of traitKeys) {
    const percentage = row[key] as number;
    const level = percentage <= 20 ? 'very_low' : percentage <= 40 ? 'low' : percentage <= 60 ? 'medium' : percentage <= 80 ? 'high' : 'very_high';

    // ファセット復元
    const facets: FacetScore[] = [];
    if (row.facet_scores?.[key]) {
      for (const [facetKey, facetPct] of Object.entries(row.facet_scores[key])) {
        facets.push({
          name: facetKey,
          label: FACET_LABELS[key]?.[facetKey] || facetKey,
          score: 0,
          maxScore: 0,
          percentage: facetPct as number,
        });
      }
    }

    traits[key] = { score: 0, maxScore: 0, percentage, level, facets };
  }

  // MBTI復元
  const mbtiDimensions = row.mbti_dimensions || {};
  const mbtiType: MBTIType = {
    code: row.mbti_code || 'XXXX',
    name: mbtiDimensions.name || '',
    description: mbtiDimensions.description || '',
    dimensions: {
      EI: mbtiDimensions.EI || { label: '', value: 'I', score: 0 },
      SN: mbtiDimensions.SN || { label: '', value: 'N', score: 0 },
      TF: mbtiDimensions.TF || { label: '', value: 'F', score: 0 },
      JP: mbtiDimensions.JP || { label: '', value: 'J', score: 0 },
    },
  };

  // DISC復元
  const discType = row.disc_type || {
    primary: 'S', secondary: 'C', name: '安定型（S）', description: '',
    scores: { D: 50, I: 50, S: 50, C: 50 },
  };

  const result: any = { traits, mbtiType, discType, testType: row.test_type || 'full' };

  // エニアグラム復元（詳細診断のみ）
  if (row.enneagram_result) {
    result.enneagramType = row.enneagram_result;
  }

  return result as BigFiveResult;
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

    // 結果取得（管理者はService Role ClientでRLSバイパス）
    const readClient = isAdmin
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : supabase;

    let query = readClient
      .from('bigfive_results')
      .select('*')
      .eq('id', resultId);

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: row, error } = await query.single();

    if (error || !row) {
      console.error('[BigFive generate-report] Query failed:', { resultId, isAdmin, error: error?.message, code: error?.code });
      return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 });
    }

    if (!row.pdf_purchased && !isAdmin) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    // キャッシュ確認
    if (row.report_content) {
      return NextResponse.json({ html: row.report_content, cached: true });
    }

    // BigFiveResult を復元
    const result = reconstructResult(row);

    // AI生成
    const provider = createAIProvider({
      preferProvider: 'gemini',
      model: 'gemini-2.5-flash',
    });

    const systemPrompt = buildReportSystemPrompt(result.testType);
    const userPrompt = buildReportUserPrompt(result);

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
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : supabase;
    await dbClient
      .from('bigfive_results')
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
      actionType: 'bigfive_report',
      service: 'bigfive',
      modelUsed: aiResponse.model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
    });

    // レポート生成完了メール送信（非ブロッキング）
    if (user.email) {
      const reportUrl = `${SITE_URL}/bigfive/report/${resultId}`;
      const mbtiCode = row.mbti_code || '';
      resend.emails.send({
        from: 'Big Five 性格診断 <support@makers.tokyo>',
        to: user.email,
        subject: '【Big Five 性格診断】プレミアムレポートが完成しました',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
            <div style="background: linear-gradient(135deg, #6366f1, #7c3aed); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; font-size: 22px; margin: 0 0 8px;">Big Five 性格診断</h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">プレミアムレポート</p>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 15px; line-height: 1.8; margin: 0 0 16px;">プレミアムレポートが完成しました！</p>
              ${mbtiCode ? `<p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">パーソナリティタイプ: <strong style="color: #4f46e5; font-size: 16px;">${mbtiCode}</strong></p>` : ''}
              <div style="text-align: center; margin: 24px 0;">
                <a href="${reportUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">レポートを見る</a>
              </div>
              <p style="font-size: 13px; color: #6b7280; margin: 16px 0 0; text-align: center;">レポートページから「PDF保存 / 印刷」ボタンでPDFとして保存できます。</p>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #9ca3af; font-size: 10px; margin: 0;">集客メーカー <a href="${SITE_URL}/" style="color: #6366f1;">makers.tokyo</a></p>
            </div>
          </div>
        `,
      }).catch(err => console.error('[BigFive] Report email error:', err));
    }

    return NextResponse.json({ html: reportHtml, cached: false });
  } catch (err: any) {
    console.error('BigFive report generation error:', err);
    return NextResponse.json({ error: err.message || 'レポート生成に失敗しました' }, { status: 500 });
  }
}
