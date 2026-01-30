'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Loader2, RefreshCw, DollarSign, 
  Cpu, AlertCircle, CheckCircle, Edit3
} from 'lucide-react';

interface PlanDefinition {
  id: string;
  name: string;
  name_ja: string;
  monthly_price: number;
  yearly_price: number;
  daily_ai_limit: number;
  monthly_ai_limit: number;
  ai_model: string;
  ai_model_display?: string;
  support_level?: string;
  features?: string[];
  sort_order?: number;
  is_active?: boolean;
}

interface SystemSetting {
  value: any;
  description?: string;
  updated_at?: string;
}

interface AdminSystemSettingsProps {
  userId: string;
  accessToken: string;
}

const DEFAULT_PLAN_DEFINITIONS: Record<string, Partial<PlanDefinition>> = {
  lite: {
    name: 'Lite',
    name_ja: 'ライト',
    monthly_price: 2980,
    yearly_price: 29800,
    daily_ai_limit: 20,
    monthly_ai_limit: 300,
    ai_model: 'gemini-flash',
  },
  standard: {
    name: 'Standard',
    name_ja: 'スタンダード',
    monthly_price: 4980,
    yearly_price: 49800,
    daily_ai_limit: 30,
    monthly_ai_limit: 900,
    ai_model: 'gpt-4o-mini',
  },
  pro: {
    name: 'Pro',
    name_ja: 'プロ',
    monthly_price: 9800,
    yearly_price: 98000,
    daily_ai_limit: 100,
    monthly_ai_limit: 1000,
    ai_model: 'gpt-4o-mini',
  },
  business: {
    name: 'Business',
    name_ja: 'ビジネス',
    monthly_price: 29800,
    yearly_price: 298000,
    daily_ai_limit: -1,
    monthly_ai_limit: -1,
    ai_model: 'gpt-4o',
  },
};

export default function AdminSystemSettings({ userId, accessToken }: AdminSystemSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [planDefinitions, setPlanDefinitions] = useState<Record<string, PlanDefinition>>({});
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editedPlan, setEditedPlan] = useState<Partial<PlanDefinition>>({});

  useEffect(() => {
    fetchSettings();
  }, [accessToken]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/kdl-settings', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setPlanDefinitions(data.planDefinitions || DEFAULT_PLAN_DEFINITIONS);
      setSettings(data.settings || {});
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: '設定の取得に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (planId: string) => {
    setEditingPlan(planId);
    setEditedPlan(planDefinitions[planId] || DEFAULT_PLAN_DEFINITIONS[planId] || {});
  };

  const handleSavePlan = async (planId: string) => {
    try {
      setSaving(planId);
      const response = await fetch('/api/admin/kdl-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: 'plan_definition',
          planId,
          planData: editedPlan,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save plan');
      }

      // ローカル状態を更新
      setPlanDefinitions(prev => ({
        ...prev,
        [planId]: { ...prev[planId], ...editedPlan } as PlanDefinition,
      }));

      setMessage({ type: 'success', text: `${editedPlan.name_ja || planId}プランを保存しました` });
      setEditingPlan(null);
    } catch (error) {
      console.error('Failed to save plan:', error);
      setMessage({ type: 'error', text: 'プランの保存に失敗しました' });
    } finally {
      setSaving(null);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === -1) return '要相談';
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return '無制限';
    return `${limit}回`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  const planIds = ['lite', 'standard', 'pro', 'business'];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings size={32} />
          <h2 className="text-2xl font-bold">システム設定</h2>
        </div>
        <p className="text-gray-300">
          KDLのプラン定義とシステム設定を管理します
        </p>
      </div>

      {/* メッセージ */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)} 
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      {/* プラン定義 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-gray-600" />
            <h3 className="font-bold text-gray-900">プラン定義</h3>
          </div>
          <button
            onClick={fetchSettings}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
          >
            <RefreshCw size={16} />
            更新
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">プラン</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">月額</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">年額</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">日次上限</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">月次上限</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">AIモデル</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {planIds.map((planId) => {
                const plan = planDefinitions[planId] || DEFAULT_PLAN_DEFINITIONS[planId];
                const isEditing = editingPlan === planId;

                return (
                  <tr key={planId} className={isEditing ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{plan?.name_ja || planId}</div>
                      <div className="text-xs text-gray-500">{plan?.name || planId}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedPlan.monthly_price || 0}
                          onChange={(e) => setEditedPlan(prev => ({ ...prev, monthly_price: Number(e.target.value) }))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900"
                        />
                      ) : (
                        <span className="font-medium">{formatCurrency(plan?.monthly_price || 0)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedPlan.yearly_price || 0}
                          onChange={(e) => setEditedPlan(prev => ({ ...prev, yearly_price: Number(e.target.value) }))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900"
                        />
                      ) : (
                        <span className="font-medium">{formatCurrency(plan?.yearly_price || 0)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedPlan.daily_ai_limit || 0}
                          onChange={(e) => setEditedPlan(prev => ({ ...prev, daily_ai_limit: Number(e.target.value) }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                          placeholder="-1 = 無制限"
                        />
                      ) : (
                        <span className={plan?.daily_ai_limit === -1 ? 'text-green-600 font-bold' : ''}>
                          {formatLimit(plan?.daily_ai_limit || 0)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedPlan.monthly_ai_limit || 0}
                          onChange={(e) => setEditedPlan(prev => ({ ...prev, monthly_ai_limit: Number(e.target.value) }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                          placeholder="-1 = 無制限"
                        />
                      ) : (
                        <span className={plan?.monthly_ai_limit === -1 ? 'text-green-600 font-bold' : ''}>
                          {formatLimit(plan?.monthly_ai_limit || 0)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedPlan.ai_model || ''}
                          onChange={(e) => setEditedPlan(prev => ({ ...prev, ai_model: e.target.value }))}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-gray-900"
                        />
                      ) : (
                        <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {plan?.ai_model || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSavePlan(planId)}
                            disabled={saving === planId}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {saving === planId ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            保存
                          </button>
                          <button
                            onClick={() => setEditingPlan(null)}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditPlan(planId)}
                          className="text-purple-600 hover:text-purple-800 flex items-center gap-1 mx-auto"
                        >
                          <Edit3 size={16} />
                          編集
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          ※ -1 を入力すると無制限になります。AIモデルは管理者ダッシュボードのAI設定で詳細に設定できます。
        </div>
      </div>

      {/* システム設定 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Cpu size={20} className="text-gray-600" />
            <h3 className="font-bold text-gray-900">その他の設定</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(settings).map(([key, setting]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <div className="font-bold text-gray-900 mb-1">{key}</div>
                {setting.description && (
                  <div className="text-xs text-gray-500 mb-2">{setting.description}</div>
                )}
                <div className="font-mono text-sm text-gray-900 bg-white p-2 rounded border border-gray-200 overflow-auto max-h-32">
                  {typeof setting.value === 'object' 
                    ? JSON.stringify(setting.value, null, 2)
                    : String(setting.value)
                  }
                </div>
                {setting.updated_at && (
                  <div className="text-xs text-gray-400 mt-2">
                    最終更新: {new Date(setting.updated_at).toLocaleString('ja-JP')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {Object.keys(settings).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              その他の設定はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
