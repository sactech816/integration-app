'use client';

import { useState, useEffect } from 'react';
import { Activity, Loader2, Save, Users } from 'lucide-react';
import type { PlanTier } from '@/lib/subscription';

interface FeatureLimits {
  profile: number;
  business: number;
  quiz: number;
  total: number | null;
}

interface AdminFeatureLimitsSettingsProps {
  userId: string;
}

export default function AdminFeatureLimitsSettings({ userId }: AdminFeatureLimitsSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('standard');
  const [featureLimits, setFeatureLimits] = useState<Record<string, FeatureLimits>>({});

  const plans: PlanTier[] = ['lite', 'standard', 'pro', 'business'];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const limits: Record<string, FeatureLimits> = {};
      
      for (const plan of plans) {
        try {
          const response = await fetch(`/api/admin/ai-settings?planTier=${plan}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch settings for ${plan}:`, response.status);
            continue;
          }
          
          const data = await response.json();
          
          // 機能制限を読み込み
          limits[plan] = data.feature_limits || {
            profile: 5,
            business: 5,
            quiz: 5,
            total: null
          };
        } catch (error) {
          console.error(`Error loading settings for ${plan}:`, error);
        }
      }

      // featureLimitsが空のプランにはデフォルト値を設定
      const allPlans: PlanTier[] = ['lite', 'standard', 'pro', 'business'];
      const defaultLimits: FeatureLimits = {
        profile: 5,
        business: 5,
        quiz: 5,
        total: null
      };
      
      allPlans.forEach(plan => {
        if (!limits[plan]) {
          limits[plan] = defaultLimits;
        }
      });
      
      setFeatureLimits(limits);
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('AI設定の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (planTier: PlanTier) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier,
          selectedPreset: 'presetB', // ダミー値（必須パラメータのため）
          featureLimits: featureLimits[planTier],
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      alert('設定を保存しました');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleLimitChange = (planTier: PlanTier, field: keyof FeatureLimits, value: string) => {
    const numValue = value === '' ? 0 : (value === '-1' ? -1 : parseInt(value) || 0);
    setFeatureLimits(prev => ({
      ...prev,
      [planTier]: {
        profile: prev[planTier]?.profile ?? 5,
        business: prev[planTier]?.business ?? 5,
        quiz: prev[planTier]?.quiz ?? 5,
        total: prev[planTier]?.total ?? null,
        ...prev[planTier],
        [field]: field === 'total' && value === '' ? null : numValue
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity size={32} />
          <h2 className="text-2xl font-bold">AI生成機能の使用制限設定</h2>
        </div>
        <p className="text-purple-100">
          プロフィールLP、ビジネスLP、診断クイズのAI生成機能の1日あたりの使用制限を管理します
        </p>
      </div>

      {/* プラン選択タブ */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {plans.map((plan) => (
          <button
            key={plan}
            onClick={() => setSelectedPlan(plan)}
            className={`
              px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all
              ${selectedPlan === plan
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)}プラン
          </button>
        ))}
      </div>

      {/* 説明 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>プロフィールLP、ビジネスLP、診断クイズ</strong>のAI生成機能の1日あたりの使用制限を設定します
        </p>
        <p className="text-xs text-amber-600 mt-1">
          ※ -1 を入力すると無制限になります。totalを設定すると全機能合計で制限されます。
        </p>
      </div>

      {/* 使用制限設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid gap-6">
          {/* プロフィールLP */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-900 block mb-1">
                プロフィールLP生成
              </label>
              <p className="text-xs text-gray-600">
                1日あたりの生成回数上限
              </p>
            </div>
            <div className="w-32">
              <input
                type="number"
                value={featureLimits[selectedPlan]?.profile ?? 5}
                onChange={(e) => handleLimitChange(selectedPlan, 'profile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="5"
              />
              <p className="text-xs text-center text-gray-500 mt-1">回/日</p>
            </div>
          </div>

          {/* ビジネスLP */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-900 block mb-1">
                ビジネスLP生成
              </label>
              <p className="text-xs text-gray-600">
                1日あたりの生成回数上限
              </p>
            </div>
            <div className="w-32">
              <input
                type="number"
                value={featureLimits[selectedPlan]?.business ?? 5}
                onChange={(e) => handleLimitChange(selectedPlan, 'business', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="5"
              />
              <p className="text-xs text-center text-gray-500 mt-1">回/日</p>
            </div>
          </div>

          {/* 診断クイズ */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-900 block mb-1">
                診断クイズ生成
              </label>
              <p className="text-xs text-gray-600">
                1日あたりの生成回数上限
              </p>
            </div>
            <div className="w-32">
              <input
                type="number"
                value={featureLimits[selectedPlan]?.quiz ?? 5}
                onChange={(e) => handleLimitChange(selectedPlan, 'quiz', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="5"
              />
              <p className="text-xs text-center text-gray-500 mt-1">回/日</p>
            </div>
          </div>

          {/* 全機能合計 */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-bold text-gray-900 block mb-1">
                  全機能合計の上限（オプション）
                </label>
                <p className="text-xs text-gray-600">
                  空欄の場合は個別の合計値。設定すると全機能合計で制限されます
                </p>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={featureLimits[selectedPlan]?.total === null ? '' : featureLimits[selectedPlan]?.total ?? ''}
                  onChange={(e) => handleLimitChange(selectedPlan, 'total', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="空欄"
                />
                <p className="text-xs text-center text-gray-500 mt-1">回/日</p>
              </div>
            </div>
          </div>

          {/* 使用例 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              <Users size={16} className="inline mr-1" />
              現在の設定
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              <p>• プロフィールLP: <strong>{featureLimits[selectedPlan]?.profile === -1 ? '無制限' : `${featureLimits[selectedPlan]?.profile ?? 5}回/日`}</strong></p>
              <p>• ビジネスLP: <strong>{featureLimits[selectedPlan]?.business === -1 ? '無制限' : `${featureLimits[selectedPlan]?.business ?? 5}回/日`}</strong></p>
              <p>• 診断クイズ: <strong>{featureLimits[selectedPlan]?.quiz === -1 ? '無制限' : `${featureLimits[selectedPlan]?.quiz ?? 5}回/日`}</strong></p>
              {featureLimits[selectedPlan]?.total !== null && (
                <p className="text-amber-700 font-semibold">
                  ⚠️ 全機能合計: <strong>{featureLimits[selectedPlan]?.total === -1 ? '無制限' : `${featureLimits[selectedPlan]?.total}回/日`}</strong>（こちらが優先）
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={() => handleSave(selectedPlan)}
          disabled={saving}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              保存中...
            </>
          ) : (
            <>
              <Save size={20} />
              {selectedPlan}プランの設定を保存
            </>
          )}
        </button>
      </div>
    </div>
  );
}
