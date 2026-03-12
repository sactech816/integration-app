'use client';

import ConciergeToolButton from './ConciergeToolButton';
import type { ConciergeMessage } from './types';

interface ConciergeBubbleProps {
  message: ConciergeMessage;
  onNavigate?: () => void;
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

export default function ConciergeBubble({ message, onNavigate }: ConciergeBubbleProps) {
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
      </div>
    </div>
  );
}
