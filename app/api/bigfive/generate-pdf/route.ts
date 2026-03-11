/**
 * Big Five PDF生成 — 購入済みユーザー向け
 * GET /api/bigfive/generate-pdf?id=<resultId>
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { FACET_LABELS } from '@/lib/bigfive/calculate';
import { getTraitDetail } from '@/lib/bigfive/trait-details';

const TRAIT_NAMES: Record<string, string> = {
  openness: '開放性',
  conscientiousness: '誠実性',
  extraversion: '外向性',
  agreeableness: '協調性',
  neuroticism: '情緒安定性',
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    const { data: result } = await supabase
      .from('bigfive_results')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!result) {
      return NextResponse.json({ error: '結果が見つかりません' }, { status: 404 });
    }

    if (!result.pdf_purchased) {
      return NextResponse.json({ error: 'PDFレポートの購入が必要です' }, { status: 403 });
    }

    // 印刷用HTMLを返す（ブラウザのprint→PDF保存で対応）
    const html = generatePdfHtml(result);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function generatePdfHtml(result: any): string {
  const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const facetScores = result.facet_scores || {};
  const createdAt = new Date(result.created_at).toLocaleDateString('ja-JP');

  let traitsHtml = '';
  for (const key of traitKeys) {
    const percentage = result[key];
    const detail = getTraitDetail(key, percentage);
    const facetLabels = FACET_LABELS[key] || {};

    let facetHtml = '';
    if (facetScores[key]) {
      for (const [facetKey, pct] of Object.entries(facetScores[key] as Record<string, number>)) {
        const label = facetLabels[facetKey] || facetKey;
        facetHtml += `
          <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
            <span style="width:80px;font-size:11px;color:#555;">${label}</span>
            <div style="flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px;"></div>
            </div>
            <span style="width:30px;font-size:11px;text-align:right;color:#555;">${pct}%</span>
          </div>
        `;
      }
    }

    traitsHtml += `
      <div style="page-break-inside:avoid;margin-bottom:24px;border:1px solid #d1d5db;border-radius:12px;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="margin:0;font-size:16px;color:#1f2937;">${TRAIT_NAMES[key]}</h3>
          <span style="font-size:24px;font-weight:bold;color:#4f46e5;">${percentage}%</span>
        </div>
        <div style="height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;margin-bottom:16px;">
          <div style="width:${percentage}%;height:100%;background:linear-gradient(90deg,#3b82f6,#6366f1);border-radius:5px;"></div>
        </div>
        <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">${detail.title}</h4>
        <p style="font-size:12px;color:#4b5563;line-height:1.6;margin:0 0 12px;">${detail.description}</p>
        ${facetHtml ? `<div style="margin-bottom:12px;"><h5 style="font-size:12px;color:#6b7280;margin:0 0 6px;">ファセット分析</h5>${facetHtml}</div>` : ''}
        <div style="margin-bottom:8px;"><h5 style="font-size:12px;color:#059669;margin:0 0 4px;">強み</h5><ul style="margin:0;padding-left:16px;font-size:11px;color:#374151;">${detail.strengths.map((s: string) => `<li>${s}</li>`).join('')}</ul></div>
        <div style="margin-bottom:8px;"><h5 style="font-size:12px;color:#2563eb;margin:0 0 4px;">成長のヒント</h5><ul style="margin:0;padding-left:16px;font-size:11px;color:#374151;">${detail.growthTips.map((t: string) => `<li>${t}</li>`).join('')}</ul></div>
        <div><h5 style="font-size:12px;color:#7c3aed;margin:0 0 4px;">適した職業</h5><p style="font-size:11px;color:#374151;margin:0;">${detail.careers.join(' / ')}</p></div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans JP', sans-serif; color: #1f2937; margin: 0; padding: 0; }
</style></head>
<body>
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:28px;color:#4f46e5;margin:0 0 8px;">Big Five 性格診断レポート</h1>
    <p style="font-size:12px;color:#9ca3af;">診断日: ${createdAt} | テストタイプ: ${result.test_type === 'full' ? '本格版（50問）' : '簡易版（10問）'}</p>
  </div>

  ${result.mbti_code ? `
  <div style="text-align:center;background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:16px;padding:24px;color:white;margin-bottom:24px;">
    <p style="font-size:12px;margin:0 0 4px;opacity:0.8;">あなたのタイプ</p>
    <p style="font-size:36px;font-weight:bold;letter-spacing:4px;margin:0 0 4px;">${result.mbti_code}</p>
  </div>
  ` : ''}

  ${traitsHtml}

  <div style="text-align:center;font-size:10px;color:#9ca3af;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
    <p>集客メーカー Big Five 性格診断 | makers.tokyo</p>
    <p>本レポートは心理学的な Big Five 理論に基づく自己分析ツールです。医療的な診断ではありません。</p>
  </div>
</body></html>`;
}
