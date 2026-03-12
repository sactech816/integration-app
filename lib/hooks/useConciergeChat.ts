'use client';

import { useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type {
  AvatarState,
  ConciergeMessage,
  ConciergeChatResponse,
  ConciergeChatHistoryResponse,
} from '@/components/concierge/types';

interface UseConciergeChat {
  messages: ConciergeMessage[];
  isLoading: boolean;
  isOpen: boolean;
  avatarState: AvatarState;
  remainingMessages: number | null;
  sendMessage: (text: string) => Promise<void>;
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
  const pathname = usePathname();

  const loadHistory = useCallback(async () => {
    if (historyLoadedRef.current) return;

    try {
      const res = await fetch(`/api/concierge/chat?sessionId=${sessionIdRef.current}`);
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
    // 楽観的にユーザーメッセージを追加
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
          currentPage: pathname,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        // レート制限
        if (res.status === 429) {
          const errorMsg: ConciergeMessage = {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: err.error || '本日のメッセージ上限に達しました。明日またお話しましょう！',
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
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setRemainingMessages(data.remainingMessages);

      if (data.sessionId) {
        sessionIdRef.current = data.sessionId;
      }

      // 話し中アニメーション（1.5秒）
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
    toggleOpen,
    clearHistory,
    loadHistory,
  };
}
