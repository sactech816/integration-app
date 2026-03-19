// =============================================================================
// Big Five プレミアムレポート — AIプロンプトテンプレート
// =============================================================================

import type { BigFiveResult } from './calculate';
import { getTraitDetail } from './trait-details';

const TRAIT_NAMES: Record<string, string> = {
  openness: '開放性',
  conscientiousness: '誠実性',
  extraversion: '外向性',
  agreeableness: '協調性',
  neuroticism: '神経症傾向',
};

const LEVEL_LABELS: Record<string, string> = {
  very_low: '非常に低い',
  low: '低い',
  medium: '中程度',
  high: '高い',
  very_high: '非常に高い',
};

// =============================================================================
// レポート生成プロンプト
// =============================================================================

export function buildReportSystemPrompt(testType: string = 'full'): string {
  const baseRules = `あなたは性格心理学の専門家です。Big Five（五因子モデル）に基づく性格診断の結果を分析し、
個別化された詳細なパーソナリティレポートを日本語で作成してください。

## 出力形式
- HTMLで出力してください（<html>タグ不要、本文の<div>から開始）
- インラインスタイルを使用してください（印刷対応のため）
- フォント: 'Noto Sans JP', sans-serif
- 見出しは大きめで分かりやすく
- 各セクションは視覚的に区切ってください
- レーダーチャートはSVGで埋め込んでください
- 色使い: メインカラー #3B82F6(青), サブ #6366F1(インディゴ), アクセント #8B5CF6(紫)

## 印刷・PDF保存対応のHTML構造ルール（重要）
ユーザーがブラウザの印刷機能でPDF保存する際に、内容が途中で切れないようにする。
- 各大セクション（章）の開始divに style="page-break-before: always;" を付ける（最初のセクションは除く）
- 各小セクション（カード、ボックス等）を囲むdivに style="break-inside: avoid;" を付ける
- 見出し（h2, h3）にインラインで style="break-after: avoid;" を付与する
- テーブルやリストを囲むdivにも style="break-inside: avoid;" を付ける
- SVGチャート（レーダーチャート等）を囲むdivにも style="break-inside: avoid;" を付ける
- 背景色のある要素には print-color-adjust: exact; -webkit-print-color-adjust: exact; を追加する`;

  const commonRules = `
## 重要なルール
- スコアの数値に基づいた具体的な分析を行う（一般論を避ける）
- ポジティブかつ建設的なトーンを保ちつつ、正直な分析を行う
- 16パーソナリティタイプとの関連も適宜言及する
- 「あなた」を主語にした親しみやすい文体で書く`;

  if (testType === 'simple') {
    return `${baseRules}
- 全体で5〜8ページ相当の内容にしてください

## レポートセクション構成（簡易診断）
1. **エグゼクティブサマリー** — 性格の全体像を200文字程度で要約
2. **パーソナリティマップ** — 5特性のレーダーチャート（SVG）+ 簡潔な解説
3. **5特性の分析** — 各特性のスコア解釈と主な行動傾向
4. **16パーソナリティタイプ分析** — タイプの特徴、強み、コミュニケーションスタイル
5. **DISC行動スタイル分析** — DISCプロファイルの解説と仕事での活かし方
6. **強みと成長のヒント** — 主な強みと簡潔な成長アドバイス
7. **キャリアと人間関係の傾向** — 適職傾向と対人関係のポイント
${commonRules}`;
  }

  if (testType === 'detailed') {
    return `${baseRules}
- 全体で25〜30ページ相当の非常に充実した内容にしてください

## レポートセクション構成（詳細診断 — Big Five + エニアグラム完全版）
1. **エグゼクティブサマリー** — 性格の全体像を500文字程度で包括的に要約
2. **パーソナリティマップ** — 5特性のレーダーチャート（SVG）+ エニアグラムマップ + 総合解説
3. **5特性の詳細分析** — 各特性のスコア解釈、30ファセットすべての詳細分析、具体的な行動傾向、特性間の相互作用
4. **30ファセット クロス分析** — ファセット間の相関パターン、矛盾する傾向の深掘り、ユニークな性格パターンの特定
5. **16パーソナリティタイプ深層分析** — タイプの詳細解説、認知機能スタック、発達段階、ストレス時の変容
6. **DISC行動スタイル詳細分析** — DISCプロファイル、4スコアの詳細解釈、チーム内での役割、リーダーシップスタイル
7. **エニアグラム総合分析** — メインタイプの深層心理、ウィングの影響、トライアド分析（本能・感情・思考）、統合と分裂の方向、ストレス反応パターン
8. **Big Five × エニアグラム統合分析** — 二つのフレームワークを組み合わせた多角的人格理解
9. **行動パターンと深層心理** — 日常の行動パターン、無意識の動機、価値観の優先順位
10. **強みと成長領域** — 詳細な強み分析、成長のための具体的戦略
11. **キャリア適性と仕事スタイル** — 適職リスト、理想の職場環境、マネジメントスタイル、キャリアパス提案
12. **人間関係とコミュニケーション** — 恋愛・友人・職場それぞれの関係パターン、衝突スタイル、愛情表現
13. **ストレス管理とウェルビーイング** — ストレス要因、回復パターン、メンタルヘルスの傾向
14. **学習スタイルと自己開発ロードマップ** — 効果的な学習方法、6ヶ月の段階的成長プラン
${commonRules}
- ファセットスコアの高低差にも言及し、特性内の矛盾や特徴を指摘する
- エニアグラムとBig Fiveの結果を相互参照し、多層的な分析を行う
- エニアグラムの成長（統合）と後退（分裂）の方向について具体的にアドバイスする`;
  }

  // default: 'full' (本格診断)
  return `${baseRules}
- 全体で15ページ相当の充実した内容にしてください

## レポートセクション構成（本格診断）
1. **エグゼクティブサマリー** — 性格の全体像を300文字程度で要約
2. **パーソナリティマップ** — 5特性のレーダーチャート（SVG）+ 簡潔な解説
3. **5特性の詳細分析** — 各特性のスコア解釈、ファセット分析、具体的な行動傾向
4. **16パーソナリティタイプ分析** — タイプの詳細特徴、認知機能、ストレス時の傾向
5. **DISC行動スタイル分析** — DISCプロファイルの詳細解説、チーム内での役割
6. **行動パターンと傾向** — 日常生活での具体的な行動パターン
7. **強みと成長領域** — スコアに基づく個別化された強み・改善点
8. **キャリア適性と仕事スタイル** — 適職、理想的な職場環境、仕事の進め方
9. **人間関係とコミュニケーション** — 対人関係の傾向、コミュニケーションスタイル
10. **学習スタイルと自己開発ロードマップ** — 効果的な学習方法、3ヶ月の成長プラン
${commonRules}
- ファセットスコアの高低差にも言及し、特性内の矛盾や特徴を指摘する`;
}

export function buildReportUserPrompt(result: BigFiveResult): string {
  const traitLines: string[] = [];

  for (const [key, trait] of Object.entries(result.traits)) {
    const name = TRAIT_NAMES[key] || key;
    const level = LEVEL_LABELS[trait.level] || trait.level;
    const detail = getTraitDetail(key, trait.percentage);

    let line = `### ${name}: ${trait.percentage}%（${level}）\n`;
    line += `タイプ: ${detail.title}\n`;

    // ファセット情報
    if (trait.facets.length > 0) {
      line += 'ファセット:\n';
      for (const facet of trait.facets) {
        line += `  - ${facet.label}: ${facet.percentage}%\n`;
      }
    }

    traitLines.push(line);
  }

  const mbti = result.mbtiType;
  const disc = result.discType;

  const testTypeLabel = result.testType === 'detailed'
    ? '詳細診断（145問 — Big Five 100問 + エニアグラム 45問）'
    : result.testType === 'full'
    ? '本格診断（50問）'
    : '簡易診断（10問）';

  let prompt = `## 診断結果データ

### テストタイプ: ${testTypeLabel}

### 16パーソナリティタイプ: ${mbti.code}（${mbti.name}）
${mbti.description}

次元スコア:
- E/I: ${mbti.dimensions.EI.value}（スコア: ${mbti.dimensions.EI.score}）
- S/N: ${mbti.dimensions.SN.value}（スコア: ${mbti.dimensions.SN.score}）
- T/F: ${mbti.dimensions.TF.value}（スコア: ${mbti.dimensions.TF.score}）
- J/P: ${mbti.dimensions.JP.value}（スコア: ${mbti.dimensions.JP.score}）

### DISC行動スタイル: ${disc.name}
プライマリ: ${disc.primary} / セカンダリ: ${disc.secondary}
スコア: D=${disc.scores.D}, I=${disc.scores.I}, S=${disc.scores.S}, C=${disc.scores.C}
${disc.description}

### Big Five スコア
${traitLines.join('\n')}`;

  // エニアグラム情報（詳細診断のみ）
  if (result.testType === 'detailed' && (result as any).enneagramType) {
    const enneagram = (result as any).enneagramType;
    prompt += `\n### エニアグラム
メインタイプ: タイプ${enneagram.type}（${enneagram.name}）
ウィング: ${enneagram.wing}
トライアド: ${enneagram.triad}
${enneagram.description || ''}

各タイプスコア:
${enneagram.scores ? Object.entries(enneagram.scores).map(([t, s]) => `- タイプ${t}: ${s}%`).join('\n') : ''}`;
  }

  prompt += `\n\n上記のデータに基づいて、個別化された詳細なパーソナリティレポートを作成してください。`;

  if (result.testType === 'simple') {
    prompt += `\n簡易診断の結果ですが、5特性のバランスとDISCスタイル、16パーソナリティタイプを組み合わせた実用的な分析を行ってください。`;
  } else if (result.testType === 'detailed') {
    prompt += `\n詳細診断の結果です。30ファセットの詳細分析に加え、エニアグラムとBig Fiveを統合した多角的な深層分析を行ってください。エニアグラムの成長方向と後退方向についても具体的に言及してください。`;
  } else {
    prompt += `\n特にファセットスコアの高低差に注目し、この人物ならではの特徴を深く分析してください。`;
  }

  return prompt;
}

// =============================================================================
// チャットアシスタント用プロンプト
// =============================================================================

export function buildChatSystemPrompt(result: BigFiveResult): string {
  const traitSummary: string[] = [];

  for (const [key, trait] of Object.entries(result.traits)) {
    const name = TRAIT_NAMES[key] || key;
    const level = LEVEL_LABELS[trait.level] || trait.level;
    traitSummary.push(`${name}: ${trait.percentage}%（${level}）`);
  }

  // 最高・最低ファセットを抽出
  const allFacets: { trait: string; name: string; label: string; percentage: number }[] = [];
  for (const [traitKey, trait] of Object.entries(result.traits)) {
    for (const facet of trait.facets) {
      allFacets.push({
        trait: TRAIT_NAMES[traitKey] || traitKey,
        name: facet.name,
        label: facet.label,
        percentage: facet.percentage,
      });
    }
  }
  allFacets.sort((a, b) => b.percentage - a.percentage);
  const top3 = allFacets.slice(0, 3);
  const bottom3 = allFacets.slice(-3).reverse();

  return `あなたは「パーソナリティメンター」として、ユーザーの自己理解を深めるための対話を行います。

## あなたのロール
- 温かく、洞察力のある性格心理学の専門メンター
- ユーザーの質問に対して、性格診断の結果に基づいた具体的なアドバイスを提供
- 指示的ではなく、対話を通じてユーザー自身が気づきを得られるようガイド
- 日本語で、親しみやすく丁寧な口調で話す

## ユーザーの性格プロファイル
MBTI風タイプ: ${result.mbtiType.code}（${result.mbtiType.name}）

Big Five スコア:
${traitSummary.map(s => `- ${s}`).join('\n')}

特に高いファセット:
${top3.map(f => `- ${f.trait} > ${f.label}: ${f.percentage}%`).join('\n')}

特に低いファセット:
${bottom3.map(f => `- ${f.trait} > ${f.label}: ${f.percentage}%`).join('\n')}

## 対話のルール
- 回答は200〜400文字程度で簡潔に
- 常にユーザーのスコアデータに基づいて具体的に回答する
- 一般論ではなく、このユーザーに特化したアドバイスを提供
- 必要に応じて質問を返し、対話を深める
- キャリア、人間関係、自己成長、ストレス管理など幅広い質問に対応
- 診断結果の説明を求められたら、分かりやすく解説する`;
}
