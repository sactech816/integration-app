'use client';

import { useState, useEffect } from 'react';
import { Settings, Zap, DollarSign, Check, Loader2, Save, Sparkles, BookOpen, Sliders } from 'lucide-react';
import type { PlanTier, MakersPlanTier } from '@/lib/subscription';
import { PLAN_AI_PRESETS } from '@/lib/ai-provider';

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

// 利用可能なAIモデル一覧
const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', cost: 0.01 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', cost: 0.05 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', cost: 0.02 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', cost: 0.10 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', cost: 0.08 },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', cost: 0.02 },
];

type PresetType = 'presetA' | 'presetB' | 'custom';
type ServiceType = 'kdl' | 'makers';

interface CustomModelSettings {
  outlineModel: string;
  writingModel: string;
}

interface AdminAISettingsProps {
  userId: string;
}

export default function AdminAISettings({ userId }: AdminAISettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('kdl');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | MakersPlanTier>('standard');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [selectedPresets, setSelectedPresets] = useState<Record<string, PresetType>>({});
  const [customModels, setCustomModels] = useState<Record<string, CustomModelSettings>>({});

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
      const results: Record<string, any> = {};
      const presets: Record<string, PresetType> = {};
      const customs: Record<string, CustomModelSettings> = {};
      let needsMigration = false;

      for (const plan of currentPlans) {
        try {
          const response = await fetch(`/api/admin/ai-settings?planTier=${plan}&service=${selectedService}`);
          
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
          // カスタムモデル設定を復元（プリセットのcustomDefaultがあればそれを使用）
          const planPresets = PLAN_AI_PRESETS[plan as keyof typeof PLAN_AI_PRESETS];
          const customDefault = planPresets && 'customDefault' in planPresets 
            ? (planPresets as any).customDefault 
            : { outlineModel: 'gemini-1.5-flash', writingModel: 'gemini-1.5-flash' };
          
          if (data.customOutlineModel || data.customWritingModel) {
            customs[plan] = {
              outlineModel: data.customOutlineModel || customDefault.outlineModel,
              writingModel: data.customWritingModel || customDefault.writingModel,
            };
          } else {
            customs[plan] = {
              outlineModel: customDefault.outlineModel,
              writingModel: customDefault.writingModel,
            };
          }
        } catch (error) {
          console.error(`Error loading settings for ${plan}:`, error);
        }
      }

      setSettings(results);
      setSelectedPresets(presets);
      setCustomModels(customs);

      // マイグレーション必要な場合は警告
      if (needsMigration) {
        alert('⚠️ データベースマイグレーションが必要です\n\nSupabase Studioで以下のSQLファイルを実行してください:\n- supabase_admin_ai_settings.sql\n\n設定の保存機能を有効化するために必要です。');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('AI設定の読み込みに失敗しました。データベースマイグレーションを実行してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (planTier: PlanTier | MakersPlanTier) => {
    try {
      setSaving(true);
      const preset = selectedPresets[planTier];
      const custom = customModels[planTier];
      
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier,
          selectedPreset: preset,
          customOutlineModel: preset === 'custom' ? custom?.outlineModel : null,
          customWritingModel: preset === 'custom' ? custom?.writingModel : null,
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

  const handlePresetChange = (planTier: PlanTier | MakersPlanTier, preset: PresetType) => {
    setSelectedPresets(prev => ({ ...prev, [planTier]: preset }));
  };

  const handleCustomModelChange = (
    planTier: PlanTier | MakersPlanTier,
    field: 'outlineModel' | 'writingModel',
    value: string
  ) => {
    setCustomModels(prev => ({
      ...prev,
      [planTier]: {
        ...prev[planTier],
        [field]: value,
      },
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
  const hasPresets = planData && planData.presets;
  const currentPreset = selectedPresets[selectedPlan] || 'presetB';
  
  // カスタムモデルのデフォルト値をプリセットから取得
  const getCustomDefault = (plan: string) => {
    const planPresets = PLAN_AI_PRESETS[plan as keyof typeof PLAN_AI_PRESETS];
    if (planPresets && 'customDefault' in planPresets) {
      return (planPresets as any).customDefault;
    }
    return { outlineModel: 'gemini-1.5-flash', writingModel: 'gemini-1.5-flash' };
  };
  const currentCustom = customModels[selectedPlan] || getCustomDefault(selectedPlan);

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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className={`rounded-lg p-6 ${
        selectedService === 'kdl' 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          {selectedService === 'kdl' ? <BookOpen size={32} /> : <Sparkles size={32} />}
          <h2 className="text-2xl font-bold">AIモデル設定</h2>
        </div>
        <p className={selectedService === 'kdl' ? 'text-amber-100' : 'text-indigo-100'}>
          {selectedService === 'kdl' 
            ? 'Kindle執筆機能で使用するデフォルトAIモデルをプラン別に設定します'
            : '集客メーカーで使用するデフォルトAIモデルをプラン別に設定します'
          }
        </p>
      </div>

      {/* サービス選択タブ */}
      <div className="flex gap-2 mb-4">
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
                ? selectedService === 'kdl' ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg'
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
        selectedService === 'kdl' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-sm ${selectedService === 'kdl' ? 'text-amber-800' : 'text-blue-800'}`}>
          <strong>{selectedService === 'kdl' ? 'Kindle執筆' : '集客メーカー'}</strong>で使用するデフォルトAIモデルをプラン別に設定します（候補A/B/カスタム）
        </p>
        <p className={`text-xs mt-1 ${selectedService === 'kdl' ? 'text-amber-600' : 'text-blue-600'}`}>
          ※カスタムを選択すると、構成用・執筆用のモデルを個別に設定できます
        </p>
      </div>

      {/* プリセット選択 */}
      {hasPresets ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Preset A */}
            <PresetCard
              preset="presetA"
              data={planData.presets.presetA}
              selected={currentPreset === 'presetA'}
              onSelect={() => handlePresetChange(selectedPlan, 'presetA')}
            />

            {/* Preset B */}
            <PresetCard
              preset="presetB"
              data={planData.presets.presetB}
              selected={currentPreset === 'presetB'}
              onSelect={() => handlePresetChange(selectedPlan, 'presetB')}
            />

            {/* Custom */}
            <CustomPresetCard
              selected={currentPreset === 'custom'}
              onSelect={() => handlePresetChange(selectedPlan, 'custom')}
              customModels={currentCustom}
              onModelChange={(field, value) => handleCustomModelChange(selectedPlan, field, value)}
            />
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            プリセットデータを読み込めませんでした。データベースマイグレーションを実行してください。
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            実行: <code className="bg-yellow-100 px-2 py-1 rounded">supabase_admin_ai_settings.sql</code>
          </p>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={() => handleSave(selectedPlan)}
          disabled={saving}
          className={`flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
            selectedService === 'kdl' 
              ? 'bg-amber-600 hover:bg-amber-700' 
              : 'bg-indigo-600 hover:bg-indigo-700'
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

// カスタムプリセットカード
interface CustomPresetCardProps {
  selected: boolean;
  onSelect: () => void;
  customModels: CustomModelSettings;
  onModelChange: (field: 'outlineModel' | 'writingModel', value: string) => void;
}

function CustomPresetCard({ selected, onSelect, customModels, onModelChange }: CustomPresetCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative border-2 rounded-xl p-4 cursor-pointer transition-all
        ${selected
          ? 'border-purple-600 bg-purple-50 shadow-lg'
          : 'border-gray-300 bg-white hover:border-purple-300 hover:shadow-md'
        }
      `}
    >
      {/* 選択インジケーター */}
      {selected && (
        <div className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-1">
          <Check size={16} />
        </div>
      )}

      {/* タイトル */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Sliders size={18} className="text-purple-500" />
          候補 C: カスタム
        </h3>
        <p className="text-xs text-gray-600">モデルを個別に選択</p>
      </div>

      {/* モデル選択（選択時のみ表示） */}
      {selected && (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* 構成用モデル */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              構成（脳）用モデル
            </label>
            <select
              value={customModels.outlineModel}
              onChange={(e) => onModelChange('outlineModel', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-900"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          {/* 執筆用モデル */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              執筆（手）用モデル
            </label>
            <select
              value={customModels.writingModel}
              onChange={(e) => onModelChange('writingModel', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-900"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 非選択時の説明 */}
      {!selected && (
        <p className="text-xs text-gray-500 mt-2">
          クリックして構成・執筆用モデルを個別に設定
        </p>
      )}
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

