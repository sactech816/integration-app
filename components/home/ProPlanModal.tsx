'use client';

import { useState } from 'react';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import {
  Crown,
  X,
  Sparkles,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Zap,
  Star,
} from 'lucide-react';

interface ProPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string; id?: string } | null;
  onShowAuth: () => void;
}

type PlanKey = 'standard' | 'business' | 'premium';

interface PlanInfo {
  key: PlanKey;
  planId: string;
  name: string;
  badge: string;
  price: number;
  icon: typeof Zap;
  color: string;
  hoverColor: string;
  bgLight: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: PlanInfo[] = [
  {
    key: 'standard',
    planId: 'makers_standard_monthly',
    name: 'スタンダード',
    badge: '個人・副業向け',
    price: 1980,
    icon: Zap,
    color: '#3b82f6',
    hoverColor: '#2563eb',
    bgLight: '#eff6ff',
    features: [
      'フリープランの全機能',
      'AI利用（月30回）',
      'アクセス解析',
      'フォーム・ファネル拡張',
      'サムネイル5件 / エンタメ診断3件',
    ],
  },
  {
    key: 'business',
    planId: 'makers_business_monthly',
    name: 'ビジネス',
    badge: '事業者向け',
    price: 4980,
    icon: Crown,
    color: '#f97316',
    hoverColor: '#ea580c',
    bgLight: '#fffbf0',
    highlight: true,
    features: [
      'スタンダードの全機能',
      'AI無制限',
      'HTML / 埋め込み / 広告非表示',
      'ゲーミフィケーション（10件）',
      'メルマガ月1,000通',
      'お問い合わせ機能',
    ],
  },
  {
    key: 'premium',
    planId: 'makers_premium_monthly',
    name: 'プレミアム',
    badge: '法人・本格運用',
    price: 9800,
    icon: Star,
    color: '#8b5cf6',
    hoverColor: '#7c3aed',
    bgLight: '#f5f3ff',
    features: [
      'ビジネスの全機能',
      '全機能無制限',
      'メルマガ月5,000通',
      '優先サポート',
    ],
  },
];

export default function ProPlanModal({ isOpen, onClose, user, onShowAuth }: ProPlanModalProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<PlanKey | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (plan: PlanInfo) => {
    setIsProcessingPayment(true);
    setProcessingPlan(plan.key);
    try {
      const email = user?.email;
      const referralCode = getReferralCode();
      if (referralCode && email) {
        try {
          await fetch('/api/affiliate/pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              referralCode,
              service: 'makers',
              planTier: plan.key,
              planPeriod: 'monthly',
              userId: user?.id || null,
            }),
          });
        } catch (err) {
          console.warn('Failed to save pending affiliate:', err);
        }
      }
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.planId,
          userId: user?.id || null,
          email: email || null,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        alert('決済ページの準備中です。しばらくお待ちください。');
      }
    } catch (error) {
      console.error('決済エラー:', error);
      alert('決済の開始に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessingPayment(false);
      setProcessingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-orange-500 to-purple-600 text-white px-6 py-5 flex justify-between items-center z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Crown size={24} />
            <h3 className="font-bold text-xl">有料プランを選ぶ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* ログイン案内 */}
          {!user && (
            <div
              className="border rounded-2xl p-4 mb-6"
              style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}
            >
              <p className="text-sm" style={{ color: '#5d4037' }}>
                <span className="font-bold">ヒント：</span>
                ログインすると、購入履歴がアカウントに紐付けられます。
              </p>
              <button
                onClick={onShowAuth}
                className="mt-2 text-sm font-bold hover:underline"
                style={{ color: '#f97316' }}
              >
                ログイン / 新規登録はこちら →
              </button>
            </div>
          )}

          {/* プランカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isProcessing = isProcessingPayment && processingPlan === plan.key;
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
                  {/* 人気バッジ */}
                  {plan.highlight && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    >
                      <Sparkles size={12} className="inline mr-1" />
                      おすすめ
                    </div>
                  )}

                  {/* プラン名・バッジ */}
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={20} style={{ color: plan.color }} />
                    <span className="font-bold text-lg" style={{ color: '#1f2937' }}>
                      {plan.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mb-3">{plan.badge}</span>

                  {/* 価格 */}
                  <div className="mb-4">
                    <span className="text-3xl font-black" style={{ color: '#1f2937' }}>
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">/月</span>
                  </div>

                  {/* 機能リスト */}
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

                  {/* CTAボタン */}
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isProcessingPayment}
                    className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transform"
                    style={{ backgroundColor: plan.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = plan.hoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = plan.color)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        処理中...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        申し込む
                        <ExternalLink size={14} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* 単品購入案内 */}
          <div className="mt-6 text-center border-t border-gray-200 pt-5">
            <p className="text-sm text-gray-600">
              サブスク不要で個別機能だけ使いたい方は
              <span className="font-bold text-gray-800">単品購入</span>
              （¥300〜）もご利用いただけます。
            </p>
          </div>

          {/* 注意書き */}
          <p className="text-xs text-gray-500 text-center mt-4">
            税込 / いつでも解約可能 / Stripeによる安全な決済処理
          </p>
        </div>
      </div>
    </div>
  );
}
