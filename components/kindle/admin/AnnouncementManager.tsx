'use client';

/**
 * お知らせ管理コンポーネント
 * 管理者向けのお知らせCRUD管理UI
 */

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Save,
  X,
  Search,
  Filter,
  Pin,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Wrench,
  Gift,
  AlertTriangle,
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'info' | 'update' | 'maintenance' | 'campaign' | 'important';
  priority: number;
  is_published: boolean;
  is_pinned: boolean;
  target_plans?: string[];
  target_roles?: string[];
  start_at?: string;
  end_at?: string;
  created_at: string;
  published_at?: string;
}

interface AnnouncementManagerProps {
  userId: string;
  accessToken: string;
}

const CATEGORY_OPTIONS = [
  { value: 'info', label: 'お知らせ', icon: Info, color: 'bg-blue-100 text-blue-700' },
  { value: 'update', label: 'アップデート', icon: Zap, color: 'bg-green-100 text-green-700' },
  { value: 'maintenance', label: 'メンテナンス', icon: Wrench, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'campaign', label: 'キャンペーン', icon: Gift, color: 'bg-purple-100 text-purple-700' },
  { value: 'important', label: '重要', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
];

export default function AnnouncementManager({ userId, accessToken }: AnnouncementManagerProps) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // フィルター・検索
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUnpublished, setShowUnpublished] = useState(true);
  
  // 編集モード
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // フォームデータ
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    category: 'info',
    priority: 0,
    is_published: false,
    is_pinned: false,
  });

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, showUnpublished]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (showUnpublished) params.append('includeUnpublished', 'true');
      params.append('limit', '100');

      const response = await fetch(`/api/kdl/announcements?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('データの取得に失敗しました');

      const data = await response.json();
      setItems(data.announcements || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      category: 'info',
      priority: 0,
      is_published: false,
      is_pinned: false,
    });
  };

  const handleEdit = async (item: Announcement) => {
    try {
      const response = await fetch(`/api/kdl/announcements?id=${item.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('データの取得に失敗しました');

      const data = await response.json();
      setEditingItem(data.announcement);
      setFormData(data.announcement);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem
        ? { id: editingItem.id, ...formData }
        : formData;

      const response = await fetch('/api/kdl/announcements', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      setSuccess(editingItem ? '更新しました' : '作成しました');
      setEditingItem(null);
      setIsCreating(false);
      fetchItems();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このお知らせを削除しますか？')) return;

    try {
      const response = await fetch(`/api/kdl/announcements?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('削除に失敗しました');

      setSuccess('削除しました');
      fetchItems();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTogglePublish = async (item: Announcement) => {
    try {
      const response = await fetch('/api/kdl/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: item.id,
          is_published: !item.is_published,
        }),
      });

      if (!response.ok) throw new Error('更新に失敗しました');

      setSuccess(item.is_published ? '非公開にしました' : '公開しました');
      fetchItems();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTogglePin = async (item: Announcement) => {
    try {
      const response = await fetch('/api/kdl/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: item.id,
          is_pinned: !item.is_pinned,
        }),
      });

      if (!response.ok) throw new Error('更新に失敗しました');

      setSuccess(item.is_pinned ? 'ピン留めを解除しました' : 'ピン留めしました');
      fetchItems();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData({});
  };

  // フィルタリング
  const filteredItems = items.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 編集フォーム表示
  if (editingItem || isCreating) {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone size={32} />
            <h2 className="text-2xl font-bold">
              {isCreating ? 'お知らせ新規作成' : 'お知らせ編集'}
            </h2>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* フォーム */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="お知らせのタイトル"
            />
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="お知らせの内容（HTML可）"
            />
          </div>

          {/* メタ情報 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                カテゴリ
              </label>
              <select
                value={formData.category || 'info'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 優先度 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                優先度（高いほど上に表示）
              </label>
              <input
                type="number"
                value={formData.priority || 0}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 公開期間 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                公開開始日時
              </label>
              <input
                type="datetime-local"
                value={formData.start_at ? formData.start_at.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                公開終了日時
              </label>
              <input
                type="datetime-local"
                value={formData.end_at ? formData.end_at.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* フラグ */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published || false}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-900 font-medium">公開する</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_pinned || false}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-gray-900 font-medium">ピン留め（常に上部に表示）</span>
            </label>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.content}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isCreating ? '作成' : '保存'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 一覧表示
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Megaphone size={32} />
              <h2 className="text-2xl font-bold">お知らせ管理</h2>
            </div>
            <p className="text-blue-100">
              お知らせの作成・編集・公開管理
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            新規作成
          </button>
        </div>
      </div>

      {/* メッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 検索 */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="タイトル・内容で検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* カテゴリフィルター */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのカテゴリ</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 非公開表示 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnpublished}
              onChange={(e) => setShowUnpublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">非公開も表示</span>
          </label>
        </div>
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Megaphone className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">お知らせがありません</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            最初のお知らせを作成する
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">タイトル</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">カテゴリ</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">優先度</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">状態</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const categoryOpt = CATEGORY_OPTIONS.find(c => c.value === item.category);
                const CategoryIcon = categoryOpt?.icon || Info;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.is_pinned && (
                          <Pin size={16} className="text-orange-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{item.title}</div>
                          {item.content && (
                            <div className="text-sm text-gray-700 line-clamp-1">
                              {item.content.replace(/<[^>]*>/g, '').slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${categoryOpt?.color || 'bg-gray-100 text-gray-700'}`}>
                        <CategoryIcon size={14} />
                        {categoryOpt?.label || item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {item.priority}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                            item.is_published
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {item.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                          {item.is_published ? '公開' : '非公開'}
                        </button>
                        <button
                          onClick={() => handleTogglePin(item)}
                          className={`p-1 rounded ${
                            item.is_pinned
                              ? 'text-orange-500 hover:bg-orange-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={item.is_pinned ? 'ピン留め解除' : 'ピン留め'}
                        >
                          <Pin size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
