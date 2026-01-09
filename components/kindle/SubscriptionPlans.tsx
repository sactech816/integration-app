'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Star, 
  ArrowRight, 
  Loader2, 
  Crown,
  AlertCircle,
  Zap,
  Rocket,
  Building2,
  MessageCircle
} from 'lucide-react';

// プランTier定義
type PlanTier = 'lite' | 'standard' | 'pro' | 'business' | 'enterprise';
type BillingPeriod = 'monthly' | 'yearly';

interface PlanDisplay {
  id: PlanTier;
  name: string;
  nameEn: string;
  monthlyPrice: number;
  yearlyPrice: number;
  aiLimit: string;
  aiModelDisplay: string;
  supportLevel: string;
  features: string[];
  popular: boolean;
  icon: React.ElementType;
  gradient: string;
}

interface SubscriptionPlansProps {
  onSubscribe?: (planId: PlanTier, period: BillingPeriod, email: string) => Promise<void>;
  userEmail?: string;
  currentPlan?: PlanTier | null;
  currentPeriod?: BillingPeriod | null;
  className?: string;
  /** 外部から価格を渡す場合（管理画面から取得した値など） */
  customPrices?: Record<PlanTier, { monthly: number; yearly: number }>;
}

// プラン情報
const PLANS: PlanDisplay[] = [
  {
    id: 'lite',
    name: 'ライト',
    nameEn: 'Lite',
    monthlyPrice: 2980,
    yearlyPrice: 29800,
    aiLimit: '20回/日',
    aiModelDisplay: '標準AI',
    supportLevel: 'メールサポート',
    features: [
      'AI執筆サポート（20回/日）',
      '標準AI',
      '書籍数無制限',
      'KDP形式エクスポート',
      'メールサポート',
    ],
    popular: false,
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'standard',
    name: 'スタンダード',
    nameEn: 'Standard',
    monthlyPrice: 4980,
    yearlyPrice: 49800,
    aiLimit: '50回/日',
    aiModelDisplay: '標準AI+',
    supportLevel: 'メール優先サポート',
    features: [
      'AI執筆サポート（50回/日）',
      '標準AI+',
      '書籍数無制限',
      'KDP形式エクスポート',
      'メール優先サポート',
    ],
    popular: true,
    icon: Star,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'pro',
    name: 'プロ',
    nameEn: 'Pro',
    monthlyPrice: 9800,
    yearlyPrice: 98000,
    aiLimit: '100回/日',
    aiModelDisplay: '高性能AI',
    supportLevel: 'チャットサポート',
    features: [
      'AI執筆サポート（100回/日）',
      '高性能AI',
      '書籍数無制限',
      'KDP形式エクスポート',
      'チャットサポート',
      '新機能の先行アクセス',
    ],
    popular: false,
    icon: Rocket,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'business',
    name: 'ビジネス',
    nameEn: 'Business',
    monthlyPrice: 29800,
    yearlyPrice: 298000,
    aiLimit: '無制限',
    aiModelDisplay: '最高性能AI',
    supportLevel: 'グルコン月1回',
    features: [
      'AI執筆サポート（無制限）',
      '最高性能AI',
      '書籍数無制限',
      'KDP形式エクスポート',
      'グループコンサル（月1回）',
      '優先サポート',
      '新機能の先行アクセス',
    ],
    popular: false,
    icon: Crown,
    gradient: 'from-emerald-500 to-teal-500',
  },
];

// UnivaPayリンク（環境変数から取得）
const getUnivaPayLink = (planId: PlanTier, period: BillingPeriod): string => {
  const links: Record<string, string> = {
    'lite_monthly': process.env.NEXT_PUBLIC_UNIVAPAY_LITE_MONTHLY_URL || '',
    'lite_yearly': process.env.NEXT_PUBLIC_UNIVAPAY_LITE_YEARLY_URL || '',
    'standard_monthly': process.env.NEXT_PUBLIC_UNIVAPAY_STANDARD_MONTHLY_URL || process.env.NEXT_PUBLIC_UNIVAPAY_MONTHLY_URL || '',
    'standard_yearly': process.env.NEXT_PUBLIC_UNIVAPAY_STANDARD_YEARLY_URL || process.env.NEXT_PUBLIC_UNIVAPAY_YEARLY_URL || '',
    'pro_monthly': process.env.NEXT_PUBLIC_UNIVAPAY_PRO_MONTHLY_URL || '',
    'pro_yearly': process.env.NEXT_PUBLIC_UNIVAPAY_PRO_YEARLY_URL || '',
    'business_monthly': process.env.NEXT_PUBLIC_UNIVAPAY_BUSINESS_MONTHLY_URL || '',
    'business_yearly': process.env.NEXT_PUBLIC_UNIVAPAY_BUSINESS_YEARLY_URL || '',
  };
  return links[`${planId}_${period}`] || '';
};

export default function SubscriptionPlans({
  onSubscribe,
  userEmail,
  currentPlan,
  currentPeriod,
  className = '',
  customPrices,
}: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [email, setEmail] = useState(userEmail || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // カスタム価格があれば適用
  const getPrice = (plan: PlanDisplay, period: BillingPeriod): number => {
    if (customPrices && customPrices[plan.id]) {
      return period === 'yearly' ? customPrices[plan.id].yearly : customPrices[plan.id].monthly;
    }
    return period === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  // 年間プランの割引率を計算
  const getDiscount = (plan: PlanDisplay): number => {
    const monthlyTotal = getPrice(plan, 'monthly') * 12;
    const yearlyPrice = getPrice(plan, 'yearly');
    return Math.round((1 - yearlyPrice / monthlyTotal) * 100);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError('プランを選択してください');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setError('');
    setIsProcessing(true);

    if (onSubscribe) {
      try {
        await onSubscribe(selectedPlan, billingPeriod, email);
      } catch (err: any) {
        setError(err.message || '処理中にエラーが発生しました');
        setIsProcessing(false);
      }
    } else {
      // UnivaPayリンクフォームにリダイレクト
      const baseUrl = getUnivaPayLink(selectedPlan, billingPeriod);
      
      if (!baseUrl) {
        setError('決済リンクが設定されていません。お問い合わせください。');
        setIsProcessing(false);
        return;
      }

      const params = new URLSearchParams({
        email: email,
      });
      
      window.location.href = `${baseUrl}?${params.toString()}`;
    }
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className={`${className}`}>
      {/* 月額/年額切り替え */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg border border-gray-200">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            月額プラン
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            年額プラン
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              お得
            </span>
          </button>
        </div>
      </div>

      {/* プラン選択 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isCurrent = currentPlan === plan.id && currentPeriod === billingPeriod;
          const price = getPrice(plan, billingPeriod);
          const discount = getDiscount(plan);
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              onClick={() => !isCurrent && setSelectedPlan(plan.id)}
              className={`relative bg-white rounded-2xl p-5 shadow-lg border-2 transition-all cursor-pointer ${
                isCurrent
                  ? 'border-green-400 bg-green-50 cursor-default'
                  : isSelected
                    ? 'border-amber-400 shadow-xl scale-[1.02]'
                    : 'border-gray-100 hover:border-amber-200 hover:shadow-xl'
              }`}
            >
              {/* 人気バッジ */}
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    <Star size={12} fill="currentColor" />
                    人気No.1
                  </span>
                </div>
              )}

              {/* 現在のプランバッジ */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    <Check size={12} />
                    現在のプラン
                  </span>
                </div>
              )}

              {/* プランアイコン */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} mb-4`}>
                <Icon size={24} className="text-white" />
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.nameEn}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-gray-900">
                    ¥{price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm mb-1">
                    /{billingPeriod === 'yearly' ? '年' : '月'}
                  </span>
                </div>
                {billingPeriod === 'yearly' && discount > 0 && (
                  <div className="mt-1">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                      {discount}%オフ
                    </span>
                  </div>
                )}
              </div>

              {/* AI情報 */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI回数</span>
                  <span className="font-bold text-gray-900">{plan.aiLimit}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">AIモデル</span>
                  <span className="font-bold text-amber-600">{plan.aiModelDisplay}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-xs text-gray-500 pl-5">
                    +{plan.features.length - 4}件の機能
                  </li>
                )}
              </ul>

              {/* 選択インジケーター */}
              {!isCurrent && (
                <div className={`py-2 text-center rounded-lg font-bold text-sm ${
                  isSelected
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {isSelected ? '✓ 選択中' : '選択する'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* エンタープライズプラン */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <Building2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  エンタープライズ
                </h3>
                <p className="text-gray-300 text-sm">
                  大規模利用・チーム利用・カスタム機能をご希望の方
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">要相談</p>
                <p className="text-xs text-gray-400">カスタムAI環境・専任サポート</p>
              </div>
              <a
                href="/contact?subject=KDLエンタープライズプランについて"
                className="inline-flex items-center gap-2 bg-white text-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <MessageCircle size={18} />
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* メールアドレス入力 & 申し込みボタン */}
      {!currentPlan && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                決済完了通知とアカウント情報をお送りします
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={isProcessing || !selectedPlan}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
                isProcessing || !selectedPlan
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  処理中...
                </>
              ) : (
                <>
                  <Crown size={20} />
                  {selectedPlanData 
                    ? `${selectedPlanData.name}プラン（${billingPeriod === 'yearly' ? '年額' : '月額'}）を申し込む` 
                    : 'プランを選択してください'}
                  {selectedPlan && <ArrowRight size={18} />}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              お支払いはUnivaPayで安全に処理されます<br />
              いつでも解約可能です
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
