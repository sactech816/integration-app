'use client';

import { Check } from 'lucide-react';
import { useHomeAuth } from './HomeAuthContext';
import { PLANS, PLAN_FEATURES } from '@/constants/pricing';

export default function PricingSection() {
  const { setShowAuth, setShowProPlanModal } = useHomeAuth();

  const navigateTo = (page: string) => {
    if (page === 'create') {
      document.getElementById('create-section-services')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${page}`;
    }
  };

  return (
    <section id="create-section" className="py-24 border-t" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>わかりやすい料金プラン</h2>
          <p className="text-gray-600">まずは無料で、すべての機能をお試しいただけます。</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const isGuest = plan.id === 'guest';
            const isFree = plan.id === 'free';
            const isPro = plan.id === 'pro';
            const checkColor = isPro ? 'text-purple-500' : isFree ? undefined : undefined;
            const checkStyle = isPro ? undefined : isFree ? { color: '#f97316' } : { color: '#84cc16' };
            const handleCta = () => {
              if (isGuest) navigateTo('create');
              else if (isFree) setShowAuth(true);
              else setShowProPlanModal(true);
            };
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 flex flex-col transition ${
                  isFree ? 'border-4 bg-white shadow-xl' : isPro ? 'border-2 border-purple-200' : 'border-2 bg-white hover:shadow-lg'
                }`}
                style={{
                  borderColor: isFree ? '#f97316' : isGuest ? '#ffedd5' : undefined,
                  backgroundColor: isPro ? '#fffbf0' : undefined,
                }}
              >
                <div className="mb-4 text-center">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${isPro ? 'bg-purple-100 text-purple-700' : ''}`}
                    style={!isPro ? { backgroundColor: isFree ? '#ffedd5' : '#fffbf0', color: isFree ? '#f97316' : '#5d4037' } : undefined}
                  >
                    {plan.badge}
                  </span>
                  <h3
                    className={`text-xl font-bold mt-2 ${isPro ? 'text-purple-800' : ''}`}
                    style={!isPro ? { color: isFree ? '#f97316' : '#5d4037' } : undefined}
                  >
                    {plan.name}
                  </h3>
                  <div className="mt-1">
                    <span className="text-3xl font-bold" style={{ color: '#5d4037' }}>{plan.price}</span>
                    <span className="text-xs text-gray-500">{plan.priceUnit}</span>
                  </div>
                </div>
                <p className="text-xs mb-6 text-center whitespace-pre-line" style={{ color: isFree ? '#5d4037' : undefined, fontWeight: isFree ? 700 : undefined }}>
                  {plan.description}
                </p>
                <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                  {PLAN_FEATURES.map((feature) => {
                    const status = feature[plan.id];
                    const note = isFree ? feature.freeNote : isPro ? feature.proNote : undefined;
                    if (status === 'no') {
                      return (
                        <li key={feature.label} className="flex items-center justify-between text-sm font-bold text-gray-400">
                          <span>{feature.label}</span><span className="text-gray-300">×</span>
                        </li>
                      );
                    }
                    if (status === 'limited') {
                      return (
                        <li key={feature.label} className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                          <span>{feature.label}</span>
                          <span className="text-xs" style={isFree ? { color: '#f97316' } : undefined}>{note || '制限あり'}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={feature.label} className="flex items-center justify-between text-sm font-bold" style={{ color: '#5d4037' }}>
                        <span>{feature.label}</span>
                        {note
                          ? <span className={`text-xs ${isPro ? 'text-purple-500' : ''}`} style={!isPro ? checkStyle : undefined}>{note}</span>
                          : <Check size={16} className={checkColor} style={checkStyle} />}
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={handleCta}
                  className={`block w-full py-3 px-4 font-bold text-center rounded-2xl transition text-sm ${
                    isPro ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md hover:-translate-y-1 transform'
                    : isFree ? 'text-white shadow-md hover:-translate-y-1 transform'
                    : ''
                  }`}
                  style={
                    isFree ? { backgroundColor: '#f97316' }
                    : isGuest ? { backgroundColor: '#fffbf0', color: '#5d4037' }
                    : undefined
                  }
                >
                  {plan.ctaLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
