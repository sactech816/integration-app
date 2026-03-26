'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Send, Headphones, HeadphoneOff, RefreshCw, Clock, User, MessageSquare,
  CheckCircle, AlertCircle, Filter,
} from 'lucide-react';

interface Session {
  id: string;
  session_id: string;
  user_id: string | null;
  visitor_id: string | null;
  mode: 'ai' | 'human';
  status: 'active' | 'waiting' | 'assigned' | 'closed';
  assigned_operator_id: string | null;
  user_email: string | null;
  user_plan: string | null;
  current_page: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: any;
  created_at: string;
  feedback: number | null;
  sender_type: string | null;
  user_type: string | null;
  context: any;
}

type FilterType = 'all' | 'waiting' | 'assigned' | 'active' | 'closed';

export default function ConciergeOperator() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeMsgRef = useRef<any>(null);
  const realtimeSessRef = useRef<any>(null);

  // セッション一覧取得
  const fetchSessions = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`/api/concierge/operator/handoff${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // 初回＋フィルター変更時にセッション取得
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // プレゼンスハートビート
  const updatePresence = useCallback(async (status: string) => {
    try {
      await fetch('/api/concierge/operator/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // ignore
    }
  }, []);

  const toggleOnline = useCallback(async () => {
    const newStatus = isOnline ? 'offline' : 'online';
    await updatePresence(newStatus);
    setIsOnline(!isOnline);
  }, [isOnline, updatePresence]);

  // オンライン時はハートビート送信
  useEffect(() => {
    if (isOnline) {
      heartbeatRef.current = setInterval(() => {
        updatePresence('online');
      }, 30000);
    } else {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [isOnline, updatePresence]);

  // アンマウント時にオフラインに
  useEffect(() => {
    return () => {
      updatePresence('offline');
    };
  }, [updatePresence]);

  // Realtimeでセッション変更を監視
  useEffect(() => {
    if (!supabase) return;

    const sessChannel = supabase
      .channel('operator-sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'concierge_sessions' },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    realtimeSessRef.current = sessChannel;

    return () => {
      if (realtimeSessRef.current) {
        supabase.removeChannel(realtimeSessRef.current);
      }
    };
  }, [fetchSessions]);

  // 選択中セッションのメッセージ取得
  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/concierge/operator/message?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // セッション選択時
  const handleSelectSession = useCallback((session: Session) => {
    setSelectedSession(session);
    fetchMessages(session.session_id);
  }, [fetchMessages]);

  // 選択中セッションのRealtimeメッセージ監視
  useEffect(() => {
    if (!supabase || !selectedSession) return;

    // 前のチャンネルを破棄
    if (realtimeMsgRef.current) {
      supabase.removeChannel(realtimeMsgRef.current);
    }

    const channel = supabase
      .channel(`op-msg-${selectedSession.session_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'concierge_messages',
          filter: `session_id=eq.${selectedSession.session_id}`,
        },
        (payload: any) => {
          const newMsg = payload.new;
          // オペレーター自身のメッセージは送信時に追加済みなので除外
          if (newMsg.sender_type !== 'operator') {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    realtimeMsgRef.current = channel;

    return () => {
      if (realtimeMsgRef.current) {
        supabase.removeChannel(realtimeMsgRef.current);
        realtimeMsgRef.current = null;
      }
    };
  }, [selectedSession]);

  // メッセージ追加時に自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // メッセージ送信
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSession || sendingMessage) return;

    const content = input.trim();
    setInput('');
    setSendingMessage(true);

    // 楽観的にUIに追加
    const optimisticMsg: Message = {
      id: `temp_${Date.now()}`,
      role: 'assistant',
      content,
      metadata: { source: 'operator' },
      created_at: new Date().toISOString(),
      feedback: null,
      sender_type: 'operator',
      user_type: null,
      context: null,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch('/api/concierge/operator/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.session_id,
          content,
        }),
      });
    } catch {
      // エラー時に楽観メッセージを削除
      setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSendingMessage(false);
    }
  };

  // セッション操作（対応開始 / 対応終了）
  const handleSessionAction = async (action: 'assign' | 'close') => {
    if (!selectedSession) return;

    try {
      const res = await fetch('/api/concierge/operator/handoff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.session_id,
          action,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedSession(data.session);
        fetchSessions();
      }
    } catch {
      // ignore
    }
  };

  // ステータスバッジ
  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      waiting: { bg: 'bg-amber-100', text: 'text-amber-700', label: '待機中' },
      assigned: { bg: 'bg-green-100', text: 'text-green-700', label: '対応中' },
      active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'AI対応' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-500', label: '終了' },
    };
    const c = config[status] || config.active;
    return (
      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const waitingCount = sessions.filter(s => s.status === 'waiting').length;

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Headphones className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">コンシェルジュ管理</h2>
          {waitingCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 animate-pulse">
              {waitingCount}件 待機中
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
              isOnline
                ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                オンライン
              </>
            ) : (
              <>
                <HeadphoneOff className="w-3.5 h-3.5" />
                オフライン
              </>
            )}
          </button>
          <button
            onClick={fetchSessions}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="更新"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左パネル: セッション一覧 */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
          {/* フィルター */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
            {(['all', 'waiting', 'assigned', 'active', 'closed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? '全て' : f === 'waiting' ? '待機' : f === 'assigned' ? '対応中' : f === 'active' ? 'AI' : '終了'}
              </button>
            ))}
          </div>

          {/* セッションリスト */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">読み込み中...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">セッションがありません</p>
              </div>
            ) : (
              sessions
                .sort((a, b) => {
                  // waiting優先、次にassigned、updated_at降順
                  const priority: Record<string, number> = { waiting: 0, assigned: 1, active: 2, closed: 3 };
                  const diff = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
                  if (diff !== 0) return diff;
                  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                })
                .map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      selectedSession?.id === session.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {session.user_email || session.visitor_id?.slice(0, 12) || '不明'}
                        </span>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 truncate max-w-[150px]">
                        {session.current_page || 'ページ不明'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(session.updated_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {session.user_plan && (
                      <span className="text-[10px] text-gray-400">プラン: {session.user_plan}</span>
                    )}
                  </button>
                ))
            )}
          </div>
        </div>

        {/* 右パネル: 会話ビュー */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">セッションを選択してください</p>
              </div>
            </div>
          ) : (
            <>
              {/* セッションヘッダー */}
              <div className="px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {selectedSession.user_email || selectedSession.visitor_id?.slice(0, 16) || '不明ユーザー'}
                      </span>
                      <StatusBadge status={selectedSession.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      {selectedSession.current_page && (
                        <span>ページ: {selectedSession.current_page}</span>
                      )}
                      {selectedSession.user_plan && (
                        <span>プラン: {selectedSession.user_plan}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSession.status === 'waiting' && (
                      <button
                        onClick={() => handleSessionAction('assign')}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-green-500 text-white
                          hover:bg-green-600 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        対応開始
                      </button>
                    )}
                    {selectedSession.status === 'assigned' && (
                      <button
                        onClick={() => handleSessionAction('close')}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-600
                          hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        対応終了
                      </button>
                    )}
                  </div>
                </div>

                {/* 会話サマリー */}
                {selectedSession.summary && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <span className="font-medium">会話の要約: </span>
                    {selectedSession.summary}
                  </div>
                )}
              </div>

              {/* メッセージ一覧 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isOperator = msg.sender_type === 'operator';
                  const isAI = !isUser && !isOperator;

                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : isOperator
                              ? 'bg-green-50 border border-green-200 text-gray-800 rounded-bl-md'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        {/* 送信者ラベル */}
                        {!isUser && (
                          <div className={`text-[10px] font-medium mb-1 ${
                            isOperator ? 'text-green-600' : 'text-blue-500'
                          }`}>
                            {isOperator ? '🎧 オペレーター' : '🤖 AI'}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className={`text-[10px] mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 入力エリア（assigned時のみ） */}
              {selectedSession.status === 'assigned' && (
                <div className="border-t border-gray-200 bg-white px-4 py-3">
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="メッセージを入力..."
                      disabled={sendingMessage}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                        text-gray-900 placeholder:text-gray-400
                        focus:ring-2 focus:ring-green-500 focus:border-transparent
                        transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sendingMessage}
                      className="p-2.5 rounded-xl bg-green-500 text-white shadow-md
                        hover:bg-green-600 transition-all duration-200
                        disabled:opacity-40 disabled:cursor-not-allowed
                        min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* waitingで未対応の場合の案内 */}
              {selectedSession.status === 'waiting' && (
                <div className="border-t border-gray-200 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-sm text-amber-700">
                    ユーザーが担当者への接続を待っています。「対応開始」ボタンで会話を始めてください。
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
