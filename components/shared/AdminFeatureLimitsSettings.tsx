'use client';

import { useState, useEffect } from 'react';
import { Activity, Loader2, Save, BookOpen, Sparkles, Infinity } from 'lucide-react';
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
  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType>('makers');
  const [featureLimits, setFeatureLimits] = useState<Record<string, FeatureLimits>>({});

  // Kindleプランタイプ
  type KdlPlanType = 'initial' | 'continuation';
  const [kdlPlanType, setKdlPlanType] = useState<KdlPlanType>('continuation');

  // サービスごとのプラン
  const kdlInitialPlans = ['initial_trial', 'initial_standard', 'initial_business'] as const;
  const kdlContinuationPlans: PlanTier[] = ['lite', 'standard', 'pro', 'business', 'enterprise'];
  const makersPlans: MakersPlanTier[] = ['guest', 'free', 'pro'];
  
  const currentPlans = selectedService === 'kdl' 
    ? (kdlPlanType === 'initial' ? [...kdlInitialPlans] : kdlContinuationPlans)
    : makersPlans;

  useEffect(() => {
    loadSettings();
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

  const handleSave = async (planTier: string) => {
    try {
      setSavingPlan(planTier);
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier,
          selectedPreset: 'custom',
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
      setSavingPlan(null);
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

  const handleLimitChange = (planTier: string, field: keyof FeatureLimits, value: string) => {
    const numValue = value === '' ? 0 : (value === '-1' ? -1 : parseInt(value) || 0);
    setFeatureLimits(prev => ({
      ...prev,
      [planTier]: {
        ...getDefaultLimits(planTier, selectedService),
        ...prev[planTier],
        [field]: field === 'total' && value === '' ? null : numValue
      }
    }));
  };

  // 値を表示用にフォーマット
  const formatLimitValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    if (value === -1) return '∞';
    return value.toString();
  };

  // 入力値を取得
  const getInputValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return value.toString();
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

      {/* 説明 */}
      <div className={`border rounded-lg p-4 ${
        selectedService === 'kdl' ? 'bg-amber-50 border-amber-200' : 'bg-purple-50 border-purple-200'
      }`}>
        <p className={`text-sm ${selectedService === 'kdl' ? 'text-amber-800' : 'text-purple-800'}`}>
          各プランの1日あたりのAI生成回数上限を設定します。
        </p>
        <p className={`text-xs mt-1 ${selectedService === 'kdl' ? 'text-amber-600' : 'text-purple-600'}`}>
          ※ <strong>-1</strong> = 無制限、<strong>空欄</strong> = 個別制限の合計
        </p>
      </div>

      {/* プラン別制限テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={selectedService === 'kdl' ? 'bg-amber-50' : 'bg-purple-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 w-28">プラン</th>
                <th className="px-3 py-3 text-center text-sm font-bold text-gray-900 w-24">
                  Profile<br /><span className="text-xs font-normal text-gray-500">LP生成</span>
                </th>
                <th className="px-3 py-3 text-center text-sm font-bold text-gray-900 w-24">
                  Business<br /><span className="text-xs font-normal text-gray-500">LP生成</span>
                </th>
                <th className="px-3 py-3 text-center text-sm font-bold text-gray-900 w-24">
                  Quiz<br /><span className="text-xs font-normal text-gray-500">生成</span>
                </th>
                {selectedService === 'kdl' && (
                  <>
                    <th className="px-3 py-3 text-center text-sm font-bold text-gray-900 w-24">
                      構成<br /><span className="text-xs font-normal text-gray-500">生成</span>
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-bold text-gray-900 w-24">
                      執筆<br /><span className="text-xs font-normal text-gray-500">生成</span>
                    </th>
                  </>
                )}
                <th className="px-3 py-3 text-center text-sm font-bold text-gray-900 w-24">
                  合計<br /><span className="text-xs font-normal text-gray-500">上限</span>
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 w-20">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPlans.map((plan) => {
                const limits = featureLimits[plan] || getDefaultLimits(plan, selectedService);

                return (
                  <tr key={plan} className="hover:bg-gray-50">
                    {/* プラン名 */}
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        selectedService === 'kdl' ? 'text-amber-700' : 'text-purple-700'
                      }`}>
                        {getPlanDisplayName(plan)}
                      </span>
                    </td>

                    {/* Profile LP */}
                    <td className="px-3 py-3">
                      <LimitInput
                        value={limits.profile}
                        onChange={(v) => handleLimitChange(plan, 'profile', v)}
                        service={selectedService}
                      />
                    </td>

                    {/* Business LP */}
                    <td className="px-3 py-3">
                      <LimitInput
                        value={limits.business}
                        onChange={(v) => handleLimitChange(plan, 'business', v)}
                        service={selectedService}
                      />
                    </td>

                    {/* Quiz */}
                    <td className="px-3 py-3">
                      <LimitInput
                        value={limits.quiz}
                        onChange={(v) => handleLimitChange(plan, 'quiz', v)}
                        service={selectedService}
                      />
                    </td>

                    {/* KDL用: 構成・執筆 */}
                    {selectedService === 'kdl' && (
                      <>
                        <td className="px-3 py-3">
                          <LimitInput
                            value={limits.kdl_outline ?? 0}
                            onChange={(v) => handleLimitChange(plan, 'kdl_outline', v)}
                            service={selectedService}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <LimitInput
                            value={limits.kdl_writing ?? 0}
                            onChange={(v) => handleLimitChange(plan, 'kdl_writing', v)}
                            service={selectedService}
                          />
                        </td>
                      </>
                    )}

                    {/* 合計上限 */}
                    <td className="px-3 py-3">
                      <LimitInput
                        value={limits.total}
                        onChange={(v) => handleLimitChange(plan, 'total', v)}
                        service={selectedService}
                        isTotal
                      />
                    </td>

                    {/* 保存ボタン */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSave(plan)}
                        disabled={savingPlan === plan}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                          selectedService === 'kdl' 
                            ? 'bg-amber-600 hover:bg-amber-700' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {savingPlan === plan ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 凡例 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-2">設定値の説明</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-10 h-8 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-900 font-mono">0</span>
            <span className="text-gray-600">利用不可</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 h-8 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-900 font-mono">5</span>
            <span className="text-gray-600">5回/日</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 h-8 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-900 font-mono">-1</span>
            <span className="text-gray-600">無制限</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 h-8 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-400 font-mono">--</span>
            <span className="text-gray-600">個別の合計</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 制限値入力コンポーネント
interface LimitInputProps {
  value: number | null | undefined;
  onChange: (value: string) => void;
  service: ServiceType;
  isTotal?: boolean;
}

function LimitInput({ value, onChange, service, isTotal }: LimitInputProps) {
  const displayValue = value === null || value === undefined ? '' : value.toString();
  const isUnlimited = value === -1;

  return (
    <div className="relative">
      {isUnlimited ? (
        <div 
          className={`w-full h-9 flex items-center justify-center rounded-lg border cursor-pointer ${
            service === 'kdl' 
              ? 'bg-amber-50 border-amber-200 text-amber-600' 
              : 'bg-purple-50 border-purple-200 text-purple-600'
          }`}
          onClick={() => onChange('0')}
          title="クリックで変更"
        >
          <Infinity size={18} />
        </div>
      ) : (
        <input
          type="number"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isTotal ? '--' : '0'}
          className={`w-full h-9 px-2 text-center text-sm border rounded-lg focus:ring-2 focus:outline-none bg-white text-gray-900 ${
            service === 'kdl' 
              ? 'border-amber-200 focus:ring-amber-300' 
              : 'border-purple-200 focus:ring-purple-300'
          } ${isTotal && displayValue === '' ? 'text-gray-400' : ''}`}
        />
      )}
    </div>
  );
}
