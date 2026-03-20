'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type {
  AvatarState,
  ConciergeMessage,
  ConciergeChatResponse,
  ConciergeChatHistoryResponse,
} from '@/components/concierge/types';

/** localStorage にビジターIDを保存・取得 */
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

interface UseConciergeChat {
  messages: ConciergeMessage[];
  isLoading: boolean;
  isOpen: boolean;
  avatarState: AvatarState;
  remainingMessages: number | null;
  sendMessage: (text: string) => Promise<void>;
  sendFeedback: (messageId: string, feedback: 1 | -1) => Promise<void>;
  toggleOpen: () => void;
  clearHistory: () => void;
  loadHistory: () => Promise<void>;
}

export function useConciergeChat(): UseConciergeChat {
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const sessionIdRef = useRef<string>(`session_${new Date().toISOString().slice(0, 10)}`);
  const historyLoadedRef = useRef(false);
  const visitorIdRef = useRef<string>('');
  const pathname = usePathname();

  // ビジターID初期化
  useEffect(() => {
    visitorIdRef.current = getOrCreateVisitorId();
  }, []);

  const loadHistory = useCallback(async () => {
    if (historyLoadedRef.current) return;

    try {
      const params = new URLSearchParams({
        sessionId: sessionIdRef.current,
        visitorId: visitorIdRef.current,
      });
      const res = await fetch(`/api/concierge/chat?${params}`);
      if (!res.ok) return;

      const data: ConciergeChatHistoryResponse = await res.json();
      if (data.messages.length > 0) {
        setMessages(data.messages);
      }
      if (data.sessionId) {
        sessionIdRef.current = data.sessionId;
      }
      historyLoadedRef.current = true;
    } catch {
      // 履歴取得失敗は無視
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const nextState = !prev;
      if (nextState && !historyLoadedRef.current) {
        loadHistory();
      }
      return nextState;
    });
  }, [loadHistory]);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ConciergeMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setAvatarState('thinking');

    try {
      const res = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
          visitorId: visitorIdRef.current,
          currentPage: pathname,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          const errorMsg: ConciergeMessage = {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: err.error || '本日のメッセージ上限に達しました。',
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          setRemainingMessages(0);
          return;
        }
        throw new Error(err.error || 'エラーが発生しました');
      }

      const data: ConciergeChatResponse = await res.json();

      const assistantMsg: ConciergeMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        actions: data.actions,
        suggestions: data.suggestions,
        contactInfo: data.contactInfo,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setRemainingMessages(data.remainingMessages);

      if (data.sessionId) {
        sessionIdRef.current = data.sessionId;
      }

      setAvatarState('talking');
      setTimeout(() => setAvatarState('idle'), 1500);
    } catch (err: any) {
      const errorMsg: ConciergeMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'すみません、エラーが発生しました。もう一度お試しください。',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setAvatarState('idle');
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  const sendFeedback = useCallback(async (messageId: string, feedback: 1 | -1) => {
    try {
      await fetch('/api/concierge/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, feedback }),
      });
      setMessages((prev) =>
        prev.map(m => m.id === messageId ? { ...m, feedback } : m)
      );
    } catch {
      // ignore
    }
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    historyLoadedRef.current = false;
    sessionIdRef.current = `session_${Date.now()}`;
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    avatarState,
    remainingMessages,
    sendMessage,
    sendFeedback,
    toggleOpen,
    clearHistory,
    loadHistory,
  };
}
