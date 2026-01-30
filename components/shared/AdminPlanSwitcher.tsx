'use client';

import { useState } from 'react';
import { Settings, Crown, Zap, BookOpen } from 'lucide-react';
import type { PlanTier } from '@/lib/subscription';
import { PLAN_DEFINITIONS } from '@/lib/subscription';

// 初回プランを含む拡張型
type ExtendedPlanTier = PlanTier | 'initial_trial' | 'initial_standard' | 'initial_business';

interface AdminPlanSwitcherProps {
  currentPlan: ExtendedPlanTier;
  onPlanChange: (plan: ExtendedPlanTier) => void;
}

// 初回プラン定義
const INITIAL_PLAN_DEFINITIONS = {
  initial_trial: {
    name: 'トライアル',
    nameJa: 'トライアル',
    price: 49800,
    priceDisplay: '¥49,800',
    premiumCreditsDaily: 0,
    standardCreditsDaily: 30,
    description: '初めての方向け。基本機能で1冊完成',
  },
  initial_standard: {
    name: 'スタンダード',
    nameJa: 'スタンダード',
    price: 99800,
    priceDisplay: '¥99,800',
    premiumCreditsDaily: 10,
    standardCreditsDaily: 50,
    description: '本格執筆向け。高品質AIも利用可能',
  },
  initial_business: {
    name: 'ビジネス',
    nameJa: 'ビジネス',
    price: 198000,
    priceDisplay: '¥198,000',
    premiumCreditsDaily: 30,
    standardCreditsDaily: 100,
    description: 'プロ向け。最高性能AIで複数冊執筆',
  },
};

const PLAN_LABELS: Record<ExtendedPlanTier, string> = {
  none: 'なし',
  // 継続プラン
  lite: 'Lite (¥2,980/月)',
  standard: 'Standard (¥4,980/月)',
  pro: 'Pro (¥9,800/月)',
  business: 'Business (¥29,800/月)',
  enterprise: 'Enterprise',
  // 初回プラン
  initial_trial: 'トライアル (¥49,800)',
  initial_standard: 'スタンダード (¥99,800)',
  initial_business: 'ビジネス (¥198,000)',
};

const PLAN_COLORS: Record<ExtendedPlanTier, string> = {
  none: 'bg-gray-100 text-gray-700 border-gray-300',
  // 継続プラン
  lite: 'bg-blue-50 text-blue-700 border-blue-300',
  standard: 'bg-green-50 text-green-700 border-green-300',
  pro: 'bg-purple-50 text-purple-700 border-purple-300',
  business: 'bg-amber-50 text-amber-700 border-amber-300',
  enterprise: 'bg-red-50 text-red-700 border-red-300',
  // 初回プラン
  initial_trial: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  initial_standard: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  initial_business: 'bg-orange-50 text-orange-700 border-orange-300',
};

/**
 * 管理者用プラン切り替えコンポーネント
 * 管理者が全プランを試せるようにKindleページで表示
 * 初回プラン（一括）と継続プラン（月額）の両方に対応
 */
export default function AdminPlanSwitcher({ currentPlan, onPlanChange }: AdminPlanSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 初回プラン（一括購入）
  const initialPlans: ExtendedPlanTier[] = ['initial_trial', 'initial_standard', 'initial_business'];
  // 継続プラン（月額）
  const continuationPlans: ExtendedPlanTier[] = ['lite', 'standard', 'pro', 'business'];

  const handlePlanChange = (plan: ExtendedPlanTier) => {
    onPlanChange(plan);
    
    // LocalStorageに保存（ページリロード時に復元）
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminTestPlan', plan);
    }
    
    setIsOpen(false);
  };

  // プラン情報を取得（継続プラン or 初回プラン）
  const getPlanInfo = (plan: ExtendedPlanTier) => {
    if (plan.startsWith('initial_')) {
      const initialPlan = INITIAL_PLAN_DEFINITIONS[plan as keyof typeof INITIAL_PLAN_DEFINITIONS];
      return {
        premiumCredits: initialPlan.premiumCreditsDaily,
        standardCredits: initialPlan.standardCreditsDaily,
        description: initialPlan.description,
        isInitial: true,
      };
    }
    const continuationPlan = PLAN_DEFINITIONS[plan as PlanTier];
    return {
      premiumCredits: continuationPlan?.premiumCreditsDaily || 0,
      standardCredits: continuationPlan?.standardCreditsDaily || 0,
      description: continuationPlan?.features?.[0] || '',
      isInitial: false,
    };
  };

  // 初回プランかどうか判定
  const isInitialPlan = currentPlan.startsWith('initial_');
  const currentPlanInfo = getPlanInfo(currentPlan);

  // プランボタンを描画
  const renderPlanButton = (plan: ExtendedPlanTier) => {
    const label = PLAN_LABELS[plan];
    const name = label.split(' ')[0];
    const priceMatch = label.match(/\(([^)]+)\)/);
    const price = priceMatch ? priceMatch[1] : '';
    
    return (
      <button
        key={plan}
        onClick={() => handlePlanChange(plan)}
        className={`
          px-3 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all
          ${currentPlan === plan
            ? 'ring-2 ring-amber-500 shadow-lg scale-105'
            : 'hover:scale-102'
          }
          ${PLAN_COLORS[plan]}
        `}
      >
        <div className="text-center">
          <div className="font-bold text-sm">{name}</div>
          <div className="text-xs opacity-75 mt-0.5">{price}</div>
        </div>
        {currentPlan === plan && (
          <div className="mt-1 flex justify-center">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown className="text-amber-600" size={20} />
          <h3 className="text-sm font-bold text-amber-900">管理者モード：プラン体験切り替え</h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full hover:bg-amber-700 transition-colors"
        >
          {isOpen ? '閉じる' : '切り替え'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <p className="text-xs text-amber-700">
            <Settings size={12} className="inline mr-1" />
            全プランのAIモード選択とクレジット上限を体験できます。実際の課金は発生しません。
          </p>

          {/* 初回プラン（一括購入） */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-cyan-600" />
              <span className="text-xs font-bold text-gray-700">初回プラン（一括購入）</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {initialPlans.map(renderPlanButton)}
            </div>
          </div>

          {/* 継続プラン（月額） */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-gray-700">継続プラン（月額）</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {continuationPlans.map(renderPlanButton)}
            </div>
          </div>

          {/* 現在のプラン情報 */}
          <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs">
            <div className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              現在の体験プラン: {PLAN_LABELS[currentPlan]}
              {isInitialPlan && (
                <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded text-[10px]">初回</span>
              )}
              {!isInitialPlan && currentPlan !== 'none' && (
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px]">継続</span>
              )}
            </div>
            <div className="space-y-1 text-gray-600">
              {/* 動的にプラン情報を表示 */}
              {currentPlan !== 'none' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-purple-600">Premium枠:</span>
                    <span>{currentPlanInfo.premiumCredits > 0 ? `${currentPlanInfo.premiumCredits}回/日` : 'なし'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">Standard枠:</span>
                    <span>
                      {currentPlanInfo.standardCredits === -1 
                        ? '無制限' 
                        : `${currentPlanInfo.standardCredits}回/日`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">モード選択:</span>
                    <span>{currentPlanInfo.premiumCredits > 0 ? '可能（高品質/高速）' : '不可（高速のみ）'}</span>
                  </div>
                  {currentPlanInfo.description && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-gray-500">
                      {currentPlanInfo.description}
                    </div>
                  )}
                </>
              )}
              {currentPlan === 'none' && (
                <div>プランが選択されていません</div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="text-xs text-amber-700 flex items-center gap-2">
          現在の体験プラン: <span className="font-bold">{PLAN_LABELS[currentPlan]}</span>
          {isInitialPlan && (
            <span className="bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded text-[10px]">初回</span>
          )}
        </div>
      )}
    </div>
  );
}

