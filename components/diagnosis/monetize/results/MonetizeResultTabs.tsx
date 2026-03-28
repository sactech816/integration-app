'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, BookOpen, GraduationCap, Briefcase, Share2, Package, Sparkles, Crown, Loader2 } from 'lucide-react';
import {
  MonetizeDiagnosisResult, MonetizeField, MasterReport,
  MONETIZE_FIELDS, MONETIZE_FIELD_LABELS, MONETIZE_FIELD_DESCRIPTIONS,
  PRODUCT_IDS,
} from '../types';
import { KindleTabContent } from './KindleTabContent';
import { CourseTabContent } from './CourseTabContent';
import { ConsultingTabContent } from './ConsultingTabContent';
import { SnsTabContent } from './SnsTabContent';
import { DigitalTabContent } from './DigitalTabContent';
import { MasterReportSection } from './MasterReportSection';
import { useFeaturePurchase } from '@/lib/hooks/useFeaturePurchase';

interface MonetizeResultTabsProps {
  result: MonetizeDiagnosisResult;
  userId?: string | null;
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
  const [masterReport, setMasterReport] = useState<MasterReport | null>(result.masterReport || null);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);

  // 完全診断レポート（全分野＋総括）
  const { hasAccess: hasCompleteAccess, refetch: refetchComplete } = useFeaturePurchase(
    userId, PRODUCT_IDS.complete, result.id
  );

  // 各分野の個別購入チェック
  const { hasAccess: hasKindle } = useFeaturePurchase(userId, PRODUCT_IDS.kindle, result.id);
  const { hasAccess: hasCourse } = useFeaturePurchase(userId, PRODUCT_IDS.course, result.id);
  const { hasAccess: hasConsulting } = useFeaturePurchase(userId, PRODUCT_IDS.consulting, result.id);
  const { hasAccess: hasSns } = useFeaturePurchase(userId, PRODUCT_IDS.sns, result.id);
  const { hasAccess: hasDigital } = useFeaturePurchase(userId, PRODUCT_IDS.digital, result.id);

  const fieldAccess: Record<MonetizeField, boolean> = {
    kindle: hasCompleteAccess || hasKindle,
    course: hasCompleteAccess || hasCourse,
    consulting: hasCompleteAccess || hasConsulting,
    sns: hasCompleteAccess || hasSns,
    digital: hasCompleteAccess || hasDigital,
  };

  // 完全診断購入後に総括レポートを取得
  const fetchMasterReport = useCallback(async () => {
    if (!hasCompleteAccess || masterReport) return;
    setIsLoadingMaster(true);
    try {
      const res = await fetch('/api/diagnosis/monetize/master-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosisId: result.id }),
      });
      const data = await res.json();
      if (data.masterReport) {
        setMasterReport(data.masterReport);
      }
    } catch {
      console.error('Failed to fetch master report');
    } finally {
      setIsLoadingMaster(false);
    }
  }, [hasCompleteAccess, masterReport, result.id]);

  useEffect(() => {
    fetchMasterReport();
  }, [fetchMasterReport]);

  const isFieldUnlocked = (field: MonetizeField) => fieldAccess[field];
  const getFreeItems = <T,>(items: T[], field: MonetizeField): T[] =>
    isFieldUnlocked(field) ? items : items.slice(0, 1);
  const getLockedCount = <T,>(items: T[], field: MonetizeField): number =>
    isFieldUnlocked(field) ? 0 : Math.max(0, items.length - 1);

  const handlePurchaseField = async (field: MonetizeField) => {
    try {
      const res = await fetch('/api/features/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: PRODUCT_IDS[field],
          contentId: result.id,
          contentType: 'monetize_diagnosis',
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert('購入処理でエラーが発生しました');
    }
  };

  const handlePurchaseComplete = async () => {
    try {
      const res = await fetch('/api/features/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: PRODUCT_IDS.complete,
          contentId: result.id,
          contentType: 'monetize_diagnosis',
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert('購入処理でエラーが発生しました');
    }
  };

  const renderTabContent = () => {
    const field = activeTab;
    const lockedCount = (() => {
      switch (field) {
        case 'kindle': return getLockedCount(result.kindle, field);
        case 'course': return getLockedCount(result.course, field);
        case 'consulting': return getLockedCount(result.consulting, field);
        case 'sns': return getLockedCount(result.sns, field);
        case 'digital': return getLockedCount(result.digital, field);
      }
    })();

    return (
      <>
        {field === 'kindle' && <KindleTabContent suggestions={getFreeItems(result.kindle, field)} />}
        {field === 'course' && <CourseTabContent suggestions={getFreeItems(result.course, field)} />}
        {field === 'consulting' && <ConsultingTabContent suggestions={getFreeItems(result.consulting, field)} />}
        {field === 'sns' && <SnsTabContent suggestions={getFreeItems(result.sns, field)} />}
        {field === 'digital' && <DigitalTabContent suggestions={getFreeItems(result.digital, field)} />}

        {lockedCount > 0 && (
          <LockedSection
            field={field}
            lockedCount={lockedCount}
            onPurchaseField={() => handlePurchaseField(field)}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
      </>
    );
  };

  return (
    <div>
      {/* 完全診断レポート購入バナー（未購入時） */}
      {!hasCompleteAccess && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">完全診断レポート</h3>
              <p className="text-violet-100 text-sm mb-3">
                全5分野×5件の詳細結果＋<span className="font-semibold text-white">総括レポート</span>（収益化ロードマップ・分野連携戦略・30日アクションプラン）
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handlePurchaseComplete}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 font-bold rounded-xl shadow-md hover:bg-violet-50 transition-all text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  ¥3,980で購入
                </button>
                <span className="text-violet-200 text-xs">
                  単品5分野（¥4,900）より ¥920お得 + 総括レポート付き
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 総括レポート（完全診断購入済み） */}
      {hasCompleteAccess && (
        isLoadingMaster ? (
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-8 mb-6 text-center">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
            <p className="text-violet-700 font-medium">総括レポートを生成中...</p>
          </div>
        ) : masterReport ? (
          <MasterReportSection report={masterReport} />
        ) : null
      )}

      {/* タブヘッダー */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex border-b border-gray-200 mb-6 min-w-max">
          {MONETIZE_FIELDS.map((field) => {
            const Icon = TAB_ICONS[field];
            const isActive = activeTab === field;
            const unlocked = isFieldUnlocked(field);
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
                {unlocked ? (
                  <span className="text-xs text-green-600">&#10003;</span>
                ) : (
                  <Lock className="w-3 h-3 text-gray-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{MONETIZE_FIELD_DESCRIPTIONS[activeTab]}</p>

      {renderTabContent()}
    </div>
  );
};

// ロック解除セクション
interface LockedSectionProps {
  field: MonetizeField;
  lockedCount: number;
  onPurchaseField: () => void;
  onPurchaseComplete: () => void;
}

const LockedSection: React.FC<LockedSectionProps> = ({ field, lockedCount, onPurchaseField, onPurchaseComplete }) => {
  return (
    <div className="mt-6 relative">
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

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-violet-200 p-6 max-w-md mx-4 text-center">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">
            残り {lockedCount} 件の提案をアンロック
          </h3>

          <div className="space-y-3 mt-4">
            {/* 分野別購入 */}
            <button
              type="button"
              onClick={onPurchaseField}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 transition-all text-sm"
            >
              {MONETIZE_FIELD_LABELS[field]}レポート（¥980）
            </button>

            {/* まとめ購入 */}
            <button
              type="button"
              onClick={onPurchaseComplete}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:from-violet-700 hover:to-indigo-700 transition-all text-sm"
            >
              <Crown className="w-4 h-4" />
              完全診断レポート（¥3,980）
            </button>
            <p className="text-xs text-gray-500">
              全5分野 + 総括レポート付き（単品合計 ¥4,900 → ¥920お得）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
