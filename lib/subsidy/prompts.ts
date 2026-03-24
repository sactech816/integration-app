// =============================================
// 補助金申請書AI生成用プロンプト
// =============================================

import type { BusinessInfo, ApplicationSectionDef } from './types';

/**
 * 申請書セクション生成用のシステムプロンプト
 */
export function getSystemPrompt(): string {
  return `あなたは中小企業の補助金申請を支援する専門コンサルタントです。
以下のルールに従って、補助金申請書のセクションを生成してください。

【文体ルール】
- 「です・ます」調の正式なビジネス文書スタイル
- 具体的な数値・期間・固有名詞を含める
- 審査員が評価しやすい構造的な文章（箇条書きと段落の組み合わせ）
- 楽観的すぎず、根拠のある計画を記述

【出力形式】
- HTML形式で出力（<h3>, <p>, <ul>, <li>, <strong>, <table>, <tr>, <td>タグを使用）
- 見出しは<h3>タグ、段落は<p>タグ
- 重要語句は<strong>で強調
- 1セクション1500〜3000文字程度

【注意事項】
- ユーザーの事業情報をもとに、可能な限り具体的に記述する
- 不足情報は合理的に推測して補完し、「〇〇（具体的な数値を記入）」のようなプレースホルダを適宜残す
- 補助金の審査基準を意識した記述を心がける`;
}

/**
 * セクション生成用のユーザープロンプトを構築
 */
export function buildSectionPrompt(
  businessInfo: BusinessInfo,
  subsidyName: string,
  section: ApplicationSectionDef,
  allSections: ApplicationSectionDef[]
): string {
  const businessContext = `
【事業者情報】
- 業種: ${businessInfo.industry}
- 従業員数: ${businessInfo.employeeCount}人
- 年間売上: ${businessInfo.annualRevenue}
- 事業年数: ${businessInfo.yearsInBusiness}
- 法人形態: ${businessInfo.corporationType}
- 所在地: ${businessInfo.prefecture}
- 事業概要: ${businessInfo.businessDescription}
- IT導入予定: ${businessInfo.hasItPlan ? 'あり' : 'なし'}
- 設備投資予定: ${businessInfo.hasEquipmentPlan ? 'あり' : 'なし'}
- 小規模事業者: ${businessInfo.isSmallBusiness ? 'はい' : 'いいえ'}`;

  const sectionList = allSections
    .map((s, i) => `${i + 1}. ${s.title}${s.key === section.key ? ' ← 今回生成するセクション' : ''}`)
    .join('\n');

  return `以下の補助金申請書のセクションを生成してください。

【対象補助金】${subsidyName}

${businessContext}

【申請書の全体構成】
${sectionList}

【今回生成するセクション】
タイトル: ${section.title}
説明: ${section.description}

上記の事業者情報をもとに、「${section.title}」セクションの内容をHTML形式で生成してください。`;
}

/**
 * 全セクション一括生成用のプロンプト
 */
export function buildFullReportPrompt(
  businessInfo: BusinessInfo,
  subsidyName: string,
  sections: ApplicationSectionDef[]
): string {
  const businessContext = `
【事業者情報】
- 業種: ${businessInfo.industry}
- 従業員数: ${businessInfo.employeeCount}人
- 年間売上: ${businessInfo.annualRevenue}
- 事業年数: ${businessInfo.yearsInBusiness}
- 法人形態: ${businessInfo.corporationType}
- 所在地: ${businessInfo.prefecture}
- 事業概要: ${businessInfo.businessDescription}
- IT導入予定: ${businessInfo.hasItPlan ? 'あり' : 'なし'}
- 設備投資予定: ${businessInfo.hasEquipmentPlan ? 'あり' : 'なし'}
- 小規模事業者: ${businessInfo.isSmallBusiness ? 'はい' : 'いいえ'}`;

  const sectionDefs = sections
    .map((s, i) => `${i + 1}. ${s.title}: ${s.description}`)
    .join('\n');

  return `以下の補助金申請書の全セクションを生成してください。

【対象補助金】${subsidyName}

${businessContext}

【生成するセクション】
${sectionDefs}

各セクションをJSON配列形式で出力してください。
各要素は { "key": "セクションキー", "title": "タイトル", "content": "HTML内容" } の形式です。

出力形式:
\`\`\`json
[
  { "key": "...", "title": "...", "content": "<h3>...</h3><p>...</p>" },
  ...
]
\`\`\`

全セクションを一貫した内容で生成し、セクション間で矛盾がないようにしてください。`;
}
