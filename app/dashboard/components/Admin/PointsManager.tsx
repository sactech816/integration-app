'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Loader2,
  Coins,
  Package,
  Settings,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// ─── 型定義 ───

interface PointCostRow {
  id?: string;
  service_type: string;
  action: string;
  cost: number;
  description: string;
  is_active: boolean;
}

interface PointPackRow {
  id: string;
  name: string;
  points: number;
  price: number;
  bonus_points: number;
  is_active: boolean;
  sort_order: number;
}

// ─── カテゴリ定義 ───

const COST_CATEGORIES = [
  {
    label: 'LP・ページ作成',
    icon: '📄',
    services: ['profile', 'business', 'webinar', 'onboarding'],
  },
  {
    label: '診断・クイズ',
    icon: '🧩',
    services: ['quiz', 'entertainment_quiz'],
  },
  {
    label: 'ライティング・制作',
    icon: '✍️',
    services: ['salesletter', 'thumbnail', 'sns-post'],
  },
  {
    label: '集客・イベント',
    icon: '📢',
    services: ['booking', 'attendance', 'survey', 'newsletter', 'funnel'],
  },
  {
    label: '収益化',
    icon: '💰',
    services: ['order-form', 'gamification'],
  },
  {
    label: 'システム',
    icon: '⚙️',
    services: ['ai', 'export'],
  },
];

const SERVICE_LABELS: Record<string, string> = {
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
  webinar: 'ウェビナーLP',
  onboarding: 'はじめかた',
  quiz: '診断クイズ',
  entertainment_quiz: 'エンタメ診断',
  salesletter: 'セールスライター',
  thumbnail: 'サムネイル',
  'sns-post': 'SNS投稿',
  booking: '予約',
  attendance: '出欠',
  survey: 'アンケート',
  newsletter: 'メルマガ',
  funnel: 'ファネル',
  'order-form': '申し込みフォーム',
  gamification: 'ガミフィケーション',
  ai: 'AI生成',
  export: 'エクスポート',
};

const ACTION_LABELS: Record<string, string> = {
  save: '保存',
  generate: 'AI生成',
  html: 'HTMLエクスポート',
  embed: '埋め込みコード',
};

// ─── コンポーネント ───

export default function PointsManager() {
  const [costs, setCosts] = useState<PointCostRow[]>([]);
  const [packs, setPacks] = useState<PointPackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(COST_CATEGORIES.map((c) => c.label))
  );
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

  // ─── データ取得 ───

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [costsRes, packsRes] = await Promise.all([
        fetch('/api/admin/points/costs'),
        fetch('/api/admin/points/packs'),
      ]);

      if (!costsRes.ok || !packsRes.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const costsData = await costsRes.json();
      const packsData = await packsRes.json();

      setCosts(costsData.costs || []);
      setPacks(packsData.packs || []);
      setDirtyFields(new Set());
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── カテゴリ開閉 ───

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  // ─── コスト変更 ───

  const updateCost = (index: number, field: keyof PointCostRow, value: any) => {
    setCosts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirtyFields((prev) => new Set(prev).add(`cost-${index}`));
  };

  // ─── パック変更 ───

  const updatePack = (index: number, field: keyof PointPackRow, value: any) => {
    setPacks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirtyFields((prev) => new Set(prev).add(`pack-${index}`));
  };

  // ─── 一括保存 ───

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const [costsRes, packsRes] = await Promise.all([
        fetch('/api/admin/points/costs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ costs }),
        }),
        fetch('/api/admin/points/packs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packs }),
        }),
      ]);

      if (!costsRes.ok || !packsRes.ok) {
        const costsErr = !costsRes.ok ? await costsRes.json().catch(() => ({})) : {};
        const packsErr = !packsRes.ok ? await packsRes.json().catch(() => ({})) : {};
        throw new Error(
          costsErr.error || packsErr.error || '保存に失敗しました'
        );
      }

      setSuccess('設定を保存しました');
      setDirtyFields(new Set());
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // ─── カテゴリ別にコストをグルーピング ───

  const getCostsForCategory = (services: string[]) => {
    return costs
      .map((cost, index) => ({ ...cost, _index: index }))
      .filter((cost) => services.includes(cost.service_type));
  };

  // ─── ローディング ───

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="ml-3 text-gray-600 text-lg">読み込み中...</span>
      </div>
    );
  }

  const hasDirty = dirtyFields.size > 0;

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Coins size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">ポイント設定管理</h2>
            <p className="text-sm text-gray-600">
              ツールのポイントコストとポイントパックを管理します
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            リロード
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasDirty}
            className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </div>

      {/* メッセージ */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle size={20} />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* ─── システム設定 ─── */}
      <div className="bg-white border border-gray-300 shadow-md rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings size={20} className="text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">システム設定</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">新規登録ボーナス</p>
            <p className="text-2xl font-bold text-blue-700">100 pt</p>
            <p className="text-xs text-gray-500 mt-1">
              新規ユーザー登録時に自動付与されるポイント
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Pro月次付与</p>
            <p className="text-2xl font-bold text-blue-700">1,500 pt</p>
            <p className="text-xs text-gray-500 mt-1">
              Proプランユーザーへの月次ポイント付与
            </p>
          </div>
        </div>
      </div>

      {/* ─── ポイントコスト設定 ─── */}
      <div className="bg-white border border-gray-300 shadow-md rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-200">
          <Coins size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            ツール別ポイントコスト
          </h3>
          <span className="ml-auto text-sm text-gray-500">
            {costs.length} 件
          </span>
        </div>

        <div className="divide-y divide-gray-200">
          {COST_CATEGORIES.map((category) => {
            const categoryCosts = getCostsForCategory(category.services);
            if (categoryCosts.length === 0) return null;

            const isExpanded = expandedCategories.has(category.label);

            return (
              <div key={category.label}>
                {/* カテゴリヘッダー */}
                <button
                  onClick={() => toggleCategory(category.label)}
                  className="w-full flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-left min-h-[44px]"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-semibold text-gray-800">
                    {category.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({categoryCosts.length})
                  </span>
                  <span className="ml-auto">
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </span>
                </button>

                {/* コスト行 */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {/* テーブルヘッダー */}
                    <div className="hidden sm:grid grid-cols-[1fr_120px_1fr_100px_80px] gap-4 px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <span>サービス</span>
                      <span>アクション</span>
                      <span>説明</span>
                      <span className="text-right">コスト (pt)</span>
                      <span className="text-center">有効</span>
                    </div>

                    {categoryCosts.map((cost) => (
                      <div
                        key={`${cost.service_type}-${cost.action}`}
                        className={`grid grid-cols-1 sm:grid-cols-[1fr_120px_1fr_100px_80px] gap-3 sm:gap-4 px-6 py-4 items-center hover:bg-blue-50/30 transition-all duration-200 ${
                          dirtyFields.has(`cost-${cost._index}`)
                            ? 'bg-amber-50/50'
                            : ''
                        }`}
                      >
                        {/* サービス名 */}
                        <div>
                          <span className="font-medium text-gray-900">
                            {SERVICE_LABELS[cost.service_type] ||
                              cost.service_type}
                          </span>
                          <span className="sm:hidden ml-2 text-xs text-gray-500">
                            / {ACTION_LABELS[cost.action] || cost.action}
                          </span>
                        </div>

                        {/* アクション */}
                        <div className="hidden sm:block">
                          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">
                            {ACTION_LABELS[cost.action] || cost.action}
                          </span>
                        </div>

                        {/* 説明 */}
                        <div>
                          <input
                            type="text"
                            value={cost.description || ''}
                            onChange={(e) =>
                              updateCost(
                                cost._index,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder="説明を入力..."
                            className="w-full px-3 py-2 h-12 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* コスト */}
                        <div>
                          <input
                            type="number"
                            min={0}
                            value={cost.cost}
                            onChange={(e) =>
                              updateCost(
                                cost._index,
                                'cost',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 h-12 border border-gray-300 rounded-xl text-gray-900 text-right font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* 有効/無効トグル */}
                        <div className="flex justify-center">
                          <button
                            onClick={() =>
                              updateCost(
                                cost._index,
                                'is_active',
                                !cost.is_active
                              )
                            }
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all duration-200"
                            title={cost.is_active ? '有効' : '無効'}
                          >
                            {cost.is_active ? (
                              <ToggleRight
                                size={28}
                                className="text-blue-500"
                              />
                            ) : (
                              <ToggleLeft size={28} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ポイントパック設定 ─── */}
      <div className="bg-white border border-gray-300 shadow-md rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-200">
          <Package size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">ポイントパック</h3>
          <span className="ml-auto text-sm text-gray-500">
            {packs.length} 件
          </span>
        </div>

        {/* テーブルヘッダー */}
        <div className="hidden lg:grid grid-cols-[1fr_100px_100px_100px_80px_80px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>パック名</span>
          <span className="text-right">ポイント</span>
          <span className="text-right">価格 (円)</span>
          <span className="text-right">ボーナス</span>
          <span className="text-center">表示順</span>
          <span className="text-center">有効</span>
        </div>

        <div className="divide-y divide-gray-100">
          {packs.map((pack, index) => (
            <div
              key={pack.id}
              className={`grid grid-cols-1 lg:grid-cols-[1fr_100px_100px_100px_80px_80px] gap-3 lg:gap-4 px-6 py-4 items-center hover:bg-blue-50/30 transition-all duration-200 ${
                dirtyFields.has(`pack-${index}`) ? 'bg-amber-50/50' : ''
              }`}
            >
              {/* パック名 */}
              <div>
                <label className="lg:hidden text-xs font-semibold text-gray-500 mb-1 block">
                  パック名
                </label>
                <input
                  type="text"
                  value={pack.name}
                  onChange={(e) => updatePack(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 h-12 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* ポイント */}
              <div>
                <label className="lg:hidden text-xs font-semibold text-gray-500 mb-1 block">
                  ポイント
                </label>
                <input
                  type="number"
                  min={0}
                  value={pack.points}
                  onChange={(e) =>
                    updatePack(index, 'points', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 h-12 border border-gray-300 rounded-xl text-gray-900 text-right font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 価格 */}
              <div>
                <label className="lg:hidden text-xs font-semibold text-gray-500 mb-1 block">
                  価格 (円)
                </label>
                <input
                  type="number"
                  min={0}
                  value={pack.price}
                  onChange={(e) =>
                    updatePack(index, 'price', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 h-12 border border-gray-300 rounded-xl text-gray-900 text-right font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* ボーナスポイント */}
              <div>
                <label className="lg:hidden text-xs font-semibold text-gray-500 mb-1 block">
                  ボーナス
                </label>
                <input
                  type="number"
                  min={0}
                  value={pack.bonus_points}
                  onChange={(e) =>
                    updatePack(
                      index,
                      'bonus_points',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 h-12 border border-gray-300 rounded-xl text-gray-900 text-right font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 表示順 */}
              <div>
                <label className="lg:hidden text-xs font-semibold text-gray-500 mb-1 block">
                  表示順
                </label>
                <input
                  type="number"
                  min={0}
                  value={pack.sort_order}
                  onChange={(e) =>
                    updatePack(
                      index,
                      'sort_order',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 h-12 border border-gray-300 rounded-xl text-gray-900 text-center font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 有効/無効トグル */}
              <div className="flex justify-center">
                <button
                  onClick={() =>
                    updatePack(index, 'is_active', !pack.is_active)
                  }
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all duration-200"
                  title={pack.is_active ? '有効' : '無効'}
                >
                  {pack.is_active ? (
                    <ToggleRight size={28} className="text-blue-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {packs.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              ポイントパックが登録されていません
            </div>
          )}
        </div>
      </div>

      {/* フローティング保存ボタン（変更がある場合） */}
      {hasDirty && (
        <div className="sticky bottom-4 flex justify-center z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 min-h-[48px] bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {saving ? '保存中...' : `変更を保存 (${dirtyFields.size} 件)`}
          </button>
        </div>
      )}
    </div>
  );
}
