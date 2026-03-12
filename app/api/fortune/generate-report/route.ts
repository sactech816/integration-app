/**
 * Fortune プレミアムレポート AI生成
 * POST /api/fortune/generate-report
 * Body: { resultId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { createAIProvider } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { buildFortuneReportSystemPrompt, buildFortuneReportUserPrompt } from '@/lib/fortune/report-prompt';
import type { FortuneResult } from '@/lib/fortune/calculation';

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

    // 結果取得 + 購入チェック
    const { data: row, error } = await supabase
      .from('fortune_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: '鑑定結果が見つかりません' }, { status: 404 });
    }

    if (!row.report_purchased) {
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

    // DB保存
    await supabase
      .from('fortune_results')
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
      actionType: 'fortune_report',
      service: 'fortune',
      modelUsed: aiResponse.model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
    });

    return NextResponse.json({ html: reportHtml, cached: false });
  } catch (err: any) {
    console.error('Fortune report generation error:', err);
    return NextResponse.json({ error: err.message || 'レポート生成に失敗しました' }, { status: 500 });
  }
}
