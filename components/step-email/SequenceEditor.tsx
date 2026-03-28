'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, ArrowLeft, Loader2, Monitor, Pencil,
  ChevronDown, ChevronUp, Settings, Clock,
  Plus, Trash2, Mail, Users, X,
  Play, Pause, AlertTriangle, CheckCircle2,
  Eye, Code, BarChart3, ListOrdered, Zap,
  LayoutTemplate, Sparkles, FileText, ExternalLink,
  MousePointerClick, MailOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePointsWithLimitModal } from '@/lib/hooks/usePointsWithLimitModal';
import CreationLimitModal from '@/components/shared/CreationLimitModal';
import { STEP_EMAIL_TEMPLATES, TEMPLATE_CATEGORIES, type StepEmailTemplate } from '@/constants/templates/step-email';

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

interface TrackingStats {
  [stepId: string]: {
    opens: number;
    uniqueOpens: number;
    clicks: number;
    uniqueClicks: number;
  };
}

// --- Section Component (Newsletter-style) ---

const Section = ({
  title, icon: Icon, isOpen, onToggle, children, badge,
  step, stepLabel,
  headerBgColor = 'bg-gray-50',
  headerHoverColor = 'hover:bg-gray-100',
  accentColor = 'bg-violet-100 text-violet-600',
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  step?: number;
  stepLabel?: string;
  headerBgColor?: string;
  headerHoverColor?: string;
  accentColor?: string;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white">
    {step && stepLabel && (
      <div className={`px-5 py-2 ${headerBgColor} border-b border-gray-200/50`}>
        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          STEP {step}
        </span>
        <span className="text-sm text-gray-700 ml-2">{stepLabel}</span>
      </div>
    )}
    <button
      onClick={onToggle}
      className={`w-full px-5 py-4 flex items-center justify-between ${headerBgColor} ${headerHoverColor} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOpen ? accentColor : 'bg-gray-200 text-gray-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-900">{title}</span>
        {badge && (
          <span className="text-xs bg-white/80 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">{badge}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && (
      <div className="p-5 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

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

// --- Main Component ---

export default function SequenceEditor({ sequenceId, defaultListId }: SequenceEditorProps) {
  const router = useRouter();
  const isEditing = !!sequenceId;

  // Auth
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { consumeAndExecute, limitModalProps } = usePointsWithLimitModal({ userId: user?.id, isPro: false });

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

  // Progress & tracking stats
  const [progressStats, setProgressStats] = useState<ProgressStats>({ active: 0, completed: 0, paused: 0, total: 0 });
  const [trackingStats, setTrackingStats] = useState<TrackingStats>({});

  // AI Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPurpose, setAiPurpose] = useState('welcome');
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiSubjectSuggestions, setAiSubjectSuggestions] = useState<string[]>([]);
  const [aiTargetStepIndex, setAiTargetStepIndex] = useState<number | null>(null);

  // Preview step
  const [previewStepIndex, setPreviewStepIndex] = useState<number | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sections
  const [openSections, setOpenSections] = useState({
    basic: true,
    template: !sequenceId,
    steps: true,
    status: !!sequenceId,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Refs for contentEditable
  const bodyRef = useRef<HTMLDivElement>(null);

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

  // Sync visual editor
  useEffect(() => {
    if (bodyRef.current && bodyViewMode === 'visual' && selectedStepIndex !== null) {
      const step = steps[selectedStepIndex];
      if (step) {
        bodyRef.current.innerHTML = step.html_content || '';
      }
    }
  }, [bodyViewMode, selectedStepIndex]);

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
      setTrackingStats(data.trackingStats || {});
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

  // --- Template ---

  const applyTemplate = (template: StepEmailTemplate) => {
    if (steps.length > 0 && !confirm('現在のステップをテンプレートで上書きしますか？')) return;
    const newSteps: Step[] = template.steps.map((s, i) => ({
      step_order: i + 1,
      delay_days: s.delay_days,
      subject: s.subject,
      html_content: s.html_content,
      text_content: null,
      isNew: true,
    }));
    setSteps(newSteps);
    setSelectedStepIndex(0);
    setOpenSections((prev) => ({ ...prev, template: false, steps: true }));
  };

  // --- AI Generation ---

  const openAiModal = (stepIndex: number) => {
    setAiTargetStepIndex(stepIndex);
    setAiResult('');
    setAiSubjectSuggestions([]);
    setShowAiModal(true);
  };

  const handleAiGenerate = async () => {
    if (!user || !aiKeyword.trim()) return;
    setAiGenerating(true);
    setAiResult('');
    setAiSubjectSuggestions([]);
    try {
      const targetStep = aiTargetStepIndex !== null ? steps[aiTargetStepIndex] : null;
      const res = await fetch('/api/step-email-maker/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          purpose: aiPurpose,
          keyword: aiKeyword,
          stepNumber: aiTargetStepIndex !== null ? aiTargetStepIndex + 1 : undefined,
          totalSteps: steps.length,
          sequenceName: name,
          currentContent: targetStep?.html_content || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data.result || '');
        setAiSubjectSuggestions(data.subjectSuggestions || []);
      } else {
        const err = await res.json();
        alert(err.error || 'AI生成に失敗しました');
      }
    } catch {
      alert('通信エラーが発生しました');
    }
    setAiGenerating(false);
  };

  const applyAiResult = () => {
    if (aiTargetStepIndex === null || !aiResult) return;
    updateStepLocal(aiTargetStepIndex, { html_content: aiResult });
    setShowAiModal(false);
    setAiResult('');
  };

  // --- Save ---

  const handleSave = async () => {
    if (!user || !name.trim() || !listId) return;

    await consumeAndExecute('step-email', 'save', async () => {
      setSaving(true);

      try {
        if (isEditing) {
          await fetch(`/api/step-email-maker/sequences/${sequenceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, name: name.trim(), description: description.trim() || null }),
          });

          for (const step of steps) {
            if (step.id) {
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

          await fetchSequence(user.id);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        } else {
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
    }, sequenceId);
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

  const getStepTrackingRate = (stepId: string | undefined, type: 'open' | 'click') => {
    if (!stepId || !trackingStats[stepId] || progressStats.total === 0) return null;
    const stat = trackingStats[stepId];
    const count = type === 'open' ? stat.uniqueOpens : stat.uniqueClicks;
    const rate = Math.round((count / progressStats.total) * 100);
    return { count, rate };
  };

  // --- Loading ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
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
  const previewStep = previewStepIndex !== null ? steps[previewStepIndex] : (selectedStepIndex !== null ? steps[selectedStepIndex] : null);

  // Preview panel
  const renderPreview = () => (
    <div className="flex flex-col h-full">
      {/* ブラウザ風ヘッダー */}
      <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-400 text-xs font-medium font-mono">ステップメール プレビュー</span>
      </div>

      {/* ステップタイムライン（横スクロール） */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const isActive = (previewStepIndex ?? selectedStepIndex) === index;
            const openRate = getStepTrackingRate(step.id, 'open');
            return (
              <button
                key={step.id || `new-${index}`}
                onClick={() => setPreviewStepIndex(index)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="block">{index + 1}通目</span>
                <span className="block text-[10px] opacity-75 mt-0.5">{getDelayLabel(step.delay_days)}</span>
                {openRate && (
                  <span className="block text-[10px] opacity-75 mt-0.5">
                    開封 {openRate.rate}%
                  </span>
                )}
              </button>
            );
          })}
          {steps.length === 0 && (
            <span className="text-xs text-gray-500">ステップを追加するとプレビューが表示されます</span>
          )}
        </div>
      </div>

      {/* プレビューコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-800">
        {previewStep ? (
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* メールヘッダ風 */}
            <div className="px-6 pt-5 pb-3 border-b border-gray-100">
              {previewStep.subject ? (
                <h2 className="text-lg font-bold text-gray-900 mb-1">{previewStep.subject}</h2>
              ) : (
                <h2 className="text-lg font-bold text-gray-300 mb-1">件名を入力してください</h2>
              )}
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getDelayLabel(previewStep.delay_days)}に送信
              </p>
            </div>
            {/* メール本文 */}
            <div className="p-0">
              {previewStep.html_content ? (
                <div dangerouslySetInnerHTML={{ __html: previewStep.html_content }} />
              ) : (
                <p className="text-gray-300 text-center py-16">本文を入力するとプレビューが表示されます</p>
              )}
            </div>
            {/* トラッキング統計 */}
            {previewStep.id && trackingStats[previewStep.id] && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MailOpen className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {getStepTrackingRate(previewStep.id, 'open')?.rate ?? 0}%
                      </p>
                      <p className="text-xs text-gray-500">開封率（{trackingStats[previewStep.id].uniqueOpens}人）</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {getStepTrackingRate(previewStep.id, 'click')?.rate ?? 0}%
                      </p>
                      <p className="text-xs text-gray-500">クリック率（{trackingStats[previewStep.id].uniqueClicks}人）</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">ステップを追加・選択するとプレビューが表示されます</p>
          </div>
        )}

        {/* 全体進行率 */}
        {isEditing && progressStats.total > 0 && (
          <div className="max-w-lg mx-auto mt-4 bg-gray-900 rounded-xl p-4 border border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              配信統計
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{progressStats.total}</p>
                <p className="text-[10px] text-gray-500">総登録</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400">{progressStats.active}</p>
                <p className="text-[10px] text-gray-500">配信中</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">{progressStats.completed}</p>
                <p className="text-[10px] text-gray-500">完了</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-400">{progressStats.paused}</p>
                <p className="text-[10px] text-gray-500">停止</p>
              </div>
            </div>
            {/* 完了率バー */}
            {progressStats.total > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>完了率</span>
                  <span>{Math.round((progressStats.completed / progressStats.total) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${(progressStats.completed / progressStats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Editor panel
  const renderEditor = () => (
    <div className="max-w-2xl mx-auto space-y-0 pb-32">
      {/* STEP 1: 基本設定 */}
      <Section
        title="基本設定"
        icon={Settings}
        isOpen={openSections.basic}
        onToggle={() => toggleSection('basic')}
        step={1}
        stepLabel="配信先・シーケンス名を設定"
        headerBgColor="bg-blue-50"
        headerHoverColor="hover:bg-blue-100"
        accentColor="bg-blue-100 text-blue-600"
        badge={name ? undefined : '未設定'}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      新しいリストを作成
                    </button>
                    <p className="text-xs text-gray-500">メルマガメーカーの読者リストと共有されます</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-blue-700 flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />新しいリストを作成
                      </p>
                      <button
                        onClick={() => { setShowNewList(false); setNewListName(''); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="リスト名"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={handleCreateList}
                      disabled={creatingList || !newListName.trim()}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all min-h-[44px] shadow-sm flex items-center justify-center gap-2"
                    >
                      {creatingList ? <><Loader2 className="w-4 h-4 animate-spin" />作成中...</> : <><Plus className="w-4 h-4" />リストを作成</>}
                    </button>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </Section>

      {/* STEP 2: テンプレート */}
      <Section
        title="テンプレート"
        icon={LayoutTemplate}
        isOpen={openSections.template}
        onToggle={() => toggleSection('template')}
        badge={`${STEP_EMAIL_TEMPLATES.length}種類`}
        step={2}
        stepLabel="テンプレートを選択"
        headerBgColor="bg-amber-50"
        headerHoverColor="hover:bg-amber-100"
        accentColor="bg-amber-100 text-amber-600"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">テンプレートを選択すると、ステップ全体が自動設定されます。</p>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
                {cat.icon} {cat.label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STEP_EMAIL_TEMPLATES.filter((t) => t.category === cat.id).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="p-3 text-left border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all group"
                  >
                    <span className="text-xl mb-1 block">{template.icon}</span>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700">{template.name}</span>
                    <span className="text-xs text-gray-500 block mt-0.5">{template.description}</span>
                    <span className="text-xs text-amber-600 mt-1 block">{template.steps.length}通</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* STEP 3: ステップ設定 */}
      <Section
        title="ステップ設定"
        icon={ListOrdered}
        isOpen={openSections.steps}
        onToggle={() => toggleSection('steps')}
        badge={steps.length > 0 ? `${steps.length}通` : undefined}
        step={3}
        stepLabel="各ステップの内容を編集"
        headerBgColor="bg-violet-50"
        headerHoverColor="hover:bg-violet-100"
        accentColor="bg-violet-100 text-violet-600"
      >
        <div className="space-y-3">
          {steps.map((step, index) => {
            const openRate = getStepTrackingRate(step.id, 'open');
            const clickRate = getStepTrackingRate(step.id, 'click');
            return (
              <div
                key={step.id || `new-${index}`}
                className={`border rounded-xl overflow-hidden transition-all ${
                  selectedStepIndex === index ? 'border-violet-300 shadow-md' : 'border-gray-200 shadow-sm'
                }`}
              >
                {/* Step header */}
                <button
                  onClick={() => setSelectedStepIndex(selectedStepIndex === index ? null : index)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedStepIndex === index ? 'bg-violet-500 text-white' : 'bg-violet-100 text-violet-700'
                  }`}>
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {step.subject || '(件名未設定)'}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getDelayLabel(step.delay_days)}
                      </p>
                      {openRate && (
                        <p className="text-xs text-blue-500 flex items-center gap-1">
                          <MailOpen className="w-3 h-3" />
                          {openRate.rate}%
                        </p>
                      )}
                      {clickRate && (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {clickRate.rate}%
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Preview link */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewStepIndex(index);
                      setMobileTab('preview');
                    }}
                    className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="プレビュー"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        />
                        <span className="text-sm text-gray-600">日後に送信</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <label className="text-sm font-semibold text-gray-700">本文</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAiModal(index)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />AIで下書き生成
                          </button>
                          <ViewToggle mode={bodyViewMode} onChange={setBodyViewMode} />
                        </div>
                      </div>
                      {bodyViewMode === 'html' ? (
                        <textarea
                          value={step.html_content}
                          onChange={(e) => updateStepLocal(index, { html_content: e.target.value })}
                          rows={12}
                          placeholder="<p>メール本文をHTMLで記述...</p>"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-mono text-sm"
                        />
                      ) : (
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white min-h-[200px]">
                          {step.html_content ? (
                            <div
                              ref={bodyRef}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateStepLocal(index, { html_content: e.currentTarget.innerHTML })}
                              className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset rounded-xl text-gray-900"
                              dangerouslySetInnerHTML={{ __html: step.html_content }}
                            />
                          ) : (
                            <p className="p-4 text-sm text-gray-400">本文が未入力です。HTMLモードで直接入力するか、AIで生成してください。</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ステップ別トラッキング */}
                    {step.id && trackingStats[step.id] && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <BarChart3 className="w-3 h-3" />
                          このステップの統計
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <MailOpen className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{getStepTrackingRate(step.id, 'open')?.rate ?? 0}%</p>
                              <p className="text-xs text-gray-500">開封率</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{getStepTrackingRate(step.id, 'click')?.rate ?? 0}%</p>
                              <p className="text-xs text-gray-500">クリック率</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add step button */}
          <button
            onClick={addStep}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            ステップを追加
          </button>
        </div>
      </Section>

      {/* STEP 4: 配信ステータス (edit mode only) */}
      {isEditing && (
        <Section
          title="配信ステータス"
          icon={Zap}
          isOpen={openSections.status}
          onToggle={() => toggleSection('status')}
          badge={status === 'active' ? '配信中' : status === 'paused' ? '一時停止' : '下書き'}
          step={4}
          stepLabel="シーケンスの有効化・停止"
          headerBgColor="bg-emerald-50"
          headerHoverColor="hover:bg-emerald-100"
          accentColor="bg-emerald-100 text-emerald-600"
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
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
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
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* エディタヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/step-email/dashboard')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
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
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-sm text-violet-600 font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />保存しました
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md min-h-[44px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? '保存中...' : isEditing ? '更新して保存' : '保存して公開'}
          </button>
        </div>
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
          {renderEditor()}
        </div>

        {/* 右パネル: プレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[138px] lg:h-[calc(100vh-138px)] lg:z-10 flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          {renderPreview()}
        </div>

        {/* 右パネル用スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>

      {/* Floating save button (mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4 z-20">
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-lg transition-all min-h-[44px]"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isEditing ? '更新して保存' : '保存して公開'}
        </button>
      </div>

      {/* AI生成モーダル */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                AIで本文を生成
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">メールの目的</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'welcome', label: 'ウェルカム', icon: '👋' },
                    { id: 'value', label: '価値提供', icon: '💡' },
                    { id: 'story', label: 'ストーリー', icon: '📖' },
                    { id: 'engagement', label: 'エンゲージメント', icon: '💬' },
                    { id: 'offer', label: 'オファー', icon: '🎁' },
                    { id: 'reminder', label: 'リマインダー', icon: '⏰' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAiPurpose(p.id)}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-all ${
                        aiPurpose === p.id
                          ? 'border-violet-400 bg-violet-50 text-violet-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300'
                      }`}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  キーワード・テーマ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={aiKeyword}
                  onChange={(e) => setAiKeyword(e.target.value)}
                  rows={3}
                  placeholder="例: ダイエットの基礎知識、SNS集客のコツ、自己紹介"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiKeyword.trim()}
                className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px] flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />生成中...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />生成する</>
                )}
              </button>

              {/* AI結果 */}
              {aiResult && (
                <div className="space-y-3">
                  {aiSubjectSuggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">件名候補</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiSubjectSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (aiTargetStepIndex !== null) {
                                updateStepLocal(aiTargetStepIndex, { subject: s });
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">生成結果プレビュー</p>
                    <div className="border border-gray-200 rounded-xl p-4 max-h-60 overflow-y-auto bg-white">
                      <div dangerouslySetInnerHTML={{ __html: aiResult }} />
                    </div>
                  </div>
                  <button
                    onClick={applyAiResult}
                    className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    この内容を適用
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreationLimitModal {...limitModalProps} />
    </div>
  );
}
