'use client';

import { useState, useEffect, useMemo } from 'react';
import { Settings, Loader2, Save, BookOpen, Sparkles, Shield, ChevronDown } from 'lucide-react';
import type { PlanTier, MakersPlanTier } from '@/lib/subscription';
import { AVAILABLE_AI_MODELS, DEFAULT_AI_MODELS, getModelsByProvider, type AIModelInfo } from '@/lib/ai-provider';

type ServiceType = 'kdl' | 'makers';

interface PlanModelSettings {
  outlineModel: string;
  writingModel: string;
  backupOutlineModel: string;
  backupWritingModel: string;
}

interface AdminAISettingsProps {
  userId: string;
}

export default function AdminAISettings({ userId }: AdminAISettingsProps) {
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType>('makers');
  const [settings, setSettings] = useState<Record<string, PlanModelSettings>>({});

  // サービスごとのプラン（Kindleは初回と継続を統合して表示）
  const kdlAllPlans = [
    'none',                                                    // 未加入ユーザー
    'initial_trial', 'initial_standard', 'initial_business',  // 初回（一括）
    'lite', 'standard', 'pro', 'business', 'enterprise'       // 継続（月額）
  ] as const;
  const makersPlans: MakersPlanTier[] = ['guest', 'free', 'pro'];
  
  const currentPlans = selectedService === 'kdl' ? [...kdlAllPlans] : makersPlans;

  // プロバイダー別モデル
  const modelsByProvider = useMemo(() => getModelsByProvider(), []);

  useEffect(() => {
    loadSettings();
  }, [selectedService]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const newSettings: Record<string, PlanModelSettings> = {};

      for (const plan of currentPlans) {
        try {
          const response = await fetch(`/api/admin/ai-settings?planTier=${plan}&service=${selectedService}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch settings for ${plan}:`, response.status);
            continue;
          }
          
          const data = await response.json();
          
          newSettings[plan] = {
            outlineModel: data.outlineModel || data.customOutlineModel || DEFAULT_AI_MODELS.primary.outline,
            writingModel: data.writingModel || data.customWritingModel || DEFAULT_AI_MODELS.primary.writing,
            backupOutlineModel: data.backupOutlineModel || DEFAULT_AI_MODELS.backup.outline,
            backupWritingModel: data.backupWritingModel || DEFAULT_AI_MODELS.backup.writing,
          };
        } catch (error) {
          console.error(`Error loading settings for ${plan}:`, error);
          // デフォルト値を設定
          newSettings[plan] = {
            outlineModel: DEFAULT_AI_MODELS.primary.outline,
            writingModel: DEFAULT_AI_MODELS.primary.writing,
            backupOutlineModel: DEFAULT_AI_MODELS.backup.outline,
            backupWritingModel: DEFAULT_AI_MODELS.backup.writing,
          };
        }
      }

      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (planTier: string) => {
    try {
      setSavingPlan(planTier);
      const planSettings = settings[planTier];
      
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier,
          outlineModel: planSettings.outlineModel,
          writingModel: planSettings.writingModel,
          backupOutlineModel: planSettings.backupOutlineModel,
          backupWritingModel: planSettings.backupWritingModel,
          service: selectedService,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save settings');
      }

      alert('設定を保存しました');
      // 保存後に再読み込み
      await loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('設定の保存に失敗しました: ' + (error instanceof Error ? error.message : ''));
    } finally {
      setSavingPlan(null);
    }
  };

  const handleModelChange = (
    planTier: string,
    field: keyof PlanModelSettings,
    value: string
  ) => {
    setSettings(prev => ({
      ...prev,
      [planTier]: {
        ...prev[planTier],
        [field]: value,
      },
    }));
  };

  // プラン名を取得
  const getPlanDisplayName = (plan: string): string => {
    const names: Record<string, string> = {
      // 集客メーカー
      guest: 'ゲスト',
      free: 'フリー',
      // Kindle未加入
      none: '未加入（デフォルト）',
      // Kindle初回（一括）
      initial_trial: 'トライアル（初回）',
      initial_standard: 'スタンダード（初回）',
      initial_business: 'ビジネス（初回）',
      // Kindle継続（月額）
      lite: 'ライト',
      standard: 'スタンダード',
      pro: 'プロ',
      business: 'ビジネス',
      enterprise: 'エンタープライズ',
    };
    return names[plan] || plan;
  };


  // モデル情報を取得
  const getModelInfo = (modelId: string): AIModelInfo | undefined => {
    return AVAILABLE_AI_MODELS.find(m => m.id === modelId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

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
            ? 'Kindle執筆機能で使用するAIモデルをプラン別に設定します'
            : '集客メーカーで使用するAIモデルをプラン別に設定します'
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

      {/* 説明 */}
      <div className={`border rounded-lg p-4 ${
        selectedService === 'kdl' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
      }`}>
        {selectedService === 'kdl' ? (
          <>
            <p className="text-sm text-amber-800">
              各プランの<strong>構成用（脳）</strong>と<strong>執筆用（手）</strong>のAIモデルを設定します。
              バックアップモデルはメインモデルが利用できない場合に自動で切り替わります。
            </p>
            <p className="text-xs mt-1 text-amber-600">
              ※ 構成用 = 章立て・アウトライン作成、執筆用 = 本文の文章生成
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-blue-800">
              各プランの<strong>メインAI</strong>と<strong>サブAI</strong>を設定します。
              診断クイズ・LP生成では<strong>メインAI（構成用）</strong>が使用されます。
              サブAI（執筆用）はバックアップとして機能します。
            </p>
            <p className="text-xs mt-1 text-blue-600">
              ※ 集客メーカーの機能はメインAIモデルを使用します
            </p>
          </>
        )}
        <p className={`text-xs mt-1 ${selectedService === 'kdl' ? 'text-amber-600' : 'text-blue-600'}`}>
          ※ 価格は1Mトークンあたり: <span className="text-blue-600 font-medium">入=入力コスト</span>、<span className="text-orange-600 font-medium">出=出力コスト</span>（出力の方が高い）
        </p>
      </div>

      {/* プラン別設定テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={selectedService === 'kdl' ? 'bg-amber-50' : 'bg-indigo-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 w-28">プラン</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                  <div className="flex items-center gap-1">
                    <Settings size={14} />
                    {selectedService === 'kdl' ? '構成用モデル' : 'メインAI（診断・LP生成）'}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                  <div className="flex items-center gap-1">
                    <Settings size={14} />
                    {selectedService === 'kdl' ? '執筆用モデル' : 'サブAI（予備）'}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPlans.map((plan, index) => {
                const planSettings = settings[plan] || {
                  outlineModel: DEFAULT_AI_MODELS.primary.outline,
                  writingModel: DEFAULT_AI_MODELS.primary.writing,
                  backupOutlineModel: DEFAULT_AI_MODELS.backup.outline,
                  backupWritingModel: DEFAULT_AI_MODELS.backup.writing,
                };
                const outlineInfo = getModelInfo(planSettings.outlineModel);
                const writingInfo = getModelInfo(planSettings.writingModel);
                const backupOutlineInfo = getModelInfo(planSettings.backupOutlineModel);
                const backupWritingInfo = getModelInfo(planSettings.backupWritingModel);

                // Kindleのセクションヘッダー表示
                const showNoneHeader = selectedService === 'kdl' && plan === 'none';
                const showInitialHeader = selectedService === 'kdl' && plan === 'initial_trial';
                const showContinuationHeader = selectedService === 'kdl' && plan === 'lite';

                return (
                  <>
                    {showNoneHeader && (
                      <tr key="header-none" className="bg-gray-100">
                        <td colSpan={4} className="px-4 py-2 text-sm font-bold text-gray-700">
                          未加入ユーザー（デフォルト設定）
                        </td>
                      </tr>
                    )}
                    {showInitialHeader && (
                      <tr key="header-initial" className="bg-orange-100">
                        <td colSpan={4} className="px-4 py-2 text-sm font-bold text-orange-800">
                          初回プラン（一括購入）
                        </td>
                      </tr>
                    )}
                    {showContinuationHeader && (
                      <tr key="header-continuation" className="bg-amber-100">
                        <td colSpan={4} className="px-4 py-2 text-sm font-bold text-amber-800">
                          継続プラン（月額）
                        </td>
                      </tr>
                    )}
                    <tr key={plan} className="hover:bg-gray-50">
                    {/* プラン名 */}
                    <td className="px-4 py-4">
                      <span className={`font-bold ${
                        selectedService === 'kdl' ? 'text-amber-700' : 'text-indigo-700'
                      }`}>
                        {getPlanDisplayName(plan)}
                      </span>
                    </td>

                    {/* 構成用モデル */}
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {/* メインモデル */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">メイン</label>
                          <ModelSelector
                            value={planSettings.outlineModel}
                            onChange={(v) => handleModelChange(plan, 'outlineModel', v)}
                            modelsByProvider={modelsByProvider}
                          />
                          {outlineInfo && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-blue-600 font-medium" title="入力コスト/1M tokens">
                                入${outlineInfo.inputCost.toFixed(2)}
                              </span>
                              <span className="text-xs text-orange-600 font-medium" title="出力コスト/1M tokens">
                                出${outlineInfo.outputCost.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">{outlineInfo.provider}</span>
                            </div>
                          )}
                        </div>
                        {/* バックアップモデル */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                            <Shield size={10} />
                            バックアップ
                          </label>
                          <ModelSelector
                            value={planSettings.backupOutlineModel}
                            onChange={(v) => handleModelChange(plan, 'backupOutlineModel', v)}
                            modelsByProvider={modelsByProvider}
                            isBackup
                          />
                          {backupOutlineInfo && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 font-medium" title="入力/出力コスト">
                                ${backupOutlineInfo.inputCost.toFixed(2)}/${backupOutlineInfo.outputCost.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 執筆用モデル */}
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {/* メインモデル */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">メイン</label>
                          <ModelSelector
                            value={planSettings.writingModel}
                            onChange={(v) => handleModelChange(plan, 'writingModel', v)}
                            modelsByProvider={modelsByProvider}
                          />
                          {writingInfo && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-blue-600 font-medium" title="入力コスト/1M tokens">
                                入${writingInfo.inputCost.toFixed(2)}
                              </span>
                              <span className="text-xs text-orange-600 font-medium" title="出力コスト/1M tokens">
                                出${writingInfo.outputCost.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">{writingInfo.provider}</span>
                            </div>
                          )}
                        </div>
                        {/* バックアップモデル */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                            <Shield size={10} />
                            バックアップ
                          </label>
                          <ModelSelector
                            value={planSettings.backupWritingModel}
                            onChange={(v) => handleModelChange(plan, 'backupWritingModel', v)}
                            modelsByProvider={modelsByProvider}
                            isBackup
                          />
                          {backupWritingInfo && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 font-medium" title="入力/出力コスト">
                                ${backupWritingInfo.inputCost.toFixed(2)}/${backupWritingInfo.outputCost.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 保存ボタン */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSave(plan)}
                        disabled={savingPlan === plan}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                          selectedService === 'kdl' 
                            ? 'bg-amber-600 hover:bg-amber-700' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {savingPlan === plan ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                        保存
                      </button>
                    </td>
                  </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* モデル一覧（参考） */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Settings size={18} />
            利用可能なAIモデル一覧
          </h3>
          <span className="text-xs text-gray-500">
            <span className="text-blue-600">入力</span>/<span className="text-orange-600">出力</span> ($/1M tokens)
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(modelsByProvider).map(([provider, models]) => (
            <div key={provider} className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="font-bold text-sm mb-2 text-gray-900">{provider}</h4>
              <div className="space-y-1">
                {models.map((model) => (
                  <div key={model.id} className="flex justify-between items-center text-xs gap-2">
                    <span className="text-gray-700 truncate">{model.name}</span>
                    <span className="font-mono whitespace-nowrap">
                      <span className="text-blue-600">${model.inputCost.toFixed(2)}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-orange-600">${model.outputCost.toFixed(2)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// モデル選択コンポーネント
interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  modelsByProvider: Record<string, AIModelInfo[]>;
  isBackup?: boolean;
}

function ModelSelector({ value, onChange, modelsByProvider, isBackup }: ModelSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 pr-8 text-sm border rounded-lg appearance-none cursor-pointer focus:ring-2 focus:outline-none bg-white text-gray-900 ${
          isBackup 
            ? 'border-gray-200 focus:ring-gray-300' 
            : 'border-gray-300 focus:ring-indigo-500'
        }`}
      >
        {Object.entries(modelsByProvider).map(([provider, models]) => (
          <optgroup key={provider} label={`── ${provider} ──`}>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} (入${model.inputCost.toFixed(2)}/出${model.outputCost.toFixed(2)})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown 
        size={16} 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
      />
    </div>
  );
}
