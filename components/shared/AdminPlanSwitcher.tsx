'use client';

import { useState } from 'react';
import { Settings, Crown } from 'lucide-react';
import type { PlanTier } from '@/lib/subscription';

interface AdminPlanSwitcherProps {
  currentPlan: PlanTier;
  onPlanChange: (plan: PlanTier) => void;
}

const PLAN_LABELS: Record<PlanTier, string> = {
  none: 'なし',
  lite: 'Lite (¥2,980)',
  standard: 'Standard (¥4,980)',
  pro: 'Pro (¥9,800)',
  business: 'Business (¥29,800)',
  enterprise: 'Enterprise',
};

const PLAN_COLORS: Record<PlanTier, string> = {
  none: 'bg-gray-100 text-gray-700 border-gray-300',
  lite: 'bg-blue-50 text-blue-700 border-blue-300',
  standard: 'bg-green-50 text-green-700 border-green-300',
  pro: 'bg-purple-50 text-purple-700 border-purple-300',
  business: 'bg-amber-50 text-amber-700 border-amber-300',
  enterprise: 'bg-red-50 text-red-700 border-red-300',
};

/**
 * 管理者用プラン切り替えコンポーネント
 * 管理者が全プランを試せるようにKindleページで表示
 */
export default function AdminPlanSwitcher({ currentPlan, onPlanChange }: AdminPlanSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const testablePlans: PlanTier[] = ['lite', 'standard', 'pro', 'business'];

  const handlePlanChange = (plan: PlanTier) => {
    onPlanChange(plan);
    
    // LocalStorageに保存（ページリロード時に復元）
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminTestPlan', plan);
    }
    
    setIsOpen(false);
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
        <div className="space-y-3">
          <p className="text-xs text-amber-700">
            <Settings size={12} className="inline mr-1" />
            全プランのAIモード選択とクレジット上限を体験できます。実際の課金は発生しません。
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {testablePlans.map((plan) => (
              <button
                key={plan}
                onClick={() => handlePlanChange(plan)}
                className={`
                  px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all
                  ${currentPlan === plan
                    ? 'ring-2 ring-amber-500 shadow-lg scale-105'
                    : 'hover:scale-102'
                  }
                  ${PLAN_COLORS[plan]}
                `}
              >
                <div className="text-center">
                  <div className="font-bold">{PLAN_LABELS[plan].split(' ')[0]}</div>
                  <div className="text-xs opacity-75 mt-0.5">
                    {PLAN_LABELS[plan].includes('¥') 
                      ? PLAN_LABELS[plan].split(' ')[1]
                      : ''
                    }
                  </div>
                </div>
                {currentPlan === plan && (
                  <div className="mt-1 flex justify-center">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 現在のプラン情報 */}
          <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs">
            <div className="font-semibold text-amber-900 mb-2">
              現在の体験プラン: {PLAN_LABELS[currentPlan]}
            </div>
            <div className="space-y-1 text-gray-600">
              {currentPlan === 'lite' && (
                <>
                  <div>• AI使用: 20回/日（Standard枠のみ）</div>
                  <div>• モード選択: 不可</div>
                  <div>• モデル: Gemini Flash限定</div>
                </>
              )}
              {currentPlan === 'standard' && (
                <>
                  <div>• AI使用: 30回/日（Standard枠のみ）</div>
                  <div>• モード選択: 不可</div>
                  <div>• モデル: Gemini Flash / Claude Haiku</div>
                </>
              )}
              {currentPlan === 'pro' && (
                <>
                  <div>• AI使用: 100回/日（Premium 20回 + Standard 80回）</div>
                  <div>• モード選択: 可能</div>
                  <div>• ハイクオリティ: Claude/OpenAI o3-mini</div>
                  <div>• スピード: Gemini Flash</div>
                </>
              )}
              {currentPlan === 'business' && (
                <>
                  <div>• AI使用: 無制限（Premium 50回 + Standard 無制限）</div>
                  <div>• モード選択: 可能</div>
                  <div>• ハイクオリティ: Claude Sonnet / OpenAI o1</div>
                  <div>• スピード: Gemini Flash（無制限）</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="text-xs text-amber-700">
          現在の体験プラン: <span className="font-bold">{PLAN_LABELS[currentPlan]}</span>
        </div>
      )}
    </div>
  );
}

