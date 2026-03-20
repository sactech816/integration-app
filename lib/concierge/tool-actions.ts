/**
 * AI応答からツールアクション・フォローアップ候補・お問い合わせマーカーを抽出するパーサー
 *
 * マーカー書式:
 *   [ACTION:id|label|url]  — ツールへのナビゲーションボタン
 *   [SUGGEST:テキスト]      — フォローアップ候補（クリックで送信）
 *   [CONTACT]              — お問い合わせ先カードを表示
 */

import type { ToolAction, ContactInfo } from '@/components/concierge/types';

const ACTION_REGEX = /\[ACTION:([^|]+)\|([^|]+)\|([^\]]+)\]/g;
const SUGGEST_REGEX = /\[SUGGEST:([^\]]+)\]/g;
const CONTACT_REGEX = /\[CONTACT\]/g;

export interface ParsedResponse {
  /** マーカーを除去したテキスト */
  text: string;
  /** 抽出されたツールアクション */
  actions: ToolAction[];
  /** 抽出されたフォローアップ候補 */
  suggestions: string[];
  /** お問い合わせ先を表示するかどうか */
  showContact: boolean;
}

export function parseToolActions(rawText: string): ParsedResponse {
  const actions: ToolAction[] = [];
  const suggestions: string[] = [];
  let showContact = false;

  let text = rawText.replace(ACTION_REGEX, (_, id, label, url) => {
    actions.push({
      id: id.trim(),
      label: label.trim(),
      url: url.trim(),
    });
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

  return { text, actions, suggestions, showContact };
}
