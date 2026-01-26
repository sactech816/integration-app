/**
 * モニターユーザー管理コンポーネント
 * 管理者が特定ユーザーに期間限定で有料プラン機能を開放
 * Kindle/集客メーカー両対応
 */

'use client';

import React, { useState, useEffect } from 'react';
import { User, Clock, Shield, Trash2, PlusCircle, AlertCircle, Loader2, Search, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import { PlanTier, PLAN_DEFINITIONS, MakersPlanTier, MAKERS_PLAN_DEFINITIONS } from '@/lib/subscription';

// サービス種別
type ServiceType = 'kdl' | 'makers';

interface MonitorUser {
  id: string;
  user_id: string;
  admin_user_id: string;
  monitor_plan_type: PlanTier | MakersPlanTier;
  monitor_start_at: string;
  monitor_expires_at: string;
  notes: string | null;
  service?: ServiceType; // サービス種別（新規追加）
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
  };
  admin?: {
    id: string;
    email: string;
  };
}

interface MonitorUsersManagerProps {
  adminUserId: string;
  adminEmail?: string;
  defaultService?: ServiceType; // デフォルトで表示するサービス
}

export default function MonitorUsersManager({ adminUserId, adminEmail, defaultService = 'kdl' }: MonitorUsersManagerProps) {
  const [monitors, setMonitors] = useState<MonitorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType>(defaultService);

  // フォーム入力
  const [formEmail, setFormEmail] = useState('');
  const [formPlan, setFormPlan] = useState<PlanTier | MakersPlanTier>('pro');
  const [formService, setFormService] = useState<ServiceType>(defaultService);
  const [formDuration, setFormDuration] = useState(30); // デフォルト30日
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // サービス変更時にプランをリセット
  useEffect(() => {
    if (formService === 'makers') {
      setFormPlan('pro');
    } else {
      setFormPlan('pro');
    }
  }, [formService]);

  // モニター一覧を取得
  const fetchMonitors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/monitor-users?adminUserId=${adminUserId}&showExpired=${showExpired}&service=${selectedService}`
      );
      const data = await response.json();

      if (data.success) {
        setMonitors(data.monitors);
      } else {
        setMessage({ type: 'error', text: data.error || 'データ取得に失敗しました' });
      }
    } catch (error) {
      console.error('モニターユーザー取得エラー:', error);
      setMessage({ type: 'error', text: 'データ取得中にエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, [showExpired, adminUserId, selectedService]);

  // モニターユーザーを追加
  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/monitor-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId,
          userEmail: formEmail,
          monitorPlanType: formPlan,
          durationDays: formDuration,
          notes: formNotes || null,
          service: formService,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setFormEmail('');
        setFormPlan('pro');
        setFormService(selectedService);
        setFormDuration(30);
        setFormNotes('');
        setShowAddForm(false);
        fetchMonitors();
      } else {
        setMessage({ type: 'error', text: data.error || 'モニター権限の付与に失敗しました' });
      }
    } catch (error) {
      console.error('モニターユーザー追加エラー:', error);
      setMessage({ type: 'error', text: 'エラーが発生しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // モニターユーザーを削除
  const handleDeleteMonitor = async (monitorId: string) => {
    if (!confirm('このモニター権限を削除してもよろしいですか?')) return;

    try {
      const response = await fetch(
        `/api/admin/monitor-users?adminUserId=${adminUserId}&monitorId=${monitorId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchMonitors();
      } else {
        setMessage({ type: 'error', text: data.error || '削除に失敗しました' });
      }
    } catch (error) {
      console.error('モニターユーザー削除エラー:', error);
      setMessage({ type: 'error', text: 'エラーが発生しました' });
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 残り日数を計算
  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 検索フィルター
  const filteredMonitors = monitors.filter((monitor) =>
    monitor.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // プラン名を取得
  const getPlanName = (planType: string, service: ServiceType = 'kdl'): string => {
    if (service === 'makers') {
      const plan = MAKERS_PLAN_DEFINITIONS[planType as MakersPlanTier];
      return plan?.nameJa || planType;
    }
    const plan = PLAN_DEFINITIONS[planType as PlanTier];
    return plan?.nameJa || planType;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="text-purple-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">モニターユーザー管理</h2>
            <p className="text-sm text-gray-600">期間限定で有料プラン機能を開放</p>
          </div>
        </div>
        <button
          onClick={() => {
            setFormService(selectedService);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-bold"
        >
          <PlusCircle size={20} />
          モニター追加
        </button>
      </div>

      {/* サービス選択タブ */}
      <div className="flex gap-2 mb-6">
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

      {/* メッセージ表示 */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 追加フォーム */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">モニターユーザーを追加</h3>
          <form onSubmit={handleAddMonitor} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ユーザーのEmail *
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                対象サービス *
              </label>
              <div className="flex gap-3 mb-4">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition-colors ${
                  formService === 'kdl' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="formService"
                    value="kdl"
                    checked={formService === 'kdl'}
                    onChange={() => setFormService('kdl')}
                    className="sr-only"
                  />
                  <BookOpen size={18} className={formService === 'kdl' ? 'text-amber-600' : 'text-gray-400'} />
                  <span className={formService === 'kdl' ? 'text-amber-700 font-bold' : 'text-gray-600'}>Kindle執筆</span>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition-colors ${
                  formService === 'makers' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="formService"
                    value="makers"
                    checked={formService === 'makers'}
                    onChange={() => setFormService('makers')}
                    className="sr-only"
                  />
                  <Sparkles size={18} className={formService === 'makers' ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className={formService === 'makers' ? 'text-indigo-700 font-bold' : 'text-gray-600'}>集客メーカー</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                付与するプラン *
              </label>
              {formService === 'kdl' ? (
                <select
                  value={formPlan}
                  onChange={(e) => setFormPlan(e.target.value as PlanTier)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-900"
                >
                  <optgroup label="初回プラン（一括）">
                    <option value="initial_trial">トライアル（¥49,800相当）</option>
                    <option value="initial_standard">スタンダード（¥99,800相当）</option>
                    <option value="initial_business">ビジネス（¥198,000相当）</option>
                  </optgroup>
                  <optgroup label="継続プラン（月額）">
                    <option value="lite">ライト（¥2,980/月相当）</option>
                    <option value="standard">スタンダード（¥4,980/月相当）</option>
                    <option value="pro">プロ（¥9,800/月相当）</option>
                    <option value="business">ビジネス（¥29,800/月相当）</option>
                    <option value="enterprise">エンタープライズ（カスタム）</option>
                  </optgroup>
                </select>
              ) : (
                <select
                  value={formPlan}
                  onChange={(e) => setFormPlan(e.target.value as MakersPlanTier)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                >
                  <option value="pro">Pro - {MAKERS_PLAN_DEFINITIONS.pro.nameJa}（¥3,980相当）</option>
                </select>
              )}
              {formService === 'makers' && (
                <p className="text-xs text-gray-500 mt-1">
                  集客メーカーのモニターは有料プラン（¥3,980/月）相当の機能が利用可能になります
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                有効期間（日数） *
              </label>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                required
                min={1}
                max={365}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                1〜365日の範囲で指定してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                管理者メモ（任意）
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="付与理由など"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-bold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    処理中...
                  </>
                ) : (
                  <>
                    <PlusCircle size={20} />
                    追加する
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-bold text-gray-700 bg-white"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* フィルター */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="メールアドレスで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-bold">
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          期限切れも表示
        </label>
      </div>

      {/* モニター一覧 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      ) : filteredMonitors.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">
            {searchQuery
              ? '検索条件に一致するモニターユーザーがいません'
              : 'モニターユーザーがいません'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMonitors.map((monitor) => {
            const daysRemaining = getDaysRemaining(monitor.monitor_expires_at);
            const isExpired = daysRemaining < 0;
            const isExpiringSoon = daysRemaining <= 7 && !isExpired;

            return (
              <div
                key={monitor.id}
                className={`p-4 border rounded-lg ${
                  isExpired
                    ? 'bg-gray-50 border-gray-300 opacity-60'
                    : isExpiringSoon
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {monitor.user?.email || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>プラン:</span>
                          <span className="font-bold text-purple-600">
                            {getPlanName(monitor.monitor_plan_type, monitor.service || selectedService)}
                          </span>
                          {monitor.service && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              monitor.service === 'kdl' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {monitor.service === 'kdl' ? 'Kindle' : '集客メーカー'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 ml-13">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>
                          有効期限: {formatDate(monitor.monitor_expires_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpired ? (
                          <span className="text-red-600 font-bold">期限切れ</span>
                        ) : isExpiringSoon ? (
                          <span className="text-yellow-600 font-bold">
                            残り{daysRemaining}日
                          </span>
                        ) : (
                          <span className="text-green-600 font-bold">
                            残り{daysRemaining}日
                          </span>
                        )}
                      </div>
                    </div>

                    {monitor.notes && (
                      <div className="mt-2 text-sm text-gray-600 ml-13">
                        <span className="font-bold">メモ:</span> {monitor.notes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMonitor(monitor.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 統計 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {monitors.filter((m) => getDaysRemaining(m.monitor_expires_at) >= 0).length}
            </div>
            <div className="text-sm text-gray-600">有効</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {monitors.filter((m) => {
                const days = getDaysRemaining(m.monitor_expires_at);
                return days >= 0 && days <= 7;
              }).length}
            </div>
            <div className="text-sm text-gray-600">7日以内に期限切れ</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {monitors.filter((m) => getDaysRemaining(m.monitor_expires_at) < 0).length}
            </div>
            <div className="text-sm text-gray-600">期限切れ</div>
          </div>
        </div>
      </div>
    </div>
  );
}

