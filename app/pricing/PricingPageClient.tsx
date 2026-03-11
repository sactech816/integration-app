'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ProPlanModal from '@/components/home/ProPlanModal';
import {
  Check,
  Crown,
  Sparkles,
  Rocket,
  Building2,
  ChevronRight,
} from 'lucide-react';
import {
  PLANS,
  PLAN_FEATURES,
  PLAN_DETAILS,
  COMING_SOON_FEATURES,
  PRICING_FAQ,
  type FeatureAvailability,
} from '@/constants/pricing';

// アイコン名からコンポーネントへのマッピング
import {
  Handshake,
  Share2,
  MessageCircle,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Handshake, Share2, MessageCircle, CalendarCheck, Sparkles,
};

export default function PricingPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('free');

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
    router.push(page === '/' || page === '' ? '/' : `/${page}`);
  };

  const handlePlanCta = (planId: string) => {
    if (planId === 'guest') router.push('/#create-section');
    else if (planId === 'free') setShowAuth(true);
    else setShowPlanModal(true);
  };

  const activeDetail = PLAN_DETAILS.find((d) => d.id === activeTab);

  // 機能の利用可否を表示
  const renderAvailability = (status: FeatureAvailability, note: string | undefined, planId: string) => {
    if (status === 'yes') {
      const color = (planId === 'business' || planId === 'premium') ? 'text-purple-500' : planId === 'free' ? 'text-orange-500' : 'text-lime-500';
      return note
        ? <span className={`text-xs font-bold ${color}`}>{note}</span>
        : <Check size={16} className={color} />;
    }
    if (status === 'limited') {
      const color = planId === 'free' ? 'text-orange-500' : planId === 'guest' ? 'text-gray-500' : 'text-gray-500';
      return <span className={`text-xs font-bold ${color}`}>{note || '制限あり'}</span>;
    }
    return <span className="text-gray-300 font-bold">×</span>;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffbf0' }}>
      <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} onNavigate={navigateTo} />
      <ProPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        user={user}
        onShowAuth={() => { setShowPlanModal(false); setShowAuth(true); }}
      />

      {/* ========== ヒーロー ========== */}
      <section className="pt-20 pb-12 text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
            <Crown size={18} />
            <span className="font-bold text-sm">料金プラン</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6" style={{ color: '#5d4037' }}>
            シンプルな料金、<br className="md:hidden" />必要な機能だけ
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            まずは無料で全ツールを体験。ビジネスの成長に合わせてプランをアップグレードできます。
          </p>
        </div>
      </section>

      {/* ========== 料金カード ========== */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto items-stretch">
            {PLANS.map((plan) => {
              const isGuest = plan.id === 'guest';
              const isFree = plan.id === 'free';
              const isPopular = plan.popular === true;
              const isPaid = plan.id === 'standard' || plan.id === 'business' || plan.id === 'premium';
              const isPremiumTier = plan.id === 'business' || plan.id === 'premium';
              const highlights = getHighlights(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-5 flex flex-col transition ${
                    isPopular ? 'border-4 bg-white shadow-xl' : isPremiumTier ? 'border-2 border-purple-200' : 'border-2 bg-white hover:shadow-lg'
                  }`}
                  style={{
                    borderColor: isPopular ? '#f97316' : isGuest ? '#ffedd5' : undefined,
                    backgroundColor: isPremiumTier ? '#fffbf0' : undefined,
                  }}
                >
                  <div className="mb-3 text-center">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${isPremiumTier ? 'bg-purple-100 text-purple-700' : ''}`}
                      style={!isPremiumTier ? { backgroundColor: isPopular ? '#ffedd5' : '#fffbf0', color: isPopular ? '#f97316' : '#5d4037' } : undefined}
                    >
                      {plan.badge}
                    </span>
                    <h3
                      className={`text-xl font-bold mt-2 ${isPremiumTier ? 'text-purple-800' : ''}`}
                      style={!isPremiumTier ? { color: isPopular ? '#f97316' : '#5d4037' } : undefined}
                    >
                      {plan.name}
                    </h3>
                    <div className="mt-1">
                      <span className="text-3xl font-bold" style={{ color: '#5d4037' }}>{plan.price}</span>
                      <span className="text-xs text-gray-500">{plan.priceUnit}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1 border-t pt-3" style={{ borderColor: '#ffedd5' }}>
                    {highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs font-bold" style={{ color: '#5d4037' }}>
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: isPopular ? '#f97316' : isPremiumTier ? '#8b5cf6' : '#84cc16' }} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setActiveTab(plan.id);
                      document.getElementById('plan-details')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center justify-center gap-1 transition"
                  >
                    詳しく見る <ChevronRight size={12} />
                  </button>

                  <button
                    onClick={() => handlePlanCta(plan.id)}
                    className={`block w-full py-2.5 px-4 font-bold text-center rounded-2xl transition text-sm ${
                      isPremiumTier ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md hover:-translate-y-1 transform'
                      : isPopular ? 'text-white shadow-md hover:-translate-y-1 transform'
                      : isPaid ? 'text-white shadow-md hover:-translate-y-1 transform'
                      : ''
                    }`}
                    style={
                      isPopular ? { backgroundColor: '#f97316' }
                      : isPaid && !isPremiumTier ? { backgroundColor: '#3b82f6', color: '#ffffff' }
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

      {/* ========== プラン詳細（タブ形式） ========== */}
      <section id="plan-details" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
              <Sparkles size={18} />
              <span className="font-bold text-sm">プラン詳細</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#5d4037' }}>各プランの詳しい内容</h2>
            <p className="text-gray-600 mt-3">タブを切り替えて、プランごとの機能をご確認ください。</p>
          </div>

          {/* タブ */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
            {PLAN_DETAILS.map((detail) => {
              const isActive = activeTab === detail.id;
              return (
                <button
                  key={detail.id}
                  onClick={() => setActiveTab(detail.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    isActive ? 'text-white shadow-lg scale-105' : 'bg-white border-2 hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: isActive ? detail.color : undefined,
                    borderColor: isActive ? detail.color : '#e5e7eb',
                    color: isActive ? '#ffffff' : '#5d4037',
                  }}
                >
                  {detail.name}
                </button>
              );
            })}
          </div>

          {/* タブコンテンツ */}
          {activeDetail && (
            <div className="max-w-4xl mx-auto bg-white rounded-3xl border-2 shadow-xl overflow-hidden" style={{ borderColor: activeDetail.color + '40' }}>
              <div className="px-6 md:px-8 py-6 border-b" style={{ backgroundColor: activeDetail.color + '10', borderColor: activeDetail.color + '30' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: activeDetail.color }}>
                    <Crown size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold" style={{ color: activeDetail.color }}>{activeDetail.name}</h4>
                    <p className="text-sm text-gray-600">{activeDetail.tagline}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {activeDetail.sections.map((section, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-5">
                      <h5 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#5d4037' }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeDetail.color }} />
                        {section.title}
                      </h5>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check size={14} className="mt-0.5 shrink-0" style={{ color: activeDetail.color }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* プランのCTA */}
                {activeDetail.id !== 'guest' && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => handlePlanCta(activeDetail.id)}
                      className="inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:-translate-y-0.5 transform transition-all text-sm"
                      style={{ backgroundColor: activeDetail.color }}
                    >
                      {activeDetail.id === 'free' ? '無料で登録する' : `${activeDetail.name}に申し込む`}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== 比較表 ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#5d4037' }}>全プラン比較表</h2>
            <p className="text-gray-600 mt-3">すべての機能を一覧で比較できます。</p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: '#ffedd5' }}>
              <thead>
                <tr style={{ backgroundColor: '#fffbf0' }}>
                  <th className="text-left px-4 py-4 text-sm font-bold" style={{ color: '#5d4037' }}>機能</th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="px-3 py-4 text-center text-sm font-bold" style={{ color: '#5d4037' }}>
                      <div>{plan.name}</div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{plan.price}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((feature, idx) => (
                  <tr key={feature.label} className={idx % 2 === 0 ? 'bg-white' : ''} style={idx % 2 !== 0 ? { backgroundColor: '#fffdf7' } : undefined}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#5d4037' }}>{feature.label}</td>
                    {PLANS.map((plan) => {
                      const status = feature[plan.id];
                      const noteKey = `${plan.id}Note` as keyof typeof feature;
                      const note = feature[noteKey] as string | undefined;
                      return (
                        <td key={plan.id} className="px-3 py-3 text-center">
                          {renderAvailability(status, note, plan.id)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== 今後追加予定 ========== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full mb-4">
              <Rocket size={18} />
              <span className="font-bold text-sm">Coming Soon</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#5d4037' }}>今後追加予定の機能</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {COMING_SOON_FEATURES.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Sparkles;
              return (
                <div key={index} className="bg-white border-2 rounded-2xl p-6 hover:shadow-lg transition relative overflow-hidden" style={{ borderColor: '#ffedd5' }}>
                  <div className="absolute top-3 right-3">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-3">
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#5d4037' }}>{feature.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#5d4037' }}>よくある質問</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {PRICING_FAQ.map((faq, index) => (
              <div key={index} className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: '#ffedd5' }}>
                <details className="group">
                  <summary className="flex justify-between items-center px-6 py-4 font-bold cursor-pointer select-none list-none text-sm" style={{ color: '#5d4037' }}>
                    <span>Q. {faq.question}</span>
                    <span className="transition group-open:rotate-180" style={{ color: '#f97316' }}>▼</span>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t pt-3" style={{ borderColor: '#ffedd5' }}>
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 法人向けバナー ========== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div
            className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border-2 p-8 md:p-10"
            style={{ borderColor: '#c4b5fd', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f5f3ff 100%)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 size={32} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold text-purple-900 mb-2">
                  法人向け — ツールカスタマイズのご相談
                </h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  自社ブランドでのツール提供、独自機能の開発、大規模導入のご相談など、
                  法人様のニーズに合わせたカスタマイズを承っております。
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/contact'}
                className="shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:-translate-y-0.5 transform transition-all text-sm flex items-center gap-2"
              >
                お問い合わせ
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-16" style={{ backgroundColor: '#fffbf0' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#5d4037' }}>
            まずは無料で、すべてのツールを体験
          </h2>
          <p className="text-gray-500 mb-8 text-sm">有料プランは月額¥1,980〜 ・ いつでも解約OK</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center justify-center gap-2 font-bold px-10 py-4 rounded-2xl transition shadow-lg hover:-translate-y-1 transform text-base"
              style={{ backgroundColor: '#f97316', color: '#ffffff' }}
            >
              無料で始める
            </button>
            <button
              onClick={() => setShowPlanModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold px-10 py-4 rounded-2xl transition shadow-lg hover:-translate-y-1 transform text-base"
            >
              <Crown size={20} />
              有料プランを見る
            </button>
          </div>
        </div>
      </section>

      <Footer setPage={navigateTo} user={user} />
    </div>
  );
}

/** プランごとのハイライト項目 */
function getHighlights(planId: string): string[] {
  switch (planId) {
    case 'guest':
      return [
        'プロフィール（1個）',
        'LP（1個）',
        '出欠表（無制限）',
        'スキルマーケット（無制限）',
        'ポータル掲載',
        'URL発行',
      ];
    case 'free':
      return [
        '全ツール各1個ずつ作成・編集',
        '（プロフィール / LP / 診断クイズ / 予約 / サイト 等20種以上）',
        '出欠表（無制限）',
        'スキルマーケット（無制限）',
        'フォームメーカー（無制限）',
        'アフィリエイト',
        'ポータル掲載',
        'SEO（AEO）対策',
        'URL発行',
      ];
    case 'standard':
      return [
        '全ツール各10個まで作成・編集',
        'テキストAI（10回/日）',
        'アクセス解析',
        'HTMLダウンロード',
        '埋め込みコード',
      ];
    case 'business':
      return [
        '全ツール無制限作成',
        'テキストAI（50回/日）',
        '画像AI（5回/日）',
        'メルマガ（月500通）',
        'ステップメール（月500通）',
        'ファネル（無制限）',
        'ゲーミフィケーション（無制限）',
        'コピーライト非表示',
        '広告枠非表示',
        '決済手数料 0%',
      ];
    case 'premium':
      return [
        'テキストAI（200回/日）',
        '画像AI（20回/日）',
        'メルマガ（月1,000通）',
        'ステップメール（月1,000通）',
        'Googleカレンダー連携',
        '優先サポート',
      ];
    default:
      return [];
  }
}
