'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Loader2,
  Package,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';

// ─── 型定義 ───

interface FeatureProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration_type: string;
  duration_days: number | null;
  usage_count: number | null;
  stripe_price_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: '汎用',
  ai: 'AI機能',
  export: 'エクスポート',
  business: 'ビジネス',
  display: '表示',
};

const DURATION_TYPE_LABELS: Record<string, string> = {
  one_time: '1回限り',
  permanent: '永久',
  days: '日数制限',
  count: '回数制限',
};

// ─── コンポーネント ───

export default function FeatureProductManager() {
  const [products, setProducts] = useState<FeatureProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<FeatureProduct>>({
    id: '',
    name: '',
    description: '',
    category: 'general',
    price: 500,
    duration_type: 'permanent',
    is_active: true,
    sort_order: 0,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/feature-products');
      if (!res.ok) throw new Error('取得に失敗しました');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateProduct = (id: string, field: keyof FeatureProduct, value: string | number | boolean | null) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
    setDirtyIds(prev => new Set(prev).add(id));
    setSuccess(null);
  };

  const handleSave = async () => {
    if (dirtyIds.size === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const dirtyProducts = products.filter(p => dirtyIds.has(p.id));
      const res = await fetch('/api/admin/feature-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dirtyProducts),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '保存に失敗しました');
      }

      setDirtyIds(new Set());
      setSuccess(`${dirtyProducts.length}件の商品を保存しました`);
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存エラー');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.id || !newProduct.name) {
      setError('商品IDと名前は必須です');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/feature-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '追加に失敗しました');
      }

      setSuccess('商品を追加しました');
      setShowAddForm(false);
      setNewProduct({
        id: '',
        name: '',
        description: '',
        category: 'general',
        price: 500,
        duration_type: 'permanent',
        is_active: true,
        sort_order: 0,
      });
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '追加エラー');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">単品商品管理</h2>
            <p className="text-sm text-gray-600">
              ツール枠追加などの都度課金商品を管理します
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="再読み込み"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            新規追加
          </button>
        </div>
      </div>

      {/* メッセージ */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* 新規追加フォーム */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900">新規商品を追加</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品ID</label>
              <input
                type="text"
                value={newProduct.id || ''}
                onChange={e => setNewProduct(p => ({ ...p, id: e.target.value }))}
                placeholder="例: tool_unlock_quiz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品名</label>
              <input
                type="text"
                value={newProduct.name || ''}
                onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                placeholder="例: 診断クイズ作成枠追加"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">価格（円）</label>
              <input
                type="number"
                value={newProduct.price || 0}
                onChange={e => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <select
                value={newProduct.category || 'general'}
                onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">期間タイプ</label>
              <select
                value={newProduct.duration_type || 'permanent'}
                onChange={e => setNewProduct(p => ({ ...p, duration_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
              >
                {Object.entries(DURATION_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <input
                type="text"
                value={newProduct.description || ''}
                onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                placeholder="商品の説明"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddProduct}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              追加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 商品一覧 */}
      <div className="space-y-3">
        {products.map(product => (
          <div
            key={product.id}
            className={`bg-white p-5 rounded-2xl shadow-sm border transition-all ${
              dirtyIds.has(product.id)
                ? 'border-amber-300 ring-1 ring-amber-200'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* 左側: 商品情報 */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  {/* 有効/無効トグル */}
                  <button
                    onClick={() => updateProduct(product.id, 'is_active', !product.is_active)}
                    className="flex-shrink-0"
                    title={product.is_active ? '有効' : '無効'}
                  >
                    {product.is_active ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-300" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {product.id}
                      </code>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {CATEGORY_LABELS[product.category] || product.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {DURATION_TYPE_LABELS[product.duration_type] || product.duration_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-11">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">商品名</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={e => updateProduct(product.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">価格（円）</label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={e => updateProduct(product.id, 'price', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">説明</label>
                    <input
                      type="text"
                      value={product.description || ''}
                      onChange={e => updateProduct(product.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          商品がありません。「新規追加」ボタンから追加してください。
        </div>
      )}

      {/* 保存ボタン（変更がある場合のみ表示） */}
      {dirtyIds.size > 0 && (
        <div className="sticky bottom-4 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? '保存中...' : `${dirtyIds.size}件の変更を保存`}
          </button>
        </div>
      )}
    </div>
  );
}
