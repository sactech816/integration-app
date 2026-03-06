'use client';

import { useState } from 'react';
import {
  Save, Trash2, Loader2, Eye, EyeOff, Copy, Check,
  ExternalLink, AlertCircle, CheckCircle2
} from 'lucide-react';
import type { LineAccount } from '@/types/line';

interface LineAccountSettingsProps {
  userId: string;
  account: LineAccount | null;
  webhookUrl: string;
  onSaved: (account: LineAccount) => void;
  onDeleted: () => void;
}

export default function LineAccountSettings({
  userId, account, webhookUrl, onSaved, onDeleted
}: LineAccountSettingsProps) {
  const [channelId, setChannelId] = useState(account?.channel_id || '');
  const [channelSecret, setChannelSecret] = useState(account?.channel_secret || '');
  const [channelAccessToken, setChannelAccessToken] = useState(account?.channel_access_token || '');
  const [botBasicId, setBotBasicId] = useState(account?.bot_basic_id || '');
  const [displayName, setDisplayName] = useState(account?.display_name || '');
  const [friendAddMessage, setFriendAddMessage] = useState(account?.friend_add_message || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleSave = async () => {
    if (!channelId || !channelSecret || !channelAccessToken) {
      setError('Channel ID、Channel Secret、Channel Access Token は必須です');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/line/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          channelId,
          channelSecret,
          channelAccessToken,
          botBasicId: botBasicId || undefined,
          displayName: displayName || undefined,
          friendAddMessage: friendAddMessage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '保存に失敗しました');
        return;
      }

      setSuccess('LINE公式アカウントの設定を保存しました');
      onSaved(data.account);
    } catch {
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('LINE公式アカウントの連携を解除しますか？友だちデータは保持されます。')) return;

    setDeleting(true);
    try {
      await fetch(`/api/line/account?userId=${userId}`, { method: 'DELETE' });
      onDeleted();
    } catch {
      setError('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 設定ガイド */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2">設定手順</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>
            <a
              href="https://developers.line.biz/console/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900 inline-flex items-center gap-1"
            >
              LINE Developers <ExternalLink className="w-3 h-3" />
            </a>
            でMessaging APIチャネルを作成
          </li>
          <li>チャネル基本設定から Channel ID と Channel Secret をコピー</li>
          <li>Messaging API設定から「チャネルアクセストークン（長期）」を発行してコピー</li>
          <li>下記のフォームに貼り付けて保存</li>
          <li>保存後、Webhook URLをLINE Developersに設定</li>
        </ol>
      </div>

      {/* エラー/成功メッセージ */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* フォーム */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900">Messaging APIチャネル設定</h3>

        {/* Channel ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Channel ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={channelId}
            onChange={e => setChannelId(e.target.value)}
            placeholder="1234567890"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Channel Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Channel Secret <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={channelSecret}
              onChange={e => setChannelSecret(e.target.value)}
              placeholder="abcdef1234567890..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Channel Access Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            チャネルアクセストークン（長期） <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={channelAccessToken}
              onChange={e => setChannelAccessToken(e.target.value)}
              placeholder="長期のチャネルアクセストークンを入力"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bot Basic ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bot Basic ID（任意）
          </label>
          <input
            type="text"
            value={botBasicId}
            onChange={e => setBotBasicId(e.target.value)}
            placeholder="@xxx"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">LINE公式アカウントの@から始まるID</p>
        </div>

        {/* 表示名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            表示名（任意）
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="アカウント名"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">空欄の場合、LINE APIから自動取得されます</p>
        </div>

        {/* 友だち追加時のメッセージ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            友だち追加ボタンの説明文（任意）
          </label>
          <textarea
            value={friendAddMessage}
            onChange={e => setFriendAddMessage(e.target.value)}
            placeholder="LINE登録で特典をプレゼント！"
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">クイズ結果ページ等に表示される友だち追加ボタンの説明文</p>
        </div>

        {/* 保存ボタン */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {account ? '更新して保存' : '保存して連携'}
          </button>
          {account && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              連携解除
            </button>
          )}
        </div>
      </div>

      {/* Webhook URL（保存済みの場合） */}
      {account && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">Webhook URL</h3>
          <p className="text-sm text-gray-500 mb-3">
            LINE Developers &gt; Messaging API設定 &gt; Webhook URL に以下を設定してください。
            Webhookの利用を「ON」にしてください。
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700 border border-gray-200 overflow-x-auto">
              {webhookUrl}
            </code>
            <button
              onClick={handleCopyWebhook}
              className="shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              {copiedWebhook ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
