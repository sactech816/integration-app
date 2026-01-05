'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Star, 
  ArrowRight, 
  Loader2, 
  Crown,
  AlertCircle
} from 'lucide-react';

interface Plan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  period: string;
  originalPrice?: number;
  discount?: string;
  description: string;
  features: string[];
  popular: boolean;
}

interface SubscriptionPlansProps {
  onSubscribe?: (planId: 'monthly' | 'yearly', email: string) => Promise<void>;
  userEmail?: string;
  currentPlan?: 'monthly' | 'yearly' | null;
  className?: string;
  /** 外部から価格を渡す場合（管理画面から取得した値など） */
  customPrices?: { monthly: number; yearly: number };
}

// デフォルト料金設定（DBから取得できない場合のフォールバック）
const DEFAULT_PRICES = {
  monthly: 4980,
  yearly: 39800,
};

// プランの基本情報（価格以外）
const PLAN_INFO = {
  monthly: {
    name: '月額プラン',
    period: '/月',
    description: 'まずは試してみたい方に',
    features: [
      'AIによる目次自動生成',
      'AI執筆サポート（1日50回）',
      '書籍数無制限',
      'KDP形式エクスポート',
      '出版準備ガイド',
      'メールサポート',
    ],
    popular: false,
  },
  yearly: {
    name: '年間プラン',
    period: '/年',
    description: '本気で作家活動を続けたい方に',
    features: [
      '月額プランの全機能',
      'AI使用回数が2倍（1日100回）',
      '年間で約2万円お得',
      '優先サポート',
      '新機能の先行アクセス',
      'コミュニティアクセス（予定）',
    ],
    popular: true,
  },
};

// 価格からプラン情報を生成
const buildPlans = (prices: { monthly: number; yearly: number }): Plan[] => {
  const monthlyPrice = prices.monthly;
  const yearlyPrice = prices.yearly;
  const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12);
  const discountPercent = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  return [
    {
      id: 'monthly',
      ...PLAN_INFO.monthly,
      price: monthlyPrice,
    },
    {
      id: 'yearly',
      ...PLAN_INFO.yearly,
      price: yearlyPrice,
      originalPrice: monthlyPrice * 12,
      discount: `約${discountPercent}%オフ！`,
    },
  ];
};

export default function SubscriptionPlans({
  onSubscribe,
  userEmail,
  currentPlan,
  className = '',
  customPrices,
}: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [email, setEmail] = useState(userEmail || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // 価格を決定（カスタム価格 > デフォルト価格）
  const prices = customPrices || DEFAULT_PRICES;
  const PLANS = buildPlans(prices);

  // UnivaPay リンクフォームURL
  const UNIVAPAY_LINKS = {
    monthly: process.env.NEXT_PUBLIC_UNIVAPAY_MONTHLY_URL || 'https://univa.cc/M6-JZs',
    yearly: process.env.NEXT_PUBLIC_UNIVAPAY_YEARLY_URL || 'https://univa.cc/NAXogx',
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
        await onSubscribe(selectedPlan, email);
      } catch (err: any) {
        setError(err.message || '処理中にエラーが発生しました');
        setIsProcessing(false);
      }
    } else {
      // UnivaPayリンクフォームにリダイレクト
      const baseUrl = UNIVAPAY_LINKS[selectedPlan];
      
      // メールアドレスをクエリパラメータとして追加（UnivaPayが対応している場合）
      const params = new URLSearchParams({
        email: email,
        // 成功時のリダイレクト先を指定（UnivaPayの設定で対応している場合）
      });
      
      // リンクフォームに遷移
      window.location.href = `${baseUrl}?${params.toString()}`;
    }
  };

  return (
    <div className={`${className}`}>
      {/* プラン選択 */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => !isCurrent && setSelectedPlan(plan.id)}
              className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all cursor-pointer ${
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
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    <Star size={14} fill="currentColor" />
                    おすすめ
                  </span>
                </div>
              )}

              {/* 現在のプランバッジ */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    <Check size={14} />
                    現在のプラン
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>

                <div className="flex items-end justify-center gap-1 mt-4">
                  <span className="text-4xl font-black text-gray-900">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 mb-1">{plan.period}</span>
                </div>

                {plan.originalPrice && (
                  <div className="mt-2">
                    <span className="text-gray-400 line-through text-sm">
                      ¥{plan.originalPrice.toLocaleString()}
                    </span>
                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                      {plan.discount}
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 選択インジケーター */}
              {!isCurrent && (
                <div className={`mt-4 py-2 text-center rounded-lg font-bold text-sm ${
                  isSelected
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {isSelected ? '✓ 選択中' : 'クリックして選択'}
                </div>
              )}
            </div>
          );
        })}
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
                  {selectedPlan ? `${PLANS.find(p => p.id === selectedPlan)?.name}を申し込む` : 'プランを選択してください'}
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


