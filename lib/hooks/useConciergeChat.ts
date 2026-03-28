'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type {
  AvatarState,
  ConciergeMessage,
  ConciergeChatResponse,
  ConciergeChatHistoryResponse,
  PlanCard,
  PlanExecution,
  PlanExecutionProgress,
  PlanExecutionResult,
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

export type SessionStatus = 'active' | 'waiting' | 'assigned' | 'closed';

interface UseConciergeChat {
  messages: ConciergeMessage[];
  isLoading: boolean;
  isOpen: boolean;
  avatarState: AvatarState;
  remainingMessages: number | null;
  /** オペレーターがオンラインか */
  operatorOnline: boolean;
  /** 人間チャットモードか */
  isHumanMode: boolean;
  /** セッションのステータス */
  sessionStatus: SessionStatus;
  /** プラン実行状態 */
  planExecution: PlanExecution;
  sendMessage: (text: string) => Promise<void>;
  sendFeedback: (messageId: string, feedback: 1 | -1) => Promise<void>;
  toggleOpen: () => void;
  clearHistory: () => void;
  loadHistory: () => Promise<void>;
  /** 人間サポートをリクエスト */
  requestHumanSupport: () => Promise<void>;
  /** プランを実行 */
  executePlan: (plan: PlanCard) => Promise<void>;
}

export function useConciergeChat(): UseConciergeChat {
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [operatorOnline, setOperatorOnline] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('active');
  const [planExecution, setPlanExecution] = useState<PlanExecution>({
    status: 'idle',
    progress: [],
    results: [],
  });
  const sessionIdRef = useRef<string>(`session_${new Date().toISOString().slice(0, 10)}`);
  const historyLoadedRef = useRef(false);
  const visitorIdRef = useRef<string>('');
  const realtimeChannelRef = useRef<any>(null);
  const sessionChannelRef = useRef<any>(null);
  const pathname = usePathname();

  // ビジターID初期化
  useEffect(() => {
    visitorIdRef.current = getOrCreateVisitorId();
  }, []);

  // オペレーターオンライン状態チェック
  const checkOperatorPresence = useCallback(async () => {
    try {
      const res = await fetch('/api/concierge/operator/presence');
      if (res.ok) {
        const data = await res.json();
        setOperatorOnline(data.operatorOnline || false);
      }
    } catch {
      setOperatorOnline(false);
    }
  }, []);

  // ウィジェットが開いた時にプレゼンスチェック + Realtimeサブスクリプション開始
  useEffect(() => {
    if (!isOpen) return;

    checkOperatorPresence();

    // 定期的にプレゼンスチェック（30秒毎）
    const interval = setInterval(checkOperatorPresence, 30000);

    // Supabase Realtimeでオペレーターからのメッセージを監視
    if (supabase && sessionIdRef.current) {
      // メッセージ受信チャンネル
      const msgChannel = supabase
        .channel(`concierge-msg-${sessionIdRef.current}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'concierge_messages',
            filter: `session_id=eq.${sessionIdRef.current}`,
          },
          (payload: any) => {
            const newMsg = payload.new;
            // オペレーターからのメッセージのみ追加（自分のメッセージは既にUIに表示済み）
            if (newMsg.sender_type === 'operator') {
              const operatorMsg: ConciergeMessage = {
                id: newMsg.id,
                role: 'assistant',
                content: newMsg.content,
                sender_type: 'operator',
                metadata: { source: 'operator' },
                created_at: newMsg.created_at,
              };
              setMessages((prev) => [...prev, operatorMsg]);
              setAvatarState('talking');
              setTimeout(() => setAvatarState('idle'), 1500);
            }
          }
        )
        .subscribe();

      realtimeChannelRef.current = msgChannel;

      // セッション状態変更チャンネル
      const sessChannel = supabase
        .channel(`concierge-sess-${sessionIdRef.current}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'concierge_sessions',
            filter: `session_id=eq.${sessionIdRef.current}`,
          },
          (payload: any) => {
            const updated = payload.new;
            setIsHumanMode(updated.mode === 'human');
            setSessionStatus(updated.status);

            // オペレーターが対応開始した時のシステムメッセージ
            if (updated.status === 'assigned' && updated.mode === 'human') {
              const sysMsg: ConciergeMessage = {
                id: `sys_assigned_${Date.now()}`,
                role: 'assistant',
                content: '担当者が接続しました。ご質問をどうぞ！',
                sender_type: 'operator',
                created_at: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, sysMsg]);
            }

            // オペレーターが対応終了した時
            if (updated.status === 'closed') {
              const sysMsg: ConciergeMessage = {
                id: `sys_closed_${Date.now()}`,
                role: 'assistant',
                content: '担当者との会話が終了しました。引き続きAIコンシェルジュがサポートいたします！',
                created_at: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, sysMsg]);
            }
          }
        )
        .subscribe();

      sessionChannelRef.current = sessChannel;
    }

    return () => {
      clearInterval(interval);
      if (realtimeChannelRef.current) {
        supabase?.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      if (sessionChannelRef.current) {
        supabase?.removeChannel(sessionChannelRef.current);
        sessionChannelRef.current = null;
      }
    };
  }, [isOpen, checkOperatorPresence]);

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

      const data: ConciergeChatResponse & { humanMode?: boolean; plan?: any } = await res.json();

      // humanModeの場合はAI応答なし（オペレーターからRealtimeで受信）
      if (data.humanMode) {
        setAvatarState('idle');
        setRemainingMessages(data.remainingMessages);
        return;
      }

      const assistantMsg: ConciergeMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        actions: data.actions,
        suggestions: data.suggestions,
        contactInfo: data.contactInfo,
        plan: data.plan || undefined,
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

  const requestHumanSupport = useCallback(async () => {
    try {
      setIsLoading(true);

      // 会話の要約を作成（最新5メッセージ）
      const recentMessages = messages.slice(-5);
      const summary = recentMessages
        .map(m => `${m.role === 'user' ? 'ユーザー' : 'AI'}: ${m.content.slice(0, 100)}`)
        .join('\n');

      const res = await fetch('/api/concierge/operator/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          visitorId: visitorIdRef.current,
          currentPage: pathname,
          summary,
        }),
      });

      if (res.ok) {
        setSessionStatus('waiting');

        // 待機メッセージを表示
        const waitMsg: ConciergeMessage = {
          id: `sys_wait_${Date.now()}`,
          role: 'assistant',
          content: operatorOnline
            ? '担当者に接続しています。少々お待ちください...'
            : '担当者は現在オフラインです。お問い合わせを受け付けました。担当者が確認次第、こちらでご返信いたします。',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, waitMsg]);
      }
    } catch {
      const errorMsg: ConciergeMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: '接続に失敗しました。もう一度お試しください。',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, pathname, operatorOnline]);

  /** プランを実行（ストリーミング） */
  const executePlan = useCallback(async (plan: PlanCard) => {
    setPlanExecution({ status: 'executing', progress: [], results: [] });

    try {
      // 会話履歴をAPI側に送信してAIでコンテキスト抽出
      const conversationHistory = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-20) // 直近20メッセージ
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, conversationHistory }),
      });

      if (!res.ok) {
        const err = await res.json();
        setPlanExecution(prev => ({
          ...prev,
          status: 'error',
          errorMessage: err.message || 'プランの実行に失敗しました',
        }));

        const errorMsg: ConciergeMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: err.message || 'プランの実行に失敗しました。ログインしてからお試しください。',
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }

      // NDJSONストリームを読み取る
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ストリームの読み取りに失敗しました');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            if (data.type === 'progress') {
              setPlanExecution(prev => {
                const progress = [...prev.progress];
                const existingIdx = progress.findIndex(p => p.stepIndex === data.stepIndex);
                const progressItem: PlanExecutionProgress = {
                  stepIndex: data.stepIndex,
                  toolId: data.toolId,
                  status: data.status,
                  message: data.message,
                };
                if (existingIdx >= 0) {
                  progress[existingIdx] = progressItem;
                } else {
                  progress.push(progressItem);
                }
                return { ...prev, progress };
              });
            } else if (data.type === 'result') {
              setPlanExecution(prev => ({
                ...prev,
                results: [...prev.results, {
                  stepIndex: data.stepIndex,
                  toolId: data.toolId,
                  contentId: data.contentId,
                  url: data.url,
                  title: data.title,
                }],
              }));
            } else if (data.type === 'complete') {
              setPlanExecution(prev => ({
                ...prev,
                status: 'completed',
              }));

              // 完了メッセージをチャットに追加
              const resultCount = data.results?.length || 0;
              const completeMsg: ConciergeMessage = {
                id: `agent_complete_${Date.now()}`,
                role: 'assistant',
                content: `${resultCount}つのコンテンツを作成しました！\n各コンテンツのリンクから確認・編集できます。\n\n内容を調整したい場合は、ダッシュボードから各コンテンツを開いて編集してください。`,
                suggestions: ['ダッシュボードを開く', '別の集客プランを相談したい'],
                created_at: new Date().toISOString(),
              };
              setMessages(prev => [...prev, completeMsg]);
            }
          } catch {
            // JSONパースエラーは無視
          }
        }
      }
    } catch (err: any) {
      setPlanExecution(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err.message || 'エラーが発生しました',
      }));

      const errorMsg: ConciergeMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `プランの実行中にエラーが発生しました: ${err.message || '不明なエラー'}`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    historyLoadedRef.current = false;
    sessionIdRef.current = `session_${Date.now()}`;
    setIsHumanMode(false);
    setSessionStatus('active');
    setPlanExecution({ status: 'idle', progress: [], results: [] });
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    avatarState,
    remainingMessages,
    operatorOnline,
    isHumanMode,
    sessionStatus,
    planExecution,
    sendMessage,
    sendFeedback,
    toggleOpen,
    clearHistory,
    loadHistory,
    requestHumanSupport,
    executePlan,
  };
}
