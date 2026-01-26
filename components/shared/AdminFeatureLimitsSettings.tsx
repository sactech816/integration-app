'use client';

import { useState, useEffect } from 'react';
import { Activity, Loader2, Save, Users, BookOpen, Sparkles } from 'lucide-react';
import type { PlanTier, MakersPlanTier } from '@/lib/subscription';

type ServiceType = 'kdl' | 'makers';

interface FeatureLimits {
  profile: number;
  business: number;
  quiz: number;
  total: number | null;
  // KDL用
  kdl_outline?: number;
  kdl_writing?: number;
}

interface AdminFeatureLimitsSettingsProps {
  userId: string;
}

export default function AdminFeatureLimitsSettings({ userId }: AdminFeatureLimitsSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('makers');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | MakersPlanTier>('pro');
  const [featureLimits, setFeatureLimits] = useState<Record<string, FeatureLimits>>({});

  // Kindleプランタイプ
  type KdlPlanType = 'initial' | 'continuation';
  const [kdlPlanType, setKdlPlanType] = useState<KdlPlanType>('continuation');

  // サービスごとのプラン
  const kdlInitialPlans = ['initial_trial', 'initial_standard', 'initial_business'] as const;
  const kdlContinuationPlans: PlanTier[] = ['lite', 'standard', 'pro', 'business', 'enterprise'];
  const makersPlans: MakersPlanTier[] = ['guest', 'free', 'pro'];
  
  const currentPlans = selectedService === 'kdl' 
    ? (kdlPlanType === 'initial' ? kdlInitialPlans : kdlContinuationPlans)
    : makersPlans;

  useEffect(() => {
    loadSettings();
  }, [selectedService, kdlPlanType]);

  // サービス変更時にプランをリセット
  useEffect(() => {
    if (selectedService === 'kdl') {
      if (kdlPlanType === 'initial') {
        setSelectedPlan('initial_trial' as any);
      } else {
        setSelectedPlan('standard');
      }
    } else {
      setSelectedPlan('pro');
    }
  }, [selectedService, kdlPlanType]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const limits: Record<string, FeatureLimits> = {};
      
      for (const plan of currentPlans) {
        try {
          const response = await fetch(`/api/admin/ai-settings?planTier=${plan}&service=${selectedService}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch settings for ${plan}:`, response.status);
            continue;
          }
          
          const data = await response.json();
          
          // 機能制限を読み込み
          limits[plan] = data.feature_limits || getDefaultLimits(plan, selectedService);
        } catch (error) {
          console.error(`Error loading settings for ${plan}:`, error);
        }
      }

      // featureLimitsが空のプランにはデフォルト値を設定
      currentPlans.forEach(plan => {
        if (!limits[plan]) {
          limits[plan] = getDefaultLimits(plan, selectedService);
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

  // デフォルトの制限値を取得
  const getDefaultLimits = (plan: string, service: ServiceType): FeatureLimits => {
    if (service === 'makers') {
      // 集客メーカーのデフォルト
      switch (plan) {
        case 'guest':
          return { profile: 0, business: 0, quiz: 0, total: 0 };
        case 'free':
          return { profile: 0, business: 0, quiz: 0, total: 0 };
        case 'pro':
          return { profile: -1, business: -1, quiz: -1, total: null };
        default:
          return { profile: 5, business: 5, quiz: 5, total: null };
      }
    } else {
      // KDLのデフォルト
      switch (plan) {
        // 初回プラン（一括）
        case 'initial_trial':
          return { profile: 5, business: 5, quiz: 5, total: null, kdl_outline: 30, kdl_writing: 30 };
        case 'initial_standard':
          return { profile: 10, business: 10, quiz: 10, total: null, kdl_outline: 50, kdl_writing: 50 };
        case 'initial_business':
          return { profile: -1, business: -1, quiz: -1, total: null, kdl_outline: 100, kdl_writing: 100 };
        // 継続プラン（月額）
        case 'lite':
          return { profile: 5, business: 5, quiz: 5, total: null, kdl_outline: 20, kdl_writing: 20 };
        case 'standard':
          return { profile: 10, business: 10, quiz: 10, total: null, kdl_outline: 30, kdl_writing: 30 };
        case 'pro':
          return { profile: -1, business: -1, quiz: -1, total: null, kdl_outline: 100, kdl_writing: 100 };
        case 'business':
          return { profile: -1, business: -1, quiz: -1, total: null, kdl_outline: -1, kdl_writing: -1 };
        case 'enterprise':
          return { profile: -1, business: -1, quiz: -1, total: null, kdl_outline: -1, kdl_writing: -1 };
        default:
          return { profile: 5, business: 5, quiz: 5, total: null };
      }
    }
  };

  const handleSave = async (planTier: PlanTier | MakersPlanTier) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier,
          selectedPreset: 'presetB', // ダミー値（必須パラメータのため）
          featureLimits: featureLimits[planTier],
          service: selectedService,
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

  // プラン名を取得
  const getPlanDisplayName = (plan: string): string => {
    const names: Record<string, string> = {
      // 集客メーカー
      guest: 'ゲスト',
      free: 'フリー',
      // Kindle初回（一括）
      initial_trial: 'トライアル',
      initial_standard: 'スタンダード',
      initial_business: 'ビジネス',
      // Kindle継続（月額）
      lite: 'ライト',
      standard: 'スタンダード',
      pro: 'プロ',
      business: 'ビジネス',
      enterprise: 'エンタープライズ',
    };
    return names[plan] || plan;
  };

  const handleLimitChange = (planTier: PlanTier | MakersPlanTier, field: keyof FeatureLimits, value: string) => {
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
      <div className={`rounded-lg p-6 ${
        selectedService === 'kdl' 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
          : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <Activity size={32} />
          <h2 className="text-2xl font-bold">AI生成機能の使用制限設定</h2>
        </div>
        <p className={selectedService === 'kdl' ? 'text-amber-100' : 'text-purple-100'}>
          {selectedService === 'kdl' 
            ? 'Kindle執筆のAI生成機能の1日あたりの使用制限を管理します'
            : 'プロフィールLP、ビジネスLP、診断クイズのAI生成機能の1日あたりの使用制限を管理します'
          }
        </p>
      </div>

      {/* サービス選択タブ */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedService('makers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedService === 'makers'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Sparkles size={18} />
          集客メーカー
        </button>
        <button
          onClick={() => setSelectedService('kdl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedService === 'kdl'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BookOpen size={18} />
          Kindle執筆
        </button>
      </div>

      {/* Kindleプランタイプ選択（Kindle選択時のみ） */}
      {selectedService === 'kdl' && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setKdlPlanType('initial')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              kdlPlanType === 'initial'
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            初回プラン（一括）
          </button>
          <button
            onClick={() => setKdlPlanType('continuation')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              kdlPlanType === 'continuation'
                ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            継続プラン（月額）
          </button>
        </div>
      )}

      {/* プラン選択タブ */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {currentPlans.map((plan) => (
          <button
            key={plan}
            onClick={() => setSelectedPlan(plan as any)}
            className={`
              px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all
              ${selectedPlan === plan
                ? selectedService === 'kdl' ? 'bg-amber-600 text-white shadow-lg' : 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {getPlanDisplayName(plan)}
          </button>
        ))}
      </div>

      {/* 説明 */}
      <div className={`border rounded-lg p-4 ${
        selectedService === 'kdl' ? 'bg-amber-50 border-amber-200' : 'bg-purple-50 border-purple-200'
      }`}>
        <p className={`text-sm ${selectedService === 'kdl' ? 'text-amber-800' : 'text-purple-800'}`}>
          {selectedService === 'kdl' 
            ? <><strong>Kindle執筆</strong>のAI生成機能の1日あたりの使用制限を設定します</>
            : <><strong>プロフィールLP、ビジネスLP、診断クイズ</strong>のAI生成機能の1日あたりの使用制限を設定します</>
          }
        </p>
        <p className={`text-xs mt-1 ${selectedService === 'kdl' ? 'text-amber-600' : 'text-purple-600'}`}>
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
          className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
            selectedService === 'kdl' 
              ? 'bg-amber-600 hover:bg-amber-700' 
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              保存中...
            </>
          ) : (
            <>
              <Save size={20} />
              {getPlanDisplayName(selectedPlan)}プランの設定を保存
            </>
          )}
        </button>
      </div>
    </div>
  );
}
