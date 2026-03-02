'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Save, ArrowLeft, Loader2, Monitor, Pencil,
  ChevronDown, ChevronUp, Settings, FileText, Paintbrush,
  LayoutTemplate, Sparkles, Type
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { NEWSLETTER_TEMPLATES, type NewsletterTemplate } from '@/constants/templates/newsletter';

interface CampaignEditorProps {
  campaignId?: string;
  defaultListId?: string;
}

interface ListOption {
  id: string;
  name: string;
  header_html?: string;
  footer_html?: string;
}

// 折りたたみセクション
function Section({
  title, icon: Icon, isOpen, onToggle, children, badge,
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <span className={`p-2 rounded-lg ${isOpen ? 'bg-violet-100 text-violet-600' : 'bg-gray-200 text-gray-500'}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="flex-1 text-left text-sm font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-violet-100 text-violet-600 rounded-md">{badge}</span>
        )}
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

// HTMLからプレーンテキストを抽出
function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '・')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function CampaignEditor({ campaignId, defaultListId }: CampaignEditorProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [lists, setLists] = useState<ListOption[]>([]);
  const [listId, setListId] = useState(defaultListId || '');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [headerHtml, setHeaderHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentCount, setSentCount] = useState(0);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // AI 関連
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiType, setAiType] = useState<'subject' | 'body'>('body');
  const [aiPurpose, setAiPurpose] = useState('announcement');
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiResults, setAiResults] = useState<string[]>([]);

  // セクション開閉
  const [openSections, setOpenSections] = useState({
    basic: true,
    template: !campaignId,
    header: false,
    body: !!campaignId,
    footer: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  // リスト変更時にヘッダ/フッタをデフォルト適用
  useEffect(() => {
    const selectedList = lists.find((l) => l.id === listId);
    if (selectedList && !campaignId) {
      if (selectedList.header_html && !headerHtml) setHeaderHtml(selectedList.header_html);
      if (selectedList.footer_html && !footerHtml) setFooterHtml(selectedList.footer_html);
    }
  }, [listId, lists]);

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
    const textContent = htmlToPlainText(getFullHtml());
    const body = { userId, listId, subject, previewText, htmlContent: getFullHtml(), textContent };
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
    // 保存してから送信
    const textContent = htmlToPlainText(getFullHtml());
    await fetch(`/api/newsletter-maker/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, listId, subject, previewText, htmlContent: getFullHtml(), textContent }),
    });

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

  // ヘッダ + 本文 + フッタを結合したHTML
  const getFullHtml = () => {
    const body = htmlContent.startsWith('<') ? htmlContent : textToHtml(htmlContent);
    const parts = [headerHtml, body, footerHtml].filter(Boolean);
    return parts.join('\n');
  };

  // テンプレート適用
  const applyTemplate = (template: NewsletterTemplate) => {
    if (htmlContent && !confirm('現在の本文を上書きしますか？')) return;
    setHeaderHtml(template.header_html);
    setHtmlContent(template.body_html);
    setFooterHtml(template.footer_html);
    setOpenSections((prev) => ({ ...prev, template: false, body: true }));
  };

  // AI生成
  const handleAiGenerate = async () => {
    if (!userId) return;
    setAiGenerating(true);
    setAiResults([]);
    try {
      const res = await fetch('/api/newsletter-maker/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: aiType,
          purpose: aiPurpose,
          keyword: aiKeyword,
          currentSubject: subject,
          currentContent: htmlContent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data.results || []);
      } else {
        const err = await res.json();
        alert(err.error || 'AI生成に失敗しました');
      }
    } catch {
      alert('AI生成に失敗しました');
    }
    setAiGenerating(false);
  };

  const applyAiResult = (result: string) => {
    if (aiType === 'subject') {
      setSubject(result);
    } else {
      setHtmlContent(result);
    }
    setShowAiModal(false);
    setAiResults([]);
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
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Section 1: 基本設定 */}
            <Section
              title="基本設定"
              icon={Settings}
              isOpen={openSections.basic}
              onToggle={() => toggleSection('basic')}
            >
              <div className="space-y-4">
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">件名 <span className="text-red-500">*</span></label>
                    {!isSent && (
                      <button
                        onClick={() => { setAiType('subject'); setShowAiModal(true); }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />AIで生成
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSent}
                    placeholder="メールの件名を入力"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  />
                </div>
              </div>
            </Section>

            {/* Section 2: テンプレート選択 */}
            {!isSent && (
              <Section
                title="テンプレート"
                icon={LayoutTemplate}
                isOpen={openSections.template}
                onToggle={() => toggleSection('template')}
                badge={`${NEWSLETTER_TEMPLATES.length}種類`}
              >
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">テンプレートを選択すると、ヘッダー・本文・フッターが自動設定されます。</p>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">基本テンプレート</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NEWSLETTER_TEMPLATES.filter((t) => t.category === 'basic').map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-3 text-left border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all group"
                        >
                          <span className="text-xl mb-1 block">{template.icon}</span>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">{template.name}</span>
                          <span className="text-xs text-gray-500 block mt-0.5">{template.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">業種別テンプレート</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NEWSLETTER_TEMPLATES.filter((t) => t.category === 'industry').map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-3 text-left border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all group"
                        >
                          <span className="text-xl mb-1 block">{template.icon}</span>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">{template.name}</span>
                          <span className="text-xs text-gray-500 block mt-0.5">{template.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Section 3: ヘッダー */}
            <Section
              title="ヘッダー"
              icon={Type}
              isOpen={openSections.header}
              onToggle={() => toggleSection('header')}
              badge={headerHtml ? '設定済み' : undefined}
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">メール冒頭に表示されるヘッダーHTML。リスト設定から自動適用されます。</p>
                <textarea
                  value={headerHtml}
                  onChange={(e) => setHeaderHtml(e.target.value)}
                  disabled={isSent}
                  placeholder="ヘッダーHTML（任意）"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                />
              </div>
            </Section>

            {/* Section 4: 本文 */}
            <Section
              title="本文"
              icon={FileText}
              isOpen={openSections.body}
              onToggle={() => toggleSection('body')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">メール本文を入力してください。HTMLタグも使用できます。</p>
                  {!isSent && (
                    <button
                      onClick={() => { setAiType('body'); setShowAiModal(true); }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />AIで下書き生成
                    </button>
                  )}
                </div>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  disabled={isSent}
                  placeholder={'メール本文を入力してください。\n\n改行はそのまま反映されます。\nHTMLタグも使用できます。'}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                />
              </div>
            </Section>

            {/* Section 5: フッター */}
            <Section
              title="フッター"
              icon={Paintbrush}
              isOpen={openSections.footer}
              onToggle={() => toggleSection('footer')}
              badge={footerHtml ? '設定済み' : undefined}
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">メール末尾に表示されるフッターHTML。配信停止リンクは自動追加されます。</p>
                <textarea
                  value={footerHtml}
                  onChange={(e) => setFooterHtml(e.target.value)}
                  disabled={isSent}
                  placeholder="フッターHTML（任意）"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                />
              </div>
            </Section>
          </div>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[57px] lg:h-[calc(100vh-57px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          {/* ブラウザ風ヘッダー */}
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-medium font-mono">メールプレビュー</span>
          </div>
          {/* プレビューコンテンツ */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* メールヘッダ風 */}
              <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                {subject ? (
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{subject}</h2>
                ) : (
                  <h2 className="text-lg font-bold text-gray-300 mb-1">件名を入力してください</h2>
                )}
                {previewText && (
                  <p className="text-sm text-gray-500">{previewText}</p>
                )}
              </div>
              {/* メール本文 */}
              <div className="p-0">
                {(headerHtml || htmlContent || footerHtml) ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: getFullHtml() }}
                  />
                ) : (
                  <p className="text-gray-300 text-center py-16">本文を入力すると、ここにプレビューが表示されます</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右パネル用スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>

      {/* AI生成モーダル */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                {aiType === 'subject' ? 'AIで件名を生成' : 'AIで本文を生成'}
              </h2>
              <button
                onClick={() => { setShowAiModal(false); setAiResults([]); }}
                className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">用途</label>
                <select
                  value={aiPurpose}
                  onChange={(e) => setAiPurpose(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                >
                  <option value="announcement">お知らせ</option>
                  <option value="sale">セール告知</option>
                  <option value="column">コラム/ブログ</option>
                  <option value="event">イベント案内</option>
                  <option value="welcome">ウェルカムメール</option>
                  <option value="follow_up">フォローアップ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">キーワード・補足情報</label>
                <textarea
                  value={aiKeyword}
                  onChange={(e) => setAiKeyword(e.target.value)}
                  placeholder="例：春のキャンペーン、新サービス開始、料理教室の生徒募集..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="w-full px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all min-h-[44px] flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />生成中...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />生成する</>
                )}
              </button>

              {/* AI生成結果 */}
              {aiResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">生成結果（クリックで適用）</p>
                  {aiResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => applyAiResult(result)}
                      className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
                    >
                      {aiType === 'subject' ? (
                        <p className="text-sm font-semibold text-gray-900">{result}</p>
                      ) : (
                        <div className="text-sm text-gray-700 line-clamp-4" dangerouslySetInnerHTML={{ __html: result }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
