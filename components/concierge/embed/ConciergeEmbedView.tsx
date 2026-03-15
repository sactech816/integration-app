'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import ConciergeAvatar from '../ConciergeAvatar';
import ConciergeBubble from '../ConciergeBubble';
import type { AvatarState, ConciergeMessage, ConciergeChatResponse } from '../types';

function getOrCreateVisitorId(): string {
  const key = 'concierge_visitor_id';
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

interface ConciergeConfig {
  id: string;
  name: string;
  greeting: string;
  avatar_style: { type: string; primaryColor: string };
  design: { position: string; bubbleSize: number; headerColor: string; fontFamily: string };
  slug: string;
}

export default function ConciergeEmbedView({ config }: { config: ConciergeConfig }) {
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: config.greeting,
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [sessionId, setSessionId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ConciergeMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');

    try {
      const res = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          visitorId: getOrCreateVisitorId(),
          configId: config.id,
        }),
      });

      if (!res.ok) throw new Error('Failed');

      const data: ConciergeChatResponse = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);

      setAvatarState('talking');
      const assistantMsg: ConciergeMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        actions: data.actions,
        suggestions: data.suggestions,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      setTimeout(() => setAvatarState('idle'), 1500);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content: '申し訳ありません。エラーが発生しました。しばらくしてからもう一度お試しください。',
          created_at: new Date().toISOString(),
        },
      ]);
      setAvatarState('idle');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, config.id]);

  const headerColor = config.design?.headerColor || config.avatar_style?.primaryColor || '#3B82F6';

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ヘッダー */}
      <div
        className="flex items-center gap-3 px-4 py-3 text-white shrink-0"
        style={{ backgroundColor: headerColor }}
      >
        <ConciergeAvatar state={avatarState} size={36} avatarStyle={config.avatar_style} />
        <div>
          <p className="font-bold text-sm">{config.name}</p>
          <p className="text-xs opacity-80">AIコンシェルジュ</p>
        </div>
      </div>

      {/* メッセージエリア */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <ConciergeBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* サジェスト */}
      {messages.length > 0 && messages[messages.length - 1].suggestions && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {messages[messages.length - 1].suggestions!.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 入力エリア */}
      <div className="border-t border-gray-200 p-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: headerColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Powered by 集客メーカー
        </p>
      </div>
    </div>
  );
}
