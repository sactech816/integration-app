'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  Save,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  RefreshCw,
} from 'lucide-react';

interface TrialSettings {
  id: string;
  trial_enabled: boolean;
  trial_delay_days: number;
  trial_price: number;
  trial_message: string;
  target_plans: string[];
  stripe_coupon_ids: Record<string, string>;
  campaign_start_at: string | null;
  campaign_end_at: string | null;
  updated_at: string;
}

interface TrialStats {
  totalOffered: number;
  totalAccepted: number;
  conversionRate: number;
}

interface TrialSettingsManagerProps {
  getAuthHeader: () => Record<string, string>;
}

const PLAN_OPTIONS = [
  { key: 'standard', name: 'スタンダード', price: 1980 },
  { key: 'business', name: 'ビジネス', price: 4980 },
  { key: 'premium', name: 'プレミアム', price: 9800 },
];

export default function TrialSettingsManager({ getAuthHeader }: TrialSettingsManagerProps) {
  const [settings, setSettings] = useState<TrialSettings | null>(null);
  const [stats, setStats] = useState<TrialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 設定を取得
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/trial-settings', {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('設定の取得に失敗しました');
      const data = await res.json();
      setSettings(data.settings);
      setStats(data.stats);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 設定を保存
  const saveSettings = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/trial-settings', {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trial_enabled: settings.trial_enabled,
          trial_delay_days: settings.trial_delay_days,
          trial_price: settings.trial_price,
          trial_message: settings.trial_message,
          target_plans: settings.target_plans,
          stripe_coupon_ids: settings.stripe_coupon_ids,
          campaign_start_at: settings.campaign_start_at || null,
          campaign_end_at: settings.campaign_end_at || null,
        }),
      });
      if (!res.ok) throw new Error('保存に失敗しました');
      const data = await res.json();
      setSettings(data.settings);
      setMessage({ type: 'success', text: '設定を保存しました' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // ON/OFF切り替え（即座に保存）
  const toggleEnabled = async () => {
    if (!settings) return;
    const newEnabled = !settings.trial_enabled;
    setSettings({ ...settings, trial_enabled: newEnabled });

    try {
      const res = await fetch('/api/admin/trial-settings', {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ trial_enabled: newEnabled }),
      });
      if (!res.ok) throw new Error('切り替えに失敗しました');
      setMessage({
        type: 'success',
        text: newEnabled ? 'お試しキャンペーンを有効にしました' : 'お試しキャンペーンを無効にしました',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setSettings({ ...settings, trial_enabled: !newEnabled }); // ロールバック
      setMessage({ type: 'error', text: err.message });
    }
  };

  const updateField = (field: string, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateCouponId = (planKey: string, couponId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      stripe_coupon_ids: { ...settings.stripe_coupon_ids, [planKey]: couponId },
    });
  };

  const toggleTargetPlan = (planKey: string) => {
    if (!settings) return;
    const current = settings.target_plans || [];
    const updated = current.includes(planKey)
      ? current.filter((p) => p !== planKey)
      : [...current, planKey];
    setSettings({ ...settings, target_plans: updated });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-center text-gray-500">
        設定の読み込みに失敗しました
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift size={24} className="text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">お試しキャンペーン設定</h2>
        </div>
        <button
          onClick={fetchSettings}
          className="text-gray-500 hover:text-gray-700 p-2 transition"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* メッセージ */}
      {message && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Users size={16} />
              <span className="text-sm">オファー表示数</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOffered}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Gift size={16} />
              <span className="text-sm">申し込み数</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalAccepted}</p>
          </div>
          <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp size={16} />
              <span className="text-sm">転換率</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</p>
          </div>
        </div>
      )}

      {/* メインON/OFFスイッチ */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">キャンペーン ON/OFF</h3>
            <p className="text-sm text-gray-600 mt-1">
              ONにすると、対象のフリーユーザー全員にモーダルが表示されます
            </p>
          </div>
          <button
            onClick={toggleEnabled}
            className="transition-transform hover:scale-105"
          >
            {settings.trial_enabled ? (
              <ToggleRight size={48} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={48} className="text-gray-400" />
            )}
          </button>
        </div>
        {settings.trial_enabled && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-sm text-emerald-700 font-medium">
              キャンペーンは現在有効です。条件を満たすフリーユーザーにモーダルが表示されます。
            </p>
          </div>
        )}
      </div>

      {/* 詳細設定 */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Settings size={20} className="text-gray-600" />
          <h3 className="font-bold text-gray-900 text-lg">詳細設定</h3>
        </div>

        {/* お試し価格 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            お試し価格（円）
          </label>
          <input
            type="number"
            value={settings.trial_price}
            onChange={(e) => updateField('trial_price', parseInt(e.target.value) || 0)}
            className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">全プラン共通の初月お試し価格</p>
        </div>

        {/* 表示開始日数 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            登録後の表示開始日数
          </label>
          <input
            type="number"
            value={settings.trial_delay_days}
            onChange={(e) => updateField('trial_delay_days', parseInt(e.target.value) || 0)}
            className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            ユーザー登録からN日後にモーダルを表示（0にすると即日表示）
          </p>
        </div>

        {/* モーダルメッセージ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            モーダルメッセージ
          </label>
          <textarea
            value={settings.trial_message}
            onChange={(e) => updateField('trial_message', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* 対象プラン */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            対象プラン
          </label>
          <div className="flex flex-wrap gap-3">
            {PLAN_OPTIONS.map((plan) => (
              <label
                key={plan.key}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.target_plans?.includes(plan.key)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={settings.target_plans?.includes(plan.key) || false}
                  onChange={() => toggleTargetPlan(plan.key)}
                  className="sr-only"
                />
                <span className="font-medium">{plan.name}</span>
                <span className="text-xs">¥{plan.price.toLocaleString()}/月</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stripeクーポン ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Stripe クーポンID（プラン別）
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Stripeダッシュボードで作成したクーポンIDを入力してください。
            「duration: once」（初回のみ）のクーポンを作成してください。
          </p>
          <div className="space-y-3">
            {PLAN_OPTIONS.map((plan) => (
              <div key={plan.key} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-32">
                  {plan.name}:
                </span>
                <input
                  type="text"
                  value={settings.stripe_coupon_ids?.[plan.key] || ''}
                  onChange={(e) => updateCouponId(plan.key, e.target.value)}
                  placeholder={`例: TRIAL_${plan.key.toUpperCase()}_500`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* キャンペーン期間 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">
              キャンペーン期間（任意）
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            空欄の場合は無期限になります
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">開始日時</label>
              <input
                type="datetime-local"
                value={settings.campaign_start_at?.slice(0, 16) || ''}
                onChange={(e) =>
                  updateField(
                    'campaign_start_at',
                    e.target.value ? new Date(e.target.value).toISOString() : null
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">終了日時</label>
              <input
                type="datetime-local"
                value={settings.campaign_end_at?.slice(0, 16) || ''}
                onChange={(e) =>
                  updateField(
                    'campaign_end_at',
                    e.target.value ? new Date(e.target.value).toISOString() : null
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                保存中...
              </>
            ) : (
              <>
                <Save size={18} />
                設定を保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
