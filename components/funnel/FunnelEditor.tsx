'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown, Globe, Loader2,
  GitBranch, BarChart3, Monitor, Pencil, ChevronDown,
  User, HelpCircle, FileText, Mail, Calendar, ExternalLink, Heart,
  Building2, PenTool, ArrowRight, X, Trophy, Share2, CheckCircle,
  Sparkles, ClipboardList, Megaphone, Users, Image, BookOpen, MessageSquare, Info,
} from 'lucide-react';
import { FUNNEL_TEMPLATES } from '@/constants/templates/funnel';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import { usePointsWithLimitModal } from '@/lib/hooks/usePointsWithLimitModal';
import CreationLimitModal from '@/components/shared/CreationLimitModal';

interface Step {
  name: string;
  stepType: string;
  contentRef: { type: string; slug?: string; url?: string; id?: string; message?: string; nextAction?: string; ctaText?: string; ctaUrl?: string } | null;
  ctaLabel: string;
  slug?: string;
  ctaEnabled: boolean;
  ctaStyle: {
    color?: string;
    size?: string;
    rounded?: string;
    fullWidth?: boolean;
  };
}

interface ContentItem {
  id: string;
  label: string;
  slug?: string;
}

// ステップタイプ定義（カラー情報付き）
const STEP_TYPES = [
  { value: 'profile_lp', label: 'プロフィールLP', refType: 'slug', placeholder: '例: taro-yamada', hint: 'プロフィールLPのURLの末尾部分', ctaNote: '閲覧後にファネルCTAで次のステップへ進みます', color: 'emerald', hasContent: true },
  { value: 'business_lp', label: 'ビジネスLP', refType: 'slug', placeholder: '例: my-service-lp', hint: 'ビジネスLPのURLの末尾部分', ctaNote: '閲覧後にファネルCTAで次へ進みます', color: 'amber', hasContent: true },
  { value: 'salesletter', label: 'セールスレター', refType: 'slug', placeholder: '例: my-salesletter', hint: 'セールスレターのURLの末尾部分', ctaNote: '閲覧後にファネルCTAで次へ進みます', color: 'rose', hasContent: true },
  { value: 'quiz', label: '診断クイズ', refType: 'slug', placeholder: '例: career-quiz', hint: '診断クイズのURLの末尾部分', ctaNote: 'クイズ完了後にファネルCTAで次のステップへ進みます', color: 'indigo', hasContent: true },
  { value: 'entertainment_quiz', label: 'エンタメ診断', refType: 'slug', placeholder: '例: personality-check', hint: 'エンタメ診断のURLの末尾部分', ctaNote: '診断完了後にファネルCTAで次のステップへ進みます', color: 'pink', hasContent: true },
  { value: 'order_form', label: '申し込みフォーム', refType: 'slug', placeholder: '例: consulting-form', hint: '申し込みフォームのURLの末尾部分', ctaNote: 'フォーム送信・決済がこのステップ内で完了します', color: 'teal', hasContent: true },
  { value: 'newsletter', label: 'メルマガ登録', refType: 'id', placeholder: '例: abc123-def456', hint: 'メルマガリストのID', ctaNote: 'メルマガ登録がこのステップ内で完了します', color: 'violet', hasContent: true },
  { value: 'booking', label: '予約ページ', refType: 'id', placeholder: '例: free-consultation', hint: '予約メニューのID', ctaNote: '予約完了がこのステップ内で行われます', color: 'blue', hasContent: true },
  { value: 'survey', label: 'アンケート', refType: 'slug', placeholder: '例: customer-survey', hint: 'アンケートのURLの末尾部分', ctaNote: 'アンケート回答後にファネルCTAで次へ進みます', color: 'cyan', hasContent: true },
  { value: 'webinar', label: 'ウェビナーLP', refType: 'slug', placeholder: '例: seminar-lp', hint: 'ウェビナーLPのURLの末尾部分', ctaNote: '閲覧後にファネルCTAで次へ進みます', color: 'purple', hasContent: true },
  { value: 'attendance', label: '出欠表', refType: 'id', placeholder: '例: event-id', hint: '出欠表のID', ctaNote: '回答後にファネルCTAで次へ進みます', color: 'orange', hasContent: true },
  { value: 'onboarding', label: 'ガイドメーカー', refType: 'slug', placeholder: '例: getting-started', hint: 'ガイドのURLの末尾部分', ctaNote: '閲覧後にファネルCTAで次へ進みます', color: 'lime', hasContent: true },
  { value: 'gamification', label: 'ゲーミフィケーション', refType: 'id', placeholder: '例: campaign-id', hint: 'キャンペーンのID', ctaNote: '参加後にファネルCTAで次へ進みます', color: 'fuchsia', hasContent: true },
  { value: 'sns_post', label: 'SNS投稿', refType: 'slug', placeholder: '例: my-post', hint: 'SNS投稿のURLの末尾部分', ctaNote: '閲覧後にファネルCTAで次へ進みます', color: 'sky', hasContent: true },
  { value: 'custom_url', label: '外部URL', refType: 'url', placeholder: 'https://example.com', hint: '外部サイトのURLをそのまま入力', ctaNote: '外部ページを表示します', color: 'gray', hasContent: false },
  { value: 'thank_you', label: 'サンキューページ', refType: 'none', placeholder: '', hint: '', ctaNote: 'ファネルの最終ステップです', color: 'green', hasContent: false },
];

// タイプ別アイコン
const STEP_ICONS: Record<string, React.ReactNode> = {
  profile_lp: <User className="w-4 h-4" />,
  business_lp: <Building2 className="w-4 h-4" />,
  salesletter: <PenTool className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
  entertainment_quiz: <Sparkles className="w-4 h-4" />,
  order_form: <FileText className="w-4 h-4" />,
  newsletter: <Mail className="w-4 h-4" />,
  booking: <Calendar className="w-4 h-4" />,
  survey: <ClipboardList className="w-4 h-4" />,
  webinar: <Megaphone className="w-4 h-4" />,
  attendance: <Users className="w-4 h-4" />,
  onboarding: <BookOpen className="w-4 h-4" />,
  gamification: <Trophy className="w-4 h-4" />,
  sns_post: <MessageSquare className="w-4 h-4" />,
  custom_url: <ExternalLink className="w-4 h-4" />,
  thank_you: <Heart className="w-4 h-4" />,
};

// タイプ別カラー設定
const STEP_COLORS: Record<string, { bg: string; text: string; border: string; light: string; badge: string; cta: string }> = {
  emerald:  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', light: 'bg-emerald-50', badge: 'bg-emerald-500', cta: 'bg-emerald-600' },
  amber:    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', light: 'bg-amber-50', badge: 'bg-amber-500', cta: 'bg-amber-600' },
  rose:     { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', light: 'bg-rose-50', badge: 'bg-rose-500', cta: 'bg-rose-600' },
  indigo:   { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', light: 'bg-indigo-50', badge: 'bg-indigo-500', cta: 'bg-indigo-600' },
  pink:     { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', light: 'bg-pink-50', badge: 'bg-pink-500', cta: 'bg-pink-600' },
  teal:     { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', light: 'bg-teal-50', badge: 'bg-teal-500', cta: 'bg-teal-600' },
  violet:   { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300', light: 'bg-violet-50', badge: 'bg-violet-500', cta: 'bg-violet-600' },
  blue:     { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', light: 'bg-blue-50', badge: 'bg-blue-500', cta: 'bg-blue-600' },
  cyan:     { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', light: 'bg-cyan-50', badge: 'bg-cyan-500', cta: 'bg-cyan-600' },
  purple:   { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', light: 'bg-purple-50', badge: 'bg-purple-500', cta: 'bg-purple-600' },
  orange:   { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', light: 'bg-orange-50', badge: 'bg-orange-500', cta: 'bg-orange-600' },
  lime:     { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-300', light: 'bg-lime-50', badge: 'bg-lime-500', cta: 'bg-lime-600' },
  fuchsia:  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300', light: 'bg-fuchsia-50', badge: 'bg-fuchsia-500', cta: 'bg-fuchsia-600' },
  sky:      { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300', light: 'bg-sky-50', badge: 'bg-sky-500', cta: 'bg-sky-600' },
  gray:     { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', light: 'bg-gray-50', badge: 'bg-gray-500', cta: 'bg-gray-600' },
  green:    { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', light: 'bg-green-50', badge: 'bg-green-500', cta: 'bg-green-600' },
};

function getStepColor(stepType: string) {
  const config = STEP_TYPES.find((t) => t.value === stepType);
  return STEP_COLORS[config?.color || 'gray'];
}

interface FunnelAnalyticsData {
  name: string;
  views: number;
  clicks: number;
}

/* -- ファネルフロープレビュー（カラフル版） -- */
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
        const colors = getStepColor(step.stepType);
        const analyticsData = analytics[i];
        const prevViews = i > 0 ? analytics[i - 1]?.views : 0;
        const cvr = i > 0 && prevViews > 0 && analyticsData
          ? ((analyticsData.views / prevViews) * 100).toFixed(1)
          : null;

        return (
          <div key={i} className="w-full max-w-xs">
            {/* ステップカード */}
            <div className={`rounded-xl border-2 ${colors.border} shadow-md p-4 ${colors.light}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{step.name || `ステップ ${i + 1}`}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    {typeLabel}
                  </span>
                </div>
                <span className={`w-7 h-7 ${colors.badge} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {i + 1}
                </span>
              </div>
              {step.ctaLabel && step.stepType !== 'thank_you' && (
                <div className="mt-3">
                  <div className={`w-full px-3 py-2 ${colors.cta} text-white text-xs font-semibold rounded-lg text-center`}>
                    {step.ctaLabel}
                  </div>
                </div>
              )}
              {step.slug && (
                <a
                  href={`${typeof window !== 'undefined' ? window.location.origin : ''}/fs/${step.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-amber-500 transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">/fs/{step.slug}</span>
                </a>
              )}
              {analyticsData && analyticsData.views > 0 && (
                <div className="mt-1 text-xs text-gray-500 text-center">
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

/* -- コンテンツ選択ドロップダウン -- */
function ContentPicker({
  stepType,
  items,
  loading,
  value,
  onChange,
  fallbackPlaceholder,
}: {
  stepType: string;
  items: ContentItem[];
  loading: boolean;
  value: string;
  onChange: (value: string, slug?: string) => void;
  fallbackPlaceholder: string;
}) {
  const [manualMode, setManualMode] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400">
        <Loader2 className="w-3 h-3 animate-spin" />読み込み中...
      </div>
    );
  }

  if (items.length === 0 || manualMode) {
    return (
      <div className="space-y-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallbackPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400"
        />
        {items.length > 0 && (
          <button onClick={() => setManualMode(false)} className="text-xs text-blue-600 hover:underline">
            一覧から選ぶ
          </button>
        )}
        {items.length === 0 && (
          <p className="text-xs text-gray-400">まだ作成済みのコンテンツがありません。スラッグ/IDを直接入力してください。</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => {
          const selected = items.find((item) =>
            item.slug ? item.slug === e.target.value : item.id === e.target.value
          );
          onChange(e.target.value, selected?.slug);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm bg-white"
      >
        <option value="">-- 作成済みから選ぶ --</option>
        {items.map((item) => (
          <option key={item.id} value={item.slug || item.id}>
            {item.label}{item.slug && item.slug !== item.label ? ` (/${item.slug})` : ''}
          </option>
        ))}
      </select>
      <button onClick={() => setManualMode(true)} className="text-xs text-blue-600 hover:underline">
        手動で入力する
      </button>
    </div>
  );
}

/* -- メインエディタ -- */
export default function FunnelEditor({ funnelId, initialSteps, initialName }: { funnelId?: string; initialSteps?: Step[]; initialName?: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const [name, setName] = useState(initialName || '');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [slug, setSlug] = useState('');
  const [steps, setSteps] = useState<Step[]>(initialSteps || []);
  const [analytics, setAnalytics] = useState<FunnelAnalyticsData[]>([]);

  // ユーザーの作成済みコンテンツ
  const [userContents, setUserContents] = useState<Record<string, ContentItem[]>>({});
  const [contentsLoading, setContentsLoading] = useState(false);

  // 完了モーダル
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [savedFunnelId, setSavedFunnelId] = useState<string | null>(funnelId || null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const { consumeAndExecute, limitModalProps } = usePointsWithLimitModal({ userId: userId ?? undefined, isPro: false });

  useEffect(() => {
    const init = async () => {
      if (!supabase) { console.warn('[FunnelEditor] supabase not available'); return; }
      // getSession はローカルセッションを使うため getUser より安定
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      console.log('[FunnelEditor] auth check:', user ? `user=${user.id}` : 'no user');
      if (user) {
        setUserId(user.id);
        fetchUserContents(user.id);
        if (funnelId) {
          await fetchFunnel(user.id);
          await fetchAnalytics(user.id);
        }
      }
      setLoading(false);
    };
    init();
  }, [funnelId]);

  const fetchUserContents = async (uid: string) => {
    setContentsLoading(true);
    try {
      const res = await fetch(`/api/funnel/user-contents?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        const contents = data.contents || {};
        console.log('[FunnelEditor] userContents loaded:', Object.keys(contents).map(k => `${k}:${contents[k]?.length || 0}`));
        setUserContents(contents);
      } else {
        console.error('[FunnelEditor] user-contents fetch failed:', res.status);
      }
    } catch (err) {
      console.error('[FunnelEditor] user-contents fetch error:', err);
    }
    setContentsLoading(false);
  };

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
          slug: s.slug || undefined,
          ctaEnabled: s.cta_enabled !== false,
          ctaStyle: s.cta_style || {},
        })));
      }
    }
  };

  const fetchAnalytics = async (uid: string) => {
    const res = await fetch(`/api/funnel/${funnelId}/analytics?userId=${uid}`);
    if (res.ok) { const data = await res.json(); setAnalytics(data.analytics || []); }
  };

  const addStep = () => setSteps([...steps, { name: '', stepType: 'custom_url', contentRef: null, ctaLabel: '次へ進む', ctaEnabled: true, ctaStyle: {} }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, updates: Partial<Step>) => setSteps(steps.map((s, i) => i === index ? { ...s, ...updates } : s));
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const ns = [...steps]; const t = direction === 'up' ? index - 1 : index + 1;
    if (t < 0 || t >= ns.length) return;
    [ns[index], ns[t]] = [ns[t], ns[index]]; setSteps(ns);
  };

  const handleSave = async (newStatus?: string) => {
    if (!userId || !name) return;
    await consumeAndExecute('funnel', 'save', async () => {
      setSaving(true);
      try {
        const body = { userId, name, description, status: newStatus || status, steps };
        if (savedFunnelId) {
          const res = await fetch(`/api/funnel/${savedFunnelId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          if (res.ok) {
            const data = await res.json();
            if (newStatus) setStatus(newStatus);
            // 保存後のslugをステップに反映
            if (data.steps?.length > 0) {
              setSteps(prev => prev.map((s, i) => ({
                ...s,
                slug: data.steps[i]?.slug || s.slug,
              })));
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
          }
        } else {
          const res = await fetch('/api/funnel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          if (res.ok) {
            const data = await res.json();
            // ステップ保存 + 公開状態にする（公開URLがすぐ使えるように）
            const patchRes = await fetch(`/api/funnel/${data.funnel.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, steps: steps.length > 0 ? steps : undefined, status: 'active' }),
            });
            if (patchRes.ok) {
              const patchData = await patchRes.json();
              // ステップslugを反映
              if (patchData.steps?.length > 0) {
                setSteps(prev => prev.map((s, i) => ({
                  ...s,
                  slug: patchData.steps[i]?.slug || s.slug,
                })));
              }
            }
            setStatus('active');
            setCreatedSlug(data.funnel.slug);
            setSlug(data.funnel.slug);
            setSavedFunnelId(data.funnel.id);
            setShowCompleteModal(true);
            window.history.replaceState(null, '', `/funnel/editor/${data.funnel.id}`);
          }
        }
      } finally {
        setSaving(false);
      }
    }, savedFunnelId);
  };

  const getStepTypeConfig = (type: string) => STEP_TYPES.find((t) => t.value === type);

  // コンテンツピッカー用のキー（stepTypeからuserContentsのキーへのマッピング）
  const getContentKey = (stepType: string): string => {
    // APIのキーと一致させる
    if (stepType === 'order_form') return 'order_form';
    if (stepType === 'sns_post') return 'sns_post';
    return stepType;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/funnel/${slug}` : '';
  const completeUrl = createdSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/funnel/${createdSlug}` : publicUrl;

  const handleCopyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 完了モーダル */}
      <CreationCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="ファネル"
        publicUrl={completeUrl}
        contentTitle={`${name}のファネル`}
        theme="amber"
      />

      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard?view=funnel')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{savedFunnelId ? 'ファネル編集' : '新しいファネル'}</h1>
          {slug && status === 'active' && (
            <>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <Globe className="w-3 h-3" />公開中
              </a>
              <a href={`${publicUrl}?preview=true`} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 hover:underline">
                <Monitor className="w-3 h-3" />確認
              </a>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4" />保存しました
            </span>
          )}
          {urlCopied && (
            <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4" />URLコピー済み
            </span>
          )}
          {savedFunnelId && (
            <button onClick={() => setShowCompleteModal(true)} className="hidden sm:flex bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 hover:from-amber-700 hover:to-orange-700 whitespace-nowrap transition-all shadow-md text-sm sm:text-base min-h-[44px]">
              <Trophy className="w-4 h-4" /> <span className="hidden md:inline">作成完了画面</span><span className="md:hidden">完了</span>
            </button>
          )}
          {slug && (
            <button onClick={handleCopyUrl} className="hidden sm:flex bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 rounded-lg font-bold items-center gap-2 whitespace-nowrap text-sm sm:text-base min-h-[44px]">
              <Share2 className="w-4 h-4" /> <span className="hidden md:inline">公開URL</span><span className="md:hidden">URL</span>
            </button>
          )}
          <button onClick={() => handleSave()} disabled={saving || !name} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md min-h-[44px]">
            <Save className="w-4 h-4" />{saving ? '保存中...' : '保存'}
          </button>
          {savedFunnelId && (
            <button onClick={() => handleSave(status === 'active' ? 'draft' : 'active')} disabled={saving || !name || steps.length === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all shadow-md min-h-[44px]">
              <Globe className="w-4 h-4" />{status === 'active' ? '非公開' : '公開'}
            </button>
          )}
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-[121px] z-30">
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
            {/* テンプレート選択（新規作成時のみ） */}
            {!savedFunnelId && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-amber-100 p-1.5 rounded-lg"><GitBranch className="w-4 h-4 text-amber-600" /></span>テンプレートから作成
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-3">テンプレートを選ぶと、ステップが自動追加されます</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FUNNEL_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        const msg = steps.length > 0
                          ? `「${template.name}」を適用すると、現在のステップが置き換わります。適用しますか？`
                          : `「${template.name}」テンプレートを適用しますか？`;
                        if (!confirm(msg)) return;
                        setName(template.name);
                        setSteps(template.steps.map((s) => ({
                          name: s.name,
                          stepType: s.stepType,
                          contentRef: s.contentRef,
                          ctaLabel: s.ctaLabel,
                          ctaEnabled: true,
                          ctaStyle: {},
                        })));
                      }}
                      className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:shadow-md hover:border-amber-300 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{template.emoji}</span>
                        <span className="font-bold text-sm text-gray-900 group-hover:text-amber-700 transition-colors">{template.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        {template.steps.length}ステップ
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    const colors = getStepColor(step.stepType);
                    const contentKey = getContentKey(step.stepType);
                    const contentItems = userContents[contentKey] || [];

                    return (
                      <div key={i} className={`border-2 ${colors.border} rounded-xl p-4 ${colors.light} transition-all duration-200`}>
                        {/* ステップヘッダー */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-8 h-8 ${colors.badge} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                            {i + 1}
                          </span>
                          <div className={`w-7 h-7 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            {STEP_ICONS[step.stepType] || <ExternalLink className="w-3.5 h-3.5" />}
                          </div>
                          <input type="text" value={step.name} onChange={(e) => updateStep(i, { name: e.target.value })} placeholder="ステップ名" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white" />
                          <div className="flex items-center gap-1">
                            <button onClick={() => moveStep(i, 'up')} disabled={i === 0} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-white/60"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => moveStep(i, 'down')} disabled={i === steps.length - 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-white/60"><ArrowDown className="w-4 h-4" /></button>
                            <button onClick={() => removeStep(i)} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-white/60"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2">
                          {/* タイプ選択 */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">タイプ</label>
                            <select value={step.stepType} onChange={(e) => updateStep(i, { stepType: e.target.value, contentRef: null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm bg-white">
                              <optgroup label="LP・ページ">
                                {STEP_TYPES.filter(t => ['profile_lp', 'business_lp', 'webinar', 'onboarding'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </optgroup>
                              <optgroup label="診断・クイズ">
                                {STEP_TYPES.filter(t => ['quiz', 'entertainment_quiz'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </optgroup>
                              <optgroup label="ライティング">
                                {STEP_TYPES.filter(t => ['salesletter', 'sns_post'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </optgroup>
                              <optgroup label="集客・イベント">
                                {STEP_TYPES.filter(t => ['newsletter', 'booking', 'survey', 'attendance'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </optgroup>
                              <optgroup label="収益化">
                                {STEP_TYPES.filter(t => ['order_form', 'gamification'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </optgroup>
                              <optgroup label="その他">
                                {STEP_TYPES.filter(t => ['custom_url', 'thank_you'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </optgroup>
                            </select>
                          </div>

                          {/* コンテンツ選択 */}
                          {typeConfig?.hasContent && typeConfig?.refType !== 'none' && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-gray-500 mb-1">
                                {typeConfig.label}を選択
                              </label>
                              <ContentPicker
                                stepType={step.stepType}
                                items={contentItems}
                                loading={contentsLoading}
                                value={
                                  typeConfig.refType === 'url'
                                    ? step.contentRef?.url || ''
                                    : typeConfig.refType === 'id'
                                      ? step.contentRef?.id || step.contentRef?.slug || ''
                                      : step.contentRef?.slug || ''
                                }
                                onChange={(val) => {
                                  const ref = typeConfig.refType === 'url'
                                    ? { type: step.stepType, url: val }
                                    : typeConfig.refType === 'id'
                                      ? { type: step.stepType, id: val, slug: val }
                                      : { type: step.stepType, slug: val };
                                  updateStep(i, { contentRef: ref });
                                }}
                                fallbackPlaceholder={typeConfig.placeholder}
                              />
                            </div>
                          )}

                          {/* 外部URL入力 */}
                          {step.stepType === 'custom_url' && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-gray-500 mb-1">URL</label>
                              <input
                                type="text"
                                value={step.contentRef?.url || ''}
                                onChange={(e) => updateStep(i, { contentRef: { type: 'custom_url', url: e.target.value } })}
                                placeholder="https://example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white"
                              />
                            </div>
                          )}

                          {/* サンキューページ専用フォーム */}
                          {step.stepType === 'thank_you' && (
                            <div className="sm:col-span-2 space-y-3 bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-xs font-semibold text-green-700 mb-1">サンキューページの内容</p>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">メッセージ本文</label>
                                <textarea
                                  value={(step.contentRef as any)?.message || ''}
                                  onChange={(e) => updateStep(i, { contentRef: { ...step.contentRef, type: 'thank_you', message: e.target.value } })}
                                  placeholder="例: お申し込みありがとうございます。確認メールをお送りしましたのでご確認ください。"
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">次のアクション案内（任意）</label>
                                <input
                                  type="text"
                                  value={(step.contentRef as any)?.nextAction || ''}
                                  onChange={(e) => updateStep(i, { contentRef: { ...step.contentRef, type: 'thank_you', nextAction: e.target.value } })}
                                  placeholder="例: メールを確認してください / LINEを友だち追加してください"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white"
                                />
                              </div>
                              <div className="grid sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">ボタンテキスト（任意）</label>
                                  <input
                                    type="text"
                                    value={(step.contentRef as any)?.ctaText || ''}
                                    onChange={(e) => updateStep(i, { contentRef: { ...step.contentRef, type: 'thank_you', ctaText: e.target.value } })}
                                    placeholder="例: LINEを追加する"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">ボタンリンク先（任意）</label>
                                  <input
                                    type="text"
                                    value={(step.contentRef as any)?.ctaUrl || ''}
                                    onChange={(e) => updateStep(i, { contentRef: { ...step.contentRef, type: 'thank_you', ctaUrl: e.target.value } })}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CTAボタン設定 */}
                          {step.stepType !== 'thank_you' && (
                          <div className="sm:col-span-2 space-y-3">
                            {/* CTA表示/非表示トグル */}
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-gray-500">CTAボタン</label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs text-gray-500">{step.ctaEnabled ? '表示' : '非表示'}</span>
                                <button
                                  type="button"
                                  onClick={() => updateStep(i, { ctaEnabled: !step.ctaEnabled })}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${step.ctaEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
                                >
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${step.ctaEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                </button>
                              </label>
                            </div>

                            {step.ctaEnabled && (
                              <>
                                {/* CTAテキスト */}
                                <input type="text" value={step.ctaLabel} onChange={(e) => updateStep(i, { ctaLabel: e.target.value })} placeholder="次へ進む" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 bg-white" />

                                {/* CTAスタイル設定 */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">色</label>
                                    <select
                                      value={step.ctaStyle?.color || 'amber'}
                                      onChange={(e) => updateStep(i, { ctaStyle: { ...step.ctaStyle, color: e.target.value } })}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-xs bg-white"
                                    >
                                      <option value="amber">アンバー</option>
                                      <option value="blue">ブルー</option>
                                      <option value="green">グリーン</option>
                                      <option value="red">レッド</option>
                                      <option value="purple">パープル</option>
                                      <option value="pink">ピンク</option>
                                      <option value="indigo">インディゴ</option>
                                      <option value="teal">ティール</option>
                                      <option value="orange">オレンジ</option>
                                      <option value="gray">グレー</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">サイズ</label>
                                    <select
                                      value={step.ctaStyle?.size || 'md'}
                                      onChange={(e) => updateStep(i, { ctaStyle: { ...step.ctaStyle, size: e.target.value } })}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-xs bg-white"
                                    >
                                      <option value="sm">小</option>
                                      <option value="md">中</option>
                                      <option value="lg">大</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">角丸</label>
                                    <select
                                      value={step.ctaStyle?.rounded || 'lg'}
                                      onChange={(e) => updateStep(i, { ctaStyle: { ...step.ctaStyle, rounded: e.target.value } })}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-xs bg-white"
                                    >
                                      <option value="none">なし</option>
                                      <option value="md">小</option>
                                      <option value="lg">大</option>
                                      <option value="full">丸</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">横幅</label>
                                    <select
                                      value={step.ctaStyle?.fullWidth ? 'full' : 'auto'}
                                      onChange={(e) => updateStep(i, { ctaStyle: { ...step.ctaStyle, fullWidth: e.target.value === 'full' } })}
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-xs bg-white"
                                    >
                                      <option value="auto">自動</option>
                                      <option value="full">全幅</option>
                                    </select>
                                  </div>
                                </div>

                                {typeConfig?.ctaNote && (
                                  <p className={`text-xs ${colors.text}`}>{typeConfig.ctaNote}</p>
                                )}
                              </>
                            )}
                          </div>
                          )}

                          {/* ステップ公開URL（保存後に表示） */}
                          {step.slug && (
                            <div className="sm:col-span-2">
                              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <code className="text-xs text-gray-600 truncate flex-1">/fs/{step.slug}</code>
                                <a
                                  href={`${typeof window !== 'undefined' ? window.location.origin : ''}/fs/${step.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-amber-600 hover:underline whitespace-nowrap font-semibold"
                                >
                                  開く
                                </a>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/fs/${step.slug}`);
                                    setUrlCopied(true);
                                    setTimeout(() => setUrlCopied(false), 2000);
                                  }}
                                  className="text-xs text-blue-600 hover:underline whitespace-nowrap font-semibold"
                                >
                                  コピー
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ファネルモード注意書き */}
              {steps.length > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-semibold">ファネル表示時の注意</p>
                    <p>各ツール内のフッターリンクはファネル表示時に自動で非表示になります。ステップインジケーターはエンドユーザーには表示されません（作成者プレビュー時のみ表示）。</p>
                    <p>確認する場合は公開URLに <code className="bg-amber-100 px-1 rounded">?preview=true</code> を付けてください。</p>
                  </div>
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
                    const stepColor = steps[i] ? getStepColor(steps[i].stepType) : STEP_COLORS.amber;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-semibold text-gray-700">{a.name || `Step ${i + 1}`}</span>
                          <span className="text-gray-500">{a.views} PV {i > 0 && <span className="text-amber-600 font-semibold">({cvr}%)</span>}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-5">
                          <div className={`${stepColor.badge} rounded-full h-5 transition-all duration-500`} style={{ width: `${widthPercent}%` }} />
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
        <div className={`w-full lg:w-1/2 lg:fixed lg:right-0 lg:top-[138px] lg:h-[calc(100vh-138px)] lg:z-10 flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
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
      <CreationLimitModal {...limitModalProps} />
    </div>
  );
}
