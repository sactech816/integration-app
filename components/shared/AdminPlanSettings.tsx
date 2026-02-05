/**
 * 管理者向けプラン設定管理コンポーネント
 * サービス別のプラン価格・機能制限を管理
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Loader2, RefreshCw, Check, X,
  Sparkles, BookOpen, DollarSign, Zap, Users, Gamepad2
} from 'lucide-react';

interface PlanSetting {
  id: string;
  service: string;
  plan_tier: string;
  display_name: string;
  description: string;
  price: number;
  price_type: string;
  can_create: boolean;
  can_edit: boolean;
  can_use_ai: boolean;
  can_use_analytics: boolean;
  can_use_gamification: boolean;
  can_download_html: boolean;
  can_embed: boolean;
  can_hide_copyright: boolean;
  can_use_affiliate: boolean;
  ai_daily_limit: number;
  ai_monthly_limit: number;
  gamification_limit: number;
  book_limit: number;
  content_limit: number;
  premium_credits_daily: number;
  standard_credits_daily: number;
  sort_order: number;
  is_active: boolean;
  is_visible: boolean;
  badge_text: string | null;
}

interface AdminPlanSettingsProps {
  userId: string;
  userEmail?: string;
  serviceFilter?: 'makers' | 'kdl' | 'all'; // 表示するサービスを制限（デフォルト: all）
}

export default function AdminPlanSettings({ userId, userEmail, serviceFilter = 'all' }: AdminPlanSettingsProps) {
  const [plans, setPlans] = useState<Record<string, PlanSetting[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<'makers' | 'kdl'>(serviceFilter === 'kdl' ? 'kdl' : 'makers');
  const [selectedKdlType, setSelectedKdlType] = useState<'initial' | 'continuation'>('initial');
  const [editingPlan, setEditingPlan] = useState<PlanSetting | null>(null);
  const [requiresMigration, setRequiresMigration] = useState(false);

  // プラン設定を取得
  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings/plans?includeInactive=true');
      if (!response.ok) {
        throw new Error('プラン設定の取得に失敗しました');
      }

      const data = await response.json();
      setPlans(data.plans || {});
      setRequiresMigration(data.requiresMigration || false);
    } catch (err: any) {
      console.error('Plan settings fetch error:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // プラン設定を保存
  const handleSave = async (plan: PlanSetting) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/settings/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: plan.service,
          plan_tier: plan.plan_tier,
          updates: {
            display_name: plan.display_name,
            description: plan.description,
            price: plan.price,
            can_use_ai: plan.can_use_ai,
            can_use_analytics: plan.can_use_analytics,
            can_use_gamification: plan.can_use_gamification,
            can_download_html: plan.can_download_html,
            can_embed: plan.can_embed,
            can_hide_copyright: plan.can_hide_copyright,
            ai_daily_limit: plan.ai_daily_limit,
            gamification_limit: plan.gamification_limit,
            book_limit: plan.book_limit,
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
      console.error('Plan save error:', err);
      setError(err.message || '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // サービスアイコンを取得
  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'makers':
        return <Sparkles size={20} className="text-indigo-500" />;
      case 'kdl':
        return <BookOpen size={20} className="text-amber-500" />;
      default:
        return <Settings size={20} className="text-gray-500" />;
    }
  };

  // 価格をフォーマット
  const formatPrice = (price: number): string => {
    if (price === -1) return '要相談';
    if (price === 0) return '無料';
    return `¥${price.toLocaleString()}`;
  };

  // 現在のサービスのプラン
  const currentPlans = plans[selectedService] || [];

  // Kindleの場合は初回/継続でフィルタリング
  const filteredPlans = selectedService === 'kdl'
    ? currentPlans.filter((plan) => {
        const isInitialPlan = plan.plan_tier.startsWith('initial_');
        return selectedKdlType === 'initial' ? isInitialPlan : !isInitialPlan;
      })
    : currentPlans;

  // 制限値をフォーマット
  const formatLimit = (limit: number): string => {
    if (limit === -1) return '無制限';
    return limit.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Settings className="text-purple-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">プラン設定管理</h2>
            <p className="text-sm text-gray-600">価格・機能制限をDBから管理</p>
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

      {/* マイグレーション警告 */}
      {requiresMigration && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-bold">⚠️ データベースマイグレーションが必要です</p>
          <p className="text-sm text-yellow-700 mt-1">
            Supabase Studioで <code className="bg-yellow-100 px-1 rounded">supabase_service_plans.sql</code> を実行してください。
          </p>
        </div>
      )}

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

      {/* サービス選択タブ（serviceFilter='all'の場合のみ表示） */}
      {serviceFilter === 'all' && (
        <div className="flex gap-2 mb-4">
          {(['makers', 'kdl'] as const).map((service) => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedService === service
                  ? service === 'makers'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getServiceIcon(service)}
              {service === 'makers' ? '集客メーカー' : 'Kindle執筆'}
            </button>
          ))}
        </div>
      )}

      {/* Kindle: 初回/継続 サブタブ */}
      {selectedService === 'kdl' && (
        <div className="flex gap-2 mb-6 pl-4 border-l-4 border-amber-200">
          <button
            onClick={() => setSelectedKdlType('initial')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedKdlType === 'initial'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            初回プラン（一括）
          </button>
          <button
            onClick={() => setSelectedKdlType('continuation')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedKdlType === 'continuation'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            継続プラン（月額）
          </button>
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-600" size={32} />
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
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {editingPlan?.plan_tier === plan.plan_tier &&
                editingPlan?.service === plan.service ? (
                  // 編集モード
                  <PlanEditForm
                    plan={editingPlan}
                    onChange={setEditingPlan}
                    onSave={() => handleSave(editingPlan)}
                    onCancel={() => setEditingPlan(null)}
                    isSaving={isSaving}
                    service={selectedService}
                  />
                ) : (
                  // 表示モード
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {plan.display_name}
                        </h3>
                        <span className="text-lg font-bold text-purple-600">
                          {formatPrice(plan.price)}
                          {plan.price > 0 && (
                            <span className="text-sm text-gray-500 font-normal">
                              /{plan.price_type === 'monthly' ? '月' : plan.price_type === 'yearly' ? '年' : '回'}
                            </span>
                          )}
                        </span>
                        {!plan.is_active && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            無効
                          </span>
                        )}
                        {!plan.is_visible && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            非表示
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                      {/* 機能フラグ */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {plan.can_use_ai && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <Zap size={12} />
                            AI: {formatLimit(plan.ai_daily_limit)}/日
                          </span>
                        )}
                        {plan.can_use_gamification && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <Gamepad2 size={12} />
                            ゲーム: {formatLimit(plan.gamification_limit)}
                          </span>
                        )}
                        {selectedService === 'kdl' && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <BookOpen size={12} />
                            書籍: {formatLimit(plan.book_limit)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPlan({ ...plan })}
                      className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
interface PlanEditFormProps {
  plan: PlanSetting;
  onChange: (plan: PlanSetting) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  service: 'makers' | 'kdl';
}

function PlanEditForm({
  plan,
  onChange,
  onSave,
  onCancel,
  isSaving,
  service,
}: PlanEditFormProps) {
  const handleChange = (field: keyof PlanSetting, value: any) => {
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-gray-900"
        />
      </div>

      {/* 数量制限 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            AI回数/日
          </label>
          <input
            type="number"
            value={plan.ai_daily_limit}
            onChange={(e) => handleChange('ai_daily_limit', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">-1 = 無制限</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ゲーム作成数
          </label>
          <input
            type="number"
            value={plan.gamification_limit}
            onChange={(e) => handleChange('gamification_limit', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
          />
        </div>

        {service === 'kdl' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              書籍作成数
            </label>
            <input
              type="number"
              value={plan.book_limit}
              onChange={(e) => handleChange('book_limit', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
            />
          </div>
        )}
      </div>

      {/* 機能フラグ */}
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.can_use_ai}
            onChange={(e) => handleChange('can_use_ai', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">AI機能</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.can_use_gamification}
            onChange={(e) => handleChange('can_use_gamification', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">ゲーミフィケーション</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.can_hide_copyright}
            onChange={(e) => handleChange('can_hide_copyright', e.target.checked)}
            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">コピーライト非表示</span>
        </label>
      </div>

      {/* 表示・有効フラグ */}
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">有効</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={plan.is_visible}
            onChange={(e) => handleChange('is_visible', e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
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
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
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
