'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import {
  Check,
  Crown,
  Sparkles,
  Rocket,
  PlusCircle,
  Globe,
  Link as LinkIcon,
  Edit3,
  Share2,
  BarChart3,
  Zap,
  Gamepad2,
  Download,
  Code,
  EyeOff,
  GraduationCap,
  Users,
  Handshake,
  CreditCard,
  Mail,
  ImagePlus,
  MessageCircle,
  X,
  Loader2,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import {
  PLANS,
  PLAN_FEATURES,
  PRO_FEATURE_DETAILS,
  COMING_SOON_FEATURES,
  PRICING_FAQ,
  type FeatureAvailability,
} from '@/constants/pricing';

// アイコン名からコンポーネントへのマッピング
const iconMap: Record<string, LucideIcon> = {
  PlusCircle, Globe, Link: LinkIcon, Edit3, Share2, BarChart3, Zap, Gamepad2,
  Download, Code, EyeOff, GraduationCap, Users, Handshake, CreditCard, Mail,
  ImagePlus, MessageCircle,
};

export default function PricingPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProPlanModal, setShowProPlanModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ? { email: session.user.email ?? undefined, id: session.user.id } : null);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      router.push('/');
    } else if (page === 'dashboard') {
      router.push('/dashboard');
    } else if (page === 'create') {
      router.push('/#create-section');
    } else if (page.includes('/editor')) {
      router.push(`/${page}`);
    } else {
      router.push(`/${page}`);
    }
  };

  // プロプラン決済処理（トップページと同じフロー）
  const handleProPlanCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const email = user?.email;
      const referralCode = getReferralCode();
      if (referralCode && email) {
        try {
          await fetch('/api/affiliate/pending', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, referralCode, service: 'makers', planTier: 'pro', planPeriod: 'monthly', userId: user?.id || null }),
          });
        } catch (err) { console.warn('Failed to save pending affiliate:', err); }
      }
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'makers_pro_monthly', userId: user?.id || null, email: email || null }),
      });
      const data = await response.json();
      if (data.url) { window.location.href = data.url; }
      else if (data.error) { throw new Error(data.error); }
      else { alert('決済ページの準備中です。しばらくお待ちください。'); }
    } catch (error) { console.error('決済エラー:', error); alert('決済の開始に失敗しました。もう一度お試しください。'); }
    finally { setIsProcessingPayment(false); }
  };

  // 機能の利用可否を表示するヘルパー
  const renderAvailability = (
    status: FeatureAvailability,
    note: string | undefined,
    planId: string
  ) => {
    if (status === 'yes') {
      const color = planId === 'pro' ? 'text-purple-500' : planId === 'free' ? 'text-orange-500' : 'text-lime-500';
      return note
        ? <span className={`text-xs font-bold ${color}`}>{note}</span>
        : <Check size={16} className={color} />;
    }
    if (status === 'limited') {
      const color = planId === 'free' ? 'text-orange-500' : 'text-gray-400';
      return <span className={`text-xs font-bold ${color}`}>{note || '制限あり'}</span>;
    }
    return <span className="text-gray-300 font-bold">×</span>;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffbf0' }}>
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} onNavigate={navigateTo} />

      {/* プロプランモーダル */}
      {showProPlanModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 text-white px-6 py-5 flex justify-between items-center z-10 rounded-t-3xl" style={{ backgroundColor: '#f97316' }}>
              <div className="flex items-center gap-3"><Crown size={24} /><h3 className="font-bold text-xl">プロプラン</h3></div>
              <button onClick={() => setShowProPlanModal(false)} className="text-white/80 hover:text-white transition p-1"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-black" style={{ color: '#5d4037' }}>¥3,980<span className="text-lg font-normal text-gray-500">/月</span></div>
                <p className="text-sm text-gray-500 mt-1">税込 / いつでも解約可能</p>
              </div>
              <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#fffbf0' }}>
                <h4 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5d4037' }}>
                  <Sparkles size={18} style={{ color: '#f97316' }} />プロプランで使える機能
                </h4>
                <ul className="space-y-3">
                  {[
                    { text: 'フリープランの全機能', highlight: false },
                    { text: 'アクセス解析', highlight: true },
                    { text: 'AI利用（優先・回数無制限）', highlight: true },
                    { text: 'HTMLダウンロード', highlight: true },
                    { text: '埋め込みコード発行', highlight: true },
                    { text: '広告非表示', highlight: true },
                    { text: '優先サポート', highlight: true },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check size={18} style={{ color: item.highlight ? '#f97316' : '#84cc16' }} />
                      <span className={`text-sm ${item.highlight ? 'font-bold' : ''}`} style={{ color: '#5d4037' }}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {!user && (
                <div className="border rounded-2xl p-4 mb-6" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
                  <p className="text-sm" style={{ color: '#5d4037' }}><span className="font-bold">ヒント：</span>ログインすると、購入履歴がアカウントに紐付けられます。</p>
                  <button onClick={() => { setShowProPlanModal(false); setShowAuth(true); }} className="mt-2 text-sm font-bold hover:underline" style={{ color: '#f97316' }}>ログイン / 新規登録はこちら →</button>
                </div>
              )}
              <button onClick={handleProPlanCheckout} disabled={isProcessingPayment}
                className="w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transform"
                style={{ backgroundColor: '#f97316' }}>
                {isProcessingPayment ? (<><Loader2 className="animate-spin" size={20} />処理中...</>) : (<><CreditCard size={20} />決済ページへ進む<ExternalLink size={16} /></>)}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">Stripeによる安全な決済処理。カード情報は当サイトに保存されません。</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== ヒーロー ========== */}
      <section className="pt-20 pb-16 text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
            <Crown size={18} />
            <span className="font-bold text-sm">Pro Plan</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6" style={{ color: '#5d4037' }}>
            プロプランで、<br className="md:hidden" />ビジネスを次のステージへ
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            全13種のコンテンツ作成ツールに加え、アクセス解析・AI優先利用・HTMLダウンロードなど、
            本格的なビジネス運用に必要なすべてが揃っています。
          </p>
        </div>
      </section>

      {/* ========== 料金比較表 ========== */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            {PLANS.map((plan) => {
              const isGuest = plan.id === 'guest';
              const isFree = plan.id === 'free';
              const isPro = plan.id === 'pro';

              const handleCta = () => {
                if (isGuest) router.push('/#create-section');
                else if (isFree) setShowAuth(true);
                else setShowProPlanModal(true);
              };

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col transition ${
                    isFree
                      ? 'border-4 bg-white shadow-xl'
                      : isPro
                        ? 'border-2 border-purple-200'
                        : 'border-2 bg-white hover:shadow-lg'
                  }`}
                  style={{
                    borderColor: isFree ? '#f97316' : isGuest ? '#ffedd5' : undefined,
                    backgroundColor: isPro ? '#fffbf0' : undefined,
                  }}
                >
                  <div className="mb-4 text-center">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isPro ? 'bg-purple-100 text-purple-700' : ''
                      }`}
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
                  <p className="text-xs text-center mb-6 whitespace-pre-line" style={{ color: '#5d4037', fontWeight: isFree ? 700 : undefined }}>
                    {plan.description}
                  </p>

                  <ul className="space-y-2 mb-6 flex-1 border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                    {PLAN_FEATURES.map((feature) => {
                      const status = feature[plan.id];
                      const note = plan.id === 'free' ? feature.freeNote : plan.id === 'pro' ? feature.proNote : undefined;
                      return (
                        <li key={feature.label} className={`flex items-center justify-between text-sm font-bold ${status === 'no' ? 'text-gray-400' : ''}`} style={status !== 'no' ? { color: '#5d4037' } : undefined}>
                          <span>{feature.label}</span>
                          {renderAvailability(status, note, plan.id)}
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    onClick={handleCta}
                    className={`block w-full py-3 px-4 font-bold text-center rounded-2xl transition text-sm ${
                      isPro
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md hover:-translate-y-1 transform'
                        : isFree
                          ? 'text-white shadow-md hover:-translate-y-1 transform'
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

      {/* ========== Pro機能 詳細セクション ========== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
              <Sparkles size={18} />
              <span className="font-bold text-sm">Pro機能を詳しく解説</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#5d4037' }}>
              プロプランでできること
            </h2>
            <p className="text-gray-600 mt-4">
              1つひとつの機能が、あなたのビジネスの成長を加速させます。
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {PRO_FEATURE_DETAILS.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Sparkles;
              return (
                <div
                  key={index}
                  className="bg-white border-2 rounded-2xl p-6 md:p-8 hover:shadow-lg transition"
                  style={{ borderColor: '#ffedd5' }}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <IconComponent size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-3" style={{ color: '#5d4037' }}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs font-bold text-gray-400 mb-1">フリープラン</div>
                          <div className="text-sm text-gray-600">{feature.freeComparison}</div>
                        </div>
                        <div className="rounded-xl p-3" style={{ backgroundColor: '#f3e8ff' }}>
                          <div className="text-xs font-bold text-purple-600 mb-1">プロプラン</div>
                          <div className="text-sm font-bold text-purple-800">{feature.proHighlight}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 今後追加予定 ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full mb-4">
              <Rocket size={18} />
              <span className="font-bold text-sm">Coming Soon</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#5d4037' }}>
              今後追加予定のPro専用機能
            </h2>
            <p className="text-gray-600 mt-4">
              プロプランをさらに強力にする新機能を続々開発中です。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {COMING_SOON_FEATURES.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Sparkles;
              return (
                <div
                  key={index}
                  className="bg-white border-2 rounded-2xl p-6 hover:shadow-lg transition relative overflow-hidden"
                  style={{ borderColor: '#ffedd5' }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-4">
                    <IconComponent size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#5d4037' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FAQ（プロプランに関する質問） ========== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#5d4037' }}>プロプランに関するよくある質問</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {PRICING_FAQ.map((faq, index) => (
              <div key={index} className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: '#ffedd5' }}>
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                    <span>Q. {faq.question}</span>
                    <span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#5d4037' }}>
            ビジネスの成長を、プロプランで加速させましょう
          </h2>
          <p className="text-gray-500 mb-8 text-sm">月額¥3,980 ・ いつでも解約OK</p>
          <button
            onClick={() => setShowProPlanModal(true)}
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold px-12 py-5 rounded-2xl transition shadow-xl hover:-translate-y-1 transform text-lg"
          >
            <Crown size={24} />
            プロプランに申し込む
          </button>
        </div>
      </section>

      <Footer
        setPage={navigateTo}
        user={user}
      />
    </div>
  );
}
