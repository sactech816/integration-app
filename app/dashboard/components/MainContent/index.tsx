'use client';

import React from 'react';
import { ServiceType } from '@/lib/types';
import DashboardHome from './DashboardHome';
import ContentList from './ContentList';
import { ContentItem } from './ContentCard';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import AccountSettings from '../Settings/AccountSettings';
import BookingList from './BookingList';
import SurveyList from './SurveyList';

export type ActiveView =
  | 'dashboard'
  | 'quiz'
  | 'profile'
  | 'business'
  | 'booking'
  | 'survey'
  | 'gamification'
  | 'kindle'
  | 'affiliate'
  | 'settings'
  | 'admin-users'
  | 'admin-announcements'
  | 'admin-kdl'
  | 'admin-affiliate'
  | 'admin-featured';

type KdlSubscription = {
  hasActiveSubscription: boolean;
  planType: 'monthly' | 'yearly' | 'none';
  nextPaymentDate: string | null;
  amount: number | null;
  isMonitor?: boolean;
  monitorExpiresAt?: string;
  planTier?: string;
};

type MainContentProps = {
  activeView: ActiveView;
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
  contents: ContentItem[];
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
    booking: number;
    survey: number;
    gamification: number;
  };
  isLoading: boolean;
  proAccessMap: Record<string, { hasAccess: boolean; reason?: string }>;
  processingId: string | null;
  copiedId: string | null;
  kdlSubscription: KdlSubscription | null;
  loadingKdlSubscription: boolean;
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
  onLogout: () => void;
  // 管理者コンポーネント
  adminComponents?: {
    UserManager?: React.ReactNode;
    AnnouncementManager?: React.ReactNode;
    GamificationManager?: React.ReactNode;
    KdlManager?: React.ReactNode;
    AffiliateManager?: React.ReactNode;
    FeaturedManager?: React.ReactNode;
  };
};

export default function MainContent({
  activeView,
  user,
  isAdmin,
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
  onLogout,
  adminComponents,
}: MainContentProps) {
  // ダッシュボードホーム
  if (activeView === 'dashboard') {
    return (
      <DashboardHome
        user={user}
        isAdmin={isAdmin}
        selectedService={selectedService}
        onServiceChange={onServiceChange}
        contents={contents}
        contentCounts={{
          quiz: contentCounts.quiz,
          profile: contentCounts.profile,
          business: contentCounts.business,
        }}
        isLoading={isLoading}
        proAccessMap={proAccessMap}
        processingId={processingId}
        copiedId={copiedId}
        kdlSubscription={kdlSubscription}
        loadingKdlSubscription={loadingKdlSubscription}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onView={onView}
        onCopyUrl={onCopyUrl}
        onEmbed={onEmbed}
        onDownloadHtml={onDownloadHtml}
        onPurchase={onPurchase}
        onCreateNew={onCreateNew}
        onNavigate={onNavigate}
      />
    );
  }

  // コンテンツ一覧（診断クイズ、プロフィールLP、ビジネスLP）
  if (['quiz', 'profile', 'business'].includes(activeView)) {
    return (
      <ContentList
        contents={contents}
        selectedService={activeView as ServiceType}
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
    );
  }

  // 予約・日程調整
  if (activeView === 'booking') {
    if (user) {
      return <BookingList userId={user.id} isAdmin={isAdmin} />;
    }
    return null;
  }

  // アンケート
  if (activeView === 'survey') {
    if (user) {
      return <SurveyList userId={user.id} isAdmin={isAdmin} />;
    }
    return null;
  }

  // ゲーミフィケーション（管理者のみ）
  if (activeView === 'gamification') {
    if (adminComponents?.GamificationManager) {
      return <>{adminComponents.GamificationManager}</>;
    }
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">ゲーミフィケーション</h2>
        <p className="text-gray-500">キャンペーン管理機能</p>
      </div>
    );
  }

  // アフィリエイト
  if (activeView === 'affiliate') {
    if (user) {
      return <AffiliateDashboard userId={user.id} userEmail={user.email} />;
    }
    return null;
  }

  // 設定
  if (activeView === 'settings') {
    return <AccountSettings user={user} onLogout={onLogout} />;
  }

  // 管理者メニュー
  if (activeView === 'admin-users' && adminComponents?.UserManager) {
    return <>{adminComponents.UserManager}</>;
  }

  if (activeView === 'admin-announcements' && adminComponents?.AnnouncementManager) {
    return <>{adminComponents.AnnouncementManager}</>;
  }

  if (activeView === 'admin-kdl' && adminComponents?.KdlManager) {
    return <>{adminComponents.KdlManager}</>;
  }

  if (activeView === 'admin-affiliate' && adminComponents?.AffiliateManager) {
    return <>{adminComponents.AffiliateManager}</>;
  }

  if (activeView === 'admin-featured' && adminComponents?.FeaturedManager) {
    return <>{adminComponents.FeaturedManager}</>;
  }

  // デフォルト
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-4">準備中</h2>
      <p className="text-gray-500">この機能は現在準備中です</p>
    </div>
  );
}
