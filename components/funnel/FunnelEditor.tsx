'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown, Globe, Loader2,
  GitBranch, BarChart3, Monitor, Pencil, ChevronDown,
  User, HelpCircle, FileText, Mail, Calendar, ExternalLink, Heart,
} from 'lucide-react';

interface Step {
  name: string;
  stepType: string;
  contentRef: { type: string; slug?: string; url?: string } | null;
  ctaLabel: string;
}

const STEP_TYPES = [
  { value: 'profile_lp', label: 'プロフィールLP', refType: 'slug', placeholder: 'プロフィールのスラッグ' },
  { value: 'quiz', label: '診断クイズ', refType: 'slug', placeholder: 'クイズのスラッグ' },
  { value: 'order_form', label: '申し込みフォーム', refType: 'slug', placeholder: 'フォームのスラッグ' },
  { value: 'newsletter', label: 'メルマガ登録', refType: 'id', placeholder: 'リストID' },
  { value: 'booking', label: '予約ページ', refType: 'slug', placeholder: '予約のスラッグ' },
  { value: 'custom_url', label: '外部URL', refType: 'url', placeholder: 'https://...' },
  { value: 'thank_you', label: 'サンキューページ', refType: 'none', placeholder: '' },
];

const STEP_ICONS: Record<string, React.ReactNode> = {
  profile_lp: <User className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
  order_form: <FileText className="w-4 h-4" />,
  newsletter: <Mail className="w-4 h-4" />,
  booking: <Calendar className="w-4 h-4" />,
  custom_url: <ExternalLink className="w-4 h-4" />,
  thank_you: <Heart className="w-4 h-4" />,
};

interface FunnelAnalyticsData {
  name: string;
  views: number;
  clicks: number;
}

/* ── ファネルフロープレビュー ── */
function FunnelFlowPreview({ steps, analytics }: { steps: Step[]; analytics: FunnelAnalyticsData[] }) {
  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <GitBranch className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">ステップを追加すると</p>
        <p className="text-sm">ファネルフローが表示されます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0 py-4 px-4">
      {steps.map((step, i) => {
        const icon = STEP_ICONS[step.stepType] || <ExternalLink className="w-4 h-4" />;
        const typeLabel = STEP_TYPES.find((t) => t.value === step.stepType)?.label || step.stepType;
        const analyticsData = analytics[i];
        const prevViews = i > 0 ? analytics[i - 1]?.views : 0;
        const cvr = i > 0 && prevViews > 0 && analyticsData
          ? ((analyticsData.views / prevViews) * 100).toFixed(1)
          : null;

        return (
          <div key={i} className="w-full max-w-xs">
            {/* ステップカード */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{step.name || `ステップ ${i + 1}`}</p>
                  <p className="text-xs text-gray-500">{typeLabel}</p>
                </div>
              </div>
              {step.ctaLabel && step.stepType !== 'thank_you' && (
                <div className="mt-3">
                  <div className="w-full px-3 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg text-center">
                    {step.ctaLabel}
                  </div>
                </div>
              )}
              {analyticsData && analyticsData.views > 0 && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {analyticsData.views} PV
                </div>
              )}
            </div>
            {/* 矢印 */}
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className="w-0.5 h-4 bg-gray-300" />
                <ChevronDown className="w-4 h-4 text-gray-400 -mt-1" />
                {cvr && (
                  <span className="text-xs font-semibold text-amber-600 -mt-0.5">{cvr}%</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── メインエディタ ── */
export default function FunnelEditor({ funnelId }: { funnelId?: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [slug, setSlug] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [analytics, setAnalytics] = useState<FunnelAnalyticsData[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        if (funnelId) {
          await fetchFunnel(user.id);
          await fetchAnalytics(user.id);
        }
      }
      setLoading(false);
    };
    init();
  }, [funnelId]);

  const fetchFunnel = async (uid: string) => {
    const res = await fetch(`/api/funnel/${funnelId}?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      const f = data.funnel;
      setName(f.name); setDescription(f.description || '');
      setStatus(f.status); setSlug(f.slug);
      if (f.funnel_steps?.length > 0) {
        setSteps(f.funnel_steps.map((s: any) => ({
          name: s.name, stepType: s.step_type, contentRef: s.content_ref,
          ctaLabel: s.cta_label || '次へ進む',
        })));
      }
    }
  };

  const fetchAnalytics = async (uid: string) => {
    const res = await fetch(`/api/funnel/${funnelId}/analytics?userId=${uid}`);
    if (res.ok) { const data = await res.json(); setAnalytics(data.analytics || []); }
  };

  const addStep = () => setSteps([...steps, { name: '', stepType: 'custom_url', contentRef: null, ctaLabel: '次へ進む' }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, updates: Partial<Step>) => setSteps(steps.map((s, i) => i === index ? { ...s, ...updates } : s));
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const ns = [...steps]; const t = direction === 'up' ? index - 1 : index + 1;
    if (t < 0 || t >= ns.length) return;
    [ns[index], ns[t]] = [ns[t], ns[index]]; setSteps(ns);
  };

  const handleSave = async (newStatus?: string) => {
    if (!userId || !name) return;
    setSaving(true);
    const body = { userId, name, description, status: newStatus || status, steps };
    if (funnelId) {
      const res = await fetch(`/api/funnel/${funnelId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok && newStatus) setStatus(newStatus);
    } else {
      const res = await fetch('/api/funnel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json();
        if (steps.length > 0) {
          await fetch(`/api/funnel/${data.funnel.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, steps }) });
        }
        router.push(`/funnel/editor/${data.funnel.id}`);
      }
    }
    setSaving(false);
  };

  const getStepTypeConfig = (type: string) => STEP_TYPES.find((t) => t.value === type);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/funnel/${slug}` : '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/funnel/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{funnelId ? 'ファネル編集' : '新しいファネル'}</h1>
          {slug && status === 'active' && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
              <Globe className="w-3 h-3" />公開中
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave()} disabled={saving || !name} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md min-h-[44px]">
            <Save className="w-4 h-4" />{saving ? '保存中...' : '保存'}
          </button>
          {funnelId && (
            <button onClick={() => handleSave(status === 'active' ? 'draft' : 'active')} disabled={saving || !name || steps.length === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all shadow-md min-h-[44px]">
              <Globe className="w-4 h-4" />{status === 'active' ? '非公開' : '公開'}
            </button>
          )}
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[57px] z-30">
        <button onClick={() => setMobileTab('editor')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${mobileTab === 'editor' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' : 'text-gray-500 hover:text-gray-700'}`}>
          <Pencil className="w-4 h-4" />編集
        </button>
        <button onClick={() => setMobileTab('preview')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${mobileTab === 'preview' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50' : 'text-gray-500 hover:text-gray-700'}`}>
          <Monitor className="w-4 h-4" />プレビュー
        </button>
      </div>

      {/* 左右パネル */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左パネル: 編集 */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="space-y-5">
            {/* 基本設定 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-4">基本設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ファネル名 <span className="text-red-500">*</span></label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 無料相談ファネル" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">説明（任意）</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ファネルの説明" rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
                </div>
              </div>
            </div>

            {/* ステップ設定 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-amber-50 p-1.5 rounded-lg"><GitBranch className="w-4 h-4 text-amber-600" /></span>ステップ
                </h2>
                <button onClick={addStep} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-amber-50 text-amber-700 font-semibold rounded-lg hover:bg-amber-100 transition-colors min-h-[44px]">
                  <Plus className="w-4 h-4" />追加
                </button>
              </div>

              {steps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-3">ステップを追加してファネルを構築しましょう</p>
                  <button onClick={addStep} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]">
                    <Plus className="w-4 h-4" />最初のステップを追加
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, i) => {
                    const typeConfig = getStepTypeConfig(step.stepType);
                    return (
                      <div key={i} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                          <input type="text" value={step.name} onChange={(e) => updateStep(i, { name: e.target.value })} placeholder="ステップ名" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                          <div className="flex items-center gap-1">
                            <button onClick={() => moveStep(i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => moveStep(i, 'down')} disabled={i === steps.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                            <button onClick={() => removeStep(i)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">タイプ</label>
                            <select value={step.stepType} onChange={(e) => updateStep(i, { stepType: e.target.value, contentRef: null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                              {STEP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          {typeConfig?.refType !== 'none' && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">{typeConfig?.refType === 'url' ? 'URL' : 'スラッグ / ID'}</label>
                              <input
                                type="text"
                                value={typeConfig?.refType === 'url' ? step.contentRef?.url || '' : step.contentRef?.slug || ''}
                                onChange={(e) => {
                                  const ref = typeConfig?.refType === 'url' ? { type: step.stepType, url: e.target.value } : { type: step.stepType, slug: e.target.value };
                                  updateStep(i, { contentRef: ref });
                                }}
                                placeholder={typeConfig?.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">CTAボタン</label>
                            <input type="text" value={step.ctaLabel} onChange={(e) => updateStep(i, { ctaLabel: e.target.value })} placeholder="次へ進む" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CVR分析 */}
            {funnelId && analytics.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-amber-50 p-1.5 rounded-lg"><BarChart3 className="w-4 h-4 text-amber-600" /></span>CVR分析
                </h2>
                <div className="space-y-2">
                  {analytics.map((a, i) => {
                    const maxViews = Math.max(...analytics.map((x) => x.views), 1);
                    const widthPercent = (a.views / maxViews) * 100;
                    const cvr = i > 0 && analytics[i - 1].views > 0 ? ((a.views / analytics[i - 1].views) * 100).toFixed(1) : '100.0';
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-semibold text-gray-700">{a.name || `Step ${i + 1}`}</span>
                          <span className="text-gray-500">{a.views} PV {i > 0 && <span className="text-amber-600 font-semibold">({cvr}%)</span>}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-5">
                          <div className="bg-amber-500 rounded-full h-5 transition-all duration-500" style={{ width: `${widthPercent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右パネル: フロープレビュー */}
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[57px] lg:h-[calc(100vh-57px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-medium">ファネルフロー</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FunnelFlowPreview steps={steps} analytics={analytics} />
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>
    </div>
  );
}
