'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Save, ArrowLeft, Loader2, Monitor, Pencil } from 'lucide-react';
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
  const [sentCount, setSentCount] = useState(0);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

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

  const textToHtml = (text: string) => {
    return text
      .split('\n\n')
      .map((para) => `<p style="margin:0 0 16px 0;line-height:1.8;color:#374151;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const isSent = status === 'sent';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/newsletter/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {isSent ? 'キャンペーン詳細' : campaignId ? 'キャンペーン編集' : '新しいキャンペーン'}
          </h1>
          {isSent && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              送信済み（{sentCount}通）
            </span>
          )}
        </div>
        {!isSent && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !subject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
            {campaignId && (
              <button
                onClick={handleSend}
                disabled={sending || !subject || !htmlContent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all shadow-md min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                {sending ? '送信中...' : '一斉送信'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[57px] z-30">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            mobileTab === 'editor'
              ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Pencil className="w-4 h-4" />編集
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            mobileTab === 'preview'
              ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Monitor className="w-4 h-4" />プレビュー
        </button>
      </div>

      {/* 左右パネル */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル: 編集 */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="space-y-5">
            {/* リスト選択 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">配信先リスト</label>
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                disabled={isSent}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* 件名・プレビューテキスト */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">件名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSent}
                  placeholder="メールの件名を入力"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">プレビューテキスト（任意）</label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  disabled={isSent}
                  placeholder="受信トレイに表示される短い説明文"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* 本文エディタ */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">メール本文</label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                disabled={isSent}
                placeholder={'メール本文を入力してください。\n\n改行はそのまま反映されます。\nHTMLタグも使用できます。'}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-2">テキストで入力するとシンプルなHTML形式に変換されます。HTMLタグを直接入力することも可能です。</p>
            </div>
          </div>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[57px] lg:h-[calc(100vh-57px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          {/* ブラウザ風ヘッダー */}
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-medium">メールプレビュー</span>
          </div>
          {/* プレビューコンテンツ */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6">
                {subject ? (
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{subject}</h2>
                ) : (
                  <h2 className="text-xl font-bold text-gray-300 mb-1">件名を入力してください</h2>
                )}
                {previewText && (
                  <p className="text-sm text-gray-500 mb-4">{previewText}</p>
                )}
                <hr className="my-4 border-gray-200" />
                {htmlContent ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: htmlContent.startsWith('<') ? htmlContent : textToHtml(htmlContent),
                    }}
                  />
                ) : (
                  <p className="text-gray-300 text-center py-12">本文を入力すると、ここにプレビューが表示されます</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右パネル用スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>
    </div>
  );
}
