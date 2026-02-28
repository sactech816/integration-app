'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Save, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CampaignEditorProps {
  campaignId?: string;
  defaultListId?: string;
}

interface ListOption {
  id: string;
  name: string;
}

export default function CampaignEditor({ campaignId, defaultListId }: CampaignEditorProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [lists, setLists] = useState<ListOption[]>([]);
  const [listId, setListId] = useState(defaultListId || '');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchLists(user.id);
        if (campaignId) {
          await fetchCampaign(user.id);
        }
      }
      setLoading(false);
    };
    init();
  }, [campaignId]);

  const fetchLists = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/lists?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setLists(data.lists || []);
      if (!listId && data.lists?.length > 0) {
        setListId(data.lists[0].id);
      }
    }
  };

  const fetchCampaign = async (uid: string) => {
    const res = await fetch(`/api/newsletter-maker/campaigns/${campaignId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      const c = data.campaign;
      setListId(c.list_id);
      setSubject(c.subject);
      setPreviewText(c.preview_text || '');
      setHtmlContent(c.html_content || '');
      setStatus(c.status);
      setSentCount(c.sent_count || 0);
    }
  };

  const handleSave = async () => {
    if (!userId || !subject || !listId) return;
    setSaving(true);

    const body = { userId, listId, subject, previewText, htmlContent };

    if (campaignId) {
      await fetch(`/api/newsletter-maker/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      const res = await fetch('/api/newsletter-maker/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/newsletter/campaigns/${data.campaign.id}`);
      }
    }
    setSaving(false);
  };

  const handleSend = async () => {
    if (!userId || !campaignId) return;
    if (!confirm('このキャンペーンを全読者に送信しますか？送信後は編集できません。')) return;

    setSending(true);
    const res = await fetch(`/api/newsletter-maker/campaigns/${campaignId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      const data = await res.json();
      setStatus('sent');
      setSentCount(data.sentCount);
      alert(`${data.sentCount}通のメールを送信しました`);
    } else {
      const err = await res.json();
      alert(err.error || '送信に失敗しました');
    }
    setSending(false);
  };

  // テキストからシンプルなHTMLを生成
  const textToHtml = (text: string) => {
    return text
      .split('\n\n')
      .map((para) => `<p style="margin:0 0 16px 0;line-height:1.8;color:#374151;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const isSent = status === 'sent';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/newsletter/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isSent ? 'キャンペーン詳細' : campaignId ? 'キャンペーン編集' : '新しいキャンペーン'}
        </h1>
        {isSent && (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-full">
            送信済み（{sentCount}通）
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* リスト選択 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">配信先リスト</label>
          <select
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            disabled={isSent}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
          >
            {lists.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* 件名 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">件名</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSent}
            placeholder="メールの件名を入力"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
          />
        </div>

        {/* プレビューテキスト */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">プレビューテキスト（任意）</label>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            disabled={isSent}
            placeholder="受信トレイに表示される短い説明文"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
          />
        </div>

        {/* 本文エディタ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">メール本文</label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-800 font-semibold transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'エディタに戻る' : 'プレビュー'}
            </button>
          </div>

          {showPreview ? (
            <div className="border border-gray-300 rounded-xl p-6 bg-white min-h-[300px]">
              <div
                dangerouslySetInnerHTML={{
                  __html: htmlContent.startsWith('<') ? htmlContent : textToHtml(htmlContent),
                }}
              />
            </div>
          ) : (
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              disabled={isSent}
              placeholder="メール本文を入力してください。&#10;&#10;改行はそのまま反映されます。&#10;HTMLタグも使用できます。"
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
            />
          )}
          <p className="text-xs text-gray-500 mt-1">テキストで入力するとシンプルなHTML形式に変換されます。HTMLタグを直接入力することも可能です。</p>
        </div>

        {/* アクションボタン */}
        {!isSent && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving || !subject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '下書き保存'}
            </button>
            {campaignId && (
              <button
                onClick={handleSend}
                disabled={sending || !subject || !htmlContent}
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all shadow-md min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                {sending ? '送信中...' : '一斉送信'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
