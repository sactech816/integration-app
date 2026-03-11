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

export function buildReportSystemPrompt(): string {
  return `あなたは性格心理学の専門家です。Big Five（五因子モデル）に基づく性格診断の結果を分析し、
個別化された詳細なパーソナリティレポートを日本語で作成してください。

## 出力形式
- HTMLで出力してください（<html>タグ不要、本文の<div>から開始）
- インラインスタイルを使用してください（印刷対応のため）
- フォント: 'Noto Sans JP', sans-serif
- 見出しは大きめで分かりやすく
- 各セクションは視覚的に区切ってください
- レーダーチャートはSVGで埋め込んでください
- 全体で15ページ相当の充実した内容にしてください
- 色使い: メインカラー #3B82F6(青), サブ #6366F1(インディゴ), アクセント #8B5CF6(紫)

## レポートセクション構成
1. **エグゼクティブサマリー** — 性格の全体像を300文字程度で要約
2. **パーソナリティマップ** — 5特性のレーダーチャート（SVG）+ 簡潔な解説
3. **5特性の詳細分析** — 各特性のスコア解釈、ファセット分析、具体的な行動傾向
4. **行動パターンと傾向** — 日常生活での具体的な行動パターン
5. **強みと成長領域** — スコアに基づく個別化された強み・改善点
6. **キャリア適性と仕事スタイル** — 適職、理想的な職場環境、仕事の進め方
7. **人間関係とコミュニケーション** — 対人関係の傾向、コミュニケーションスタイル
8. **学習スタイルと自己開発ロードマップ** — 効果的な学習方法、3ヶ月の成長プラン

## 重要なルール
- スコアの数値に基づいた具体的な分析を行う（一般論を避ける）
- ファセットスコアの高低差にも言及し、特性内の矛盾や特徴を指摘する
- ポジティブかつ建設的なトーンを保ちつつ、正直な分析を行う
- MBTI風タイプとの関連も適宜言及する
- 「あなた」を主語にした親しみやすい文体で書く`;
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

  return `## 診断結果データ

### テストタイプ: ${result.testType === 'full' ? '本格診断（50問）' : '簡易診断（10問）'}

### MBTI風タイプ: ${mbti.code}（${mbti.name}）
${mbti.description}

次元スコア:
- E/I: ${mbti.dimensions.EI.value}（スコア: ${mbti.dimensions.EI.score}）
- S/N: ${mbti.dimensions.SN.value}（スコア: ${mbti.dimensions.SN.score}）
- T/F: ${mbti.dimensions.TF.value}（スコア: ${mbti.dimensions.TF.score}）
- J/P: ${mbti.dimensions.JP.value}（スコア: ${mbti.dimensions.JP.score}）

### Big Five スコア
${traitLines.join('\n')}

上記のデータに基づいて、個別化された詳細なパーソナリティレポートを作成してください。
特にファセットスコアの高低差に注目し、この人物ならではの特徴を深く分析してください。`;
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
