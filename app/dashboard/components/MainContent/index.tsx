'use client';

import React, { useEffect, useRef } from 'react';
import { ServiceType } from '@/lib/types';
import DashboardHome from './DashboardHome';
import ContentList from './ContentList';
import { ContentItem } from './ContentCard';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import AccountSettings from '../Settings/AccountSettings';
import MarketplaceSellerDashboard from './MarketplaceSellerDashboard';
import AnnouncementList from './AnnouncementList';
import AnalyticsSection from './AnalyticsSection';
import BookingList from './BookingList';
import AttendanceList from './AttendanceList';
import SurveyList from './SurveyList';
import MyGamification from './MyGamification';
import NewsletterDashboard from '@/components/newsletter/NewsletterDashboard';
import StepEmailDashboard from '@/components/step-email/StepEmailDashboard';
import LineDashboard from '@/components/line/LineDashboard';
import OrderFormList from './OrderFormList';
import FunnelList from './FunnelList';
import BigFiveHistory from '@/components/bigfive/BigFiveHistory';
import FortuneHistory from '@/components/fortune/FortuneHistory';
import ConciergeList from './ConciergeList';
import { MakersPlanTier } from '@/lib/subscription';

export type ActiveView =
  | 'dashboard'
  | 'announcements'
  | 'quiz'
  | 'entertainment'
  | 'profile'
  | 'business'
  | 'salesletter'
  | 'booking'
  | 'attendance'
  | 'survey'
  | 'my-games'
  | 'onboarding'
  | 'thumbnail'
  | 'kindle'
  | 'newsletter'
  | 'step-email'
  | 'order-form'
  | 'funnel'
  | 'webinar'
  | 'sns-post'
  | 'line'
  | 'youtube-analysis'
  | 'youtube-keyword-research'
  | 'kindle-keywords'
  | 'google-keyword-research'
  | 'rakuten-research'
  | 'niconico-keyword-research'
  | 'reddit-keyword-research'
  | 'site'
  | 'concierge'
  | 'bigfive'
  | 'fortune'
  | 'affiliate'
  | 'marketplace-seller'
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
  | 'admin-cleanup'
  | 'admin-feedbacks'
  | 'admin-points'
  | 'admin-diagnosis'
  | 'admin-inquiries'
  | 'admin-trial';

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
  planTier: MakersPlanTier;
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
    entertainment_quiz: number;
    profile: number;
    business: number;
    salesletter: number;
    booking: number;
    attendance: number;
    survey: number;
    gamification: number;
    onboarding: number;
    thumbnail: number;
    newsletter: number;
    step_email: number;
    order_form: number;
    funnel: number;
    webinar: number;
    sns_post: number;
    line: number;
    site: number;
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
  onMenuItemClick?: (itemId: string) => void;
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
    FeedbackManager?: () => React.ReactNode;
    PointsManager?: () => React.ReactNode;
    DiagnosisManager?: () => React.ReactNode;
    InquiryManager?: () => React.ReactNode;
    TrialSettingsManager?: () => React.ReactNode;
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
  onMenuItemClick,
  adminComponents,
}: MainContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Pro機能のアンロック判定（集客メーカーProプラン、パートナー、管理者）
  // 注: KDLサブスクではなく、集客メーカーのProプランをチェック
  const hasMakersProAccess = userSubscription?.planTier === 'business' || userSubscription?.planTier === 'premium';
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
        kdlSubscription={kdlSubscription}
        loadingKdlSubscription={loadingKdlSubscription}
        userSubscription={userSubscription}
        onNavigate={onNavigate}
        onMenuItemClick={onMenuItemClick}
      />
      )}

      {activeView === 'announcements' && (
        <AnnouncementList />
      )}

      {['quiz', 'entertainment', 'profile', 'business', 'salesletter', 'onboarding', 'thumbnail', 'webinar', 'sns-post', 'site'].includes(activeView) && (
      <div className="space-y-6">
        <ContentList
          contents={contents}
          selectedService={activeView === 'entertainment' ? 'entertainment_quiz' as ServiceType : activeView as ServiceType}
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
        {['quiz', 'profile', 'business', 'salesletter', 'onboarding', 'webinar'].includes(activeView) && (
          <AnalyticsSection
            contents={contents}
            selectedService={activeView as ServiceType}
            isUnlocked={isUnlocked}
            onNavigate={onNavigate}
          />
        )}
      </div>
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

      {/* メルマガメーカー */}
      {activeView === 'newsletter' && user && (
        <NewsletterDashboard
          userId={user.id}
          isProUser={userSubscription?.planTier === 'business' || userSubscription?.planTier === 'premium'}
          planTier={userSubscription?.planTier || 'free'}
          isAdmin={isAdmin}
        />
      )}

      {/* ステップメールメーカー */}
      {activeView === 'step-email' && user && (
        <StepEmailDashboard
          userId={user.id}
          isProUser={userSubscription?.planTier === 'business' || userSubscription?.planTier === 'premium'}
          planTier={userSubscription?.planTier || 'free'}
          isAdmin={isAdmin}
        />
      )}

      {/* フォームメーカー */}
      {activeView === 'order-form' && user && (
        <div className="space-y-6">
          <OrderFormList userId={user.id} isAdmin={isAdmin} isUnlocked={isUnlocked} />
          <AnalyticsSection
            contents={contents}
            selectedService={activeView as ServiceType}
            isUnlocked={isUnlocked}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* LINE公式連携 */}
      {activeView === 'line' && user && (
        <LineDashboard userId={user.id} isAdmin={isAdmin} />
      )}

      {/* ファネル */}
      {activeView === 'funnel' && user && (
        <FunnelList userId={user.id} isAdmin={isAdmin} hasMakersProAccess={userSubscription?.planTier === 'business' || userSubscription?.planTier === 'premium'} onNavigate={onNavigate} />
      )}

      {/* ゲーム作成（全ユーザー） */}
      {activeView === 'my-games' && user && (
        <MyGamification 
          userId={user.id} 
          planTier={userSubscription?.planTier || 'guest'}
          isUnlocked={isUnlocked}
          isAdmin={isAdmin}
          gamificationLimit={userSubscription?.gamificationLimit}
        />
      )}

      {/* ゲーミフィケーション管理（管理者のみ） */}
      {activeView === 'admin-gamification' && adminComponents?.GamificationManager && (
        <>{adminComponents.GamificationManager()}</>
      )}

      {/* スキルマーケット管理 */}
      {activeView === 'marketplace-seller' && user && (
        <MarketplaceSellerDashboard userId={user.id} />
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

      {activeView === 'admin-feedbacks' && adminComponents?.FeedbackManager && (
        <>{adminComponents.FeedbackManager()}</>
      )}

      {activeView === 'admin-points' && adminComponents?.PointsManager && (
        <>{adminComponents.PointsManager()}</>
      )}

      {activeView === 'admin-diagnosis' && adminComponents?.DiagnosisManager && (
        <>{adminComponents.DiagnosisManager()}</>
      )}

      {activeView === 'admin-inquiries' && adminComponents?.InquiryManager && (
        <>{adminComponents.InquiryManager()}</>
      )}

      {activeView === 'admin-trial' && adminComponents?.TrialSettingsManager && (
        <>{adminComponents.TrialSettingsManager()}</>
      )}

      {/* コンシェルジュメーカー */}
      {activeView === 'concierge' && user && (
        <ConciergeList userId={user.id} isAdmin={isAdmin} />
      )}

      {activeView === 'bigfive' && (
        <BigFiveHistory />
      )}

      {activeView === 'fortune' && (
        <FortuneHistory />
      )}

      {/* デフォルト */}
      {!['dashboard', 'announcements', 'quiz', 'entertainment', 'profile', 'business', 'salesletter', 'onboarding', 'thumbnail', 'webinar', 'sns-post', 'booking', 'attendance', 'survey', 'my-games', 'newsletter', 'step-email', 'line', 'youtube-analysis', 'youtube-keyword-research', 'kindle-keywords', 'google-keyword-research', 'rakuten-research', 'niconico-keyword-research', 'reddit-keyword-research', 'order-form', 'funnel', 'marketplace-seller', 'affiliate', 'settings', 'admin-overview', 'admin-users', 'admin-announcements', 'admin-monitor', 'admin-service', 'admin-ai-model', 'admin-affiliate', 'admin-featured', 'admin-gamification', 'admin-transfer', 'admin-cleanup', 'admin-feedbacks', 'admin-points', 'admin-diagnosis', 'admin-inquiries', 'admin-trial', 'bigfive', 'fortune', 'site', 'concierge'].includes(activeView) && (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-4">準備中</h2>
      <p className="text-gray-500">この機能は現在準備中です</p>
        </div>
      )}
    </div>
  );
}
