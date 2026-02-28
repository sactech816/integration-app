'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, UserMinus, Loader2, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/lib/security/sanitize';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface ListDetail {
  id: string;
  name: string;
  description: string | null;
  from_name: string | null;
  from_email: string | null;
  resend_audience_id: string | null;
}

export default function SubscriberList({ listId }: { listId: string }) {
  const [list, setList] = useState<ListDetail | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('subscribed');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await Promise.all([fetchList(user.id), fetchSubscribers(user.id, filter)]);
      }
      setLoading(false);
    };
    init();
  }, [listId]);

  useEffect(() => {
    if (userId) fetchSubscribers(userId, filter);
  }, [filter]);

  const fetchList = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/lists/${listId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setList(data.list);
    }
  };

  const fetchSubscribers = async (uid: string, statusFilter: string) => {
    const res = await fetch(`/api/newsletter-maker/lists/${listId}/subscribers?userId=${uid}&status=${statusFilter}`);
    if (res.ok) {
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    }
  };

  const handleAdd = async () => {
    if (!userId || !newEmail) return;
    if (!isValidEmail(newEmail)) {
      alert('有効なメールアドレスを入力してください');
      return;
    }
    setAdding(true);
    const res = await fetch(`/api/newsletter-maker/lists/${listId}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email: newEmail, name: newName || undefined }),
    });
    if (res.ok) {
      setNewEmail('');
      setNewName('');
      setShowAddForm(false);
      await fetchSubscribers(userId, filter);
    }
    setAdding(false);
  };

  const handleUnsubscribe = async (email: string) => {
    if (!userId || !confirm(`${email} の配信を停止しますか？`)) return;
    await fetch(`/api/newsletter-maker/lists/${listId}/subscribers`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });
    await fetchSubscribers(userId, filter);
  };

  const subscribeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/newsletter/subscribe/${listId}`
    : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(subscribeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">リストが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
        {list.description && <p className="text-gray-600 mt-1">{list.description}</p>}
      </div>

      {/* 公開購読URL */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-violet-700 mb-2">公開購読フォームURL</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={subscribeUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-white border border-violet-200 rounded-lg text-sm text-gray-900 truncate"
          />
          <button
            onClick={handleCopyUrl}
            className="inline-flex items-center gap-1 px-3 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors min-h-[44px]"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'コピー済み' : 'コピー'}
          </button>
          <a
            href={subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-violet-600 hover:text-violet-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* フィルター・追加ボタン */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['subscribed', 'unsubscribed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
                filter === f
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'subscribed' ? '購読中' : f === 'unsubscribed' ? '停止済み' : 'すべて'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          読者を追加
        </button>
      </div>

      {/* 手動追加フォーム */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="email"
              placeholder="メールアドレス"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            <input
              type="text"
              placeholder="名前（任意）"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newEmail}
              className="px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all min-h-[44px]"
            >
              {adding ? '追加中...' : '追加'}
            </button>
          </div>
        </div>
      )}

      {/* 読者一覧 */}
      {subscribers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === 'subscribed' ? 'まだ読者がいません' : '該当する読者がいません'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">メールアドレス</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">名前</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">ステータス</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">登録日</th>
                <th className="text-right px-5 py-3 text-sm font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-900 font-medium">{sub.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{sub.name || '-'}</td>
                  <td className="px-5 py-3">
                    {sub.status === 'subscribed' ? (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">購読中</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">停止済み</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(sub.subscribed_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {sub.status === 'subscribed' && (
                      <button
                        onClick={() => handleUnsubscribe(sub.email)}
                        className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors min-h-[44px]"
                      >
                        <UserMinus className="w-4 h-4" />
                        停止
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
