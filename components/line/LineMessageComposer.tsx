'use client';

import { useState } from 'react';
import {
  Send, Plus, Loader2, Trash2, AlertCircle,
  Check, ChevronDown, Edit2, Eye, Users
} from 'lucide-react';
import type { LineMessage, LineSourceType } from '@/types/line';

interface LineMessageComposerProps {
  userId: string;
  messages: LineMessage[];
  friendCount: number;
  hasAccount: boolean;
  onRefresh: () => Promise<void>;
}

const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'すべての友だち' },
  { value: 'quiz', label: '診断クイズ経由' },
  { value: 'entertainment_quiz', label: 'エンタメ診断経由' },
  { value: 'profile', label: 'プロフィールLP経由' },
  { value: 'business', label: 'ビジネスLP経由' },
  { value: 'survey', label: 'アンケート経由' },
  { value: 'booking', label: '予約経由' },
  { value: 'direct', label: '直接追加' },
];

export default function LineMessageComposer({
  userId, messages, friendCount, hasAccount, onRefresh
}: LineMessageComposerProps) {
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [targetSource, setTargetSource] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title || !text) {
      setError('タイトルとメッセージ本文は必須です');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/line/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          messageType: 'text',
          content: { type: 'text', text },
          targetType: targetSource ? 'segment' : 'all',
          targetFilter: targetSource ? { source_type: targetSource } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '保存に失敗しました');
        return;
      }

      setTitle('');
      setText('');
      setTargetSource('');
      setShowComposer(false);
      await onRefresh();
    } catch {
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (messageId: string) => {
    if (!confirm('このメッセージを配信しますか？送信後は取り消しできません。')) return;

    setSending(messageId);
    setError('');

    try {
      const res = await fetch('/api/line/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, messageId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '配信に失敗しました');
        return;
      }

      alert(`配信完了: ${data.success_count}件成功${data.failure_count > 0 ? `、${data.failure_count}件失敗` : ''}`);
      await onRefresh();
    } catch {
      setError('配信に失敗しました');
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('このメッセージを削除しますか？')) return;

    setDeleting(messageId);
    try {
      await fetch(`/api/line/messages?userId=${userId}&messageId=${messageId}`, {
        method: 'DELETE',
      });
      await onRefresh();
    } catch {
      setError('削除に失敗しました');
    } finally {
      setDeleting(null);
    }
  };

  if (!hasAccount) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="font-medium text-amber-800">LINE公式アカウントを設定してください</p>
        <p className="text-sm text-amber-600 mt-1">設定タブからアカウントを連携すると配信機能が使えるようになります</p>
      </div>
    );
  }

  const draftMessages = messages.filter(m => m.status === 'draft');
  const sentMessages = messages.filter(m => m.status === 'sent');

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 新規作成ボタン */}
      {!showComposer && (
        <button
          onClick={() => setShowComposer(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          新しいメッセージを作成
        </button>
      )}

      {/* 作成フォーム */}
      {showComposer && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900">メッセージ作成</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              管理用タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: 3月キャンペーン告知"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メッセージ本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="友だちに送信するメッセージを入力..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{text.length}/2000文字</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">配信対象</label>
            <div className="relative">
              <select
                value={targetSource}
                onChange={e => setTargetSource(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                {SOURCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <Users className="w-3 h-3 inline mr-1" />
              現在の友だち数: {friendCount}人
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
              下書き保存
            </button>
            <button
              onClick={() => { setShowComposer(false); setError(''); }}
              className="px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-all"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 下書きメッセージ */}
      {draftMessages.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">下書き（{draftMessages.length}）</h3>
          <div className="space-y-3">
            {draftMessages.map(msg => (
              <div key={msg.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{msg.title}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {typeof msg.content === 'object' && 'text' in msg.content ? msg.content.text : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(msg.created_at || '').toLocaleDateString('ja-JP')}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {msg.target_type === 'all' ? '全員' : `セグメント`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleSend(msg.id)}
                      disabled={sending === msg.id || friendCount === 0}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
                    >
                      {sending === msg.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />
                      }
                      配信
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deleting === msg.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      {deleting === msg.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 送信済みメッセージ */}
      {sentMessages.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">送信済み（{sentMessages.length}）</h3>
          <div className="space-y-3">
            {sentMessages.map(msg => (
              <div key={msg.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm opacity-80">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-gray-900">{msg.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {msg.sent_at ? new Date(msg.sent_at).toLocaleString('ja-JP') : ''}
                      </span>
                      <span className="text-xs text-green-600 font-medium">{msg.success_count}件送信</span>
                      {msg.failure_count > 0 && (
                        <span className="text-xs text-red-500">{msg.failure_count}件失敗</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空の状態 */}
      {messages.length === 0 && !showComposer && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">まだメッセージがありません</p>
          <p className="text-sm text-gray-400 mt-1">「新しいメッセージを作成」からLINEメッセージを作成・配信できます</p>
        </div>
      )}
    </div>
  );
}
