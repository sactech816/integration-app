'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Loader2,
  Settings,
  Eye,
  Play,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Shield,
} from 'lucide-react';

// 型定義
interface CleanupSettings {
  id: string;
  is_enabled: boolean;
  guest_retention_days: number;
  free_retention_days: number;
  pro_retention_days: number;
  cleanup_quizzes: boolean;
  cleanup_profiles: boolean;
  cleanup_business_projects: boolean;
  cleanup_surveys: boolean;
  cleanup_booking_menus: boolean;
  run_time: string;
  dry_run_mode: boolean;
  notify_before_delete: boolean;
  notify_days_before: number;
  updated_at: string;
}

interface CleanupTarget {
  table_name: string;
  record_id: string;
  slug: string;
  title: string;
  user_plan: string;
  last_accessed_at: string;
  created_at: string;
  days_inactive: number;
}

interface CleanupLog {
  id: string;
  executed_at: string;
  is_dry_run: boolean;
  executed_by: string | null;
  total_deleted: number;
  details: any[];
  error_message: string | null;
}

interface CleanupStats {
  total: number;
  byTable: {
    quizzes: number;
    profiles: number;
    business_projects: number;
    surveys: number;
    booking_menus: number;
  };
  byPlan: {
    guest: number;
    free: number;
  };
}

type TabType = 'settings' | 'preview' | 'logs';

type CleanupManagerProps = {
  userId?: string;
};

// テーブル名の日本語変換
const TABLE_NAME_JA: Record<string, string> = {
  quizzes: '診断クイズ',
  profiles: 'プロフィールLP',
  business_projects: 'ビジネスLP',
  surveys: 'アンケート',
  booking_menus: '予約メニュー',
};

// プラン名の日本語変換
const PLAN_NAME_JA: Record<string, string> = {
  guest: 'ゲスト',
  free: 'フリー',
};

export default function CleanupManager({ userId }: CleanupManagerProps) {
  // タブ状態
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  
  // 設定状態
  const [settings, setSettings] = useState<CleanupSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // プレビュー状態
  const [targets, setTargets] = useState<CleanupTarget[]>([]);
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  
  // ログ状態
  const [logs, setLogs] = useState<CleanupLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // 実行状態
  const [executing, setExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // フィルター状態
  const [filterTable, setFilterTable] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  // 設定を取得
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/admin/cleanup?action=settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // プレビューを取得
  const fetchPreview = useCallback(async () => {
    setLoadingPreview(true);
    try {
      const res = await fetch('/api/admin/cleanup?action=preview');
      const data = await res.json();
      setTargets(data.targets || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  // ログを取得
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/cleanup?action=logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // 初期読み込み
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // タブ切り替え時のデータ読み込み
  useEffect(() => {
    if (activeTab === 'preview') {
      fetchPreview();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, fetchPreview, fetchLogs]);

  // 設定を保存
  const saveSettings = async () => {
    if (!settings) return;
    
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          settings,
          userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExecuteResult({ success: true, message: '設定を保存しました' });
      } else {
        setExecuteResult({ success: false, message: data.error || '保存に失敗しました' });
      }
    } catch (error) {
      setExecuteResult({ success: false, message: '保存に失敗しました' });
    } finally {
      setSavingSettings(false);
      setTimeout(() => setExecuteResult(null), 3000);
    }
  };

  // クリーンアップを実行
  const executeCleanup = async (dryRun: boolean) => {
    if (!confirm(dryRun 
      ? 'ドライラン（テスト実行）を行います。実際の削除は行われません。よろしいですか？'
      : '⚠️ 実際にデータを削除します。この操作は取り消せません。本当に実行しますか？'
    )) {
      return;
    }

    setExecuting(true);
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          dryRun,
          userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExecuteResult({ success: true, message: data.message });
        // プレビューとログを更新
        fetchPreview();
        fetchLogs();
      } else {
        setExecuteResult({ success: false, message: data.error || '実行に失敗しました' });
      }
    } catch (error) {
      setExecuteResult({ success: false, message: '実行に失敗しました' });
    } finally {
      setExecuting(false);
      setTimeout(() => setExecuteResult(null), 5000);
    }
  };

  // 除外リストに追加
  const addToExclusion = async (target: CleanupTarget) => {
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_exclusion',
          tableName: target.table_name,
          recordId: target.record_id,
          reason: '管理者による手動除外',
          userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // プレビューを更新
        fetchPreview();
      }
    } catch (error) {
      console.error('Failed to add exclusion:', error);
    }
  };

  // CSVエクスポート
  const exportCSV = () => {
    const filteredTargets = getFilteredTargets();
    const headers = ['テーブル', 'ID', 'スラッグ', 'タイトル', 'プラン', '最終アクセス', '作成日', '非アクティブ日数'];
    const rows = filteredTargets.map(t => [
      TABLE_NAME_JA[t.table_name] || t.table_name,
      t.record_id,
      t.slug,
      t.title,
      PLAN_NAME_JA[t.user_plan] || t.user_plan,
      new Date(t.last_accessed_at).toLocaleDateString('ja-JP'),
      new Date(t.created_at).toLocaleDateString('ja-JP'),
      t.days_inactive,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleanup_targets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // フィルター適用
  const getFilteredTargets = () => {
    return targets.filter(t => {
      if (filterTable !== 'all' && t.table_name !== filterTable) return false;
      if (filterPlan !== 'all' && t.user_plan !== filterPlan) return false;
      return true;
    });
  };

  // 設定タブ
  const renderSettingsTab = () => {
    if (loadingSettings) {
      return (
        <div className="p-8 text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-red-600 mb-3" />
          <p className="text-gray-500">設定を読み込み中...</p>
        </div>
      );
    }

    if (!settings) {
      return (
        <div className="p-8 text-center text-gray-500">
          <AlertTriangle size={48} className="mx-auto mb-3 text-yellow-500" />
          <p>設定が見つかりません。SQLマイグレーションを実行してください。</p>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        {/* 機能ON/OFF */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">クリーンアップ機能</h3>
              <p className="text-sm text-gray-500">定期的なデータ削除を有効にします</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_enabled}
                onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        {/* ドライランモード */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                <Shield size={18} /> ドライランモード（安全モード）
              </h3>
              <p className="text-sm text-yellow-700">ONの場合、実際の削除は行わずログのみ記録します</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dry_run_mode}
                onChange={(e) => setSettings({ ...settings, dry_run_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
        </div>

        {/* プラン別保持期間 */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">プラン別保持期間</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ゲスト（未ログイン）
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.guest_retention_days}
                  onChange={(e) => setSettings({ ...settings, guest_retention_days: parseInt(e.target.value) || 0 })}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  min="-1"
                />
                <span className="text-gray-600">日</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">-1 = 無期限</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                フリープラン
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.free_retention_days}
                  onChange={(e) => setSettings({ ...settings, free_retention_days: parseInt(e.target.value) || 0 })}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  min="-1"
                />
                <span className="text-gray-600">日</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">-1 = 無期限</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                プロプラン（有料）
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.pro_retention_days}
                  onChange={(e) => setSettings({ ...settings, pro_retention_days: parseInt(e.target.value) || 0 })}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  min="-1"
                  disabled
                />
                <span className="text-gray-600">日</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">有料ユーザーは削除対象外</p>
            </div>
          </div>
        </div>

        {/* 対象テーブル */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">対象テーブル</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { key: 'cleanup_quizzes', label: '診断クイズ' },
              { key: 'cleanup_profiles', label: 'プロフィールLP' },
              { key: 'cleanup_business_projects', label: 'ビジネスLP' },
              { key: 'cleanup_surveys', label: 'アンケート' },
              { key: 'cleanup_booking_menus', label: '予約メニュー' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings[key as keyof CleanupSettings] as boolean}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {savingSettings ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
            設定を保存
          </button>
        </div>
      </div>
    );
  };

  // プレビュータブ
  const renderPreviewTab = () => {
    const filteredTargets = getFilteredTargets();

    return (
      <div className="p-6 space-y-4">
        {/* 統計情報 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="text-3xl font-bold text-red-600">{stats.total}</div>
              <div className="text-sm text-red-700">削除対象（合計）</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">{stats.byPlan.guest}</div>
              <div className="text-sm text-gray-600">ゲストデータ</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{stats.byPlan.free}</div>
              <div className="text-sm text-blue-600">フリープランデータ</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{filteredTargets.length}</div>
              <div className="text-sm text-green-600">フィルター後</div>
            </div>
          </div>
        )}

        {/* フィルター & アクション */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
          >
            <option value="all">全テーブル</option>
            <option value="quizzes">診断クイズ</option>
            <option value="profiles">プロフィールLP</option>
            <option value="business_projects">ビジネスLP</option>
            <option value="surveys">アンケート</option>
            <option value="booking_menus">予約メニュー</option>
          </select>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
          >
            <option value="all">全プラン</option>
            <option value="guest">ゲスト</option>
            <option value="free">フリー</option>
          </select>

          <button
            onClick={fetchPreview}
            disabled={loadingPreview}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw size={16} className={loadingPreview ? 'animate-spin' : ''} />
            更新
          </button>

          <button
            onClick={exportCSV}
            disabled={filteredTargets.length === 0}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-200 flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            CSVエクスポート
          </button>

          <div className="flex-1" />

          <button
            onClick={() => executeCleanup(true)}
            disabled={executing || filteredTargets.length === 0}
            className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-200 flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={16} />
            ドライラン
          </button>

          <button
            onClick={() => executeCleanup(false)}
            disabled={executing || filteredTargets.length === 0 || settings?.dry_run_mode}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
          >
            {executing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            削除実行
          </button>
        </div>

        {/* 削除対象一覧 */}
        {loadingPreview ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-red-600 mb-3" />
            <p className="text-gray-500">プレビューを読み込み中...</p>
          </div>
        ) : filteredTargets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
            <p>削除対象のデータはありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-bold text-gray-900">テーブル</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">タイトル</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">スラッグ</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">プラン</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-900">非アクティブ</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">最終アクセス</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.slice(0, 100).map((target, idx) => (
                  <tr key={`${target.table_name}-${target.record_id}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                        {TABLE_NAME_JA[target.table_name] || target.table_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate">
                      {target.title || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono max-w-[150px] truncate">
                      {target.slug}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        target.user_plan === 'guest' 
                          ? 'bg-gray-200 text-gray-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {PLAN_NAME_JA[target.user_plan] || target.user_plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-red-600 font-bold">{target.days_inactive}日</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(target.last_accessed_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => addToExclusion(target)}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                        title="除外リストに追加"
                      >
                        除外
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTargets.length > 100 && (
              <div className="p-4 text-center text-gray-500 bg-gray-50">
                他 {filteredTargets.length - 100} 件（CSVエクスポートで全件確認できます）
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ログタブ
  const renderLogsTab = () => {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">実行ログ</h3>
          <button
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw size={16} className={loadingLogs ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {loadingLogs ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-red-600 mb-3" />
            <p className="text-gray-500">ログを読み込み中...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History size={48} className="mx-auto mb-3 text-gray-300" />
            <p>実行ログはありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`rounded-xl p-4 border ${
                  log.error_message
                    ? 'bg-red-50 border-red-200'
                    : log.is_dry_run
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {log.error_message ? (
                      <XCircle size={18} className="text-red-600" />
                    ) : log.is_dry_run ? (
                      <AlertTriangle size={18} className="text-yellow-600" />
                    ) : (
                      <CheckCircle size={18} className="text-green-600" />
                    )}
                    <span className="font-bold text-gray-900">
                      {log.is_dry_run ? 'ドライラン' : '削除実行'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.error_message
                        ? 'bg-red-200 text-red-700'
                        : log.is_dry_run
                        ? 'bg-yellow-200 text-yellow-700'
                        : 'bg-green-200 text-green-700'
                    }`}>
                      {log.total_deleted}件
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.executed_at).toLocaleString('ja-JP')}
                  </span>
                </div>
                {log.error_message && (
                  <p className="text-sm text-red-600 mt-2">{log.error_message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Trash2 size={20} className="text-red-600" /> データクリーンアップ
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          ゲスト・フリープランの古いデータを定期的に削除します
        </p>
      </div>

      {/* 結果メッセージ */}
      {executeResult && (
        <div className={`px-6 py-3 ${executeResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <div className="flex items-center gap-2">
            {executeResult.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {executeResult.message}
          </div>
        </div>
      )}

      {/* タブ */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'settings', label: '設定', icon: Settings },
          { id: 'preview', label: 'プレビュー', icon: Eye },
          { id: 'logs', label: 'ログ', icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={`flex-1 px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === id
                ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'settings' && renderSettingsTab()}
      {activeTab === 'preview' && renderPreviewTab()}
      {activeTab === 'logs' && renderLogsTab()}
    </div>
  );
}
