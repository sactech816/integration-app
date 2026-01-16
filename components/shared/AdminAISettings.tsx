'use client';

import { useState, useEffect } from 'react';
import { Settings, Zap, DollarSign, Check, Loader2, Save, Activity, Users } from 'lucide-react';
import type { PlanTier } from '@/lib/subscription';

interface AIPreset {
  name: string;
  description: string;
  outline: {
    model: string;
    provider: string;
    cost: number;
  };
  writing: {
    model: string;
    provider: string;
    cost: number;
  };
}

interface FeatureLimits {
  profile: number;
  business: number;
  quiz: number;
  total: number | null;
}

interface AdminAISettingsProps {
  userId: string;
}

export default function AdminAISettings({ userId }: AdminAISettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('standard');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [selectedPresets, setSelectedPresets] = useState<Record<string, 'presetA' | 'presetB'>>({});
  const [featureLimits, setFeatureLimits] = useState<Record<string, FeatureLimits>>({});
  const [activeTab, setActiveTab] = useState<'models' | 'limits'>('models');

  const plans: PlanTier[] = ['lite', 'standard', 'pro', 'business'];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const results: Record<string, any> = {};
      const presets: Record<string, 'presetA' | 'presetB'> = {};
      const limits: Record<string, FeatureLimits> = {};
      let needsMigration = false;

      for (const plan of plans) {
        try {
          const response = await fetch(`/api/admin/ai-settings?planTier=${plan}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch settings for ${plan}:`, response.status);
            continue;
          }
          
          const data = await response.json();
          
          // エラーレスポンスの場合
          if (data.error) {
            console.error(`API error for ${plan}:`, data.error);
            continue;
          }
          
          // マイグレーション必要フラグをチェック
          if (data.requiresMigration) {
            needsMigration = true;
          }
          
          results[plan] = data;
          presets[plan] = data.selectedPreset || 'presetB';
          
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

      setSettings(results);
      setSelectedPresets(presets);
      setFeatureLimits(limits);

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

      // マイグレーション必要な場合は警告
      if (needsMigration) {
        alert('⚠️ データベースマイグレーションが必要です\n\nSupabase Studioで以下のSQLファイルを実行してください:\n- supabase_admin_ai_settings.sql\n- supabase_ai_feature_limits.sql\n\n設定の保存機能を有効化するために必要です。');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('AI設定の読み込みに失敗しました。データベースマイグレーションを実行してください。');
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
          selectedPreset: selectedPresets[planTier],
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

  const handlePresetChange = (planTier: PlanTier, preset: 'presetA' | 'presetB') => {
    setSelectedPresets(prev => ({ ...prev, [planTier]: preset }));
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
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const planData = settings[selectedPlan];
  
  // データが存在しない、またはプリセットがない場合（AIモデル設定のみ必要）
  if (activeTab === 'models' && (!planData || !planData.presets)) {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} />
            <h2 className="text-2xl font-bold">AI設定管理</h2>
          </div>
          <p className="text-indigo-100">
            プラン別のAIモデル設定と使用制限を管理します
          </p>
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'models'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={20} />
              AIモデル設定
            </div>
          </button>
          <button
            onClick={() => setActiveTab('limits')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'limits'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={20} />
              使用制限設定
            </div>
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            プラン設定を読み込めませんでした。データベースマイグレーションを実行してください。
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            実行: <code className="bg-yellow-100 px-2 py-1 rounded">supabase_admin_ai_settings.sql</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings size={32} />
          <h2 className="text-2xl font-bold">AI設定管理</h2>
        </div>
        <p className="text-indigo-100">
          プラン別のAIモデル設定と使用制限を管理します
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'models'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap size={20} />
            AIモデル設定
          </div>
        </button>
        <button
          onClick={() => setActiveTab('limits')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'limits'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity size={20} />
            使用制限設定
          </div>
        </button>
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
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)}プラン
          </button>
        ))}
      </div>

      {/* AIモデル設定タブ */}
      {activeTab === 'models' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Kindle執筆機能</strong>で使用するデフォルトAIモデルをプラン別に設定します（候補A/B）
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ※ユーザーは実行時に「スピードモード」または「ハイクオリティモード」を選択できます
            </p>
          </div>

          {/* プリセット選択 */}
          {planData?.presets ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preset A */}
              <PresetCard
                preset="presetA"
                data={planData.presets.presetA}
                selected={selectedPresets[selectedPlan] === 'presetA'}
                onSelect={() => handlePresetChange(selectedPlan, 'presetA')}
              />

              {/* Preset B */}
              <PresetCard
                preset="presetB"
                data={planData.presets.presetB}
                selected={selectedPresets[selectedPlan] === 'presetB'}
                onSelect={() => handlePresetChange(selectedPlan, 'presetB')}
              />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">
                プリセットデータを読み込めませんでした。
              </p>
            </div>
          )}
        </>
      )}

      {/* AI使用制限タブ */}
      {activeTab === 'limits' && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>プロフィールLP、ビジネスLP、診断クイズ</strong>のAI生成機能の1日あたりの使用制限を設定します
            </p>
            <p className="text-xs text-amber-600 mt-1">
              ※ -1 を入力すると無制限になります。totalを設定すると全機能合計で制限されます。
            </p>
          </div>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
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
        </>
      )}

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={() => handleSave(selectedPlan)}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
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

interface PresetCardProps {
  preset: 'presetA' | 'presetB';
  data: AIPreset;
  selected: boolean;
  onSelect: () => void;
}

function PresetCard({ preset, data, selected, onSelect }: PresetCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative border-2 rounded-xl p-6 cursor-pointer transition-all
        ${selected
          ? 'border-indigo-600 bg-indigo-50 shadow-lg'
          : 'border-gray-300 bg-white hover:border-indigo-300 hover:shadow-md'
        }
      `}
    >
      {/* 選択インジケーター */}
      {selected && (
        <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full p-1">
          <Check size={20} />
        </div>
      )}

      {/* タイトル */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          候補 {preset === 'presetA' ? 'A' : 'B'}: {data.name}
        </h3>
        <p className="text-sm text-gray-600">{data.description}</p>
      </div>

      {/* 構成（Outline） */}
      <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-amber-500" />
          <span className="font-semibold text-gray-900">構成（脳）</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">モデル:</span>
            <span className="font-mono text-gray-900">{data.outline.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">プロバイダー:</span>
            <span className="font-semibold">{data.outline.provider}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">コスト:</span>
            <span className="flex items-center gap-1 font-bold text-green-600">
              <DollarSign size={14} />
              {data.outline.cost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 執筆（Writing） */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-blue-500" />
          <span className="font-semibold text-gray-900">執筆（手）</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">モデル:</span>
            <span className="font-mono text-gray-900">{data.writing.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">プロバイダー:</span>
            <span className="font-semibold">{data.writing.provider}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">コスト:</span>
            <span className="flex items-center gap-1 font-bold text-green-600">
              <DollarSign size={14} />
              {data.writing.cost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 推奨バッジ */}
      {data.description.includes('推奨') && (
        <div className="mt-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-center py-2 rounded-lg font-semibold text-sm">
          ⭐ 推奨設定
        </div>
      )}
    </div>
  );
}

