/**
 * 補助金申請書 AI生成
 * POST /api/subsidy/generate-report
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { createAIProvider } from '@/lib/ai-provider';
import { getAdminEmails } from '@/lib/constants';
import { logAIUsage } from '@/lib/ai-usage';
import { getSystemPrompt, buildFullReportPrompt } from '@/lib/subsidy/prompts';
import type { BusinessInfo, SubsidyMaster, ReportContent, ReportSection, ReportDetail } from '@/lib/subsidy/types';
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

    const { resultId, reportDetail } = await request.json();
    if (!resultId) {
      return NextResponse.json({ error: '診断結果IDが必要です' }, { status: 400 });
    }

    const detail: ReportDetail | null = reportDetail || null;

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(e => user.email?.toLowerCase() === e.toLowerCase());

    // 結果取得
    const readClient = isAdmin ? (getServiceClient() || supabase) : supabase;
    let query = readClient
      .from('subsidy_results')
      .select('*')
      .eq('id', resultId);
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    const { data: row, error } = await query.single();

    if (error || !row) {
      return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 });
    }

    if (!row.report_purchased && !isAdmin) {
      return NextResponse.json({ error: '申請書AI作成の購入が必要です' }, { status: 403 });
    }

    // キャッシュ確認
    if (row.report_content) {
      return NextResponse.json({ report: row.report_content, cached: true });
    }

    // 補助金マスタ取得
    const subsidyKey = row.selected_subsidy;
    if (!subsidyKey) {
      return NextResponse.json({ error: '補助金が選択されていません' }, { status: 400 });
    }

    const { data: subsidyData } = await (getServiceClient() || supabase)
      .from('subsidy_master')
      .select('*')
      .eq('subsidy_key', subsidyKey)
      .single();

    if (!subsidyData) {
      return NextResponse.json({ error: '補助金マスタデータが見つかりません' }, { status: 404 });
    }

    const subsidyMaster = subsidyData as SubsidyMaster;
    const businessInfo = row.business_info as BusinessInfo;

    // 追加情報をDBに保存（入力があれば）
    if (detail) {
      const detailClient = isAdmin && row.user_id !== user.id
        ? getServiceClient() || supabase
        : supabase;
      await detailClient
        .from('subsidy_results')
        .update({ report_detail: detail, updated_at: new Date().toISOString() })
        .eq('id', resultId);
    }

    // AI生成
    const provider = createAIProvider({
      preferProvider: 'gemini',
      model: 'gemini-2.5-flash',
    });

    const systemPrompt = getSystemPrompt();
    const userPrompt = buildFullReportPrompt(
      businessInfo,
      subsidyMaster.name,
      subsidyMaster.application_sections,
      detail
    );

    const aiResponse = await provider.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 65536,
      responseFormat: 'text',
    });

    // JSON解析
    let sections: ReportSection[] = [];
    try {
      const content = aiResponse.content;
      // ```json ... ``` ブロックを抽出
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const parsed = JSON.parse(jsonStr.trim());

      sections = parsed.map((s: any) => ({
        key: s.key,
        title: s.title,
        content: s.content,
        generatedAt: new Date().toISOString(),
      }));
    } catch (parseError) {
      // JSONパース失敗時はテキスト全体を1セクションとして扱う
      console.error('JSON parse failed, using raw content:', parseError);
      sections = [{
        key: 'full_report',
        title: '申請書ドラフト',
        content: aiResponse.content,
        generatedAt: new Date().toISOString(),
      }];
    }

    const reportContent: ReportContent = {
      subsidyName: subsidyMaster.name,
      sections,
      generatedAt: new Date().toISOString(),
    };

    // DB保存
    const targetUserId = row.user_id;
    const dbClient = isAdmin && targetUserId !== user.id
      ? getServiceClient() || supabase
      : supabase;
    await dbClient
      .from('subsidy_results')
      .update({
        report_content: reportContent,
        report_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', resultId);

    // AI使用量ログ
    await logAIUsage({
      userId: user.id,
      actionType: 'subsidy_report',
      service: 'subsidy',
      modelUsed: aiResponse.model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
    });

    // 完了メール（非ブロッキング）
    if (user.email) {
      const reportUrl = `${SITE_URL}/subsidy/result/${resultId}`;
      resend.emails.send({
        from: '補助金診断 <support@makers.tokyo>',
        to: user.email,
        subject: `【補助金診断】${subsidyMaster.name}の申請書ドラフトが完成しました`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
            <div style="background: linear-gradient(135deg, #0D9488, #0891B2); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; font-size: 22px; margin: 0 0 8px;">補助金申請書ドラフト完成</h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">${subsidyMaster.name}</p>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 15px; line-height: 1.8; margin: 0 0 16px;">AIが申請書の主要セクションを自動生成しました。</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">内容を確認し、必要に応じて加筆・修正してください。</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${reportUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0D9488, #0891B2); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">ドラフトを確認する</a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 16px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #9ca3af; font-size: 10px; margin: 0;">集客メーカー <a href="${SITE_URL}/" style="color: #0D9488;">makers.tokyo</a></p>
            </div>
          </div>
        `,
      }).catch(err => console.error('[Subsidy] Report email error:', err));
    }

    return NextResponse.json({ report: reportContent, cached: false });
  } catch (err: any) {
    console.error('Subsidy report generation error:', err);
    return NextResponse.json({ error: err.message || 'レポート生成に失敗しました' }, { status: 500 });
  }
}
