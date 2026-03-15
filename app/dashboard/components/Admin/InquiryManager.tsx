'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, Loader2, Eye, CheckCircle, MessageCircle, Package, FileText, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Inquiry = {
  id: string;
  source: 'contact' | 'support';
  source_page: string | null;
  name: string;
  email: string;
  subject: string | null;
  message: string | null;
  pack: string | null;
  pack_name: string | null;
  situation: string | null;
  status: 'unread' | 'read' | 'replied';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_CONFIG = {
  unread: { label: '未読', color: 'bg-red-100 text-red-700', icon: Mail },
  read: { label: '既読', color: 'bg-blue-100 text-blue-700', icon: Eye },
  replied: { label: '返信済', color: 'bg-green-100 text-green-700', icon: CheckCircle },
} as const;

const SOURCE_CONFIG = {
  contact: { label: 'お問い合わせ', color: 'bg-indigo-100 text-indigo-700' },
  support: { label: 'サポート相談', color: 'bg-orange-100 text-orange-700' },
} as const;

const ITEMS_PER_PAGE = 10;

export default function InquiryManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const fetchInquiries = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch('/api/admin/inquiries', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setInquiries(result.data || []);
      }
    } catch (error) {
      console.error('Inquiry fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (id: string, status: string) => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        setInquiries(prev => prev.map(i =>
          i.id === id ? { ...i, status: status as Inquiry['status'], updated_at: new Date().toISOString() } : i
        ));
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const saveNote = async (id: string) => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, admin_note: noteText }),
      });

      if (response.ok) {
        setInquiries(prev => prev.map(i =>
          i.id === id ? { ...i, admin_note: noteText, updated_at: new Date().toISOString() } : i
        ));
        setEditingNoteId(null);
      }
    } catch (error) {
      console.error('Note save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このお問い合わせを削除しますか？')) return;
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch('/api/admin/inquiries', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setInquiries(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Inquiry delete error:', error);
    }
  };

  // フィルタリング
  const filtered = inquiries.filter(i => {
    if (filterSource && i.source !== filterSource) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.subject?.toLowerCase().includes(q)) ||
        (i.message?.toLowerCase().includes(q)) ||
        (i.pack_name?.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // 統計
  const unreadCount = inquiries.filter(i => i.status === 'unread').length;
  const contactCount = inquiries.filter(i => i.source === 'contact').length;
  const supportCount = inquiries.filter(i => i.source === 'support').length;

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black border-l-4 border-orange-500 pl-4 flex items-center gap-2">
          <Mail size={20} className="text-orange-500" /> お問い合わせ履歴
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
        </h2>
        <button
          onClick={fetchInquiries}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition"
        >
          更新
        </button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{inquiries.length}</p>
          <p className="text-xs text-gray-500">総件数</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-red-500">{unreadCount}</p>
          <p className="text-xs text-gray-500">未読</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-indigo-500">{contactCount}</p>
          <p className="text-xs text-gray-500">お問い合わせ</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-orange-500">{supportCount}</p>
          <p className="text-xs text-gray-500">サポート相談</p>
        </div>
      </div>

      {/* 検索 */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="名前・メール・内容で検索..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* フィルタ */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* ソースフィルタ */}
        <button
          onClick={() => { setFilterSource(null); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
            filterSource === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          すべて ({inquiries.length})
        </button>
        <button
          onClick={() => { setFilterSource('contact'); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
            filterSource === 'contact' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          お問い合わせ ({contactCount})
        </button>
        <button
          onClick={() => { setFilterSource('support'); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
            filterSource === 'support' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          サポート相談 ({supportCount})
        </button>

        <span className="w-px h-6 bg-gray-200 self-center mx-1" />

        {/* ステータスフィルタ */}
        {(['unread', 'read', 'replied'] as const).map(s => {
          const config = STATUS_CONFIG[s];
          const count = inquiries.filter(i => i.status === s).length;
          return (
            <button
              key={s}
              onClick={() => { setFilterStatus(filterStatus === s ? null : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filterStatus === s ? `${config.color} ring-2 ring-offset-1 ring-current` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* リスト */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
          {filtered.length} 件表示
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            お問い合わせはまだありません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginated.map((inquiry) => {
              const statusConfig = STATUS_CONFIG[inquiry.status];
              const sourceConfig = SOURCE_CONFIG[inquiry.source];
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedId === inquiry.id;

              return (
                <div
                  key={inquiry.id}
                  className={`p-4 transition cursor-pointer ${
                    inquiry.status === 'unread' ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setExpandedId(isExpanded ? null : inquiry.id);
                    if (inquiry.status === 'unread') {
                      updateStatus(inquiry.id, 'read');
                    }
                  }}
                >
                  {/* 上部: ステータス・ソース・日時 */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.color}`}>
                      <StatusIcon size={10} />
                      {statusConfig.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sourceConfig.color}`}>
                      {inquiry.source === 'support' ? <Package size={10} /> : <FileText size={10} />}
                      {sourceConfig.label}
                    </span>
                    {inquiry.source_page && (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {inquiry.source_page}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(inquiry.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* 名前・メール・件名 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {inquiry.name}
                        <span className="font-normal text-gray-500 ml-2 text-xs">{inquiry.email}</span>
                      </p>
                      {inquiry.subject && (
                        <p className="text-sm text-gray-700 mt-0.5">件名: {inquiry.subject}</p>
                      )}
                      {inquiry.pack_name && (
                        <p className="text-sm text-orange-700 mt-0.5">パック: {inquiry.pack_name}</p>
                      )}
                      {!isExpanded && inquiry.message && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{inquiry.message}</p>
                      )}
                    </div>

                    {/* 削除ボタン */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(inquiry.id); }}
                      className="text-gray-300 hover:text-red-500 transition p-1 flex-shrink-0"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* 展開時の詳細 */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                      {inquiry.situation && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-1">現在の状況</p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                            {inquiry.situation}
                          </p>
                        </div>
                      )}
                      {inquiry.message && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-1">メッセージ</p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                            {inquiry.message}
                          </p>
                        </div>
                      )}

                      {/* ステータス変更 */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ステータス:</span>
                        {(['unread', 'read', 'replied'] as const).map(s => {
                          const cfg = STATUS_CONFIG[s];
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(inquiry.id, s)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                inquiry.status === s
                                  ? `${cfg.color} ring-2 ring-offset-1 ring-current`
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* 管理メモ */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                          <MessageCircle size={12} /> 管理メモ
                        </p>
                        {editingNoteId === inquiry.id ? (
                          <div className="flex gap-2">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              rows={2}
                              placeholder="管理メモを入力..."
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => saveNote(inquiry.id)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteId(inquiry.id);
                              setNoteText(inquiry.admin_note || '');
                            }}
                            className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 w-full text-left hover:bg-gray-100 transition"
                          >
                            {inquiry.admin_note || 'クリックしてメモを追加...'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs font-bold rounded bg-white border border-gray-200 disabled:opacity-40"
            >
              前へ
            </button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs font-bold rounded bg-white border border-gray-200 disabled:opacity-40"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
