'use client';

import ConciergeToolButton from './ConciergeToolButton';
import type { ConciergeMessage } from './types';

interface ConciergeBubbleProps {
  message: ConciergeMessage;
  isLast?: boolean;
  onNavigate?: () => void;
  onSend?: (text: string) => void;
}

/** マークダウン記号をプレーンテキストに変換 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')       // *italic*
    .replace(/__(.+?)__/g, '$1')       // __bold__
    .replace(/_(.+?)_/g, '$1')         // _italic_
    .replace(/^#{1,6}\s+/gm, '')       // # headings
    .replace(/^[-*+]\s+/gm, '・')      // - list items → ・
    .replace(/^\d+\.\s+/gm, '')        // 1. numbered list
    .replace(/`([^`]+)`/g, '$1')       // `code`
    .replace(/```[\s\S]*?```/g, '')    // ```code blocks```
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // [link](url)
}

export default function ConciergeBubble({ message, isLast, onNavigate, onSend }: ConciergeBubbleProps) {
  const isUser = message.role === 'user';
  const displayText = isUser ? message.content : stripMarkdown(message.content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
        }`}
      >
        {/* メッセージテキスト */}
        <div className="whitespace-pre-wrap">{displayText}</div>

        {/* ツールアクションボタン */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actions.map((action) => (
              <ConciergeToolButton
                key={action.id}
                action={action}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* フォローアップ候補（最後のメッセージのみ表示） */}
        {!isUser && isLast && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
            {message.suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSend?.(suggestion)}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-50 border border-gray-200
                  text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600
                  transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
