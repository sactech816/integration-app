'use client';

import { useState } from 'react';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import {
  Crown,
  X,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Zap,
  Star,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

// ========================================
// 型定義
// ========================================

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

export interface PlanLimitInfo {
  /** 表示するタイトル（例: 「ツール作成上限に達しました」） */
  title: string;
  /** 詳細メッセージ（例: 「フリープランでは診断クイズは1個まで作成できます」） */
  message: string;
  /** 現在の使用量（任意） */
  currentUsage?: number;
  /** 上限値（任意） */
  limit?: number;
  /** 推奨プラン（ハイライトするプラン） */
  recommendedPlan?: PlanKey;
}

export interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string; id?: string } | null;
  limitInfo: PlanLimitInfo;
}

// ========================================
// プラン定義
// ========================================

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
    badge: '事業者向け',
    price: 4980,
    icon: Crown,
    color: '#f97316',
    hoverColor: '#ea580c',
    bgLight: '#fffbf0',
    highlight: true,
    features: [
      '全ツール無制限作成',
      'テキストAI 50回/日 + 画像AI',
      'メルマガ・ステップメール 月500通',
      'ファネル・ゲーミフィケーション無制限',
      'コピーライト・広告非表示',
      '決済手数料0%',
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

export default function PlanLimitModal({ isOpen, onClose, user, limitInfo }: PlanLimitModalProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<PlanKey | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (plan: PlanInfo) => {
    if (!user?.id) {
      window.location.href = '/pricing';
      return;
    }

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

  // 推奨プランがあればそれをハイライト
  const displayPlans = limitInfo.recommendedPlan
    ? PLANS.map((p) => ({
        ...p,
        highlight: p.key === limitInfo.recommendedPlan,
      }))
    : PLANS;

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
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 py-5 flex justify-between items-center z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <h3 className="font-bold text-xl">{limitInfo.title}</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* 制限メッセージ */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <p className="text-gray-800 font-medium">{limitInfo.message}</p>
            {limitInfo.currentUsage !== undefined && limitInfo.limit !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>使用状況</span>
                  <span className="font-bold text-amber-700">
                    {limitInfo.currentUsage} / {limitInfo.limit === -1 ? '無制限' : limitInfo.limit}
                  </span>
                </div>
                {limitInfo.limit > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (limitInfo.currentUsage / limitInfo.limit) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* プランカード */}
          <p className="text-sm text-gray-600 mb-4 font-medium">
            アップグレードで制限を解除できます
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayPlans.map((plan) => {
              const Icon = plan.icon;
              const isProcessing = isProcessingPayment && processingPlan === plan.key;
              return (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl border-2 p-5 flex flex-col transition-all ${
                    plan.highlight ? 'shadow-lg scale-[1.02]' : 'shadow-md hover:shadow-lg'
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
                    <span className="font-bold text-lg text-gray-900">{plan.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 mb-3">{plan.badge}</span>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-gray-900">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">/月</span>
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={16} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

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

          {/* フッター: サポート誘導 + 注意書き */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
            <a
              href="https://makers.tokyo/support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              <HelpCircle size={16} />
              プランについてよく分からない方はサポートページへ
              <ExternalLink size={14} />
            </a>
            <p className="text-xs text-gray-500 text-center">
              税込 / いつでも解約可能 / Stripeによる安全な決済処理
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
