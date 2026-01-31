'use client';

import React from 'react';
import { Loader2, BookOpen, Crown, Zap, Sparkles } from 'lucide-react';
import { ServiceType } from '@/lib/types';
import ServiceTabs from './ServiceTabs';
import AnalyticsSection from './AnalyticsSection';
import ContentList from './ContentList';
import { ContentItem } from './ContentCard';

import { PlanTier } from '@/lib/subscription';

type KdlSubscription = {
  hasActiveSubscription: boolean;
  planType: 'monthly' | 'yearly' | 'none';
  nextPaymentDate: string | null;
  amount: number | null;
  isMonitor?: boolean;
  monitorExpiresAt?: string;
  planTier?: string;
};

type UserSubscription = {
  planTier: PlanTier;
};

type DashboardHomeProps = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  isPartner: boolean;
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
  contents: ContentItem[];
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
  };
  isLoading: boolean;
  proAccessMap: Record<string, { hasAccess: boolean; reason?: string }>;
  processingId: string | null;
  copiedId: string | null;
  kdlSubscription: KdlSubscription | null;
  loadingKdlSubscription: boolean;
  userSubscription?: UserSubscription | null;
  onEdit: (item: ContentItem) => void;
  onDuplicate: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onView: (item: ContentItem) => void;
  onCopyUrl: (item: ContentItem) => void;
  onEmbed: (item: ContentItem, isUnlocked: boolean) => void;
  onDownloadHtml: (item: ContentItem) => void;
  onPurchase: (item: ContentItem) => void;
  onCreateNew: () => void;
  onNavigate: (path: string, addAdminKey?: boolean) => void;
};

export default function DashboardHome({
  user,
  isAdmin,
  isPartner,
  selectedService,
  onServiceChange,
  contents,
  contentCounts,
  isLoading,
  proAccessMap,
  processingId,
  copiedId,
  kdlSubscription,
  loadingKdlSubscription,
  userSubscription,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  onCopyUrl,
  onEmbed,
  onDownloadHtml,
  onPurchase,
  onCreateNew,
  onNavigate,
}: DashboardHomeProps) {
  // アナリティクス機能のアンロック判定
  // 管理者、パートナー、集客メーカーProプラン加入者はアンロック
  // 注: KDLサブスクではなく、集客メーカーのProプランをチェック
  const hasMakersProAccess = userSubscription?.planTier === 'pro';
  const isAnalyticsUnlocked = isAdmin || isPartner || hasMakersProAccess;
  return (
    <div className="space-y-6">
      {/* KDLサブスクリプション状態（コンパクト版） */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl shadow-sm border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <BookOpen size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Kindle執筆サービス (KDL)</p>
              <p className="text-xs text-gray-500">AI powered 書籍執筆</p>
            </div>
          </div>

          {loadingKdlSubscription ? (
            <Loader2 className="animate-spin text-amber-500" size={20} />
          ) : kdlSubscription?.hasActiveSubscription || isAdmin ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-amber-500" />
                <span className="font-bold text-amber-700 text-sm">
                  {isAdmin && !kdlSubscription?.hasActiveSubscription
                    ? '管理者特典'
                    : kdlSubscription?.isMonitor
                    ? 'モニター特典'
                    : kdlSubscription?.planType === 'yearly'
                    ? '年間プラン'
                    : '月額プラン'}
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  有効
                </span>
              </div>
              <button
                onClick={() => onNavigate('kindle', true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1 transition-colors"
              >
                <BookOpen size={14} />
                書籍を管理
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Zap size={14} />
                <span className="text-sm">未加入</span>
              </div>
              <button
                onClick={() => onNavigate('kindle/lp')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1 transition-all shadow-md"
              >
                <Sparkles size={14} />
                詳細を見る
              </button>
            </div>
          )}
        </div>
        {kdlSubscription?.isMonitor && kdlSubscription?.monitorExpiresAt && (
          <p className="text-xs text-purple-600 font-bold mt-2 ml-11">
            モニター期限: {new Date(kdlSubscription.monitorExpiresAt).toLocaleDateString('ja-JP')}まで
          </p>
        )}
      </div>

      {/* サービス選択タブ */}
      <ServiceTabs
        selectedService={selectedService}
        onServiceChange={onServiceChange}
        contentCounts={contentCounts}
      />

      {/* アクセス解析 */}
      <AnalyticsSection 
        contents={contents} 
        selectedService={selectedService} 
        isUnlocked={isAnalyticsUnlocked}
        onNavigate={onNavigate}
      />

      {/* コンテンツ一覧 */}
      <ContentList
        contents={contents}
        selectedService={selectedService}
        isLoading={isLoading}
        isAdmin={isAdmin}
        proAccessMap={proAccessMap}
        processingId={processingId}
        copiedId={copiedId}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onView={onView}
        onCopyUrl={onCopyUrl}
        onEmbed={onEmbed}
        onDownloadHtml={onDownloadHtml}
        onPurchase={onPurchase}
        onCreateNew={onCreateNew}
      />
    </div>
  );
}
