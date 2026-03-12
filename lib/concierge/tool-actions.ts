/**
 * AI応答からツールアクションマーカーを抽出するパーサー
 *
 * マーカー書式: [ACTION:id|label|url]
 * 例: [ACTION:profile|プロフィールLPを作る|/profile/editor?new]
 */

import type { ToolAction } from '@/components/concierge/types';

const ACTION_REGEX = /\[ACTION:([^|]+)\|([^|]+)\|([^\]]+)\]/g;

export interface ParsedResponse {
  /** ACTIONマーカーを除去したテキスト */
  text: string;
  /** 抽出されたツールアクション */
  actions: ToolAction[];
}

export function parseToolActions(rawText: string): ParsedResponse {
  const actions: ToolAction[] = [];

  const text = rawText.replace(ACTION_REGEX, (_, id, label, url) => {
    actions.push({
      id: id.trim(),
      label: label.trim(),
      url: url.trim(),
    });
    return '';
  }).replace(/\n{3,}/g, '\n\n').trim();

  return { text, actions };
}
