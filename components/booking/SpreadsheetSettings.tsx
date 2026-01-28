'use client';

import { useState, useEffect } from 'react';
import {
  Table2,
  Save,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Trash2,
  Link2,
} from 'lucide-react';
import {
  BookingSpreadsheetSettings,
} from '@/types/booking';
import {
  getSpreadsheetSettings,
  createSpreadsheetSettings,
  updateSpreadsheetSettings,
  deleteSpreadsheetSettings,
  extractSpreadsheetId,
} from '@/app/actions/booking';

interface SpreadsheetSettingsProps {
  userId: string;
  menuId: string;
  menuTitle: string;
}

/**
 * Googleスプレッドシート連携設定コンポーネント
 */
export default function SpreadsheetSettings({
  userId,
  menuId,
  menuTitle,
}: SpreadsheetSettingsProps) {
  const [settings, setSettings] = useState<BookingSpreadsheetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // フォーム状態
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [isEnabled, setIsEnabled] = useState(true);

  // 設定を読み込む
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await getSpreadsheetSettings(userId, menuId);
      if (data) {
        setSettings(data);
        setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${data.spreadsheet_id}/edit`);
        setSheetName(data.sheet_name || 'Sheet1');
        setIsEnabled(data.is_enabled);
      }
      setLoading(false);
    };

    loadSettings();
  }, [userId, menuId]);

  // 保存
  const handleSave = async () => {
    // スプレッドシートIDを抽出
    const spreadsheetId = await extractSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      setError('有効なスプレッドシートURLを入力してください');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    let result;
    if (settings) {
      // 更新
      result = await updateSpreadsheetSettings(userId, menuId, {
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName,
        is_enabled: isEnabled,
      });
    } else {
      // 新規作成
      result = await createSpreadsheetSettings(userId, {
        menu_id: menuId,
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName,
        is_enabled: isEnabled,
      });
    }

    if (result.success && result.data) {
      setSettings(result.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('error' in result ? result.error : '保存に失敗しました');
    }

    setSaving(false);
  };

  // 削除
  const handleDelete = async () => {
    if (!settings) return;
    if (!confirm('スプレッドシート連携を解除しますか？')) return;

    setDeleting(true);
    setError(null);

    const result = await deleteSpreadsheetSettings(userId, menuId);
    if (result.success) {
      setSettings(null);
      setSpreadsheetUrl('');
      setSheetName('Sheet1');
      setIsEnabled(true);
    } else {
      setError('error' in result ? result.error : '削除に失敗しました');
    }

    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Table2 size={20} className="text-green-600" />
        スプレッドシート連携
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Googleスプレッドシートと連携すると、予約が入るたびに自動でスプレッドシートに記録されます。
      </p>

      <div className="space-y-4">
        {/* スプレッドシートURL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Link2 size={16} className="inline mr-1" />
            スプレッドシートURL
          </label>
          <input
            type="text"
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/xxxxx/edit"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            連携するスプレッドシートを作成し、URLをコピーして貼り付けてください
          </p>
        </div>

        {/* シート名 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            シート名
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet1"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* 有効/無効 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="spreadsheet-enabled"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="spreadsheet-enabled" className="text-sm font-medium text-gray-700">
            連携を有効にする
          </label>
        </div>

        {/* 注意書き */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>注意:</strong> スプレッドシートは「リンクを知っている全員が編集可」に設定してください。
            または、サービスアカウントのメールアドレスに編集権限を付与してください。
          </p>
        </div>

        {/* ステータス */}
        {settings && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full font-semibold ${
              settings.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {settings.is_enabled ? '連携中' : '無効'}
            </span>
            {settings.last_synced_at && (
              <span className="text-gray-500">
                最終同期: {new Date(settings.last_synced_at).toLocaleString('ja-JP')}
              </span>
            )}
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <Check size={18} />
            設定を保存しました
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !spreadsheetUrl.trim()}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save size={18} />
                保存
              </>
            )}
          </button>

          {settings && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-3 border border-red-300 text-red-600 rounded-xl font-bold transition-colors hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>

        {/* スプレッドシートを開くリンク */}
        {settings && (
          <a
            href={`https://docs.google.com/spreadsheets/d/${settings.spreadsheet_id}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-green-600 font-semibold hover:underline"
          >
            <ExternalLink size={16} />
            スプレッドシートを開く
          </a>
        )}
      </div>
    </div>
  );
}
