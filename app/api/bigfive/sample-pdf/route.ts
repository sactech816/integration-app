/**
 * Big Five サンプルPDF生成 — 認証不要
 * GET /api/bigfive/sample-pdf?type=INTJ
 */

import { NextRequest, NextResponse } from 'next/server';
import { FACET_LABELS } from '@/lib/bigfive/calculate';
import { getTraitDetail } from '@/lib/bigfive/trait-details';

const TRAIT_NAMES: Record<string, string> = {
  openness: '開放性',
  conscientiousness: '誠実性',
  extraversion: '外向性',
  agreeableness: '協調性',
  neuroticism: '情緒安定性',
};

// 4タイプ分のサンプルデータ（リアルなスコア設定）
const SAMPLE_DATA: Record<string, {
  mbti_code: string;
  mbti_name: string;
  traits: Record<string, number>;
  facets: Record<string, Record<string, number>>;
}> = {
  INTJ: {
    mbti_code: 'INTJ',
    mbti_name: '建築家',
    traits: {
      openness: 82,
      conscientiousness: 78,
      extraversion: 28,
      agreeableness: 38,
      neuroticism: 35,
    },
    facets: {
      openness: { imagination: 88, artistic_interests: 75, emotionality: 62, adventurousness: 80, intellect: 92, liberalism: 78 },
      conscientiousness: { self_efficacy: 85, orderliness: 82, dutifulness: 70, achievement_striving: 88, self_discipline: 75, cautiousness: 68 },
      extraversion: { friendliness: 35, gregariousness: 22, assertiveness: 55, activity_level: 40, excitement_seeking: 25, cheerfulness: 30 },
      agreeableness: { trust: 40, morality: 55, altruism: 35, cooperation: 30, modesty: 42, sympathy: 38 },
      neuroticism: { anxiety: 40, anger: 30, depression: 28, self_consciousness: 42, immoderation: 25, vulnerability: 35 },
    },
  },
  ENFP: {
    mbti_code: 'ENFP',
    mbti_name: '広報運動家',
    traits: {
      openness: 88,
      conscientiousness: 42,
      extraversion: 82,
      agreeableness: 72,
      neuroticism: 55,
    },
    facets: {
      openness: { imagination: 92, artistic_interests: 85, emotionality: 88, adventurousness: 90, intellect: 80, liberalism: 85 },
      conscientiousness: { self_efficacy: 55, orderliness: 30, dutifulness: 40, achievement_striving: 58, self_discipline: 35, cautiousness: 32 },
      extraversion: { friendliness: 88, gregariousness: 80, assertiveness: 72, activity_level: 85, excitement_seeking: 82, cheerfulness: 90 },
      agreeableness: { trust: 75, morality: 68, altruism: 82, cooperation: 65, modesty: 60, sympathy: 80 },
      neuroticism: { anxiety: 60, anger: 45, depression: 48, self_consciousness: 65, immoderation: 62, vulnerability: 55 },
    },
  },
  ISTJ: {
    mbti_code: 'ISTJ',
    mbti_name: '管理者',
    traits: {
      openness: 32,
      conscientiousness: 88,
      extraversion: 35,
      agreeableness: 55,
      neuroticism: 30,
    },
    facets: {
      openness: { imagination: 28, artistic_interests: 35, emotionality: 30, adventurousness: 25, intellect: 42, liberalism: 28 },
      conscientiousness: { self_efficacy: 90, orderliness: 92, dutifulness: 88, achievement_striving: 85, self_discipline: 90, cautiousness: 82 },
      extraversion: { friendliness: 42, gregariousness: 28, assertiveness: 45, activity_level: 38, excitement_seeking: 22, cheerfulness: 35 },
      agreeableness: { trust: 52, morality: 72, altruism: 48, cooperation: 58, modesty: 55, sympathy: 45 },
      neuroticism: { anxiety: 32, anger: 25, depression: 22, self_consciousness: 35, immoderation: 20, vulnerability: 28 },
    },
  },
  INFJ: {
    mbti_code: 'INFJ',
    mbti_name: '提唱者',
    traits: {
      openness: 78,
      conscientiousness: 72,
      extraversion: 32,
      agreeableness: 80,
      neuroticism: 52,
    },
    facets: {
      openness: { imagination: 85, artistic_interests: 80, emotionality: 82, adventurousness: 65, intellect: 78, liberalism: 75 },
      conscientiousness: { self_efficacy: 75, orderliness: 68, dutifulness: 78, achievement_striving: 80, self_discipline: 70, cautiousness: 65 },
      extraversion: { friendliness: 45, gregariousness: 22, assertiveness: 35, activity_level: 30, excitement_seeking: 28, cheerfulness: 38 },
      agreeableness: { trust: 72, morality: 88, altruism: 85, cooperation: 78, modesty: 75, sympathy: 82 },
      neuroticism: { anxiety: 58, anger: 42, depression: 50, self_consciousness: 60, immoderation: 45, vulnerability: 55 },
    },
  },
};

export const SAMPLE_TYPES = Object.keys(SAMPLE_DATA);

export async function GET(request: NextRequest) {
  const type = new URL(request.url).searchParams.get('type')?.toUpperCase();

  if (!type || !SAMPLE_DATA[type]) {
    return NextResponse.json(
      { error: `有効なタイプを指定してください: ${SAMPLE_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  const sample = SAMPLE_DATA[type];
  const html = generateSamplePdfHtml(sample);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function generateSamplePdfHtml(sample: typeof SAMPLE_DATA[string]): string {
  const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const traitEmojis: Record<string, string> = {
    openness: '🎨', conscientiousness: '🎯', extraversion: '🌟', agreeableness: '🤝', neuroticism: '🧘',
  };

  let traitsHtml = '';
  for (const key of traitKeys) {
    const percentage = sample.traits[key];
    const detail = getTraitDetail(key, percentage);
    const facetLabels = FACET_LABELS[key] || {};

    let facetHtml = '';
    if (sample.facets[key]) {
      for (const [facetKey, pct] of Object.entries(sample.facets[key])) {
        const label = facetLabels[facetKey] || facetKey;
        facetHtml += `
          <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
            <span style="width:90px;font-size:11px;color:#555;">${label}</span>
            <div style="flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px;"></div>
            </div>
            <span style="width:32px;font-size:11px;text-align:right;color:#555;">${pct}%</span>
          </div>
        `;
      }
    }

    traitsHtml += `
      <div style="page-break-inside:avoid;margin-bottom:24px;border:1px solid #d1d5db;border-radius:12px;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="margin:0;font-size:16px;color:#1f2937;">${traitEmojis[key]} ${TRAIT_NAMES[key]}</h3>
          <span style="font-size:24px;font-weight:bold;color:#4f46e5;">${percentage}%</span>
        </div>
        <div style="height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;margin-bottom:16px;">
          <div style="width:${percentage}%;height:100%;background:linear-gradient(90deg,#3b82f6,#6366f1);border-radius:5px;"></div>
        </div>
        <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">${detail.title}</h4>
        <p style="font-size:12px;color:#4b5563;line-height:1.7;margin:0 0 12px;">${detail.description}</p>
        ${facetHtml ? `<div style="margin-bottom:12px;"><h5 style="font-size:12px;color:#6b7280;margin:0 0 6px;">ファセット分析</h5>${facetHtml}</div>` : ''}
        <div style="margin-bottom:8px;"><h5 style="font-size:12px;color:#059669;margin:0 0 4px;">✅ 強み</h5><ul style="margin:0;padding-left:16px;font-size:11px;color:#374151;line-height:1.6;">${detail.strengths.map((s: string) => `<li>${s}</li>`).join('')}</ul></div>
        <div style="margin-bottom:8px;"><h5 style="font-size:12px;color:#2563eb;margin:0 0 4px;">💡 成長のヒント</h5><ul style="margin:0;padding-left:16px;font-size:11px;color:#374151;line-height:1.6;">${detail.growthTips.map((t: string) => `<li>${t}</li>`).join('')}</ul></div>
        <div><h5 style="font-size:12px;color:#7c3aed;margin:0 0 4px;">💼 適した職業</h5><p style="font-size:11px;color:#374151;margin:0;">${detail.careers.join(' / ')}</p></div>
      </div>
    `;
  }

  // レーダーチャート SVG
  const radarSvg = generateRadarChart(sample.traits);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Big Five 性格診断サンプルレポート — ${sample.mbti_code}（${sample.mbti_name}）</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans JP', sans-serif; color: #1f2937; margin: 0; padding: 24px; max-width: 800px; margin: 0 auto; background: #f9fafb; }
  @media print {
    body { background: white; padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
  <div class="no-print" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
    <p style="margin:0;font-size:14px;color:#92400e;font-weight:bold;">📋 これはサンプルレポートです</p>
    <p style="margin:4px 0 0;font-size:12px;color:#a16207;">実際の診断を受けると、あなた専用のパーソナライズされたレポートが生成されます</p>
  </div>

  <div style="text-align:center;margin-bottom:32px;">
    <p style="font-size:11px;color:#6366f1;font-weight:bold;letter-spacing:2px;margin:0 0 4px;">BIG FIVE PERSONALITY REPORT</p>
    <h1 style="font-size:28px;color:#1f2937;margin:0 0 8px;">Big Five 性格診断レポート</h1>
    <p style="font-size:12px;color:#9ca3af;">サンプルデータ | テストタイプ: 本格版（50問）</p>
  </div>

  <div style="text-align:center;background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:16px;padding:28px;color:white;margin-bottom:28px;">
    <p style="font-size:12px;margin:0 0 4px;opacity:0.8;">パーソナリティタイプ</p>
    <p style="font-size:42px;font-weight:900;letter-spacing:6px;margin:0 0 4px;">${sample.mbti_code}</p>
    <p style="font-size:18px;font-weight:500;margin:0;opacity:0.9;">${sample.mbti_name}</p>
  </div>

  <div style="text-align:center;margin-bottom:32px;">
    ${radarSvg}
  </div>

  ${traitsHtml}

  <div style="text-align:center;font-size:10px;color:#9ca3af;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
    <p style="margin:0 0 4px;">集客メーカー Big Five 性格診断 | makers.tokyo</p>
    <p style="margin:0;">本レポートは心理学的な Big Five 理論に基づく自己分析ツールです。医療的な診断ではありません。</p>
  </div>
</body></html>`;
}

function generateRadarChart(traits: Record<string, number>): string {
  const labels = ['開放性', '誠実性', '外向性', '協調性', '情緒安定性'];
  const keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const cx = 150, cy = 150, r = 110;
  const angles = keys.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);

  // グリッド線
  let gridLines = '';
  for (const scale of [0.2, 0.4, 0.6, 0.8, 1.0]) {
    const pts = angles.map(a => `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`).join(' ');
    gridLines += `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
  }

  // 軸線
  let axisLines = '';
  for (const a of angles) {
    axisLines += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="#d1d5db" stroke-width="1"/>`;
  }

  // データ
  const dataPoints = keys.map((key, i) => {
    const val = traits[key] / 100;
    return `${cx + r * val * Math.cos(angles[i])},${cy + r * val * Math.sin(angles[i])}`;
  }).join(' ');

  // ラベル
  let labelTexts = '';
  for (let i = 0; i < 5; i++) {
    const lx = cx + (r + 24) * Math.cos(angles[i]);
    const ly = cy + (r + 24) * Math.sin(angles[i]);
    const anchor = i === 0 ? 'middle' : i < 3 ? 'start' : 'end';
    labelTexts += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle" font-size="11" fill="#4b5563" font-weight="500">${labels[i]} ${traits[keys[i]]}%</text>`;
  }

  return `<svg width="300" height="300" viewBox="0 0 300 300" style="display:inline-block;">
    ${gridLines}${axisLines}
    <polygon points="${dataPoints}" fill="rgba(99,102,241,0.2)" stroke="#6366f1" stroke-width="2"/>
    ${keys.map((key, i) => {
      const val = traits[key] / 100;
      return `<circle cx="${cx + r * val * Math.cos(angles[i])}" cy="${cy + r * val * Math.sin(angles[i])}" r="4" fill="#6366f1"/>`;
    }).join('')}
    ${labelTexts}
  </svg>`;
}
