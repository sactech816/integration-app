'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare, Send, Loader2, AlertCircle, Users, Circle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Conversation {
  user_id: string;
  user_email: string;
  note: string | null;
  last_message: {
    content: string;
    sender_type: 'agency' | 'user';
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
}

interface Message {
  id: string;
  agency_id: string;
  user_id: string;
  sender_id: string;
  sender_type: 'agency' | 'user';
  content: string;
  related_book_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface AgencyMessagesViewProps {
  agencyId: string;
  userId: string;
  accessToken: string;
}

export default function AgencyMessagesView({
  agencyId,
  userId,
  accessToken,
}: AgencyMessagesViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 会話一覧を取得
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/kdl/agency/messages', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('会話の取得に失敗しました');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [accessToken]);

  // メッセージを取得
  const fetchMessages = useCallback(async (targetUserId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        `/api/kdl/agency/messages?user_id=${targetUserId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!response.ok) throw new Error('メッセージの取得に失敗しました');
      const data = await response.json();
      setMessages(data.messages || []);

      // 既読にする
      await fetch('/api/kdl/agency/messages/read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: targetUserId }),
      });

      // 会話一覧の未読数を更新
      setConversations(prev =>
        prev.map(c =>
          c.user_id === targetUserId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 会話選択時にメッセージを読み込み
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, fetchMessages]);

  // スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Supabase Realtimeで新着メッセージを購読
  useEffect(() => {
    if (!supabase || !agencyId) return;

    const channel = supabase
      .channel(`agency-messages-${agencyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kdl_messages',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;

          // 現在表示中の会話の場合はメッセージを追加
          if (newMsg.user_id === selectedUserId) {
            setMessages(prev => [...prev, newMsg]);

            // 自分以外からのメッセージなら既読にする
            if (newMsg.sender_id !== userId) {
              fetch('/api/kdl/agency/messages/read', {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: selectedUserId }),
              });
            }
          }

          // 会話一覧を更新
          setConversations(prev => {
            const updated = prev.map(c => {
              if (c.user_id === newMsg.user_id) {
                return {
                  ...c,
                  last_message: {
                    content: newMsg.content,
                    sender_type: newMsg.sender_type,
                    created_at: newMsg.created_at,
                    is_read: newMsg.user_id === selectedUserId,
                  },
                  unread_count: newMsg.user_id === selectedUserId
                    ? c.unread_count
                    : c.unread_count + (newMsg.sender_id !== userId ? 1 : 0),
                };
              }
              return c;
            });
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agencyId, selectedUserId, userId, accessToken]);

  // メッセージ送信
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/kdl/agency/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error('メッセージの送信に失敗しました');

      const data = await response.json();
      // Realtimeで届くが、即座に表示するため追加
      setMessages(prev => {
        const exists = prev.some(m => m.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
      setNewMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastMessage = (content: string) => {
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-12 text-center">
        <MessageSquare className="text-gray-300 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-700 mb-2">メッセージはまだありません</h3>
        <p className="text-gray-500">担当ユーザーが割り当てられるとここでメッセージのやり取りができます</p>
      </div>
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
        <h2 className="text-xl font-bold text-gray-900">メッセージ</h2>
        {totalUnread > 0 && (
          <p className="text-sm text-indigo-600 mt-1">
            {totalUnread}件の未読メッセージ
          </p>
        )}
      </div>

      {/* 2カラムレイアウト */}
      <div className="flex gap-4 h-[600px]">
        {/* 左：会話リスト */}
        <div className="w-80 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Users size={14} />
              会話 ({conversations.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button
                key={conv.user_id}
                onClick={() => setSelectedUserId(conv.user_id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                  selectedUserId === conv.user_id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                  {conv.user_email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.user_email}</p>
                    {conv.unread_count > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  {conv.last_message ? (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conv.last_message.sender_type === 'agency' ? 'あなた: ' : ''}
                      {formatLastMessage(conv.last_message.content)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">メッセージなし</p>
                  )}
                  {conv.last_message && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatTime(conv.last_message.created_at)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 右：メッセージスレッド */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="text-gray-200 mx-auto mb-3" size={48} />
                <p className="text-gray-500">会話を選択してください</p>
              </div>
            </div>
          ) : (
            <>
              {/* チャットヘッダー */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="font-medium text-gray-900 text-sm">
                  {conversations.find(c => c.user_id === selectedUserId)?.user_email}
                </p>
              </div>

              {/* メッセージ表示エリア */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-400" size={24} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">まだメッセージがありません</p>
                    <p className="text-gray-400 text-xs mt-1">最初のメッセージを送りましょう</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'agency' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'agency'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          msg.sender_type === 'agency' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-[10px] ${
                            msg.sender_type === 'agency' ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {formatTime(msg.created_at)}
                          </span>
                          {msg.sender_type === 'agency' && msg.is_read && (
                            <span className="text-[10px] text-blue-100">既読</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* メッセージ入力 */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-end gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="メッセージを入力..."
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSending || !newMessage.trim()}
                    className={`p-2.5 rounded-xl transition-colors ${
                      isSending || !newMessage.trim()
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isSending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
