'use client';

/**
 * ガイドブック管理コンポーネント
 * 管理者向けの教育コンテンツCRUD管理UI
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
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
  Clock,
  Star,
  FileText,
  Play,
  BookOpen,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface GuideBookItem {
  id: string;
  title: string;
  description: string;
  body: string;
  content_type: 'article' | 'video' | 'tutorial' | 'faq';
  category: string;
  thumbnail_url?: string;
  video_url?: string;
  duration_minutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  is_published: boolean;
  is_premium: boolean;
  required_plan?: string;
  sort_order: number;
  view_count: number;
  created_at: string;
  published_at?: string;
}

interface GuideBookManagerProps {
  userId: string;
  accessToken: string;
}

const CATEGORY_OPTIONS = [
  { value: 'basics', label: '執筆基礎' },
  { value: 'kdp', label: 'KDP入門' },
  { value: 'marketing', label: 'マーケティング' },
  { value: 'ai_tips', label: 'AI活用術' },
  { value: 'advanced', label: '上級テクニック' },
  { value: 'case_study', label: '成功事例' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'article', label: '記事', icon: FileText },
  { value: 'video', label: '動画', icon: Play },
  { value: 'tutorial', label: 'チュートリアル', icon: BookOpen },
  { value: 'faq', label: 'FAQ', icon: GraduationCap },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: '初級', color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: '中級', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'advanced', label: '上級', color: 'bg-red-100 text-red-700' },
];

export default function GuideBookManager({ userId, accessToken }: GuideBookManagerProps) {
  const [items, setItems] = useState<GuideBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // フィルター・検索
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUnpublished, setShowUnpublished] = useState(true);
  
  // 編集モード
  const [editingItem, setEditingItem] = useState<GuideBookItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // フォームデータ
  const [formData, setFormData] = useState<Partial<GuideBookItem>>({
    title: '',
    description: '',
    body: '',
    content_type: 'article',
    category: 'basics',
    difficulty: 'beginner',
    is_published: false,
    is_premium: false,
    sort_order: 0,
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

      const response = await fetch(`/api/kdl/education?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('データの取得に失敗しました');

      const data = await response.json();
      setItems(data.contents || []);
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
      description: '',
      body: '',
      content_type: 'article',
      category: 'basics',
      difficulty: 'beginner',
      is_published: false,
      is_premium: false,
      sort_order: 0,
    });
  };

  const handleEdit = async (item: GuideBookItem) => {
    try {
      // 詳細データを取得
      const response = await fetch(`/api/kdl/education?id=${item.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('データの取得に失敗しました');

      const data = await response.json();
      setEditingItem(data.content);
      setFormData(data.content);
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

      const response = await fetch('/api/kdl/education', {
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
    if (!confirm('このガイドブックを削除しますか？')) return;

    try {
      const response = await fetch(`/api/kdl/education?id=${id}`, {
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

  const handleTogglePublish = async (item: GuideBookItem) => {
    try {
      const response = await fetch('/api/kdl/education', {
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
        item.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 編集フォーム表示
  if (editingItem || isCreating) {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap size={32} />
            <h2 className="text-2xl font-bold">
              {isCreating ? 'ガイドブック新規作成' : 'ガイドブック編集'}
            </h2>
          </div>
        </div>

        {/* エラー/成功メッセージ */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="ガイドブックのタイトル"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              説明文
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="簡単な説明文"
            />
          </div>

          {/* 本文 */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.body || ''}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
              placeholder="本文を入力（HTML可）"
            />
          </div>

          {/* メタ情報 */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* コンテンツタイプ */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                コンテンツタイプ
              </label>
              <select
                value={formData.content_type || 'article'}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
              >
                {CONTENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                カテゴリ
              </label>
              <select
                value={formData.category || 'basics'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 難易度 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                難易度
              </label>
              <select
                value={formData.difficulty || 'beginner'}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* オプション */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* 所要時間 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                所要時間（分）
              </label>
              <input
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
                placeholder="例: 10"
              />
            </div>

            {/* 表示順 */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                表示順
              </label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* サムネイルURL */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                サムネイルURL
              </label>
              <input
                type="text"
                value={formData.thumbnail_url || ''}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
                placeholder="https://..."
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
                className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-gray-900 font-medium">公開する</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_premium || false}
                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-900 font-medium">プレミアム限定</span>
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
              disabled={saving || !formData.title}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
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
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap size={32} />
              <h2 className="text-2xl font-bold">ガイドブック管理</h2>
            </div>
            <p className="text-amber-100">
              教育コンテンツの作成・編集・公開管理
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-white text-amber-600 px-4 py-2 rounded-lg font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
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
                placeholder="タイトル・説明で検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* カテゴリフィルター */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-amber-500"
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
              className="w-4 h-4 text-amber-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">非公開も表示</span>
          </label>
        </div>
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-600" size={48} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">ガイドブックがありません</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            最初のガイドブックを作成する
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">タイトル</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">カテゴリ</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">難易度</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">状態</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">閲覧数</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const difficultyOpt = DIFFICULTY_OPTIONS.find(d => d.value === item.difficulty);
                const categoryOpt = CATEGORY_OPTIONS.find(c => c.value === item.category);
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-gray-700 line-clamp-1">{item.description}</div>
                      )}
                      {item.is_premium && (
                        <span className="inline-flex items-center gap-1 mt-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">
                          <Star size={12} />
                          プレミアム
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                        {categoryOpt?.label || item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${difficultyOpt?.color || ''}`}>
                        {difficultyOpt?.label || item.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          item.is_published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                        {item.is_published ? '公開中' : '非公開'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {item.view_count || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
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
