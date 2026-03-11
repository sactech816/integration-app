'use client';

import { useState } from 'react';
import { Check, Building2, ChevronRight } from 'lucide-react';
import { useHomeAuth } from './HomeAuthContext';
import { PLANS, PLAN_DETAILS } from '@/constants/pricing';

export default function PricingSection() {
  const { setShowAuth, setShowProPlanModal } = useHomeAuth();
  const [activeTab, setActiveTab] = useState<string>('free');

  const navigateTo = (page: string) => {
    if (page === 'create') {
      document.getElementById('create-section-services')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${page}`;
    }
  };

  const activeDetail = PLAN_DETAILS.find((d) => d.id === activeTab);

  return (
    <section id="create-section" className="py-24 border-t" style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}>
      <div className="container mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#5d4037' }}>わかりやすい料金プラン</h2>
          <p className="text-gray-600">まずは無料で、すべてのツールをお試しいただけます。</p>
        </div>

        {/* ===== 料金カード（簡潔版） ===== */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto items-stretch mb-16">
          {PLANS.map((plan) => {
            const isGuest = plan.id === 'guest';
            const isFree = plan.id === 'free';
            const isPopular = plan.popular === true;
            const isPaid = plan.id === 'standard' || plan.id === 'business' || plan.id === 'premium';
            const isPremiumTier = plan.id === 'business' || plan.id === 'premium';

            const handleCta = () => {
              if (isGuest) navigateTo('create');
              else if (isFree) setShowAuth(true);
              else setShowProPlanModal(true);
            };

            // 各プランのハイライト項目
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
                {/* バッジ・名前・価格 */}
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

                {/* ハイライト */}
                <ul className="space-y-1.5 mb-4 flex-1 border-t pt-3" style={{ borderColor: '#ffedd5' }}>
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs font-bold" style={{ color: '#5d4037' }}>
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: isPopular ? '#f97316' : isPremiumTier ? '#8b5cf6' : '#84cc16' }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                {/* 詳しく見るリンク */}
                <button
                  onClick={() => {
                    setActiveTab(plan.id);
                    document.getElementById('plan-details')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center justify-center gap-1 transition"
                >
                  詳しく見る <ChevronRight size={12} />
                </button>

                {/* CTA */}
                <button
                  onClick={handleCta}
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

        {/* ===== プラン詳細（タブ形式） ===== */}
        <div id="plan-details" className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold" style={{ color: '#5d4037' }}>プラン内容を詳しく見る</h3>
            <p className="text-gray-500 text-sm mt-2">タブを切り替えて、各プランの詳細をご確認ください。</p>
          </div>

          {/* タブ */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {PLAN_DETAILS.map((detail) => {
              const isActive = activeTab === detail.id;
              return (
                <button
                  key={detail.id}
                  onClick={() => setActiveTab(detail.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? 'text-white shadow-md scale-105'
                      : 'bg-white border-2 hover:shadow-md'
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
            <div className="bg-white rounded-3xl border-2 shadow-lg overflow-hidden" style={{ borderColor: activeDetail.color + '40' }}>
              {/* ヘッダー */}
              <div className="px-6 py-5 border-b" style={{ backgroundColor: activeDetail.color + '10', borderColor: activeDetail.color + '30' }}>
                <h4 className="text-xl font-bold" style={{ color: activeDetail.color }}>
                  {activeDetail.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{activeDetail.tagline}</p>
              </div>

              {/* セクション */}
              <div className="p-6 space-y-6">
                {activeDetail.sections.map((section, idx) => (
                  <div key={idx}>
                    <h5 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#5d4037' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeDetail.color }} />
                      {section.title}
                    </h5>
                    <ul className="space-y-2 pl-4">
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
            </div>
          )}
        </div>

        {/* ===== 法人向けカスタマイズバナー ===== */}
        <div className="max-w-4xl mx-auto mt-16">
          <div
            className="relative overflow-hidden rounded-3xl border-2 p-8 md:p-10"
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
                  法人様のニーズに合わせたカスタマイズを承っております。まずはお気軽にお問い合わせください。
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
      </div>
    </section>
  );
}

/** プランごとのハイライト項目（簡潔な料金カード用） */
function getHighlights(planId: string): string[] {
  switch (planId) {
    case 'guest':
      return [
        'プロフィール・LP 各1個',
        '出欠表・スキルマーケット無制限',
        'ポータル掲載・URL発行',
      ];
    case 'free':
      return [
        '全ツール各1個ずつ作成・編集',
        '出欠表・スキルマーケット・フォーム無制限',
        'アフィリエイト',
        'ポータル掲載・SEO対策・URL発行',
      ];
    case 'standard':
      return [
        '全ツール各10個まで',
        'テキストAI 10回/日',
        'アクセス解析',
        'HTMLダウンロード・埋め込みコード',
      ];
    case 'business':
      return [
        '全ツール無制限作成',
        'テキストAI 50回/日 + 画像AI',
        'メルマガ・ステップメール 月500通',
        'ファネル・ゲーミフィケーション無制限',
        'コピーライト・広告非表示',
        '決済手数料0%',
      ];
    case 'premium':
      return [
        'テキストAI 200回/日 + 画像AI 20回/日',
        'メルマガ・ステップメール 月2,000通',
        'Googleカレンダー連携',
        '優先サポート',
      ];
    default:
      return [];
  }
}
