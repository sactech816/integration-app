'use client';

import { useRef, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';

export interface QuickReplyOption {
  label: string;
  value: string;
  emoji?: string;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  options?: QuickReplyOption[];
  timestamp: Date;
}

interface WizardChatProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (message: string) => void;
  onQuickReply: (option: QuickReplyOption) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function WizardChat({
  messages,
  inputValue,
  onInputChange,
  onSend,
  onQuickReply,
  isLoading,
  disabled,
}: WizardChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || disabled) return;
    onSend(inputValue.trim());
  };

  const lastMessage = messages[messages.length - 1];
  const showQuickReplies =
    lastMessage?.role === 'ai' &&
    lastMessage.options &&
    lastMessage.options.length > 0 &&
    !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'ai' && (
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mr-2 mt-1">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-gray-900 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 shadow-sm rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* ローディング */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mr-2 mt-1">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* クイックリプライ */}
        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 ml-11">
            {lastMessage.options!.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onQuickReply(opt)}
                className="px-4 py-2.5 bg-white border-2 border-pink-300 text-pink-600 rounded-full text-sm font-semibold
                  hover:bg-pink-50 hover:border-pink-400 active:scale-95
                  transition-all duration-200 shadow-sm min-h-[44px]"
              >
                {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={isLoading || disabled}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-gray-900 placeholder:text-gray-400
              focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || disabled}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500
              text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:shadow-none
              transition-all duration-200 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
