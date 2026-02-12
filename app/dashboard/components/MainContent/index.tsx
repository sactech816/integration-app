'use client';

import React, { useEffect, useRef } from 'react';
import { ServiceType } from '@/lib/types';
import DashboardHome from './DashboardHome';
import ContentList from './ContentList';
import { ContentItem } from './ContentCard';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import AccountSettings from '../Settings/AccountSettings';
import BookingList from './BookingList';
import AttendanceList from './AttendanceList';
import SurveyList from './SurveyList';
import MyGamification from './MyGamification';
import { PlanTier } from '@/lib/subscription';

export type ActiveView =
  | 'dashboard'
  | 'quiz'
  | 'profile'
  | 'business'
  | 'salesletter'
  | 'booking'
  | 'attendance'
  | 'survey'
  | 'my-games'
  | 'kindle'
  | 'affiliate'
  | 'settings'
  | 'admin-overview'
  | 'admin-users'
  | 'admin-announcements'
  | 'admin-monitor'
  | 'admin-service'
  | 'admin-ai-model'
  | 'admin-affiliate'
  | 'admin-featured'
  | 'admin-gamification'
  | 'admin-transfer'
  | 'admin-cleanup';

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
  gamificationLimit?: number;
  aiDailyLimit?: number;
};

type MainContentProps = {
  activeView: ActiveView;
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
    salesletter: number;
    booking: number;
    attendance: number;
    survey: number;
    gamification: number;
  };
  isLoading: boolean;
  proAccessMap: Record<string, { hasAccess: boolean; reason?: string }>;
  processingId: string | null;
  copiedId: string | null;
  kdlSubscription: KdlSubscription | null;
  loadingKdlSubscription: boolean;
  userSubscription?: UserSubscription | null;
  loadingUserSubscription?: boolean;
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
  // 管理者コンポーネント（遅延レンダリング関数）
  adminComponents?: {
    Overview?: () => React.ReactNode;
    UserManager?: () => React.ReactNode;
    AnnouncementManager?: () => React.ReactNode;
    MonitorManager?: () => React.ReactNode;
    ServiceManager?: () => React.ReactNode;
    AIModelManager?: () => React.ReactNode;
    GamificationManager?: () => React.ReactNode;
    AffiliateManager?: () => React.ReactNode;
    FeaturedManager?: () => React.ReactNode;
    OwnershipTransfer?: () => React.ReactNode;
    CleanupManager?: () => React.ReactNode;
  };
};

export default function MainContent({
  activeView,
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
  loadingUserSubscription,
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
  const contentRef = useRef<HTMLDivElement>(null);

  // Pro機能のアンロック判定（集客メーカーProプラン、パートナー、管理者）
  // 注: KDLサブスクではなく、集客メーカーのProプランをチェック
  const hasMakersProAccess = userSubscription?.planTier === 'pro';
  const isUnlocked = isAdmin || isPartner || hasMakersProAccess;

  // activeViewが変更されたときにスクロール位置を最上部にリセット
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    // メインコンテンツエリアのスクロールもリセット
    window.scrollTo(0, 0);
  }, [activeView]);

    return (
    <div ref={contentRef}>
      {activeView === 'dashboard' && (
      <DashboardHome
        user={user}
        isAdmin={isAdmin}
        isPartner={isPartner}
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
        userSubscription={userSubscription}
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
      )}

      {['quiz', 'profile', 'business', 'salesletter'].includes(activeView) && (
      <ContentList
        contents={contents}
        selectedService={activeView as ServiceType}
        isLoading={isLoading}
        isAdmin={isAdmin}
        proAccessMap={proAccessMap}
        processingId={processingId}
        copiedId={copiedId}
        isProUnlocked={isUnlocked}
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
      )}

      {/* 予約メーカー */}
      {activeView === 'booking' && user && (
        <BookingList userId={user.id} isAdmin={isAdmin} isUnlocked={isUnlocked} />
      )}

      {/* 出欠メーカー */}
      {activeView === 'attendance' && user && (
        <AttendanceList userId={user.id} isAdmin={isAdmin} isUnlocked={isUnlocked} />
      )}

      {/* アンケートメーカー */}
      {activeView === 'survey' && user && (
        <SurveyList userId={user.id} isAdmin={isAdmin} userEmail={user.email} isUnlocked={isUnlocked} />
      )}

      {/* ゲーム作成（全ユーザー） */}
      {activeView === 'my-games' && user && (
        <MyGamification 
          userId={user.id} 
          planTier={userSubscription?.planTier || 'none'} 
          isUnlocked={isUnlocked}
          isAdmin={isAdmin}
          gamificationLimit={userSubscription?.gamificationLimit}
        />
      )}

      {/* ゲーミフィケーション管理（管理者のみ） */}
      {activeView === 'admin-gamification' && adminComponents?.GamificationManager && (
        <>{adminComponents.GamificationManager()}</>
      )}

      {/* アフィリエイト */}
      {activeView === 'affiliate' && user && (
        <AffiliateDashboard userId={user.id} userEmail={user.email} />
      )}

      {/* 設定 */}
      {activeView === 'settings' && (
        <AccountSettings user={user} onLogout={onLogout} />
      )}

      {/* 管理者メニュー */}
      {activeView === 'admin-overview' && adminComponents?.Overview && (
        <>{adminComponents.Overview()}</>
      )}

      {activeView === 'admin-users' && adminComponents?.UserManager && (
        <>{adminComponents.UserManager()}</>
      )}

      {activeView === 'admin-announcements' && adminComponents?.AnnouncementManager && (
        <>{adminComponents.AnnouncementManager()}</>
      )}

      {activeView === 'admin-monitor' && adminComponents?.MonitorManager && (
        <>{adminComponents.MonitorManager()}</>
      )}

      {activeView === 'admin-service' && adminComponents?.ServiceManager && (
        <>{adminComponents.ServiceManager()}</>
      )}

      {activeView === 'admin-ai-model' && adminComponents?.AIModelManager && (
        <>{adminComponents.AIModelManager()}</>
      )}

      {activeView === 'admin-affiliate' && adminComponents?.AffiliateManager && (
        <>{adminComponents.AffiliateManager()}</>
      )}

      {activeView === 'admin-featured' && adminComponents?.FeaturedManager && (
        <>{adminComponents.FeaturedManager()}</>
      )}

      {activeView === 'admin-transfer' && adminComponents?.OwnershipTransfer && (
        <>{adminComponents.OwnershipTransfer()}</>
      )}

      {activeView === 'admin-cleanup' && adminComponents?.CleanupManager && (
        <>{adminComponents.CleanupManager()}</>
      )}

      {/* デフォルト */}
      {!['dashboard', 'quiz', 'profile', 'business', 'salesletter', 'booking', 'attendance', 'survey', 'my-games', 'affiliate', 'settings', 'admin-overview', 'admin-users', 'admin-announcements', 'admin-monitor', 'admin-service', 'admin-ai-model', 'admin-affiliate', 'admin-featured', 'admin-gamification', 'admin-transfer', 'admin-cleanup'].includes(activeView) && (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-4">準備中</h2>
      <p className="text-gray-500">この機能は現在準備中です</p>
        </div>
      )}
    </div>
  );
}
