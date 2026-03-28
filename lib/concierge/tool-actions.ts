/**
 * AI応答からツールアクション・フォローアップ候補・お問い合わせマーカーを抽出するパーサー
 *
 * マーカー書式:
 *   [ACTION:id|label|url]  — ツールへのナビゲーションボタン
 *   [SUGGEST:テキスト]      — フォローアップ候補（クリックで送信）
 *   [CONTACT]              — お問い合わせ先カードを表示
 */

import type { ToolAction, ContactInfo, PlanCard, PlanStep } from '@/components/concierge/types';

const ACTION_REGEX = /\[ACTION:([^|]+)\|([^|]+)\|([^\]]+)\]/g;
const SUGGEST_REGEX = /\[SUGGEST:([^\]]+)\]/g;
const CONTACT_REGEX = /\[CONTACT\]/g;
const PLAN_REGEX = /\[PLAN:([^\]]+)\]/g;

export interface ParsedResponse {
  /** マーカーを除去したテキスト */
  text: string;
  /** 抽出されたツールアクション */
  actions: ToolAction[];
  /** 抽出されたフォローアップ候補 */
  suggestions: string[];
  /** お問い合わせ先を表示するかどうか */
  showContact: boolean;
  /** 集客プランカード */
  plan: PlanCard | null;
}

export function parseToolActions(rawText: string): ParsedResponse {
  const actions: ToolAction[] = [];
  const suggestions: string[] = [];
  let showContact = false;
  let plan: PlanCard | null = null;

  let text = rawText.replace(ACTION_REGEX, (_, id, label, url) => {
    actions.push({
      id: id.trim(),
      label: label.trim(),
      url: url.trim(),
    });
    return '';
  });

  // PLANマーカー: [PLAN:プラン名|toolId:説明|toolId:説明|...]
  text = text.replace(PLAN_REGEX, (_, content) => {
    const parts = content.split('|').map((p: string) => p.trim());
    if (parts.length >= 2) {
      const name = parts[0];
      const steps: PlanStep[] = [];
      for (let i = 1; i < parts.length; i++) {
        const colonIdx = parts[i].indexOf(':');
        if (colonIdx > 0) {
          steps.push({
            toolId: parts[i].slice(0, colonIdx).trim(),
            description: parts[i].slice(colonIdx + 1).trim(),
          });
        }
      }
      if (steps.length > 0) {
        plan = { name, steps };
      }
    }
    return '';
  });

  text = text.replace(SUGGEST_REGEX, (_, content) => {
    suggestions.push(content.trim());
    return '';
  });

  text = text.replace(CONTACT_REGEX, () => {
    showContact = true;
    return '';
  });

  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return { text, actions, suggestions, showContact, plan };
}
