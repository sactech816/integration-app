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
import AffiliateManager from './components/Admin/AffiliateManager';
import FeaturedManager from './components/Admin/FeaturedManager';
import GamificationManager from './components/Admin/GamificationManager';
import AccountSettings from './components/Settings/AccountSettings';
import { Loader2 } from 'lucide-react';

// 新しいコンポーネント
import DashboardLayout from './components/DashboardLayout';
import Sidebar from './components/Sidebar';
import MainContent, { ActiveView } from './components/MainContent';
import { UserManager, AnnouncementManager, UserExport, CleanupManager } from './components/Admin';

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
    if (view && ['booking', 'survey', 'quiz', 'profile', 'business', 'affiliate', 'settings'].includes(view)) {
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
  
  // ユーザーサブスクリプション状態（ゲーム作成制限用）
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);

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

  // アナリティクス取得をスキップするかどうか（有料会員/パートナー/管理者以外はスキップ）
  const shouldSkipAnalytics = !isAdmin && !isPartner && !kdlSubscription?.hasActiveSubscription;

  // 初期データ取得（並列化で高速化）
  useEffect(() => {
    if (user) {
      // 並列でデータ取得（アナリティクスは条件付き）
      Promise.all([
        fetchContents(selectedService, { skipAnalytics: shouldSkipAnalytics }),
        fetchPurchases(),
        fetchAllContentCounts(),
        fetchKdlSubscription(),
        fetchUserSubscription(),
      ]);
    }
  }, [user, selectedService]);
  
  // ユーザーサブスクリプション状態を取得
  const fetchUserSubscription = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/subscription/status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserSubscription({
          planTier: data.planTier || 'none',
        });
      }
    } catch (error) {
      console.error('User subscription fetch error:', error);
      setUserSubscription({ planTier: 'none' });
    }
  };

  // 管理者データ取得
  useEffect(() => {
    if (isAdmin) {
      adminData.fetchAllUsers();
      adminData.fetchAnnouncements();
    }
  }, [isAdmin]);

  // KDLサブスクリプション状態を取得
  const fetchKdlSubscription = async () => {
    if (!user) return;
    setLoadingKdlSubscription(true);
    try {
      const response = await fetch('/api/kdl/subscription-status', {
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
    if (['quiz', 'profile', 'business'].includes(itemId)) {
      setSelectedService(itemId as ServiceType);
      fetchContents(itemId as ServiceType);
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

  // 管理者コンポーネントの準備
  const adminComponents = isAdmin
    ? {
        UserManager: (
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
        AnnouncementManager: (
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
        MonitorManager: user ? (
          <MonitorUsersManager adminUserId={user.id} adminEmail={user.email} />
        ) : null,
        ServiceManager: user ? (
          <div className="space-y-6">
            <AdminPlanSettings userId={user.id} userEmail={user.email} />
            <AdminAIUsageStats userId={user.id} />
          </div>
        ) : null,
        AIModelManager: user ? (
          <div className="space-y-6">
            <AdminAISettings userId={user.id} />
            <AdminFeatureLimitsSettings userId={user.id} />
          </div>
        ) : null,
        GamificationManager: <GamificationManager />,
        AffiliateManager: <AffiliateManager user={user} />,
        FeaturedManager: <FeaturedManager />,
        CleanupManager: <CleanupManager userId={user?.id} />,
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
            />
          }
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
