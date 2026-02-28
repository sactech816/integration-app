'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown, Globe, Loader2,
  GitBranch, BarChart3,
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

interface FunnelAnalyticsData {
  name: string;
  views: number;
  clicks: number;
}

export default function FunnelEditor({ funnelId }: { funnelId?: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setName(f.name);
      setDescription(f.description || '');
      setStatus(f.status);
      setSlug(f.slug);
      if (f.funnel_steps?.length > 0) {
        setSteps(f.funnel_steps.map((s: any) => ({
          name: s.name,
          stepType: s.step_type,
          contentRef: s.content_ref,
          ctaLabel: s.cta_label || '次へ進む',
        })));
      }
    }
  };

  const fetchAnalytics = async (uid: string) => {
    const res = await fetch(`/api/funnel/${funnelId}/analytics?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setAnalytics(data.analytics || []);
    }
  };

  const addStep = () => {
    setSteps([...steps, { name: '', stepType: 'custom_url', contentRef: null, ctaLabel: '次へ進む' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updates: Partial<Step>) => {
    setSteps(steps.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newSteps.length) return;
    [newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]];
    setSteps(newSteps);
  };

  const handleSave = async (newStatus?: string) => {
    if (!userId || !name) return;
    setSaving(true);

    const body = { userId, name, description, status: newStatus || status, steps };

    if (funnelId) {
      const res = await fetch(`/api/funnel/${funnelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok && newStatus) setStatus(newStatus);
    } else {
      const res = await fetch('/api/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        // ステップも保存するために即PATCHする
        if (steps.length > 0) {
          await fetch(`/api/funnel/${data.funnel.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, steps }),
          });
        }
        router.push(`/funnel/editor/${data.funnel.id}`);
      }
    }
    setSaving(false);
  };

  const getStepTypeConfig = (type: string) => STEP_TYPES.find((t) => t.value === type);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/funnel/${slug}` : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/funnel/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {funnelId ? 'ファネル編集' : '新しいファネル'}
        </h1>
      </div>

      {/* 公開URL */}
      {slug && status === 'active' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-700 mb-1">公開URL</p>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
            <Globe className="w-4 h-4" />{publicUrl}
          </a>
        </div>
      )}

      <div className="space-y-6">
        {/* 基本設定 */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <h2 className="font-bold text-gray-900 mb-4">基本設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ファネル名 <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 無料相談ファネル" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">説明（任意）</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ファネルの説明" rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
            </div>
          </div>
        </div>

        {/* ステップ設定 */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-amber-600" />ステップ
            </h2>
            <button onClick={addStep} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-amber-50 text-amber-700 font-semibold rounded-lg hover:bg-amber-100 transition-colors min-h-[44px]">
              <Plus className="w-4 h-4" />ステップ追加
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
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <input type="text" value={step.name} onChange={(e) => updateStep(i, { name: e.target.value })} placeholder="ステップ名" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveStep(i, 'up')} disabled={i === 0} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={() => moveStep(i, 'down')} disabled={i === steps.length - 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                        <button onClick={() => removeStep(i)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">タイプ</label>
                        <select value={step.stepType} onChange={(e) => updateStep(i, { stepType: e.target.value, contentRef: null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm">
                          {STEP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      {typeConfig?.refType !== 'none' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            {typeConfig?.refType === 'url' ? 'URL' : 'スラッグ / ID'}
                          </label>
                          <input
                            type="text"
                            value={
                              typeConfig?.refType === 'url'
                                ? step.contentRef?.url || ''
                                : step.contentRef?.slug || ''
                            }
                            onChange={(e) => {
                              const ref = typeConfig?.refType === 'url'
                                ? { type: step.stepType, url: e.target.value }
                                : { type: step.stepType, slug: e.target.value };
                              updateStep(i, { contentRef: ref });
                            }}
                            placeholder={typeConfig?.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">CTAボタン文言</label>
                        <input type="text" value={step.ctaLabel} onChange={(e) => updateStep(i, { ctaLabel: e.target.value })} placeholder="次へ進む" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* アナリティクス概要（既存ファネルのみ） */}
        {funnelId && analytics.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />CVR分析
            </h2>
            <div className="space-y-2">
              {analytics.map((a, i) => {
                const maxViews = Math.max(...analytics.map((x) => x.views), 1);
                const widthPercent = (a.views / maxViews) * 100;
                const cvr = i > 0 && analytics[i - 1].views > 0
                  ? ((a.views / analytics[i - 1].views) * 100).toFixed(1)
                  : '100.0';
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700">{a.name || `Step ${i + 1}`}</span>
                      <span className="text-gray-500">
                        {a.views} PV {i > 0 && <span className="text-amber-600 font-semibold">({cvr}%)</span>}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-6">
                      <div
                        className="bg-amber-500 rounded-full h-6 transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* アクション */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleSave()}
            disabled={saving || !name}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 disabled:opacity-50 shadow-md transition-all min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '下書き保存'}
          </button>
          {funnelId && (
            <button
              onClick={() => handleSave(status === 'active' ? 'draft' : 'active')}
              disabled={saving || !name || steps.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50 shadow-md transition-all min-h-[44px]"
            >
              <Globe className="w-4 h-4" />
              {status === 'active' ? '非公開にする' : '公開する'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
