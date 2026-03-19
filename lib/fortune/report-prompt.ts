/**
 * Fortune プレミアムレポート — AIプロンプトテンプレート
 */

import type { FortuneResult } from './calculation';
import { STAR_INFO } from './nine-star';
import type { NineStar } from './nine-star';

interface DetailedContent {
  personality?: {
    strengths?: string[];
    weaknesses?: string[];
    career?: string;
    love?: string;
    money?: string;
  };
  compatibility?: {
    best?: string[];
    good?: string[];
    avoid?: string[];
  };
  lucky_items?: {
    colors?: string[];
    directions?: string[];
    numbers?: number[];
    items?: string[];
    stones?: string[];
  };
  life_advice?: {
    work?: string;
    health?: string;
    wealth?: string;
    relationships?: string;
  };
}

interface FortuneContentRow {
  result_key: string;
  title: string;
  content_md: string | null;
  category: string;
  detailed_content: DetailedContent | null;
}

export function buildFortuneReportSystemPrompt(): string {
  return `あなたは東洋占術と西洋占術の専門家です。九星気学・数秘術・四柱推命の3つの占術に基づく鑑定結果を分析し、
個別化された詳細な運勢鑑定レポートを日本語で作成してください。

## 出力形式
- HTMLで出力してください（<html>タグ不要、本文の<div>から開始）
- インラインスタイルを使用してください（印刷対応のため）
- フォント: 'Noto Sans JP', sans-serif
- 見出しは大きめで分かりやすく
- 各セクションは視覚的に区切ってください
- 色使い: メインカラー #4F46E5(インディゴ), サブ #7C3AED(紫), アクセント #EC4899(ピンク)
- 全体で10〜15ページ相当の充実した内容にしてください

## 印刷・PDF保存対応のHTML構造ルール（重要）
ユーザーがブラウザの印刷機能でPDF保存する際に、内容が途中で切れないようにする。
- 各大セクション（章）の開始divに style="page-break-before: always;" を付ける（最初のセクションは除く）
- 各小セクション（カード、ボックス等）を囲むdivに style="break-inside: avoid;" を付ける
- 見出し（h2, h3）にインラインで style="break-after: avoid;" を付与する
- テーブルやリストを囲むdivにも style="break-inside: avoid;" を付ける
- SVGチャートを囲むdivにも style="break-inside: avoid;" を付ける
- 背景色のある要素には print-color-adjust: exact; -webkit-print-color-adjust: exact; を追加する

## レポートセクション構成
1. **総合鑑定サマリー** — 3占術を統合した全体像（300文字程度）
2. **九星気学 詳細鑑定** — 本命星・月命星の解説、同会星・傾斜星の影響、吉方位、ラッキーカラー
3. **数秘術 ライフパス分析** — ライフパスナンバーの深い意味、人生の使命、才能と課題
4. **四柱推命 日干分析** — 日干の本質、五行バランス、性格特性
5. **総合性格分析** — 3占術の結果を統合した性格プロファイル（強み・弱み・傾向）
6. **人間関係・相性傾向** — 相性の良いタイプ、注意すべきタイプ、恋愛・友人・仕事の関係性
7. **開運アドバイス** — ラッキーカラー・方位・数字・アイテム・パワーストーンの総合ガイド
8. **人生指南** — 仕事運・健康運・金運・対人運の詳細アドバイス
9. **月別運勢ガイド** — 各月の注意点と好機のタイミング（九星の月盤を参考に）
10. **まとめと行動プラン** — 具体的なアクションアイテム3〜5個

## 重要なルール
- 鑑定データに基づいた具体的な分析を行う（一般論を避ける）
- 温かく前向きなトーンを保ちつつ、正直な分析を行う
- 「あなた」を主語にした親しみやすい文体で書く
- 3つの占術の結果が整合する点、矛盾する点の両方に言及する
- 各セクションにはアイコンや装飾的な要素を適度に含める`;
}

export function buildFortuneReportUserPrompt(
  result: FortuneResult,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  contents: FortuneContentRow[]
): string {
  const yearStar = STAR_INFO[result.nineStar.year as NineStar];
  const monthStar = STAR_INFO[result.nineStar.month as NineStar];

  // コンテンツマップを作成
  const contentMap: Record<string, FortuneContentRow> = {};
  for (const c of contents) {
    contentMap[c.result_key] = c;
  }

  const yearContent = contentMap[result.nineStar.year];
  const monthContent = contentMap[result.nineStar.month];
  const lpContent = contentMap[result.numerology.lifePath];
  const stemContent = contentMap[result.fourPillars.heavenlyStem];

  let prompt = `## 鑑定対象
生年月日: ${birthYear}年${birthMonth}月${birthDay}日

## 九星気学
本命星: ${yearStar?.name || result.nineStar.year}
月命星: ${monthStar?.name || result.nineStar.month}`;

  if (result.nineStar.doukai) {
    const doukaiStar = STAR_INFO[result.nineStar.doukai as NineStar];
    prompt += `\n同会星: ${doukaiStar?.name || result.nineStar.doukai}`;
  }
  if (result.nineStar.keisha) {
    const keishaStar = STAR_INFO[result.nineStar.keisha as NineStar];
    prompt += `\n傾斜星: ${keishaStar?.name || result.nineStar.keisha}`;
  }
  if (result.nineStar.luckyDirections && result.nineStar.luckyDirections.length > 0) {
    const dirs = result.nineStar.luckyDirections.map(d => STAR_INFO[d as NineStar]?.name || d).join('、');
    prompt += `\n最大吉方: ${dirs}`;
  }

  if (yearContent?.content_md) {
    prompt += `\n\n### 本命星の解説:\n${yearContent.content_md}`;
  }
  if (yearContent?.detailed_content) {
    prompt += `\n\n### 本命星の詳細データ:\n${JSON.stringify(yearContent.detailed_content, null, 2)}`;
  }
  if (monthContent?.detailed_content) {
    prompt += `\n\n### 月命星の詳細データ:\n${JSON.stringify(monthContent.detailed_content, null, 2)}`;
  }

  prompt += `\n\n## 数秘術
ライフパスナンバー: ${lpContent?.title || result.numerology.lifePath}`;
  if (lpContent?.content_md) {
    prompt += `\n\n### ライフパスの解説:\n${lpContent.content_md}`;
  }
  if (lpContent?.detailed_content) {
    prompt += `\n\n### ライフパスの詳細データ:\n${JSON.stringify(lpContent.detailed_content, null, 2)}`;
  }

  prompt += `\n\n## 四柱推命
日干: ${stemContent?.title || result.fourPillars.heavenlyStem}
干支番号: ${result.fourPillars.sexagenaryCycle}`;
  if (stemContent?.content_md) {
    prompt += `\n\n### 日干の解説:\n${stemContent.content_md}`;
  }
  if (stemContent?.detailed_content) {
    prompt += `\n\n### 日干の詳細データ:\n${JSON.stringify(stemContent.detailed_content, null, 2)}`;
  }

  prompt += `\n\n上記の鑑定データに基づいて、3つの占術を統合した個別化された詳細な運勢鑑定レポートを作成してください。
特に、3占術の結果が示す共通点と独自の洞察を丁寧に分析してください。`;

  return prompt;
}
