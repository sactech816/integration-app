/**
 * Big Five プレミアムレポート AI生成
 * POST /api/bigfive/generate-report
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAIProvider } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { buildReportSystemPrompt, buildReportUserPrompt } from '@/lib/bigfive/report-prompt';
import { FACET_LABELS } from '@/lib/bigfive/calculate';
import type { BigFiveResult, FacetScore, MBTIType } from '@/lib/bigfive/calculate';

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

  return { traits, mbtiType, testType: row.test_type || 'full' };
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

    // 結果取得 + 購入チェック
    const { data: row, error } = await supabase
      .from('bigfive_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 });
    }

    if (!row.pdf_purchased) {
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

    const systemPrompt = buildReportSystemPrompt();
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

    // DB保存
    await supabase
      .from('bigfive_results')
      .update({
        report_content: reportHtml,
        report_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', resultId)
      .eq('user_id', user.id);

    // AI使用量ログ
    await logAIUsage({
      userId: user.id,
      actionType: 'bigfive_report',
      service: 'bigfive',
      modelUsed: aiResponse.model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
    });

    return NextResponse.json({ html: reportHtml, cached: false });
  } catch (err: any) {
    console.error('BigFive report generation error:', err);
    return NextResponse.json({ error: err.message || 'レポート生成に失敗しました' }, { status: 500 });
  }
}
