'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Users, Send, Plus, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NewsletterList {
  id: string;
  name: string;
  description: string | null;
  subscriber_count: number;
  campaign_count: number;
  created_at: string;
}

interface Campaign {
  id: string;
  subject: string;
  status: string;
  sent_at: string | null;
  sent_count: number;
  list_name: string;
  created_at: string;
}

export default function NewsletterDashboard() {
  const [lists, setLists] = useState<NewsletterList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await Promise.all([fetchLists(user.id), fetchCampaigns(user.id)]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchLists = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/lists?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setLists(data.lists || []);
    }
  };

  const fetchCampaigns = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/campaigns?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!userId || !confirm('このリストを削除しますか？関連する読者・キャンペーンもすべて削除されます。')) return;
    const res = await fetch(`/api/newsletter-maker/lists/${listId}?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setCampaigns((prev) => prev.filter((c) => c.id)); // refresh needed
      if (userId) fetchCampaigns(userId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">メルマガダッシュボード</h1>
          <p className="text-gray-600 mt-1">読者リスト管理・メルマガ配信</p>
        </div>
        <Link
          href="/newsletter/lists/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          新しいリスト
        </Link>
      </div>

      {/* 読者リスト一覧 */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" />
          読者リスト
        </h2>
        {lists.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">まだ読者リストがありません</p>
            <Link
              href="/newsletter/lists/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              最初のリストを作成
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {lists.map((list) => (
              <div key={list.id} className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <Link href={`/newsletter/lists/${list.id}`} className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{list.name}</h3>
                    {list.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{list.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {list.subscriber_count} 読者
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {list.campaign_count} キャンペーン
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/newsletter/campaigns/new?listId=${list.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 transition-colors min-h-[44px]"
                    >
                      <Send className="w-4 h-4" />
                      配信
                    </Link>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link href={`/newsletter/lists/${list.id}`} className="p-2 text-gray-400 hover:text-violet-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* キャンペーン一覧 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-violet-600" />
            キャンペーン
          </h2>
          {lists.length > 0 && (
            <Link
              href={`/newsletter/campaigns/new?listId=${lists[0].id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              新しいキャンペーン
            </Link>
          )}
        </div>
        {campaigns.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 text-center">
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">まだキャンペーンがありません</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">件名</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">リスト</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-700">ステータス</th>
                  <th className="text-right px-5 py-3 text-sm font-semibold text-gray-700">送信数</th>
                  <th className="text-right px-5 py-3 text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/newsletter/campaigns/${campaign.id}`} className="font-semibold text-gray-900 hover:text-violet-600 transition-colors">
                        {campaign.subject}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{campaign.list_name}</td>
                    <td className="px-5 py-4">
                      {campaign.status === 'sent' ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">送信済み</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">下書き</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-600">
                      {campaign.sent_count > 0 ? `${campaign.sent_count}通` : '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/newsletter/campaigns/${campaign.id}`} className="text-violet-600 hover:text-violet-800 text-sm font-semibold">
                        {campaign.status === 'draft' ? '編集' : '詳細'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
