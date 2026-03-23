'use client';

import React, { useState } from 'react';
import { Lock, BookOpen, GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import {
  MonetizeDiagnosisResult, MonetizeField,
  MONETIZE_FIELD_LABELS, MONETIZE_FIELD_ICONS,
} from '../types';
import { KindleTabContent } from './KindleTabContent';
import { CourseTabContent } from './CourseTabContent';
import { ConsultingTabContent } from './ConsultingTabContent';
import { useFeaturePurchase } from '@/lib/hooks/useFeaturePurchase';

interface MonetizeResultTabsProps {
  result: MonetizeDiagnosisResult;
  userId: string;
}

const TAB_ICONS: Record<MonetizeField, React.ElementType> = {
  kindle: BookOpen,
  course: GraduationCap,
  consulting: Briefcase,
};

export const MonetizeResultTabs: React.FC<MonetizeResultTabsProps> = ({ result, userId }) => {
  const [activeTab, setActiveTab] = useState<MonetizeField>('kindle');
  const { hasAccess, isLoading: isPurchaseLoading, refetch } = useFeaturePurchase(
    userId,
    'monetize_diagnosis_unlock',
    result.id
  );

  const tabs: MonetizeField[] = ['kindle', 'course', 'consulting'];
  const isLocked = (field: MonetizeField) => !hasAccess && field !== 'kindle';

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

  return (
    <div>
      {/* タブヘッダー */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((field) => {
          const Icon = TAB_ICONS[field];
          const locked = isLocked(field);
          const isActive = activeTab === field;
          return (
            <button
              key={field}
              type="button"
              onClick={() => setActiveTab(field)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
                isActive
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{MONETIZE_FIELD_LABELS[field]}</span>
              {locked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          );
        })}
      </div>

      {/* タブコンテンツ */}
      <div className="relative">
        {activeTab === 'kindle' && (
          <KindleTabContent suggestions={result.kindle} />
        )}
        {activeTab === 'course' && (
          isLocked('course') ? (
            <LockedOverlay
              field="course"
              previewCount={result.course.length}
              onPurchase={handlePurchase}
              isPurchaseLoading={isPurchaseLoading}
            />
          ) : (
            <CourseTabContent suggestions={result.course} />
          )
        )}
        {activeTab === 'consulting' && (
          isLocked('consulting') ? (
            <LockedOverlay
              field="consulting"
              previewCount={result.consulting.length}
              onPurchase={handlePurchase}
              isPurchaseLoading={isPurchaseLoading}
            />
          ) : (
            <ConsultingTabContent suggestions={result.consulting} />
          )
        )}
      </div>
    </div>
  );
};

// ロック状態のオーバーレイ
interface LockedOverlayProps {
  field: MonetizeField;
  previewCount: number;
  onPurchase: () => void;
  isPurchaseLoading: boolean;
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({ field, previewCount, onPurchase, isPurchaseLoading }) => {
  return (
    <div className="relative">
      {/* ブラーされたプレビュー */}
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
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
            {MONETIZE_FIELD_LABELS[field]}の詳細結果
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {previewCount}件の具体的な提案があなたを待っています。
            全分野の詳細結果をアンロックしましょう。
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
  );
};
