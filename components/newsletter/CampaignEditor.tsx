'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Save, ArrowLeft, Loader2, Monitor, Pencil,
  ChevronDown, ChevronUp, Settings, FileText, Paintbrush,
  LayoutTemplate, Sparkles, Type, Code, Eye, Mail, AlertTriangle,
  CheckCircle2, Users, X, SendHorizonal
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

// セクションごとのテーマカラー定義
const SECTION_THEMES = {
  basic: {
    iconBg: 'bg-blue-100 text-blue-600',
    iconBgClosed: 'bg-blue-50 text-blue-400',
    badge: 'bg-blue-100 text-blue-600',
    border: 'border-blue-200',
    headerHover: 'hover:bg-blue-50/50',
    topAccent: 'bg-gradient-to-r from-blue-500 to-blue-400',
  },
  template: {
    iconBg: 'bg-amber-100 text-amber-600',
    iconBgClosed: 'bg-amber-50 text-amber-400',
    badge: 'bg-amber-100 text-amber-600',
    border: 'border-amber-200',
    headerHover: 'hover:bg-amber-50/50',
    topAccent: 'bg-gradient-to-r from-amber-500 to-orange-400',
  },
  header: {
    iconBg: 'bg-emerald-100 text-emerald-600',
    iconBgClosed: 'bg-emerald-50 text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-200',
    headerHover: 'hover:bg-emerald-50/50',
    topAccent: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  },
  body: {
    iconBg: 'bg-violet-100 text-violet-600',
    iconBgClosed: 'bg-violet-50 text-violet-400',
    badge: 'bg-violet-100 text-violet-600',
    border: 'border-violet-200',
    headerHover: 'hover:bg-violet-50/50',
    topAccent: 'bg-gradient-to-r from-violet-500 to-purple-400',
  },
  footer: {
    iconBg: 'bg-rose-100 text-rose-600',
    iconBgClosed: 'bg-rose-50 text-rose-400',
    badge: 'bg-rose-100 text-rose-600',
    border: 'border-rose-200',
    headerHover: 'hover:bg-rose-50/50',
    topAccent: 'bg-gradient-to-r from-rose-500 to-pink-400',
  },
} as const;

type SectionThemeKey = keyof typeof SECTION_THEMES;

// 折りたたみセクション
function Section({
  title, icon: Icon, isOpen, onToggle, children, badge, theme,
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  theme: SectionThemeKey;
}) {
  const t = SECTION_THEMES[theme];
  return (
    <div className={`border ${isOpen ? t.border : 'border-gray-200'} rounded-xl overflow-hidden bg-white transition-all duration-200 ${isOpen ? 'shadow-md' : 'shadow-sm'}`}>
      {isOpen && <div className={`h-1 ${t.topAccent}`} />}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-4 ${t.headerHover} transition-colors`}
      >
        <span className={`p-2 rounded-lg transition-colors ${isOpen ? t.iconBg : t.iconBgClosed}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="flex-1 text-left text-sm font-bold text-gray-900">{title}</span>
        {badge && (
          <span className={`px-2 py-0.5 text-xs font-semibold ${t.badge} rounded-md`}>{badge}</span>
        )}
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

// HTML⇔ビジュアル切替トグル
function ViewToggle({
  mode, onChange,
}: {
  mode: 'visual' | 'html';
  onChange: (mode: 'visual' | 'html') => void;
}) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 text-xs">
      <button
        onClick={() => onChange('visual')}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all font-semibold ${
          mode === 'visual' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Eye className="w-3 h-3" />ビジュアル
      </button>
      <button
        onClick={() => onChange('html')}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all font-semibold ${
          mode === 'html' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Code className="w-3 h-3" />HTML
      </button>
    </div>
  );
}

// 送信確認モーダル
function SendConfirmModal({
  onConfirm, onCancel, sending, subscriberCount, subject, listName,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  sending: boolean;
  subscriberCount: number;
  subject: string;
  listName: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">一斉送信の確認</h2>
          <p className="text-sm text-gray-600 mb-6">
            送信後は編集できません。内容をよく確認してから送信してください。
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500">件名</p>
                <p className="text-sm text-gray-900 font-medium">{subject}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500">配信先</p>
                <p className="text-sm text-gray-900 font-medium">{listName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Send className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500">送信数</p>
                <p className="text-sm font-bold text-red-600">{subscriberCount}通</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all min-h-[44px] disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all min-h-[44px] flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />送信中...</>
            ) : (
              <><Send className="w-4 h-4" />送信する</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// テスト送信モーダル
function TestSendModal({
  onClose, campaignId, userId, userEmail,
}: {
  onClose: () => void;
  campaignId: string;
  userId: string;
  userEmail?: string;
}) {
  const [testEmail, setTestEmail] = useState(userEmail || '');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestSend = async () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/newsletter-maker/campaigns/${campaignId}/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, testEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: data.message || `${testEmail} にテストメールを送信しました` });
      } else {
        setTestResult({ success: false, message: data.error || 'テスト送信に失敗しました' });
      }
    } catch {
      setTestResult({ success: false, message: '通信エラーが発生しました' });
    }
    setTestSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <SendHorizonal className="w-5 h-5 text-blue-600" />
            テスト送信
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            指定したメールアドレスに1通だけテスト送信します。件名に「【テスト送信】」が付きます。
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">送信先メールアドレス</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleTestSend}
            disabled={testSending || !testEmail}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all min-h-[44px] flex items-center justify-center gap-2 shadow-md"
          >
            {testSending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />送信中...</>
            ) : (
              <><SendHorizonal className="w-4 h-4" />テスト送信する</>
            )}
          </button>

          {testResult && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
              testResult.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>
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
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
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
  const [subscriberCount, setSubscriberCount] = useState(0);

  // モーダル
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showTestSend, setShowTestSend] = useState(false);

  // 表示モード（HTML / ビジュアル）
  const [headerViewMode, setHeaderViewMode] = useState<'visual' | 'html'>('visual');
  const [bodyViewMode, setBodyViewMode] = useState<'visual' | 'html'>('visual');
  const [footerViewMode, setFooterViewMode] = useState<'visual' | 'html'>('visual');

  // AI 関連
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPurpose, setAiPurpose] = useState('announcement');
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiResults, setAiResults] = useState<string[]>([]);

  // 件名候補
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);

  // contentEditable refs
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

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
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchLists(currentUser.id);
        if (campaignId) {
          await fetchCampaign(currentUser.id);
        }
      }
      setLoading(false);
    };
    init();
  }, [campaignId]);

  // リスト変更時にヘッダ/フッタをデフォルト適用 & 読者数取得
  useEffect(() => {
    const selectedList = lists.find((l) => l.id === listId);
    if (selectedList && !campaignId) {
      if (selectedList.header_html && !headerHtml) setHeaderHtml(selectedList.header_html);
      if (selectedList.footer_html && !footerHtml) setFooterHtml(selectedList.footer_html);
    }
    // 読者数取得
    if (listId && supabase) {
      supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('list_id', listId)
        .eq('status', 'subscribed')
        .then(({ count }) => {
          setSubscriberCount(count || 0);
        });
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
    if (!user || !subject || !listId) return;
    setSaving(true);
    const textContent = htmlToPlainText(getFullHtml());
    const body = { userId: user.id, listId, subject, previewText, htmlContent: getFullHtml(), textContent };
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

  const handleSendConfirmed = async () => {
    if (!user || !campaignId) return;
    setSending(true);
    // 保存してから送信
    const textContent = htmlToPlainText(getFullHtml());
    await fetch(`/api/newsletter-maker/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, listId, subject, previewText, htmlContent: getFullHtml(), textContent }),
    });

    const res = await fetch(`/api/newsletter-maker/campaigns/${campaignId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setStatus('sent');
      setSentCount(data.sentCount);
      setShowSendConfirm(false);
      alert(`${data.sentCount}通のメールを送信しました`);
    } else {
      const err = await res.json();
      setShowSendConfirm(false);
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

  // プレースホルダー変数をプレビュー用に置換
  const replacePlaceholders = useCallback((html: string) => {
    const listName = lists.find((l) => l.id === listId)?.name || 'ニュースレター';
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    return html
      .replace(/\{\{ニュースレター名\}\}/g, listName)
      .replace(/\{\{送信者名\}\}/g, listName)
      .replace(/\{\{日付\}\}/g, today);
  }, [lists, listId]);

  // contentEditable → state 同期（onBlur時）
  const handleHeaderBlur = useCallback(() => {
    if (headerRef.current) setHeaderHtml(headerRef.current.innerHTML);
  }, []);
  const handleBodyBlur = useCallback(() => {
    if (bodyRef.current) setHtmlContent(bodyRef.current.innerHTML);
  }, []);
  const handleFooterBlur = useCallback(() => {
    if (footerRef.current) setFooterHtml(footerRef.current.innerHTML);
  }, []);

  // ビジュアルモード切替時にrefのinnerHTMLをセット
  useEffect(() => {
    if (headerRef.current && headerViewMode === 'visual' && headerHtml) {
      headerRef.current.innerHTML = headerHtml;
    }
  }, [headerViewMode]);

  useEffect(() => {
    if (bodyRef.current && bodyViewMode === 'visual') {
      bodyRef.current.innerHTML = htmlContent.startsWith('<')
        ? htmlContent
        : textToHtml(htmlContent);
    }
  }, [bodyViewMode]);

  useEffect(() => {
    if (footerRef.current && footerViewMode === 'visual' && footerHtml) {
      footerRef.current.innerHTML = footerHtml;
    }
  }, [footerViewMode]);

  // テンプレート適用（件名候補も設定）
  const applyTemplate = (template: NewsletterTemplate) => {
    if (htmlContent && !confirm('現在の内容をテンプレートで上書きしますか？')) return;
    setHeaderHtml(template.header_html);
    setHtmlContent(template.body_html);
    setFooterHtml(template.footer_html);
    setSubjectSuggestions(template.subject_suggestions || []);
    if (!subject && template.subject_suggestions?.length > 0) {
      setSubject(template.subject_suggestions[0]);
    }
    setOpenSections((prev) => ({ ...prev, template: false, body: true }));
  };

  // AI本文生成
  const handleAiGenerate = async () => {
    if (!user) return;
    setAiGenerating(true);
    setAiResults([]);
    try {
      const res = await fetch('/api/newsletter-maker/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'body',
          purpose: aiPurpose,
          keyword: aiKeyword,
          currentSubject: subject,
          currentContent: htmlContent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data.results || []);
        if (!data.results?.length) {
          alert('生成結果が空でした。キーワードを変更してお試しください。');
        }
      } else {
        const err = await res.json();
        alert(err.error || 'AI生成に失敗しました');
      }
    } catch {
      alert('通信エラーが発生しました。しばらくしてからお試しください。');
    }
    setAiGenerating(false);
  };

  const applyAiResult = (result: string) => {
    setHtmlContent(result);
    setShowAiModal(false);
    setAiResults([]);
    setOpenSections((prev) => ({ ...prev, body: true }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const isSent = status === 'sent';
  const currentListName = lists.find((l) => l.id === listId)?.name || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* エディタヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm">
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
            {campaignId && (
              <button
                onClick={() => {
                  // テスト送信前に保存
                  handleSave().then(() => setShowTestSend(true));
                }}
                disabled={saving || !subject || !htmlContent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all shadow-sm min-h-[44px]"
              >
                <SendHorizonal className="w-4 h-4" />
                <span className="hidden sm:inline">テスト送信</span>
              </button>
            )}
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
                onClick={() => setShowSendConfirm(true)}
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
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[121px] z-30">
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
              theme="basic"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">配信先リスト</label>
                  <select
                    value={listId}
                    onChange={(e) => setListId(e.target.value)}
                    disabled={isSent}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  >
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  {subscriberCount > 0 && (
                    <p className="mt-1.5 text-xs text-blue-600 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {subscriberCount}人の読者に配信されます
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">件名 <span className="text-red-500">*</span></label>
                  {subjectSuggestions.length > 0 && !isSent && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1.5">件名候補を選択:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {subjectSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setSubject(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all min-h-[32px] ${
                              subject === s
                                ? 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSent}
                    placeholder="メールの件名を入力（テンプレート選択で自動入力されます）"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
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
                theme="template"
              >
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">テンプレートを選択すると、件名・ヘッダー・本文・フッターが自動設定されます。</p>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">基本テンプレート</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NEWSLETTER_TEMPLATES.filter((t) => t.category === 'basic').map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-3 text-left border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all group"
                        >
                          <span className="text-xl mb-1 block">{template.icon}</span>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">{template.name}</span>
                          <span className="text-xs text-gray-500 block mt-0.5">{template.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">業種別テンプレート</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NEWSLETTER_TEMPLATES.filter((t) => t.category === 'industry').map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-3 text-left border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all group"
                        >
                          <span className="text-xl mb-1 block">{template.icon}</span>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">{template.name}</span>
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
              theme="header"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">メール冒頭に表示されるヘッダー。</p>
                  <ViewToggle mode={headerViewMode} onChange={setHeaderViewMode} />
                </div>
                {headerViewMode === 'html' ? (
                  <textarea
                    value={headerHtml}
                    onChange={(e) => setHeaderHtml(e.target.value)}
                    disabled={isSent}
                    placeholder="ヘッダーHTML（任意）"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[80px]">
                    {headerHtml ? (
                      <div
                        ref={headerRef}
                        contentEditable={!isSent}
                        suppressContentEditableWarning
                        onBlur={handleHeaderBlur}
                        className="min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset rounded-xl"
                        dangerouslySetInnerHTML={{ __html: headerHtml }}
                      />
                    ) : (
                      <p className="p-4 text-sm text-gray-400">ヘッダーが未設定です。テンプレートを選択すると自動設定されます。</p>
                    )}
                  </div>
                )}
              </div>
            </Section>

            {/* Section 4: 本文 */}
            <Section
              title="本文"
              icon={FileText}
              isOpen={openSections.body}
              onToggle={() => toggleSection('body')}
              theme="body"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm text-gray-600">メール本文を編集してください。</p>
                  <div className="flex items-center gap-2">
                    {!isSent && (
                      <button
                        onClick={() => setShowAiModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />AIで下書き生成
                      </button>
                    )}
                    <ViewToggle mode={bodyViewMode} onChange={setBodyViewMode} />
                  </div>
                </div>
                {bodyViewMode === 'html' ? (
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    disabled={isSent}
                    placeholder={'メール本文のHTMLを入力してください。\nテンプレートを選択すると自動設定されます。'}
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[200px]">
                    {htmlContent ? (
                      <div
                        ref={bodyRef}
                        contentEditable={!isSent}
                        suppressContentEditableWarning
                        onBlur={handleBodyBlur}
                        className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset rounded-xl"
                        dangerouslySetInnerHTML={{ __html: htmlContent.startsWith('<') ? htmlContent : textToHtml(htmlContent) }}
                      />
                    ) : (
                      <p className="p-4 text-sm text-gray-400">本文が未入力です。テンプレートを選択するか、HTMLモードで直接入力してください。</p>
                    )}
                  </div>
                )}
              </div>
            </Section>

            {/* Section 5: フッター */}
            <Section
              title="フッター"
              icon={Paintbrush}
              isOpen={openSections.footer}
              onToggle={() => toggleSection('footer')}
              badge={footerHtml ? '設定済み' : undefined}
              theme="footer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">メール末尾に表示されるフッター。</p>
                  <ViewToggle mode={footerViewMode} onChange={setFooterViewMode} />
                </div>
                {footerViewMode === 'html' ? (
                  <textarea
                    value={footerHtml}
                    onChange={(e) => setFooterHtml(e.target.value)}
                    disabled={isSent}
                    placeholder="フッターHTML（任意）"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-mono text-sm disabled:bg-gray-100"
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[80px]">
                    {footerHtml ? (
                      <div
                        ref={footerRef}
                        contentEditable={!isSent}
                        suppressContentEditableWarning
                        onBlur={handleFooterBlur}
                        className="min-h-[80px] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-inset rounded-xl"
                        dangerouslySetInnerHTML={{ __html: footerHtml }}
                      />
                    ) : (
                      <p className="p-4 text-sm text-gray-400">フッターが未設定です。テンプレートを選択すると自動設定されます。</p>
                    )}
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[138px] lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
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
                    dangerouslySetInnerHTML={{ __html: replacePlaceholders(getFullHtml()) }}
                  />
                ) : (
                  <p className="text-gray-300 text-center py-16">テンプレートを選択すると、ここにプレビューが表示されます</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右パネル用スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>

      {/* 送信確認モーダル */}
      {showSendConfirm && (
        <SendConfirmModal
          onConfirm={handleSendConfirmed}
          onCancel={() => setShowSendConfirm(false)}
          sending={sending}
          subscriberCount={subscriberCount}
          subject={subject}
          listName={currentListName}
        />
      )}

      {/* テスト送信モーダル */}
      {showTestSend && campaignId && user && (
        <TestSendModal
          onClose={() => setShowTestSend(false)}
          campaignId={campaignId}
          userId={user.id}
          userEmail={user.email}
        />
      )}

      {/* AI本文生成モーダル */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                AIで本文を生成
              </h2>
              <button
                onClick={() => { setShowAiModal(false); setAiResults([]); }}
                className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">用途とキーワードを入力すると、AIがメール本文のHTMLを生成します。（PROプラン限定）</p>
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
                  <><Sparkles className="w-4 h-4" />本文を生成する</>
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
                      <div className="text-sm text-gray-700 line-clamp-4" dangerouslySetInnerHTML={{ __html: result }} />
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
