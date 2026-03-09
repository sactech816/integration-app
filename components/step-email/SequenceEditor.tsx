'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, ArrowLeft, Loader2, Monitor, Pencil,
  ChevronDown, ChevronUp, Settings, Clock,
  Plus, Trash2, Mail, Users, X,
  Play, Pause, AlertTriangle, CheckCircle2,
  Eye, Code, BarChart3, ListOrdered, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePoints } from '@/lib/hooks/usePoints';

// --- Types ---

interface SequenceEditorProps {
  sequenceId?: string;
  defaultListId?: string;
}

interface ListOption {
  id: string;
  name: string;
}

interface Step {
  id?: string;
  sequence_id?: string;
  step_order: number;
  delay_days: number;
  subject: string;
  html_content: string;
  text_content: string | null;
  isNew?: boolean;
}

interface ProgressStats {
  active: number;
  completed: number;
  paused: number;
  total: number;
}

// --- Section Themes ---

const SECTION_THEMES = {
  basic: {
    iconBg: 'bg-teal-100 text-teal-600',
    iconBgClosed: 'bg-teal-50 text-teal-400',
    badge: 'bg-teal-100 text-teal-600',
    border: 'border-teal-200',
    headerHover: 'hover:bg-teal-50/50',
    topAccent: 'bg-gradient-to-r from-teal-500 to-cyan-400',
  },
  steps: {
    iconBg: 'bg-blue-100 text-blue-600',
    iconBgClosed: 'bg-blue-50 text-blue-400',
    badge: 'bg-blue-100 text-blue-600',
    border: 'border-blue-200',
    headerHover: 'hover:bg-blue-50/50',
    topAccent: 'bg-gradient-to-r from-blue-500 to-blue-400',
  },
  status: {
    iconBg: 'bg-green-100 text-green-600',
    iconBgClosed: 'bg-green-50 text-green-400',
    badge: 'bg-green-100 text-green-600',
    border: 'border-green-200',
    headerHover: 'hover:bg-green-50/50',
    topAccent: 'bg-gradient-to-r from-green-500 to-emerald-400',
  },
} as const;

type SectionThemeKey = keyof typeof SECTION_THEMES;

// --- Collapsible Section ---

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

// --- View Toggle ---

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
          mode === 'visual' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Eye className="w-3 h-3" />ビジュアル
      </button>
      <button
        onClick={() => onChange('html')}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all font-semibold ${
          mode === 'html' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Code className="w-3 h-3" />HTML
      </button>
    </div>
  );
}

// --- Main Component ---

export default function SequenceEditor({ sequenceId, defaultListId }: SequenceEditorProps) {
  const router = useRouter();
  const isEditing = !!sequenceId;

  // Auth
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { consumeAndExecute } = usePoints({ userId: user?.id, isPro: false });

  // Basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [listId, setListId] = useState(defaultListId || '');
  const [lists, setLists] = useState<ListOption[]>([]);
  const [status, setStatus] = useState<'draft' | 'active' | 'paused'>('draft');
  const [subscriberCount, setSubscriberCount] = useState(0);

  // New list creation
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  // Steps
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [bodyViewMode, setBodyViewMode] = useState<'visual' | 'html'>('html');

  // Progress stats (edit mode only)
  const [progressStats, setProgressStats] = useState<ProgressStats>({ active: 0, completed: 0, paused: 0, total: 0 });

  // UI state
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Sections
  const [openSections, setOpenSections] = useState({
    basic: true,
    steps: true,
    status: !!sequenceId,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Init ---

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
        if (sequenceId) {
          await fetchSequence(currentUser.id);
        }
      }
      setLoading(false);
    };
    init();
  }, [sequenceId]);

  // Fetch subscriber count when list changes
  useEffect(() => {
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
  }, [listId]);

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

  const fetchSequence = async (uid: string) => {
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      const seq = data.sequence;
      setName(seq.name);
      setDescription(seq.description || '');
      setListId(seq.list_id);
      setStatus(seq.status);
      setSteps(data.steps || []);
      setProgressStats(data.progressStats || { active: 0, completed: 0, paused: 0, total: 0 });
    } else {
      router.push('/step-email/dashboard');
    }
  };

  // --- List creation ---

  const handleCreateList = async () => {
    if (!user || !newListName.trim()) return;
    setCreatingList(true);
    try {
      const res = await fetch('/api/newsletter-maker/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newListName.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLists((prev) => [data.list, ...prev]);
        setListId(data.list.id);
        setNewListName('');
        setShowNewList(false);
      } else {
        const err = await res.json();
        alert(err.error || 'リスト作成に失敗しました');
      }
    } catch {
      alert('通信エラーが発生しました');
    }
    setCreatingList(false);
  };

  // --- Step management ---

  const addStep = () => {
    const maxDelay = steps.length > 0 ? Math.max(...steps.map(s => s.delay_days)) + 1 : 0;
    const newStep: Step = {
      step_order: steps.length + 1,
      delay_days: maxDelay,
      subject: '',
      html_content: '',
      text_content: null,
      isNew: true,
    };
    setSteps((prev) => [...prev, newStep]);
    setSelectedStepIndex(steps.length);
    setOpenSections((prev) => ({ ...prev, steps: true }));
  };

  const updateStepLocal = (index: number, updates: Partial<Step>) => {
    setSteps((prev) => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const removeStep = (index: number) => {
    if (!confirm('このステップを削除しますか？')) return;
    const step = steps[index];
    if (step.id && user) {
      // Delete from server
      fetch(`/api/step-email-maker/sequences/${sequenceId}/steps/${step.id}?userId=${user.id}`, {
        method: 'DELETE',
      }).then(() => {
        setSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 })));
        if (selectedStepIndex === index) setSelectedStepIndex(null);
        else if (selectedStepIndex !== null && selectedStepIndex > index) setSelectedStepIndex(selectedStepIndex - 1);
      });
    } else {
      setSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 })));
      if (selectedStepIndex === index) setSelectedStepIndex(null);
      else if (selectedStepIndex !== null && selectedStepIndex > index) setSelectedStepIndex(selectedStepIndex - 1);
    }
  };

  // --- Save ---

  const handleSave = async () => {
    if (!user || !name.trim() || !listId) return;

    await consumeAndExecute('step-email', 'save', async () => {
      setSaving(true);

      try {
        if (isEditing) {
          // Update sequence metadata
          await fetch(`/api/step-email-maker/sequences/${sequenceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, name: name.trim(), description: description.trim() || null }),
          });

          // Save each step
          for (const step of steps) {
            if (step.id) {
              // Update existing step
              await fetch(`/api/step-email-maker/sequences/${sequenceId}/steps/${step.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  subject: step.subject,
                  htmlContent: step.html_content,
                  delayDays: step.delay_days,
                }),
              });
            } else {
              // Create new step
              await fetch(`/api/step-email-maker/sequences/${sequenceId}/steps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  subject: step.subject,
                  htmlContent: step.html_content,
                  delayDays: step.delay_days,
                }),
              });
            }
          }

          // Refresh data
          await fetchSequence(user.id);
          alert('保存しました');
        } else {
          // Create new sequence
          const res = await fetch('/api/step-email-maker/sequences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              listId,
              name: name.trim(),
              description: description.trim() || null,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const newSeqId = data.sequence.id;

            // Save steps
            for (const step of steps) {
              await fetch(`/api/step-email-maker/sequences/${newSeqId}/steps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  subject: step.subject,
                  htmlContent: step.html_content,
                  delayDays: step.delay_days,
                }),
              });
            }

            router.push(`/step-email/sequences/${newSeqId}`);
          } else {
            const err = await res.json();
            alert(err.error || 'シーケンス作成に失敗しました');
          }
        }
      } catch {
        alert('保存に失敗しました');
      } finally {
        setSaving(false);
      }
    });
  };

  // --- Activate / Pause / Resume ---

  const handleActivate = async () => {
    if (!user || !sequenceId) return;
    if (steps.length === 0) {
      alert('ステップを1つ以上追加してから有効化してください。');
      return;
    }
    if (!confirm('シーケンスを有効化しますか？\n\n有効化すると、リストの購読者に対してステップメールの自動配信が開始されます。')) return;
    setActivating(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(`シーケンスを有効化しました。${data.enrolledCount}人の購読者が登録されました。`);
      await fetchSequence(user.id);
    } else {
      const data = await res.json();
      alert(data.error || '有効化に失敗しました');
    }
    setActivating(false);
  };

  const handleStatusChange = async (newStatus: 'active' | 'paused') => {
    if (!user || !sequenceId) return;
    setSaving(true);
    const res = await fetch(`/api/step-email-maker/sequences/${sequenceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, status: newStatus }),
    });
    if (res.ok) {
      await fetchSequence(user.id);
    }
    setSaving(false);
  };

  // --- Helpers ---

  const getDelayLabel = (days: number) => {
    if (days === 0) return '登録直後';
    return `${days}日後`;
  };

  const selectedStep = selectedStepIndex !== null ? steps[selectedStepIndex] : null;

  // --- Loading ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">ログインが必要です</p>
      </div>
    );
  }

  // --- Render ---

  const canSave = name.trim() && listId;

  // Preview panel content
  const renderPreview = () => (
    <div className="p-4 sm:p-6">
      <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Monitor className="w-4 h-4" />
        ステップメールフロー
      </h3>

      {steps.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">ステップを追加するとプレビューが表示されます</p>
        </div>
      ) : (
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Timeline line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[19px] top-[44px] bottom-0 w-0.5 bg-teal-200" />
              )}
              <button
                onClick={() => setSelectedStepIndex(index)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl mb-2 text-left transition-all ${
                  selectedStepIndex === index
                    ? 'bg-teal-50 border border-teal-300 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                  selectedStepIndex === index ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-700'
                }`}>
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {step.subject || '(件名未設定)'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{getDelayLabel(step.delay_days)}</span>
                  </div>
                  {step.html_content && (
                    <div className="mt-2 border border-gray-200 rounded-lg p-2 bg-white text-xs max-h-24 overflow-hidden">
                      <div dangerouslySetInnerHTML={{ __html: step.html_content }} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress stats (edit mode) */}
      {isEditing && progressStats.total > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">配信状況</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-blue-700">{progressStats.active}</p>
              <p className="text-xs text-blue-600">配信中</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-green-700">{progressStats.completed}</p>
              <p className="text-xs text-green-600">完了</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-gray-700">{progressStats.paused}</p>
              <p className="text-xs text-gray-600">停止</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Editor panel content
  const renderEditor = () => (
    <div className="space-y-4 pb-32">
      {/* Basic Section */}
      <Section
        title="基本設定"
        icon={Settings}
        isOpen={openSections.basic}
        onToggle={() => toggleSection('basic')}
        badge={name ? undefined : '未設定'}
        theme="basic"
      >
        <div className="space-y-4">
          {/* List selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              読者リスト <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{lists.find(l => l.id === listId)?.name || listId}</span>
                <span className="ml-auto text-sm text-gray-500">{subscriberCount}人</span>
              </div>
            ) : (
              <>
                {!showNewList ? (
                  <div className="space-y-2">
                    {lists.length > 0 ? (
                      <select
                        value={listId}
                        onChange={(e) => setListId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      >
                        {lists.map((list) => (
                          <option key={list.id} value={list.id}>{list.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500 py-2">リストがありません</p>
                    )}
                    <button
                      onClick={() => setShowNewList(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      新しいリストを作成
                    </button>
                    <p className="text-xs text-gray-500">メルマガメーカーの読者リストと共有されます</p>
                  </div>
                ) : (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-teal-800">新しいリストを作成</p>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="リスト名"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateList}
                        disabled={creatingList || !newListName.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-lg text-sm transition-all min-h-[44px]"
                      >
                        {creatingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        作成
                      </button>
                      <button
                        onClick={() => { setShowNewList(false); setNewListName(''); }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sequence name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              シーケンス名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 新規登録者向けウェルカムメール"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              説明（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="シーケンスの目的や内容の説明"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </Section>

      {/* Steps Section */}
      <Section
        title="ステップ設定"
        icon={ListOrdered}
        isOpen={openSections.steps}
        onToggle={() => toggleSection('steps')}
        badge={steps.length > 0 ? `${steps.length}通` : undefined}
        theme="steps"
      >
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id || `new-${index}`}
              className={`border rounded-xl overflow-hidden transition-all ${
                selectedStepIndex === index ? 'border-teal-300 shadow-md' : 'border-gray-200 shadow-sm'
              }`}
            >
              {/* Step header */}
              <button
                onClick={() => setSelectedStepIndex(selectedStepIndex === index ? null : index)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedStepIndex === index ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-700'
                }`}>
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {step.subject || '(件名未設定)'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {getDelayLabel(step.delay_days)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeStep(index); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {selectedStepIndex === index ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Step editor (expanded) */}
              {selectedStepIndex === index && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">件名</label>
                    <input
                      type="text"
                      value={step.subject}
                      onChange={(e) => updateStepLocal(index, { subject: e.target.value })}
                      placeholder="例: ご登録ありがとうございます"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">配信タイミング</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">登録から</span>
                      <input
                        type="number"
                        min={0}
                        value={step.delay_days}
                        onChange={(e) => updateStepLocal(index, { delay_days: parseInt(e.target.value) || 0 })}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                      <span className="text-sm text-gray-600">日後に送信</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-semibold text-gray-700">本文</label>
                      <ViewToggle mode={bodyViewMode} onChange={setBodyViewMode} />
                    </div>
                    {bodyViewMode === 'html' ? (
                      <textarea
                        value={step.html_content}
                        onChange={(e) => updateStepLocal(index, { html_content: e.target.value })}
                        rows={10}
                        placeholder="<p>メール本文をHTMLで記述...</p>"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-mono text-sm"
                      />
                    ) : (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: step.html_content }}
                        onBlur={(e) => updateStepLocal(index, { html_content: e.currentTarget.innerHTML })}
                        className="w-full min-h-[200px] px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all prose prose-sm max-w-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add step button */}
          <button
            onClick={addStep}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            ステップを追加
          </button>
        </div>
      </Section>

      {/* Status / Activation Section (edit mode only) */}
      {isEditing && (
        <Section
          title="配信ステータス"
          icon={Zap}
          isOpen={openSections.status}
          onToggle={() => toggleSection('status')}
          badge={status === 'active' ? '配信中' : status === 'paused' ? '一時停止' : '下書き'}
          theme="status"
        >
          <div className="space-y-4">
            {/* Status display */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className={`w-3 h-3 rounded-full ${
                status === 'active' ? 'bg-green-500' : status === 'paused' ? 'bg-amber-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-bold text-gray-900">
                {status === 'active' ? '配信中' : status === 'paused' ? '一時停止' : '下書き'}
              </span>
            </div>

            {/* Action buttons */}
            {status === 'draft' && (
              <div>
                <button
                  onClick={handleActivate}
                  disabled={activating || steps.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
                >
                  {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  シーケンスを有効化して配信開始
                </button>
                {steps.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">ステップを1つ以上追加してから有効化してください。</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  有効化すると、リストの購読者に対してステップメールの自動配信が開始されます。毎日朝9時（日本時間）に配信チェックが行われます。
                </p>
              </div>
            )}

            {status === 'active' && (
              <button
                onClick={() => handleStatusChange('paused')}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
              >
                <Pause className="w-4 h-4" />
                一時停止
              </button>
            )}

            {status === 'paused' && (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
              >
                <Play className="w-4 h-4" />
                配信再開
              </button>
            )}

            {/* Progress stats */}
            {progressStats.total > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-gray-900">{progressStats.total}</p>
                  <p className="text-xs text-gray-500">総登録</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-blue-600">{progressStats.active}</p>
                  <p className="text-xs text-gray-500">配信中</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-green-600">{progressStats.completed}</p>
                  <p className="text-xs text-gray-500">完了</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-gray-500">{progressStats.paused}</p>
                  <p className="text-xs text-gray-500">停止</p>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Draft warning */}
      {isEditing && status === 'draft' && steps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">シーケンスはまだ下書き状態です</p>
            <p className="text-sm text-amber-700 mt-1">
              「配信ステータス」セクションの「有効化」ボタンで自動配信を開始できます。
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Editor header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push('/step-email/dashboard')}
              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {isEditing ? (name || 'シーケンス編集') : '新しいシーケンス'}
              </h1>
              <p className="text-xs text-gray-500">
                {isEditing ? `${steps.length}ステップ` : 'ステップメール作成'}
                {isEditing && status === 'active' && (
                  <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    <Play className="w-2.5 h-2.5" />配信中
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? '更新して保存' : '保存して公開'}
          </button>
        </div>
      </div>

      {/* Mobile tab toggle */}
      <div className="sticky top-[121px] z-30 lg:hidden bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-full">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mobileTab === 'editor' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Pencil className="w-4 h-4" />編集
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              mobileTab === 'preview' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-4 h-4" />プレビュー
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex">
        {/* Editor (left) */}
        <div className={`w-full lg:w-1/2 p-4 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}>
          {renderEditor()}
        </div>

        {/* Preview (right) - fixed on desktop */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] overflow-y-auto bg-gray-50 border-l border-gray-200 ${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          {renderPreview()}
        </div>
      </div>

      {/* Floating save button (mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4 z-20">
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-lg transition-all min-h-[44px]"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isEditing ? '更新して保存' : '保存して公開'}
        </button>
      </div>
    </div>
  );
}
