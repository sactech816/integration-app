'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

interface StepData {
  id: string;
  name: string;
  step_type: string;
  content_ref: { type: string; slug?: string; url?: string; id?: string; message?: string; nextAction?: string; ctaText?: string; ctaUrl?: string } | null;
  cta_label: string;
  cta_enabled: boolean;
  cta_style: {
    color?: string;
    size?: string;
    rounded?: string;
    fullWidth?: boolean;
  } | null;
  slug: string;
  order_index: number;
}

interface FunnelInfo {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  stepSlug: string;
}

// CTAスタイル → Tailwindクラス変換
function getCTAClasses(style: StepData['cta_style']) {
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-600 hover:bg-amber-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    pink: 'bg-pink-600 hover:bg-pink-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    teal: 'bg-teal-600 hover:bg-teal-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    gray: 'bg-gray-700 hover:bg-gray-800',
  };

  const sizeMap: Record<string, string> = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-8 py-4 text-lg',
    lg: 'px-10 py-5 text-xl',
  };

  const roundedMap: Record<string, string> = {
    none: 'rounded-none',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  const color = colorMap[style?.color || 'amber'] || colorMap.amber;
  const size = sizeMap[style?.size || 'md'] || sizeMap.md;
  const rounded = roundedMap[style?.rounded || 'lg'] || roundedMap.lg;
  const width = style?.fullWidth ? 'w-full' : '';

  return `${color} ${size} ${rounded} ${width}`;
}

function FunnelStepStandaloneInner({ stepSlug }: Props) {
  const [step, setStep] = useState<StepData | null>(null);
  const [funnel, setFunnel] = useState<FunnelInfo | null>(null);
  const [allSteps, setAllSteps] = useState<StepData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() =>
    typeof window !== 'undefined'
      ? sessionStorage.getItem('funnel_session') || `fs_${Date.now()}_${Math.random().toString(36).slice(2)}`
      : ''
  );
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      sessionStorage.setItem('funnel_session', sessionId);
    }
    fetchStep();
  }, [stepSlug]);

  const fetchStep = async () => {
    const res = await fetch(`/api/funnel/step-by-slug?slug=${stepSlug}`);
    if (res.ok) {
      const data = await res.json();
      setStep(data.step);
      setFunnel(data.funnel);
      setAllSteps(data.allSteps);
      setCurrentIndex(data.currentIndex);
    }
    setLoading(false);
  };

  // ビューイベント記録
  useEffect(() => {
    if (!step || !funnel || !sessionId) return;
    fetch('/api/funnel/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funnelId: funnel.id,
        stepId: step.id,
        sessionId,
        eventType: 'view',
      }),
    }).catch(() => {});
  }, [step, funnel]);

  const trackClick = async () => {
    if (!step || !funnel) return;
    await fetch('/api/funnel/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funnelId: funnel.id,
        stepId: step.id,
        sessionId,
        eventType: 'cta_click',
      }),
    }).catch(() => {});
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  if (!step || !funnel) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-gray-500">ページが見つかりません</p>
      </div>
    );
  }

  const isLastStep = currentIndex >= allSteps.length - 1;
  const isThankYou = step.step_type === 'thank_you';
  const ctaEnabled = step.cta_enabled !== false;
  const nextStep = !isLastStep ? allSteps[currentIndex + 1] : null;

  // コンテンツURL生成
  const getContentUrl = () => {
    const ref = step.content_ref;
    if (!ref) return null;

    let basePath: string | null = null;
    switch (step.step_type) {
      case 'profile_lp': basePath = `/profile/${ref.slug}`; break;
      case 'business_lp': basePath = `/business/${ref.slug}`; break;
      case 'salesletter': basePath = `/salesletter/${ref.slug}`; break;
      case 'quiz': basePath = `/quiz/${ref.slug}`; break;
      case 'entertainment_quiz': basePath = `/quiz/${ref.slug}`; break;
      case 'order_form': basePath = `/order-form/${ref.slug}`; break;
      case 'newsletter': basePath = `/newsletter/subscribe/${ref.slug || ref.id}`; break;
      case 'booking': basePath = `/booking/${ref.slug || ref.id}`; break;
      case 'survey': basePath = `/survey/${ref.slug}`; break;
      case 'webinar': basePath = `/webinar/${ref.slug}`; break;
      case 'attendance': basePath = `/attendance/${ref.slug || ref.id}`; break;
      case 'onboarding': basePath = `/onboarding/${ref.slug}`; break;
      case 'gamification': basePath = `/gamification/${ref.slug || ref.id}`; break;
      case 'sns_post': basePath = `/sns-post/${ref.slug}`; break;
      case 'custom_url': return ref.url || null;
      default: return null;
    }

    return basePath ? `${basePath}?funnel=true` : null;
  };

  const contentUrl = getContentUrl();
  const ctaClasses = getCTAClasses(step.cta_style);

  // サンキューページ
  if (isThankYou) {
    const ref = step.content_ref as any;
    const headline = step.name || 'ありがとうございます！';
    const message = ref?.message || '最後までご覧いただきありがとうございます。';
    const nextAction = ref?.nextAction;
    const ctaText = ref?.ctaText;
    const ctaUrl = ref?.ctaUrl;

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-8 sm:p-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{headline}</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{message}</p>
          {nextAction && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">{nextAction}</p>
            </div>
          )}
          {ctaText && ctaUrl && (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              {ctaText}
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // 次のステップURL（/fs/xxx形式）
  const nextStepUrl = nextStep?.slug ? `/fs/${nextStep.slug}` : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ステップインジケーター（プレビュー時のみ） */}
      {isPreview && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-2">
            {allSteps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === currentIndex ? 'bg-amber-600 text-white' : i < currentIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < currentIndex ? '✓' : i + 1}
                </div>
                {i < allSteps.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
            <span className="ml-3 text-sm text-gray-500">{step.name}</span>
          </div>
        </div>
      )}

      {/* コンテンツエリア */}
      <div className="flex-1">
        {contentUrl ? (
          <iframe
            src={contentUrl}
            className="w-full h-[calc(100vh-60px)] border-none"
            title={step.name}
          />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-60px)]">
            <p className="text-gray-500">コンテンツが設定されていません</p>
          </div>
        )}
      </div>

      {/* 次のステップへのCTA */}
      {!isLastStep && ctaEnabled && nextStepUrl && (
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-5xl mx-auto text-center">
            <Link
              href={`${nextStepUrl}${isPreview ? '?preview=true' : ''}`}
              onClick={trackClick}
              className={`inline-flex items-center gap-2 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px] ${ctaClasses}`}
            >
              {step.cta_label || '次へ進む'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FunnelStepStandalone(props: Props) {
  return (
    <Suspense>
      <FunnelStepStandaloneInner {...props} />
    </Suspense>
  );
}
