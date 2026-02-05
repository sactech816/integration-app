'use client';

/**
 * KDL専用プラン設定管理コンポーネント
 * 書籍作成数、構成系AI、執筆系AIの制限を管理
 */

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Loader2, RefreshCw, Check, X,
  BookOpen, Brain, PenTool, Zap
} from 'lucide-react';

interface KdlPlanSetting {
  id: string;
  service: string;
  plan_tier: string;
  display_name: string;
  description: string;
  price: number;
  price_type: string;
  // 書籍制限
  book_limit: number;
  // AI制限
  ai_daily_limit: number;
  ai_outline_daily_limit: number;
  ai_writing_daily_limit: number;
  // AIクレジット
  premium_credits_daily: number;
  standard_credits_daily: number;
  // メタデータ
  sort_order: number;
  is_active: boolean;
  is_visible: boolean;
}

interface KdlPlanSettingsProps {
  userId: string;
  userEmail?: string;
}

export default function KdlPlanSettings({ userId, userEmail }: KdlPlanSettingsProps) {
  const [plans, setPlans] = useState<KdlPlanSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'initial' | 'continuation'>('initial');
  const [editingPlan, setEditingPlan] = useState<KdlPlanSetting | null>(null);

  // プラン設定を取得
  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings/plans?service=kdl&includeInactive=true');
      if (!response.ok) {
        throw new Error('プラン設定の取得に失敗しました');
      }

      const data = await response.json();
      setPlans(data.plans?.kdl || []);
    } catch (err: any) {
      console.error('KDL plan settings fetch error:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // プラン設定を保存
  const handleSave = async (plan: KdlPlanSetting) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/settings/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'kdl',
          plan_tier: plan.plan_tier,
          updates: {
            display_name: plan.display_name,
            description: plan.description,
            price: plan.price,
            book_limit: plan.book_limit,
            ai_daily_limit: plan.ai_daily_limit,
            ai_outline_daily_limit: plan.ai_outline_daily_limit,
            ai_writing_daily_limit: plan.ai_writing_daily_limit,
            premium_credits_daily: plan.premium_credits_daily,
            standard_credits_daily: plan.standard_credits_daily,
            is_active: plan.is_active,
            is_visible: plan.is_visible,
          },
          userEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '保存に失敗しました');
      }

      setSuccess('プラン設定を保存しました');
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      console.error('KDL plan save error:', err);
      setError(err.message || '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 価格をフォーマット
  const formatPrice = (price: number): string => {
    if (price === -1) return '要相談';
    if (price === 0) return '無料';
    return `¥${price.toLocaleString()}`;
  };

  // 制限値をフォーマット
  const formatLimit = (limit: number): string => {
    if (limit === -1) return '無制限';
    return limit.toString();
  };

  // 初回/継続でフィルタリング
  const filteredPlans = plans.filter((plan) => {
    const isInitialPlan = plan.plan_tier.startsWith('initial_');
    return selectedType === 'initial' ? isInitialPlan : !isInitialPlan;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <BookOpen className="text-amber-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">KDLプラン設定</h2>
            <p className="text-sm text-gray-600">書籍作成・AI使用制限を管理</p>
          </div>
        </div>

        <button
          onClick={fetchPlans}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="更新"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* メッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2 text-red-700">
          <X size={20} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-2 text-green-700">
          <Check size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* 初回/継続 サブタブ */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedType('initial')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'initial'
              ? 'bg-amber-500 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          初回プラン（一括）
        </button>
        <button
          onClick={() => setSelectedType('continuation')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'continuation'
              ? 'bg-amber-500 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          継続プラン（月額）
        </button>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-600" size={32} />
        </div>
      )}

      {/* プラン一覧 */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings size={48} className="mx-auto mb-3 text-gray-300" />
              <p>プランデータがありません</p>
              <p className="text-sm mt-1">マイグレーションを実行してください</p>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div
                key={`${plan.service}-${plan.plan_tier}`}
                className={`border rounded-xl p-4 transition-colors ${
                  plan.is_active
                    ? 'border-amber-200 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {editingPlan?.plan_tier === plan.plan_tier ? (
                  // 編集モード
                  <KdlPlanEditForm
                    plan={editingPlan}
                    onChange={setEditingPlan}
                    onSave={() => handleSave(editingPlan)}
                    onCancel={() => setEditingPlan(null)}
                    isSaving={isSaving}
                  />
                ) : (
                  // 表示モード
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {plan.display_name}
                        </h3>
                        <span className="text-lg font-bold text-amber-600">
                          {formatPrice(plan.price)}
                          {plan.price > 0 && (
                            <span className="text-sm text-gray-500 font-normal">
                              /{plan.price_type === 'monthly' ? '月' : plan.price_type === 'one_time' ? '回' : '年'}
                            </span>
                          )}
                        </span>
                        {!plan.is_active && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            無効
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                      {/* 制限表示 */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <BookOpen size={12} />
                          書籍: {formatLimit(plan.book_limit)}冊
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <Brain size={12} />
                          構成系: {formatLimit(plan.ai_outline_daily_limit)}/日
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <PenTool size={12} />
                          執筆系: {formatLimit(plan.ai_writing_daily_limit)}/日
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <Zap size={12} />
                          トータル: {formatLimit(plan.ai_daily_limit)}/日
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPlan({ ...plan })}
                      className="px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      編集
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// プラン編集フォーム
interface KdlPlanEditFormProps {
  plan: KdlPlanSetting;
  onChange: (plan: KdlPlanSetting) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

function KdlPlanEditForm({
  plan,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: KdlPlanEditFormProps) {
  const handleChange = (field: keyof KdlPlanSetting, value: any) => {
    onChange({ ...plan, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* 表示名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            表示名
          </label>
          <input
            type="text"
            value={plan.display_name}
            onChange={(e) => handleChange('display_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
          />
        </div>

        {/* 価格 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            価格（円）
          </label>
          <input
            type="number"
            value={plan.price}
            onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">-1 = 要相談</p>
        </div>
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          value={plan.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none text-gray-900"
        />
      </div>

      {/* 書籍作成数制限 */}
      <div className="bg-amber-50 rounded-lg p-4">
        <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
          <BookOpen size={16} />
          書籍作成制限
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              書籍作成上限
            </label>
            <input
              type="number"
              value={plan.book_limit}
              onChange={(e) => handleChange('book_limit', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">-1 = 無制限</p>
          </div>
        </div>
      </div>

      {/* AI使用回数制限 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Zap size={16} />
          AI使用回数制限（/日）
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Brain size={14} />
              構成系AI
            </label>
            <input
              type="number"
              value={plan.ai_outline_daily_limit}
              onChange={(e) => handleChange('ai_outline_daily_limit', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">タイトル・目次生成</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <PenTool size={14} />
              執筆系AI
            </label>
            <input
              type="number"
              value={plan.ai_writing_daily_limit}
              onChange={(e) => handleChange('ai_writing_daily_limit', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">本文生成・書き換え</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              トータル
            </label>
            <input
              type="number"
              value={plan.ai_daily_limit}
              onChange={(e) => handleChange('ai_daily_limit', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">全AI合計</p>
          </div>
        </div>
      </div>

      {/* 表示・有効フラグ */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">有効</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.is_visible}
            onChange={(e) => handleChange('is_visible', e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">料金表に表示</span>
        </label>
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save size={18} />
              保存
            </>
          )}
        </button>
      </div>
    </div>
  );
}
