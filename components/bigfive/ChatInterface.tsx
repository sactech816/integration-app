'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ChatInterfaceProps {
  resultId: string;
}

export default function ChatInterface({ resultId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // チャット履歴読み込み
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/bigfive/chat?resultId=${resultId}`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [resultId]);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    // ユーザーメッセージを即座に表示
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/bigfive/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, message: text }),
      });

      const data = await res.json();
      if (data.reply) {
        const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };
        setMessages(prev => [...prev, assistantMsg]);
      } else if (data.error) {
        const errorMsg: ChatMessage = { role: 'assistant', content: `エラー: ${data.error}` };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = { role: 'assistant', content: '通信エラーが発生しました。もう一度お試しください。' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, resultId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold text-sm">パーソナリティメンター</h3>
        </div>
        <p className="text-xs text-blue-100 mt-0.5">
          あなたの性格プロファイルに基づいてアドバイスします
        </p>
      </div>

      {/* メッセージエリア */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">読み込み中...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
            <Bot className="w-8 h-8 mb-2 text-blue-300" />
            <p className="text-sm font-medium text-gray-500">こんにちは！</p>
            <p className="text-xs text-gray-400 mt-1">
              あなたの性格や適職、人間関係について何でも聞いてください
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                  }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        {sending && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            rows={1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[44px] max-h-32"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all duration-200"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Shift+Enter で改行 / Enter で送信
        </p>
      </div>
    </div>
  );
}
