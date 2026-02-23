'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import WelcomeBonus from '@/components/gamification/WelcomeBonus';
import LoginBonusToast from '@/components/gamification/LoginBonusToast';
import MonitorUsersManager from '@/components/shared/MonitorUsersManager';
import AdminAISettings from '@/components/shared/AdminAISettings';
import AdminFeatureLimitsSettings from '@/components/shared/AdminFeatureLimitsSettings';
import AdminAIUsageStats from '@/components/shared/AdminAIUsageStats';
import AdminPlanSettings from '@/components/shared/AdminPlanSettings';
import KdlAccessModal from '@/components/shared/KdlAccessModal';
import SettingsHealthBadge from '@/components/shared/SettingsHealthBadge';
import AffiliateManager from './components/Admin/AffiliateManager';
import FeaturedManager from './components/Admin/FeaturedManager';
import GamificationManager from './components/Admin/GamificationManager';
import FeedbackManager from './components/Admin/FeedbackManager';
import AccountSettings from './components/Settings/AccountSettings';
import { Loader2 } from 'lucide-react';

// 新しいコンポーネント
import DashboardLayout from './components/DashboardLayout';
import Sidebar from './components/Sidebar';
import MainContent, { ActiveView } from './components/MainContent';
import { UserManager, AnnouncementManager, UserExport, CleanupManager } from './components/Admin';
import OwnershipTransfer from './components/Admin/OwnershipTransfer';
import AdminOverview from './components/Admin/AdminOverview';

// カスタムフック
import { useDashboardData } from './hooks/useDashboardData';
import { useAdminData } from './hooks/useAdminData';

import { PlanTier } from '@/lib/subscription';

// KDLサブスクリプション状態の型
type KdlSubscription = {
  hasActiveSubscription: boolean;
  planType: 'monthly' | 'yearly' | 'none';
  nextPaymentDate: string | null;
  amount: number | null;
  isMonitor?: boolean;
  monitorExpiresAt?: string;
  planTier?: string;
};

// ユーザーサブスクリプション状態の型
type UserSubscription = {
  planTier: PlanTier;
  gamificationLimit?: number;
  aiDailyLimit?: number;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // カスタムフックからデータを取得
  const {
    user,
    setUser,
    isAdmin,
    isLoading,
    contents,
    contentCounts,
    totalViews,
    proAccessMap,
    processingId,
    copiedId,
    isPartner,
    fetchContents,
    fetchPurchases,
    fetchAllContentCounts,
    handleEdit,
    handleView,
    handleCopyUrl,
    handleDelete,
    handleDuplicate,
    handleEmbed,
    handleDownloadHtml,
    handlePurchase,
    handleLogout,
  } = useDashboardData();

  // 管理者用データ
  const adminData = useAdminData(isAdmin);

  // UI状態
  const [showAuth, setShowAuth] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedService, setSelectedService] = useState<ServiceType>('quiz');

  // URLパラメータからビューを設定
  useEffect(() => {
    const view = searchParams?.get('view');
    if (view && ['booking', 'attendance', 'survey', 'quiz', 'profile', 'business', 'salesletter', 'onboarding', 'affiliate', 'settings'].includes(view)) {
      setActiveView(view as ActiveView);
      // URLパラメータをクリア
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);
  
  // 右側パネル状態
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<React.ReactNode>(null);
  
  // KDLアクセスモーダル状態
  const [showKdlModal, setShowKdlModal] = useState(false);
  const [rightPanelTitle, setRightPanelTitle] = useState<string>('');
  
  // KDLサブスクリプション状態
  const [kdlSubscription, setKdlSubscription] = useState<KdlSubscription | null>(null);
  const [loadingKdlSubscription, setLoadingKdlSubscription] = useState(true);
  
  // ユーザーサブスクリプション状態（ゲーム作成制限用・集客メーカーPro判定用）
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loadingUserSubscription, setLoadingUserSubscription] = useState(true);

  // 決済完了後の検証
  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams?.get('session_id');
      if (!sessionId) return;

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (data.success) {
          alert('決済が完了しました！Pro機能が利用可能になりました。');
          window.history.replaceState({}, '', '/dashboard');
          fetchPurchases();
          fetchContents(selectedService);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    };

    verifyPayment();
  }, [searchParams, fetchPurchases, fetchContents, selectedService]);

  // 集客メーカーProプランかどうか（アナリティクス表示の条件）
  const hasMakersProAccess = userSubscription?.planTier === 'pro';
  
  // アナリティクス取得権限の判定（管理者・パートナーは即時判定可能）
  const canFetchAnalyticsImmediately = isAdmin || isPartner;
  const shouldFetchAnalytics = canFetchAnalyticsImmediately || hasMakersProAccess;

  // 初期データ取得（サービス切り替え時も実行）
  useEffect(() => {
    if (user) {
      // 管理者・パートナーは即座にアナリティクスを取得
      // それ以外はサブスク情報確定後に判定するため、初回はスキップ
      const skipAnalytics = canFetchAnalyticsImmediately ? false : true;
      
      Promise.all([
        fetchContents(selectedService, { skipAnalytics }),
        fetchPurchases(),
        fetchAllContentCounts(),
        fetchKdlSubscription(),
        fetchUserSubscription(),
      ]);
    }
  }, [user, selectedService, canFetchAnalyticsImmediately]);

  // Proプランユーザー（管理者・パートナー以外）のアナリティクス取得
  useEffect(() => {
    // 管理者・パートナーは既に取得済みなのでスキップ
    if (canFetchAnalyticsImmediately) return;
    
    // サブスク情報ロード完了後、Proプランの場合のみ再取得
    if (user && !loadingUserSubscription && hasMakersProAccess) {
      fetchContents(selectedService, { skipAnalytics: false });
    }
  }, [loadingUserSubscription, hasMakersProAccess, canFetchAnalyticsImmediately, user, selectedService, fetchContents]);
  
  // ユーザーサブスクリプション状態を取得（集客メーカーのProプラン判定用）
  // 注: /api/makers/subscription-status を使用（service='makers' のモニター・サブスクをチェック）
  const fetchUserSubscription = async () => {
    if (!user) return;
    setLoadingUserSubscription(true);
    try {
      const response = await fetch(`/api/makers/subscription-status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // MakersPlanTier ('guest' | 'free' | 'pro') を設定
        // 'pro' の場合は Pro機能が有効になる
        const planTier = data.planTier === 'pro' ? 'pro' : (data.planTier || 'none');
        setUserSubscription({ 
          planTier,
          gamificationLimit: data.gamificationLimit,
          aiDailyLimit: data.aiDailyLimit,
        });
      }
    } catch (error) {
      console.error('User subscription fetch error:', error);
      setUserSubscription({ planTier: 'none', gamificationLimit: 0, aiDailyLimit: 0 });
    } finally {
      setLoadingUserSubscription(false);
    }
  };

  // 管理者データ取得（各セクション表示時のみ遅延ロード）
  useEffect(() => {
    if (isAdmin && activeView === 'admin-users') {
      adminData.fetchUsersPage(adminData.userPage, adminData.userSearch);
    }
    // 所有権移動でもユーザー一覧が必要（全件）
    if (isAdmin && activeView === 'admin-transfer') {
      adminData.fetchAllUsers();
    }
  }, [isAdmin, activeView]);

  useEffect(() => {
    if (isAdmin && activeView === 'admin-announcements') {
      adminData.fetchAnnouncements();
    }
  }, [isAdmin, activeView]);

  // KDLサブスクリプション状態を取得
  const fetchKdlSubscription = async () => {
    if (!user) return;
    setLoadingKdlSubscription(true);
    try {
      const response = await fetch(`/api/kdl/subscription-status?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // モニター権限も hasActiveSubscription に含める
        const hasAccess = data.hasActiveSubscription || data.isMonitor;
        setKdlSubscription({
          ...data,
          hasActiveSubscription: hasAccess,
        });
      }
    } catch (error) {
      console.error('KDL subscription fetch error:', error);
    } finally {
      setLoadingKdlSubscription(false);
    }
  };

  // サイドバーのメニュー項目クリック時の処理
  const handleMenuItemClick = (itemId: string) => {
    setActiveView(itemId as ActiveView);

    // サービス選択の場合はselectedServiceも更新
    if (['quiz', 'profile', 'business', 'salesletter', 'onboarding'].includes(itemId)) {
      setSelectedService(itemId as ServiceType);
      fetchContents(itemId as ServiceType);
    }

    // サムネイルメーカーへの遷移（Pro限定）
    if (itemId === 'thumbnail') {
      if (isAdmin || hasMakersProAccess) {
        router.push('/thumbnail/editor');
      } else {
        router.push('/pricing');
      }
      return;
    }

    // Kindle執筆への遷移
    if (itemId === 'kindle') {
      // 管理者または課金済みユーザーは直接遷移
      if (isAdmin || kdlSubscription?.hasActiveSubscription) {
        const adminKey = isAdmin ? `?admin_key=${process.env.NEXT_PUBLIC_ADMIN_KEY || ''}` : '';
        router.push(`/kindle${adminKey}`);
      } else {
        // 未課金ユーザーにはモーダルを表示
        setShowKdlModal(true);
      }
      return;
    }

    // ネタ発掘診断への遷移
    if (itemId === 'kindle-discovery') {
      const adminKey = isAdmin ? `?admin_key=${process.env.NEXT_PUBLIC_ADMIN_KEY || ''}` : '';
      router.push(`/kindle/discovery${adminKey}`);
      return;
    }

    // スキルマーケット管理はダッシュボード内で表示
    if (itemId === 'marketplace-seller') {
      setActiveView('marketplace-seller' as ActiveView);
      return;
    }
  };

  // ナビゲーション処理
  const handleNavigate = (path: string, addAdminKey?: boolean) => {
    if (addAdminKey && isAdmin) {
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || '';
      router.push(`/${path}?admin_key=${adminKey}`);
    } else {
      router.push(`/${path}`);
    }
  };

  // 新規作成処理
  const handleCreateNew = () => {
    router.push(`/${selectedService}/editor`);
  };

  // サービス変更時の処理
  const handleServiceChange = (service: ServiceType) => {
    setSelectedService(service);
    fetchContents(service);
  };

  // 未ログイン時
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">マイページ</h1>
            <p className="text-gray-600 mb-6">ログインしてコンテンツを管理しましょう</p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              ログイン / 新規登録
            </button>
          </div>
        </div>
        <Footer />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
      </div>
    );
  }

  // ローディング中
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  // 管理者コンポーネントの準備（遅延レンダリング：表示時のみマウント）
  const adminComponents = isAdmin
    ? {
        Overview: () => (
          <AdminOverview
            onNavigate={(viewId) => setActiveView(viewId as ActiveView)}
            service="makers"
          />
        ),
        UserManager: () => (
          <div className="space-y-6">
            <UserExport
              exportingCsv={adminData.exportingCsv}
              exportingSheets={adminData.exportingSheets}
              onExportCsv={adminData.handleExportCsv}
              onExportSheets={adminData.handleExportSheets}
            />
            <UserManager
              allUsers={adminData.allUsers}
              loadingUsers={adminData.loadingUsers}
              userPage={adminData.userPage}
              setUserPage={adminData.setUserPage}
              userTotalCount={adminData.userTotalCount}
              userSearch={adminData.userSearch}
              setUserSearch={adminData.setUserSearch}
              onFetchPage={adminData.fetchUsersPage}
              editingUserId={adminData.editingUserId}
              setEditingUserId={adminData.setEditingUserId}
              partnerNote={adminData.partnerNote}
              setPartnerNote={adminData.setPartnerNote}
              awardingPoints={adminData.awardingPoints}
              setAwardingPoints={adminData.setAwardingPoints}
              pointsToAward={adminData.pointsToAward}
              setPointsToAward={adminData.setPointsToAward}
              pointsReason={adminData.pointsReason}
              setPointsReason={adminData.setPointsReason}
              onTogglePartner={adminData.handleTogglePartner}
              onAwardPoints={adminData.handleAwardPoints}
            />
          </div>
        ),
        AnnouncementManager: () => (
          <AnnouncementManager
            announcements={adminData.announcements}
            showAnnouncementForm={adminData.showAnnouncementForm}
            setShowAnnouncementForm={adminData.setShowAnnouncementForm}
            editingAnnouncement={adminData.editingAnnouncement}
            setEditingAnnouncement={adminData.setEditingAnnouncement}
            announcementForm={adminData.announcementForm}
            setAnnouncementForm={adminData.setAnnouncementForm}
            announcementPage={adminData.announcementPage}
            setAnnouncementPage={adminData.setAnnouncementPage}
            onSubmit={adminData.handleAnnouncementSubmit}
            onEdit={adminData.handleEditAnnouncement}
            onDelete={adminData.handleDeleteAnnouncement}
          />
        ),
        MonitorManager: () => user ? (
          <MonitorUsersManager adminUserId={user.id} adminEmail={user.email} />
        ) : null,
        ServiceManager: () => user ? (
          <div className="space-y-6">
            <SettingsHealthBadge service="makers" />
            <AdminPlanSettings userId={user.id} userEmail={user.email} serviceFilter="makers" />
            <AdminAIUsageStats userId={user.id} />
          </div>
        ) : null,
        AIModelManager: () => user ? (
          <div className="space-y-6">
            <AdminAISettings userId={user.id} />
            <AdminFeatureLimitsSettings userId={user.id} />
          </div>
        ) : null,
        GamificationManager: () => <GamificationManager />,
        AffiliateManager: () => <AffiliateManager user={user} />,
        FeaturedManager: () => <FeaturedManager />,
        OwnershipTransfer: () => <OwnershipTransfer allUsers={adminData.allUsers} />,
        CleanupManager: () => <CleanupManager userId={user?.id} />,
        FeedbackManager: () => <FeedbackManager />,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      
      <div className="flex-1">
        <DashboardLayout
          sidebar={
            <Sidebar
              user={user}
              isAdmin={isAdmin}
              activeItem={activeView}
              onItemClick={handleMenuItemClick}
              contentCounts={contentCounts}
              totalViews={totalViews}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
              hasKdlSubscription={kdlSubscription?.hasActiveSubscription || false}
              isKdlMonitor={kdlSubscription?.isMonitor || false}
              hasMakersProAccess={hasMakersProAccess}
            />
          }
          activeView={activeView}
          onItemClick={handleMenuItemClick}
          isAdmin={isAdmin}
        >
          <MainContent
            activeView={activeView}
            user={user}
            isAdmin={isAdmin}
            isPartner={isPartner}
            selectedService={selectedService}
            onServiceChange={handleServiceChange}
            contents={contents}
            contentCounts={contentCounts}
            isLoading={isLoading}
            proAccessMap={proAccessMap}
            processingId={processingId}
            copiedId={copiedId}
            kdlSubscription={kdlSubscription}
            loadingKdlSubscription={loadingKdlSubscription}
            userSubscription={userSubscription}
            loadingUserSubscription={loadingUserSubscription}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onView={handleView}
            onCopyUrl={handleCopyUrl}
            onEmbed={handleEmbed}
            onDownloadHtml={handleDownloadHtml}
            onPurchase={handlePurchase}
            onCreateNew={handleCreateNew}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onMenuItemClick={handleMenuItemClick}
            adminComponents={adminComponents}
          />
        </DashboardLayout>
      </div>

      <Footer />

      {/* モーダル */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
      
      {/* KDLアクセス案内モーダル */}
      <KdlAccessModal isOpen={showKdlModal} onClose={() => setShowKdlModal(false)} />
      
      {/* ゲーミフィケーション */}
      {user && <WelcomeBonus userId={user.id} />}
      {user && <LoginBonusToast userId={user.id} />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
