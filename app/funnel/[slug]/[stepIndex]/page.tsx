'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  step_type: string;
  content_ref: { type: string; slug?: string; url?: string; id?: string } | null;
  cta_label: string;
  order_index: number;
}

interface FunnelData {
  id: string;
  name: string;
  slug: string;
  funnel_steps: Step[];
}

export default function FunnelStepPage({ params }: { params: Promise<{ slug: string; stepIndex: string }> }) {
  const { slug, stepIndex } = use(params);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => typeof window !== 'undefined'
    ? sessionStorage.getItem('funnel_session') || `fs_${Date.now()}_${Math.random().toString(36).slice(2)}`
    : ''
  );

  const currentIndex = parseInt(stepIndex, 10);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      sessionStorage.setItem('funnel_session', sessionId);
    }
    fetchFunnel();
  }, [slug]);

  const fetchFunnel = async () => {
    const res = await fetch(`/api/funnel/${slug}?public=true`);
    if (res.ok) {
      const data = await res.json();
      setFunnel(data.funnel);
    }
    setLoading(false);
  };

  // ビューイベントを記録
  useEffect(() => {
    if (!funnel || !sessionId) return;
    const step = funnel.funnel_steps[currentIndex];
    if (!step) return;

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
  }, [funnel, currentIndex]);

  const trackClick = async () => {
    if (!funnel) return;
    const step = funnel.funnel_steps[currentIndex];
    if (!step) return;

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
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  if (!funnel || funnel.funnel_steps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-gray-500">ファネルが見つかりません</p>
      </div>
    );
  }

  const step = funnel.funnel_steps[currentIndex];
  if (!step) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-gray-500">このステップは存在しません</p>
      </div>
    );
  }

  const isLastStep = currentIndex >= funnel.funnel_steps.length - 1;
  const isThankYou = step.step_type === 'thank_you';

  // ステップのコンテンツURL生成
  const getContentUrl = () => {
    const ref = step.content_ref;
    if (!ref) return null;

    switch (step.step_type) {
      case 'profile_lp': return `/profile/${ref.slug}`;
      case 'quiz': return `/quiz/${ref.slug}`;
      case 'order_form': return `/order-form/${ref.slug}`;
      case 'newsletter': return `/newsletter/subscribe/${ref.slug || ref.id}`;
      case 'booking': return `/booking/${ref.slug}`;
      case 'custom_url': return ref.url || null;
      default: return null;
    }
  };

  const contentUrl = getContentUrl();

  // サンキューページ
  if (isThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.name || 'ありがとうございます！'}</h2>
          <p className="text-gray-600">最後までご覧いただきありがとうございます。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ステップインジケーター */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          {funnel.funnel_steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === currentIndex ? 'bg-amber-600 text-white' : i < currentIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < currentIndex ? '✓' : i + 1}
              </div>
              {i < funnel.funnel_steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
          <span className="ml-3 text-sm text-gray-500">{step.name}</span>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1">
        {contentUrl ? (
          <iframe
            src={contentUrl}
            className="w-full h-[calc(100vh-140px)] border-none"
            title={step.name}
          />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-140px)]">
            <p className="text-gray-500">コンテンツが設定されていません</p>
          </div>
        )}
      </div>

      {/* 次のステップへのCTA */}
      {!isLastStep && (
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-5xl mx-auto text-center">
            <Link
              href={`/funnel/${slug}/${currentIndex + 1}`}
              onClick={trackClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
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
