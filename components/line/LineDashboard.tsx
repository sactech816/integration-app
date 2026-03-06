'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle, Users, Send, Settings, Loader2,
  UserPlus, BarChart3, Copy, Check, ExternalLink,
  Trash2, Eye, AlertCircle, ChevronRight, Plus
} from 'lucide-react';
import LineAccountSettings from './LineAccountSettings';
import LineFriendList from './LineFriendList';
import LineMessageComposer from './LineMessageComposer';
import type { LineAccount, LineFriend, LineMessage } from '@/types/line';

interface LineDashboardProps {
  userId: string;
  isAdmin?: boolean;
}

type TabId = 'overview' | 'settings' | 'friends' | 'messages';

export default function LineDashboard({ userId, isAdmin = false }: LineDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [account, setAccount] = useState<LineAccount | null>(null);
  const [friends, setFriends] = useState<LineFriend[]>([]);
  const [messages, setMessages] = useState<LineMessage[]>([]);
  const [friendStats, setFriendStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchAccount(),
        fetchFriends(),
        fetchMessages(),
      ]);
      setLoading(false);
    };
    init();
  }, [userId]);

  const fetchAccount = async () => {
    const res = await fetch(`/api/line/account?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setAccount(data.account);
    }
  };

  const fetchFriends = async () => {
    const res = await fetch(`/api/line/friends?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setFriends(data.friends || []);
      setFriendStats(data.stats || { total: 0, active: 0 });
    }
  };

  const fetchMessages = async () => {
    const res = await fetch(`/api/line/messages?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  };

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/line/webhook?ownerId=${userId}`
    : '';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const tabs: { id: TabId; label: string; icon: typeof MessageCircle }[] = [
    { id: 'overview', label: '概要', icon: BarChart3 },
    { id: 'friends', label: '友だちリスト', icon: Users },
    { id: 'messages', label: 'メッセージ配信', icon: Send },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const sentMessages = messages.filter(m => m.status === 'sent');
  const totalSent = sentMessages.reduce((acc, m) => acc + (m.success_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">LINE公式連携</h2>
            <p className="text-sm text-gray-500">LINE公式アカウントと連携して友だちを集客・配信</p>
          </div>
        </div>
        {account && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-green-700">
              {account.display_name || '連携済み'}
            </span>
          </div>
        )}
      </div>

      {/* 未設定時の案内 */}
      {!account && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">LINE公式アカウントを設定してください</h3>
              <p className="text-sm text-amber-700 mb-3">
                LINE Developersでチャネルを作成し、アクセストークン等を設定することで、友だち追加導線や配信機能が使えるようになります。
              </p>
              <button
                onClick={() => setActiveTab('settings')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 transition-all shadow-md"
              >
                <Settings className="w-4 h-4" />
                設定する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 概要タブ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">友だち数</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{friendStats.active}</p>
              {friendStats.total > friendStats.active && (
                <p className="text-xs text-gray-400 mt-1">累計: {friendStats.total}</p>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Send className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">配信回数</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{sentMessages.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">総送信メッセージ</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalSent}</p>
            </div>
          </div>

          {/* Webhook URL */}
          {account && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Webhook URL</h3>
              <p className="text-xs text-gray-500 mb-3">
                LINE DevelopersのMessaging API設定 &gt; Webhook URLにこのURLを設定してください
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700 border border-gray-200 overflow-x-auto">
                  {webhookUrl}
                </code>
                <button
                  onClick={handleCopyWebhook}
                  className="shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                >
                  {copiedWebhook ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>
          )}

          {/* 最近の配信 */}
          {sentMessages.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">最近の配信</h3>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  すべて見る <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {sentMessages.slice(0, 3).map(msg => (
                  <div key={msg.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{msg.title}</p>
                      <p className="text-xs text-gray-500">
                        {msg.sent_at ? new Date(msg.sent_at).toLocaleDateString('ja-JP') : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{msg.success_count}件送信</p>
                      {msg.failure_count > 0 && (
                        <p className="text-xs text-red-500">{msg.failure_count}件失敗</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* クイックアクション */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('friends')}
              className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">友だちリスト</h4>
                <p className="text-sm text-gray-500">友だちの一覧・流入経路を確認</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">メッセージ配信</h4>
                <p className="text-sm text-gray-500">友だちにメッセージを一斉送信</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
            </button>
          </div>
        </div>
      )}

      {/* 友だちリストタブ */}
      {activeTab === 'friends' && (
        <LineFriendList
          userId={userId}
          friends={friends}
          onRefresh={fetchFriends}
        />
      )}

      {/* メッセージ配信タブ */}
      {activeTab === 'messages' && (
        <LineMessageComposer
          userId={userId}
          messages={messages}
          friendCount={friendStats.active}
          hasAccount={!!account}
          onRefresh={fetchMessages}
        />
      )}

      {/* 設定タブ */}
      {activeTab === 'settings' && (
        <LineAccountSettings
          userId={userId}
          account={account}
          webhookUrl={webhookUrl}
          onSaved={(updated) => {
            setAccount(updated);
            setActiveTab('overview');
          }}
          onDeleted={() => {
            setAccount(null);
          }}
        />
      )}
    </div>
  );
}
