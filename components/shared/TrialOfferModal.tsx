'use client';

import { useState } from 'react';
import {
  X,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Zap,
  Crown,
  Star,
  Gift,
  Sparkles,
} from 'lucide-react';

// ========================================
// 型定義
// ========================================

type PlanKey = 'standard' | 'business' | 'premium';

interface TrialPlanInfo {
  key: PlanKey;
  planId: string;
  name: string;
  badge: string;
  originalPrice: number;
  icon: typeof Zap;
  color: string;
  hoverColor: string;
  bgLight: string;
  features: string[];
  highlight?: boolean;
}

interface TrialSettings {
  trialPrice: number;
  trialMessage: string;
  targetPlans: string[];
  stripeCouponIds: Record<string, string>;
}

export interface TrialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string; id?: string } | null;
  settings: TrialSettings;
  source?: 'auto' | 'admin' | 'email';
}

// ========================================
// プラン定義
// ========================================

const ALL_PLANS: TrialPlanInfo[] = [
  {
    key: 'standard',
    planId: 'makers_standard_monthly',
    name: 'スタンダード',
    badge: '個人・副業向け',
    originalPrice: 1980,
    icon: Zap,
    color: '#3b82f6',
    hoverColor: '#2563eb',
    bgLight: '#eff6ff',
    features: [
      '全ツール各10個まで作成',
      'テキストAI 10回/日',
      'アクセス解析',
      'HTMLダウンロード・埋め込みコード',
    ],
  },
  {
    key: 'business',
    planId: 'makers_business_monthly',
    name: 'ビジネス',
    badge: '一番人気',
    originalPrice: 4980,
    icon: Crown,
    color: '#f97316',
    hoverColor: '#ea580c',
    bgLight: '#fffbf0',
    highlight: true,
    features: [
      '全ツール無制限作成',
      'テキストAI 50回/日 + 画像AI',
      'メルマガ・ステップメール 月500通',
      'ゲーミフィケーション無制限',
      'コピーライト・広告非表示',
    ],
  },
  {
    key: 'premium',
    planId: 'makers_premium_monthly',
    name: 'プレミアム',
    badge: '法人・本格運用',
    originalPrice: 9800,
    icon: Star,
    color: '#8b5cf6',
    hoverColor: '#7c3aed',
    bgLight: '#f5f3ff',
    features: [
      'テキストAI 200回/日 + 画像AI 20回/日',
      'メルマガ・ステップメール 月1,000通',
      'Googleカレンダー連携',
      '優先サポート',
    ],
  },
];

// ========================================
// コンポーネント
// ========================================

export default function TrialOfferModal({
  isOpen,
  onClose,
  user,
  settings,
  source = 'auto',
}: TrialOfferModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<PlanKey | null>(null);

  if (!isOpen) return null;

  // 対象プランのみ表示
  const displayPlans = ALL_PLANS.filter((p) =>
    settings.targetPlans.includes(p.key)
  );

  const handleTrialCheckout = async (plan: TrialPlanInfo) => {
    if (!user?.id) {
      window.location.href = '/pricing';
      return;
    }

    setIsProcessing(true);
    setProcessingPlan(plan.key);

    try {
      const response = await fetch('/api/trial/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.planId,
          userId: user.id,
          email: user.email || null,
          source,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Trial checkout error:', error);
      alert('お試し申し込みに失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-6 py-5 flex justify-between items-center z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Gift size={24} />
            <div>
              <h3 className="font-bold text-xl">お試しキャンペーン</h3>
              <p className="text-white/80 text-sm">
                初月わずか¥{settings.trialPrice.toLocaleString()}で有料プランをお試し
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* キャンペーンメッセージ */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-800 font-medium">{settings.trialMessage}</p>
                <p className="text-sm text-gray-600 mt-1">
                  2ヶ月目からは通常料金になります。いつでも解約可能です。
                </p>
              </div>
            </div>
          </div>

          {/* プランカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayPlans.map((plan) => {
              const Icon = plan.icon;
              const isThisProcessing = isProcessing && processingPlan === plan.key;
              const hasCoupon = !!settings.stripeCouponIds[plan.key];

              return (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl border-2 p-5 flex flex-col transition-all ${
                    plan.highlight
                      ? 'shadow-lg scale-[1.02]'
                      : 'shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    borderColor: plan.highlight ? plan.color : '#e5e7eb',
                    backgroundColor: plan.bgLight,
                  }}
                >
                  {plan.highlight && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: plan.color }}
                    >
                      <Star size={12} />
                      おすすめ
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={20} style={{ color: plan.color }} />
                    <span className="font-bold text-lg text-gray-900">
                      {plan.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mb-3">{plan.badge}</span>

                  {/* 価格表示: お試し価格 + 取り消し線の通常価格 */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-600">
                        ¥{settings.trialPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">/初月</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400 line-through">
                        ¥{plan.originalPrice.toLocaleString()}/月
                      </span>
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        {Math.round(
                          ((plan.originalPrice - settings.trialPrice) /
                            plan.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      2ヶ月目〜 ¥{plan.originalPrice.toLocaleString()}/月
                    </p>
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={{ color: plan.color }}
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleTrialCheckout(plan)}
                    disabled={isProcessing || !hasCoupon}
                    className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transform"
                    style={{
                      backgroundColor: hasCoupon ? plan.color : '#9ca3af',
                    }}
                    onMouseEnter={(e) => {
                      if (hasCoupon)
                        e.currentTarget.style.backgroundColor = plan.hoverColor;
                    }}
                    onMouseLeave={(e) => {
                      if (hasCoupon)
                        e.currentTarget.style.backgroundColor = plan.color;
                    }}
                  >
                    {isThisProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        処理中...
                      </>
                    ) : !hasCoupon ? (
                      '準備中'
                    ) : (
                      <>
                        <CreditCard size={18} />
                        ¥{settings.trialPrice.toLocaleString()}でお試し
                        <ExternalLink size={14} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* フッター */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <p className="text-xs text-gray-500 text-center">
              税込 / いつでも解約可能 / Stripeによる安全な決済処理
            </p>
            <p className="text-xs text-gray-400 text-center">
              お試し期間終了後は自動的に通常料金に切り替わります
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
