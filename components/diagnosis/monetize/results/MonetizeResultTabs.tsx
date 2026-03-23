'use client';

import React, { useState } from 'react';
import { Lock, BookOpen, GraduationCap, Briefcase, Share2, Package, Sparkles } from 'lucide-react';
import {
  MonetizeDiagnosisResult, MonetizeField,
  MONETIZE_FIELDS, MONETIZE_FIELD_LABELS, MONETIZE_FIELD_DESCRIPTIONS,
} from '../types';
import { KindleTabContent } from './KindleTabContent';
import { CourseTabContent } from './CourseTabContent';
import { ConsultingTabContent } from './ConsultingTabContent';
import { SnsTabContent } from './SnsTabContent';
import { DigitalTabContent } from './DigitalTabContent';
import { useFeaturePurchase } from '@/lib/hooks/useFeaturePurchase';

interface MonetizeResultTabsProps {
  result: MonetizeDiagnosisResult;
  userId: string;
}

const TAB_ICONS: Record<MonetizeField, React.ElementType> = {
  kindle: BookOpen,
  course: GraduationCap,
  consulting: Briefcase,
  sns: Share2,
  digital: Package,
};

export const MonetizeResultTabs: React.FC<MonetizeResultTabsProps> = ({ result, userId }) => {
  const [activeTab, setActiveTab] = useState<MonetizeField>('kindle');
  const { hasAccess, isLoading: isPurchaseLoading } = useFeaturePurchase(
    userId,
    'monetize_diagnosis_unlock',
    result.id
  );

  // 各タブ: 1件目は無料、2件目以降はロック
  const getFreeItems = <T,>(items: T[]): T[] => hasAccess ? items : items.slice(0, 1);
  const getLockedCount = <T,>(items: T[]): number => hasAccess ? 0 : Math.max(0, items.length - 1);

  const handlePurchase = async () => {
    try {
      const params = new URLSearchParams({
        userId,
        productId: 'monetize_diagnosis_unlock',
        contentId: result.id,
        contentType: 'monetize_diagnosis',
      });
      const res = await fetch(`/api/features/purchase?${params}`, { method: 'POST' });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      alert('購入処理でエラーが発生しました');
    }
  };

  const renderTabContent = () => {
    const lockedCount = (() => {
      switch (activeTab) {
        case 'kindle': return getLockedCount(result.kindle);
        case 'course': return getLockedCount(result.course);
        case 'consulting': return getLockedCount(result.consulting);
        case 'sns': return getLockedCount(result.sns);
        case 'digital': return getLockedCount(result.digital);
      }
    })();

    return (
      <>
        {activeTab === 'kindle' && <KindleTabContent suggestions={getFreeItems(result.kindle)} />}
        {activeTab === 'course' && <CourseTabContent suggestions={getFreeItems(result.course)} />}
        {activeTab === 'consulting' && <ConsultingTabContent suggestions={getFreeItems(result.consulting)} />}
        {activeTab === 'sns' && <SnsTabContent suggestions={getFreeItems(result.sns)} />}
        {activeTab === 'digital' && <DigitalTabContent suggestions={getFreeItems(result.digital)} />}

        {lockedCount > 0 && (
          <LockedSection
            lockedCount={lockedCount}
            totalTabs={MONETIZE_FIELDS.length}
            onPurchase={handlePurchase}
            isPurchaseLoading={isPurchaseLoading}
          />
        )}
      </>
    );
  };

  return (
    <div>
      {/* タブヘッダー（横スクロール対応） */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex border-b border-gray-200 mb-6 min-w-max">
          {MONETIZE_FIELDS.map((field) => {
            const Icon = TAB_ICONS[field];
            const isActive = activeTab === field;
            return (
              <button
                key={field}
                type="button"
                onClick={() => setActiveTab(field)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{MONETIZE_FIELD_LABELS[field]}</span>
                {!hasAccess && (
                  <span className="text-xs text-gray-400">1/{
                    field === 'kindle' ? result.kindle.length :
                    field === 'course' ? result.course.length :
                    field === 'consulting' ? result.consulting.length :
                    field === 'sns' ? result.sns.length :
                    result.digital.length
                  }</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* タブ説明 */}
      <p className="text-sm text-gray-600 mb-4">
        {MONETIZE_FIELD_DESCRIPTIONS[activeTab]}
      </p>

      {/* タブコンテンツ */}
      {renderTabContent()}
    </div>
  );
};

// ロック解除セクション
interface LockedSectionProps {
  lockedCount: number;
  totalTabs: number;
  onPurchase: () => void;
  isPurchaseLoading: boolean;
}

const LockedSection: React.FC<LockedSectionProps> = ({ lockedCount, totalTabs, onPurchase, isPurchaseLoading }) => {
  return (
    <div className="mt-6">
      {/* ブラーされたプレビュー */}
      <div className="relative">
        <div className="blur-sm opacity-40 pointer-events-none select-none space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-4/5 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/5" />
            </div>
          ))}
        </div>

        {/* ロック解除CTA */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-violet-200 p-8 max-w-md mx-4 text-center">
            <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              残り {lockedCount} 件の提案をアンロック
            </h3>
            <p className="text-gray-600 text-sm mb-1">
              全{totalTabs}分野の詳細な収益化プランを確認できます。
            </p>
            <p className="text-gray-500 text-xs mb-4">
              章構成案・差別化ポイント・最初の一歩まで具体的に提案
            </p>
            <button
              type="button"
              onClick={onPurchase}
              disabled={isPurchaseLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              全分野をアンロック（¥980）
            </button>
            <p className="text-xs text-gray-500 mt-3">
              一度のお支払いで、この診断の全結果が永久に閲覧可能です
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
