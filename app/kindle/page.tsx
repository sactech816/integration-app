'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen, Plus, Loader2, Edit3, Trash2, Calendar, FileText,
  Crown, Sparkles, Zap, ArrowRight, X, Users, ChevronDown, ChevronUp, BarChart3, User,
  Copy, AlertCircle, Tag, FolderTree, MessageSquare, Globe, ExternalLink, Rocket, Eye,
  Image as ImageIcon
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import AIUsageDisplay from '@/components/kindle/AIUsageDisplay';
import KdlUsageHeader, { type KdlUsageLimits } from '@/components/kindle/KdlUsageHeader';
import { KdlDashboardLayout, KdlSidebar, PublishGuideContent } from '@/components/kindle/dashboard';
import type { KdlUserRole } from '@/components/kindle/dashboard';
import { getAdminEmails } from '@/lib/constants';
// 管理者機能コンポーネント
import AdminAISettings from '@/components/shared/AdminAISettings';
import MonitorUsersManager from '@/components/shared/MonitorUsersManager';
import { AdminUserList, GuideBookManager, AnnouncementManager, KdlServiceManagement, KdlPlanSettings } from '@/components/kindle/admin';
import { EducationContent } from '@/components/kindle/education';
import { AnnouncementList } from '@/components/kindle/announcements';
import AffiliateManager from '@/app/dashboard/components/Admin/AffiliateManager';
import KindleCoverGenerator from '@/components/kindle/cover/KindleCoverGenerator';
import AdminAIUsageStats from '@/components/shared/AdminAIUsageStats';
import AdminFeatureLimitsSettings from '@/components/shared/AdminFeatureLimitsSettings';
import SettingsHealthBadge from '@/components/shared/SettingsHealthBadge';
import AdminOverview from '@/app/dashboard/components/Admin/AdminOverview';
// 代理店機能コンポーネント
import AgencyUserList from '@/components/kindle/agency/AgencyUserList';
import AgencyProgressView from '@/components/kindle/agency/AgencyProgressView';
import AgencyFeedbackView from '@/components/kindle/agency/AgencyFeedbackView';
import AgencyMessagesView from '@/components/kindle/agency/AgencyMessagesView';
import AdminAgencyManager from '@/components/kindle/agency/AdminAgencyManager';

// プラン名を詳細表示するヘルパー関数
const getPlanDisplayName = (planTier?: string, planType?: string, isMonitor?: boolean): string => {
  if (isMonitor) return 'モニター特典';
  
  // 初回プラン（一括購入）
  if (planTier?.startsWith('initial_')) {
    switch (planTier) {
      case 'initial_trial': return '初回プラン（一括購入）トライアル';
      case 'initial_standard': return '初回プラン（一括購入）スタンダード';
      case 'initial_business': return '初回プラン（一括購入）ビジネス';
      default: return '初回プラン（一括購入）';
    }
  }
  
  // 継続プラン
  if (planType === 'monthly' || planType === 'yearly') {
    switch (planTier) {
      case 'lite': return '継続プラン ライト';
      case 'standard': return '継続プラン スタンダード';
      case 'pro': return '継続プラン プロ';
      case 'business': return '継続プラン ビジネス';
      case 'enterprise': return '継続プラン エンタープライズ';
      default: return planType === 'yearly' ? '継続プラン（年額）' : '継続プラン（月額）';
    }
  }
  
  return 'お試し';
};

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_email?: string;
  chapters_count?: number;
  sections_count?: number;
  completed_sections_count?: number;
}

interface UserBooks {
  user_id: string;
  user_email: string;
  books: Book[];
  total_books: number;
  total_sections: number;
  completed_sections: number;
}

interface AdminStats {
  totalBooks: number;
  totalUsers: number;
  totalSections: number;
  completedSections: number;
}

// ローディングフォールバックコンポーネント
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-amber-600" size={40} />
        <p className="text-gray-600 font-medium">読み込み中...</p>
      </div>
    </div>
  );
}

// メインページコンポーネント（Suspenseでラップされる）
function KindleListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [userBooks, setUserBooks] = useState<UserBooks[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // admin_keyパラメータを取得（存在する場合はリンクに引き継ぐ）
  const adminKey = searchParams.get('admin_key');
  const adminKeyParam = adminKey ? `?admin_key=${adminKey}` : '';
  const [user, setUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasActiveSubscription: boolean;
    planType: 'monthly' | 'yearly' | 'none';
    planTier?: 'none' | 'lite' | 'standard' | 'pro' | 'business' | 'enterprise';
    isMonitor?: boolean;
    monitorExpiresAt?: string;
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // サイドバー関連の状態
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [previousMenuItem, setPreviousMenuItem] = useState('dashboard');

  // KDP情報モーダル関連の状態
  const [kdpModalBookId, setKdpModalBookId] = useState<string | null>(null);
  const [kdpInfo, setKdpInfo] = useState<{
    keywords: string[];
    description: string;
    categories: string[];
    catch_copy: string;
  } | null>(null);
  const [kdpLoading, setKdpLoading] = useState(false);
  const [kdpError, setKdpError] = useState<string>('');

  // 管理者かどうかを判定
  const adminEmails = getAdminEmails();
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 代理店関連の状態
  const [isAgency, setIsAgency] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);

  // 代理店ビュー間のナビゲーション用ステート
  const [selectedAgencyUserId, setSelectedAgencyUserId] = useState<string | undefined>();
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();

  // ユーザーロールを決定
  const getUserRole = (): KdlUserRole => {
    if (isAdmin) return 'admin';
    if (isAgency) return 'agency';
    return 'user';
  };


  // 書籍LP一覧用の状態
  const [bookLPs, setBookLPs] = useState<Record<string, any>>({});
  const [loadingBookLPs, setLoadingBookLPs] = useState(false);

  // 表紙作成モーダル関連の状態
  const [coverModalBookId, setCoverModalBookId] = useState<string | null>(null);
  const [coverModalBook, setCoverModalBook] = useState<{ title: string; subtitle: string | null } | null>(null);

  // KDL使用量制限
  const [usageLimits, setUsageLimits] = useState<KdlUsageLimits | null>(null);
  const [usageRefreshTrigger, setUsageRefreshTrigger] = useState(0);

  // ユーザーが読み込まれたら管理者判定
  useEffect(() => {
    if (user?.email) {
      const adminStatus = adminEmails.some((email: string) =>
        user.email?.toLowerCase() === email.toLowerCase()
      );
      setIsAdmin(adminStatus);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // 代理店ステータスチェック（管理者も代理店を兼ねる可能性がある）
  useEffect(() => {
    const checkAgencyStatus = async () => {
      if (!user || !supabase) {
        setIsAgency(false);
        setAgencyId(null);
        return;
      }
      try {
        const { data } = await supabase
          .from('kdl_agencies')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
        if (data) {
          setIsAgency(true);
          setAgencyId(data.id);
        } else {
          setIsAgency(false);
          setAgencyId(null);
        }
      } catch {
        setIsAgency(false);
        setAgencyId(null);
      }
    };
    checkAgencyStatus();
  }, [user]);

  // ユーザーとサブスク状態を取得
  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setAccessToken(session?.access_token || null);

        if (session?.user) {
          const response = await fetch(`/api/subscription/status?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setSubscriptionStatus({
              hasActiveSubscription: data.hasActiveSubscription,
              planType: data.planType,
              planTier: data.planTier,
              isMonitor: data.isMonitor,
              monitorExpiresAt: data.monitorExpiresAt,
            });
          }
        }
      } catch (err) {
        console.error('Subscription fetch error:', err);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchUserAndSubscription();
  }, []);

  // 書籍を取得（管理者と課金者で異なるロジック）
  useEffect(() => {
    const fetchBooks = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        // デモデータ
        setBooks([
          {
            id: 'demo-book-1',
            title: 'サンプル書籍',
            subtitle: 'Kindle執筆システムのデモ',
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            chapters_count: 3,
            sections_count: 9,
            completed_sections_count: 3,
          },
        ]);
        setIsLoading(false);
        return;
      }

      // 管理者判定が完了するまで待つ
      if (loadingSubscription) return;

      try {
        if (isAdmin) {
          // 管理者: APIから全ユーザーの書籍を取得
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            throw new Error('認証が必要です');
          }

          const response = await fetch('/api/admin/kdl-books', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error('書籍の取得に失敗しました');
          }

          const data = await response.json();
          setUserBooks(data.userBooks || []);
          setAdminStats(data.stats || null);
          // 最初のユーザーを展開状態にする
          if (data.userBooks && data.userBooks.length > 0) {
            setExpandedUsers(new Set([data.userBooks[0].user_id]));
          }
        } else {
          // 課金者: 自分の書籍のみ取得
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            throw new Error('ログインが必要です');
          }

          const { data, error: fetchError } = await supabase
            .from('kdl_books')
            .select('id, title, subtitle, status, created_at, updated_at, user_id')
            .eq('user_id', session.user.id)
            .order('updated_at', { ascending: false });

          if (fetchError) throw fetchError;

          // 各書籍の進捗情報を取得
          const booksWithProgress = await Promise.all(
            (data || []).map(async (book) => {
              // 章数を取得
              const { count: chaptersCount } = await supabase
                .from('kdl_chapters')
                .select('id', { count: 'exact', head: true })
                .eq('book_id', book.id);

              // 節数を取得
              const { data: sections } = await supabase
                .from('kdl_sections')
                .select('id, content')
                .eq('book_id', book.id);

              const sectionsCount = sections?.length || 0;
              // 完成判定: 100文字以上のテキストコンテンツがある節のみカウント
              const completedSectionsCount = sections?.filter(
                (s) => {
                  if (!s.content) return false;
                  // HTMLタグを除去してテキストのみを抽出
                  const textOnly = s.content.replace(/<[^>]*>/g, '').trim();
                  return textOnly.length >= 100;
                }
              ).length || 0;

              return {
                ...book,
                chapters_count: chaptersCount || 0,
                sections_count: sectionsCount,
                completed_sections_count: completedSectionsCount,
              };
            })
          );

          setBooks(booksWithProgress);
        }
      } catch (err: any) {
        setError(err.message || '書籍の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [isAdmin, loadingSubscription]);

  // 書籍LP一覧: メニュー選択時にLP情報を一括取得
  useEffect(() => {
    if (activeMenuItem !== 'book-lps' && activeMenuItem !== 'book-covers') return;
    if (books.length === 0) return;

    const fetchBookLPs = async () => {
      setLoadingBookLPs(true);
      const lpMap: Record<string, any> = {};

      await Promise.all(
        books.map(async (book) => {
          try {
            const res = await fetch(`/api/kdl/generate-book-lp?book_id=${book.id}`);
            if (res.ok) {
              const data = await res.json();
              lpMap[book.id] = data;
            }
          } catch {
            // LP未生成の場合は無視
          }
        })
      );

      setBookLPs(lpMap);
      setLoadingBookLPs(false);
    };

    fetchBookLPs();
  }, [activeMenuItem, books]);

  // 表紙作成モーダルを開く
  const handleOpenCoverModal = useCallback((book: Book) => {
    setCoverModalBookId(book.id);
    setCoverModalBook({ title: book.title, subtitle: book.subtitle });
  }, []);

  const handleDelete = async (bookId: string) => {
    if (!confirm('この書籍を削除しますか？')) return;

    if (!isSupabaseConfigured() || !supabase) {
      setBooks(prev => prev.filter(b => b.id !== bookId));
      return;
    }

    try {
      // 節を削除
      const { data: chapters } = await supabase
        .from('kdl_chapters')
        .select('id')
        .eq('book_id', bookId);

      if (chapters && chapters.length > 0) {
        const chapterIds = chapters.map(c => c.id);
        await supabase.from('kdl_sections').delete().in('chapter_id', chapterIds);
      }

      // 章を削除
      await supabase.from('kdl_chapters').delete().eq('book_id', bookId);

      // 本を削除
      await supabase.from('kdl_books').delete().eq('id', bookId);

      if (isAdmin) {
        // 管理者の場合はuserBooksを更新
        setUserBooks(prev => prev.map(ub => ({
          ...ub,
          books: ub.books.filter(b => b.id !== bookId),
          total_books: ub.books.filter(b => b.id !== bookId).length,
        })).filter(ub => ub.books.length > 0));
      } else {
        setBooks(prev => prev.filter(b => b.id !== bookId));
      }
    } catch (err: any) {
      alert('削除に失敗しました: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // サイドバーのメニュークリック処理
  const handleMenuItemClick = useCallback((itemId: string) => {
    setPreviousMenuItem(activeMenuItem);
    setActiveMenuItem(itemId);
    
    switch (itemId) {
      case 'dashboard':
        // 現在のページなので何もしない
        break;
      case 'new-book':
        router.push(`/kindle/new${adminKeyParam}`);
        break;
      case 'discovery':
        router.push(`/kindle/discovery${adminKeyParam}`);
        break;
      case 'book-lps':
        // 書籍LP一覧画面を表示（setActiveMenuItemで切り替え済み）
        break;
      case 'book-covers':
        // 表紙作成一覧画面を表示（setActiveMenuItemで切り替え済み）
        break;
      case 'my-books':
        // 現在のページで書籍一覧にスクロール
        document.getElementById('books-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'guidebook':
        // ガイドブック（旧：教育コンテンツ）画面を表示
        break;
      case 'publish-guide':
        // 右側コンテンツエリアに出版準備ガイドを表示（別ページに遷移しない）
        break;
      case 'announcements':
        // お知らせ画面を表示
        break;
      case 'agency-users':
      case 'agency-progress':
      case 'agency-feedback':
      case 'agency-messages':
        // 代理店機能: setActiveMenuItemで画面切り替え（すでに上で設定済み）
        break;
      case 'admin-users':
      case 'admin-announcements':
      case 'admin-guidebook':
      case 'admin-monitors':
      case 'admin-service':
      case 'admin-ai-model':
      case 'admin-affiliate':
      case 'admin-agency':
        // 管理者機能: setActiveMenuItemで画面切り替え（すでに上で設定済み）
        break;
      case 'settings':
        // KDL専用のアカウント設定（集客メーカーには飛ばない）
        break;
      default:
        break;
    }
  }, [router, adminKeyParam, activeMenuItem]);

  const handleNavigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const handleLogout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push('/');
    }
  }, [router]);

  // KDP情報モーダルを開く
  const handleOpenKdpModal = useCallback(async (bookId: string) => {
    setKdpModalBookId(bookId);
    setKdpLoading(true);
    setKdpError('');
    setKdpInfo(null);

    try {
      // 保存済みKDP情報を取得
      const response = await fetch(`/api/kdl/generate-kdp-info?book_id=${bookId}`);
      
      if (response.ok) {
        const data = await response.json();
        setKdpInfo(data);
      } else {
        const errorData = await response.json();
        if (errorData.notGenerated) {
          setKdpError('KDP情報はまだ生成されていません。執筆画面の「KDP情報」ボタンから生成してください。');
        } else {
          setKdpError(errorData.error || 'KDP情報の取得に失敗しました');
        }
      }
    } catch (error: any) {
      console.error('Fetch KDP info error:', error);
      setKdpError('KDP情報の取得に失敗しました');
    } finally {
      setKdpLoading(false);
    }
  }, []);

  // クリップボードにコピー
  const handleCopyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label}をコピーしました`);
    } catch (error) {
      console.error('Copy error:', error);
      alert('コピーに失敗しました');
    }
  }, []);

  // アクセス権チェック中、または未課金ユーザーがリダイレクト中はローディング表示
  if (loadingSubscription) {
    return <LoadingFallback />;
  }

  // 書籍カードコンポーネント
  const BookCard = ({ book }: { book: Book }) => {
    const progress = getProgressPercentage(
      book.completed_sections_count || 0,
      book.sections_count || 0
    );

    return (
      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-5 hover:shadow-lg transition-all group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/kindle/${book.id}${adminKeyParam}`}
              className="block group-hover:text-amber-600 transition-colors"
            >
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {book.title}
              </h3>
              {book.subtitle && (
                <p className="text-gray-500 text-sm truncate mt-1">
                  {book.subtitle}
                </p>
              )}
            </Link>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(book.updated_at)}
              </span>
              {book.chapters_count !== undefined && (
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {book.chapters_count}章
                </span>
              )}
              {book.sections_count !== undefined && book.sections_count > 0 && (
                <span className="flex items-center gap-1">
                  <BarChart3 size={14} />
                  {book.completed_sections_count || 0}/{book.sections_count}節
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                progress === 100
                  ? 'bg-green-100 text-green-700'
                  : progress > 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {progress === 100 ? '執筆完了' : progress > 0 ? '執筆中' : '下書き'}
              </span>
            </div>
            {/* 進捗バー */}
            {book.sections_count !== undefined && book.sections_count > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>執筆進捗</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progress === 100
                        ? 'bg-green-500'
                        : progress >= 50
                        ? 'bg-amber-500'
                        : 'bg-orange-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/kindle/${book.id}${adminKeyParam}`}
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="編集"
            >
              <Edit3 size={20} />
            </Link>
            <button
              onClick={() => handleOpenKdpModal(book.id)}
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="KDP情報"
            >
              <Sparkles size={20} />
            </button>
            <button
              onClick={() => handleOpenCoverModal(book)}
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              title="表紙作成"
            >
              <ImageIcon size={20} />
            </button>
            <button
              onClick={() => handleDelete(book.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="削除"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // サイドバーをレンダリング
  const sidebar = (
    <KdlSidebar
      user={user}
      userRole={getUserRole()}
      activeItem={activeMenuItem}
      onItemClick={handleMenuItemClick}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      bookCount={isAdmin ? adminStats?.totalBooks : books.length}
      adminStats={adminStats ? { totalUsers: adminStats.totalUsers, totalBooks: adminStats.totalBooks } : undefined}
      hasActiveSubscription={subscriptionStatus?.hasActiveSubscription}
      isMonitor={subscriptionStatus?.isMonitor}
      planTier={subscriptionStatus?.planTier}
    />
  );

  return (
    <KdlDashboardLayout sidebar={sidebar}>
      {/* 出版準備ガイド表示（サイドバーから選択時） */}
      {activeMenuItem === 'publish-guide' ? (
        <PublishGuideContent />
      ) : activeMenuItem === 'admin-overview' && user && isAdmin ? (
        /* 管理者ダッシュボード概要 */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          <AdminOverview
            onNavigate={(viewId) => {
              setPreviousMenuItem(activeMenuItem);
              setActiveMenuItem(viewId);
            }}
            service="kdl"
          />
        </div>
      ) : activeMenuItem === 'admin-ai-model' && user && isAdmin ? (
        /* AIモデル設定画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <AdminAISettings userId={user.id} />
        </div>
      ) : activeMenuItem === 'admin-monitors' && user && isAdmin ? (
        /* モニター管理画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <MonitorUsersManager
            adminUserId={user.id}
            adminEmail={user.email}
            defaultService="kdl"
          />
        </div>
      ) : activeMenuItem === 'admin-users' && user && isAdmin && accessToken ? (
        /* ユーザー管理画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <AdminUserList userId={user.id} accessToken={accessToken} />
        </div>
      ) : activeMenuItem === 'admin-announcements' && user && isAdmin && accessToken ? (
        /* お知らせ管理画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <AnnouncementManager userId={user.id} accessToken={accessToken} />
        </div>
      ) : activeMenuItem === 'admin-guidebook' && user && isAdmin && accessToken ? (
        /* ガイドブック管理画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <GuideBookManager userId={user.id} accessToken={accessToken} />
        </div>
      ) : activeMenuItem === 'admin-service' && user && isAdmin && accessToken ? (
        /* サービス管理画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <SettingsHealthBadge service="kdl" />
          <KdlServiceManagement userId={user.id} accessToken={accessToken} />
          {/* KDLプラン設定 */}
          <KdlPlanSettings userId={user.id} userEmail={user.email} />
          {/* AI使用量とコスト統計 */}
          <AdminAIUsageStats userId={user.id} />
        </div>
      ) : activeMenuItem === 'admin-affiliate' && user && isAdmin ? (
        /* アフィリエイト管理画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <AffiliateManager user={user} />
        </div>
      ) : activeMenuItem === 'guidebook' ? (
        /* ガイドブック画面（旧：教育コンテンツ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          <EducationContent userId={user?.id} />
        </div>
      ) : activeMenuItem === 'announcements' ? (
        /* お知らせ画面 */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          <AnnouncementList userId={user?.id} accessToken={accessToken || undefined} />
        </div>
      ) : activeMenuItem === 'agency-users' && user && (isAgency || isAdmin) ? (
        /* 担当ユーザー一覧（代理店機能） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          {agencyId ? (
            <AgencyUserList
              agencyId={agencyId}
              accessToken={accessToken || undefined}
              onSelectUser={(uid) => {
                setSelectedAgencyUserId(uid);
                setActiveMenuItem('agency-progress');
              }}
              onFeedback={(uid) => {
                setSelectedAgencyUserId(uid);
                setActiveMenuItem('agency-feedback');
              }}
              onMessage={(uid) => {
                setSelectedAgencyUserId(uid);
                setActiveMenuItem('agency-messages');
              }}
            />
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <Users className="text-amber-400 mx-auto mb-3" size={40} />
              <h3 className="text-lg font-bold text-gray-700 mb-2">代理店として登録されていません</h3>
              <p className="text-gray-500 mb-4">この機能を利用するには、管理者画面から代理店登録を行ってください。</p>
              {isAdmin && (
                <button
                  onClick={() => setActiveMenuItem('admin-agency')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  代理店管理へ移動
                </button>
              )}
            </div>
          )}
        </div>
      ) : activeMenuItem === 'agency-progress' && user && (isAgency || isAdmin) && accessToken ? (
        /* 進捗管理（代理店機能） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('agency-users')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 担当ユーザー一覧に戻る
            </button>
          </div>
          {agencyId ? (
            <AgencyProgressView
              agencyId={agencyId}
              accessToken={accessToken}
              selectedUserId={selectedAgencyUserId}
              onFeedback={(uid, bookId, sectionId) => {
                setSelectedAgencyUserId(uid);
                setSelectedBookId(bookId);
                setSelectedSectionId(sectionId);
                setActiveMenuItem('agency-feedback');
              }}
            />
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <BarChart3 className="text-amber-400 mx-auto mb-3" size={40} />
              <h3 className="text-lg font-bold text-gray-700 mb-2">代理店として登録されていません</h3>
              <p className="text-gray-500">この機能を利用するには代理店登録が必要です。</p>
            </div>
          )}
        </div>
      ) : activeMenuItem === 'agency-feedback' && user && (isAgency || isAdmin) && accessToken ? (
        /* 添削・フィードバック（代理店機能） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('agency-users')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 担当ユーザー一覧に戻る
            </button>
          </div>
          {agencyId ? (
            <AgencyFeedbackView
              agencyId={agencyId}
              accessToken={accessToken}
              initialBookId={selectedBookId}
              initialSectionId={selectedSectionId}
            />
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <Edit3 className="text-amber-400 mx-auto mb-3" size={40} />
              <h3 className="text-lg font-bold text-gray-700 mb-2">代理店として登録されていません</h3>
              <p className="text-gray-500">この機能を利用するには代理店登録が必要です。</p>
            </div>
          )}
        </div>
      ) : activeMenuItem === 'agency-messages' && user && (isAgency || isAdmin) && accessToken ? (
        /* メッセージ（代理店機能） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('agency-users')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 担当ユーザー一覧に戻る
            </button>
          </div>
          {agencyId ? (
            <AgencyMessagesView
              agencyId={agencyId}
              userId={user.id}
              accessToken={accessToken}
            />
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <MessageSquare className="text-amber-400 mx-auto mb-3" size={40} />
              <h3 className="text-lg font-bold text-gray-700 mb-2">代理店として登録されていません</h3>
              <p className="text-gray-500">この機能を利用するには代理店登録が必要です。</p>
            </div>
          )}
        </div>
      ) : activeMenuItem === 'admin-agency' && user && isAdmin && accessToken ? (
        /* 代理店管理画面（管理者のみ） */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem(previousMenuItem)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 戻る
            </button>
          </div>
          <AdminAgencyManager userId={user.id} accessToken={accessToken} />
        </div>
      ) : activeMenuItem === 'settings' && user ? (
        /* アカウント設定画面 */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveMenuItem('dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">アカウント設定</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーID</label>
                <div className="text-gray-600 bg-gray-50 px-4 py-2 rounded-lg text-sm font-mono">{user.id}</div>
              </div>
              {subscriptionStatus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">プラン</label>
                  <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {subscriptionStatus.planTier || 'なし'}
                    {subscriptionStatus.hasActiveSubscription && (
                      <span className="ml-2 text-green-600 text-sm">（有効）</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeMenuItem === 'book-lps' ? (
        /* 書籍LP一覧画面 */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setActiveMenuItem('dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Globe size={28} className="text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">書籍LP一覧</h2>
          </div>
          <p className="text-gray-500 text-sm">
            各書籍のランディングページの状態を確認・管理できます。LPの編集は執筆画面から行えます。
          </p>

          {loadingBookLPs ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-amber-500 mr-2" size={24} />
              <span className="text-gray-600">LP情報を取得中...</span>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">書籍がまだありません。新規作成してLPを生成しましょう。</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {books.map((book) => {
                const lp = bookLPs[book.id];
                const hasLP = !!lp;
                const heroTitle = lp?.hero?.catchcopy || '';
                const themeColor = lp?.theme_color || 'orange';
                const lpStatus = lp?.status || 'draft';

                const themeColorMap: Record<string, string> = {
                  orange: 'bg-amber-500',
                  navy: 'bg-blue-800',
                  purple: 'bg-purple-600',
                  green: 'bg-emerald-600',
                  red: 'bg-red-600',
                };
                const themeBorderMap: Record<string, string> = {
                  orange: 'border-amber-200',
                  navy: 'border-blue-200',
                  purple: 'border-purple-200',
                  green: 'border-emerald-200',
                  red: 'border-red-200',
                };

                return (
                  <div
                    key={book.id}
                    className={`bg-white rounded-xl border ${hasLP ? themeBorderMap[themeColor] || 'border-gray-200' : 'border-gray-200'} p-5 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{book.title || '無題の書籍'}</h3>
                          {hasLP && (
                            <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${themeColorMap[themeColor] || 'bg-gray-400'}`} title={`テーマ: ${themeColor}`} />
                          )}
                        </div>
                        {book.subtitle && (
                          <p className="text-sm text-gray-500 truncate mb-2">{book.subtitle}</p>
                        )}

                        {hasLP ? (
                          <div className="space-y-1.5">
                            <p className="text-sm text-gray-700 line-clamp-1">
                              <span className="font-medium text-gray-500">キャッチコピー:</span>{' '}
                              {heroTitle || '（未設定）'}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                lpStatus === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {lpStatus === 'published' ? '公開中' : '下書き'}
                              </span>
                              {lp?.updated_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(lp.updated_at).toLocaleDateString('ja-JP')}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">LP未生成 — 執筆画面から生成できます</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasLP && (
                          <a
                            href={`/kindle/book-lp/${book.id}?preview=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            title="公開ページをプレビュー"
                          >
                            <Eye size={15} />
                            <span className="hidden sm:inline">プレビュー</span>
                          </a>
                        )}
                        <button
                          onClick={() => router.push(`/kindle/${book.id}${adminKeyParam ? adminKeyParam + '&' : '?'}openLP=true`)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition font-medium"
                        >
                          <Rocket size={15} />
                          <span className="hidden sm:inline">{hasLP ? 'LP編集' : 'LP生成'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeMenuItem === 'book-covers' ? (
        /* 表紙作成一覧画面 */
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setActiveMenuItem('dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← ダッシュボードに戻る
            </button>
          </div>
          <div className="flex items-center gap-3">
            <ImageIcon size={28} className="text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">表紙作成</h2>
          </div>
          <p className="text-gray-500 text-sm">
            各書籍のAI表紙画像を作成・管理できます。表紙作成ボタンからGemini AIが高品質な表紙を自動生成します。
          </p>

          {loadingBookLPs ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-amber-500 mr-2" size={24} />
              <span className="text-gray-600">表紙情報を取得中...</span>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">書籍がまだありません。新規作成してから表紙を生成しましょう。</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {books.map((book) => {
                const lp = bookLPs[book.id];
                const coverUrl = lp?.cover_image_url;
                const hasCover = !!coverUrl;

                return (
                  <div
                    key={book.id}
                    className={`bg-white rounded-xl border ${hasCover ? 'border-orange-200' : 'border-gray-200'} p-5 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {hasCover ? (
                          <div className="w-16 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                            <img
                              src={coverUrl}
                              alt={`${book.title}の表紙`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 bg-gray-50">
                            <ImageIcon size={20} className="text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{book.title || '無題の書籍'}</h3>
                          {book.subtitle && (
                            <p className="text-sm text-gray-500 truncate mb-2">{book.subtitle}</p>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            hasCover
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {hasCover ? '表紙あり' : '表紙未作成'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasCover && (
                          <a
                            href={coverUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            title="表紙画像を表示"
                          >
                            <Eye size={15} />
                            <span className="hidden sm:inline">プレビュー</span>
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenCoverModal(book)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition font-medium"
                        >
                          <Sparkles size={15} />
                          <span className="hidden sm:inline">{hasCover ? '再生成' : '表紙作成'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
      {/* 未加入者向けサブスク促進バナー - 一旦非表示 */}
      {/* {showBanner && !loadingSubscription && !subscriptionStatus?.hasActiveSubscription && !isAdmin && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-xl mb-6">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex bg-white/20 p-2.5 rounded-xl">
                  <Crown size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">
                    🚀 KDLプランに加入してフル機能を解放！
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                    AI使用量無制限・Word出版エクスポート・優先サポート
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/kindle/lp"
                  className="bg-white text-orange-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles size={16} />
                  <span className="hidden sm:inline">プランを見る</span>
                  <ArrowRight size={16} className="sm:hidden" />
                </Link>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="閉じる"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* 加入者向けステータス表示 */}
      {!loadingSubscription && subscriptionStatus?.hasActiveSubscription && !isAdmin && (
        <div className={`border rounded-xl mb-6 ${
          subscriptionStatus.isMonitor 
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        }`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${subscriptionStatus.isMonitor ? 'bg-purple-100' : 'bg-green-100'}`}>
                  <Crown size={18} className={subscriptionStatus.isMonitor ? 'text-purple-600' : 'text-green-600'} />
                </div>
                <span className={`font-bold text-sm ${subscriptionStatus.isMonitor ? 'text-purple-700' : 'text-green-700'}`}>
                  {getPlanDisplayName(subscriptionStatus.planTier, subscriptionStatus.planType, subscriptionStatus.isMonitor)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  subscriptionStatus.isMonitor ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                  有効
                </span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${subscriptionStatus.isMonitor ? 'text-purple-600' : 'text-green-600'}`}>
                <Zap size={14} />
                <span>AI機能フル解放中</span>
              </div>
            </div>
            {subscriptionStatus.isMonitor && subscriptionStatus.monitorExpiresAt && (
              <p className="text-xs text-purple-600 mt-2 ml-9">
                モニター期限: {new Date(subscriptionStatus.monitorExpiresAt).toLocaleDateString('ja-JP')}まで
              </p>
            )}
          </div>
        </div>
      )}

      {/* 管理者向け統計バナー */}
      {isAdmin && adminStats && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl mb-6">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users size={20} className="text-purple-600" />
                </div>
                <div>
                  <span className="text-purple-700 font-bold text-sm">全ユーザーの書籍管理</span>
                  <p className="text-purple-600 text-xs">進捗状況を確認できます</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-700">{adminStats.totalUsers}</p>
                  <p className="text-xs text-purple-500">ユーザー</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-700">{adminStats.totalBooks}</p>
                  <p className="text-xs text-purple-500">書籍</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-700">
                    {getProgressPercentage(adminStats.completedSections, adminStats.totalSections)}%
                  </p>
                  <p className="text-xs text-purple-500">全体進捗</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI使用量表示（ログインユーザー向け） */}
      {user && subscriptionStatus && !isAdmin && (
        <div className="mb-6">
          <AIUsageDisplay 
            userId={user.id} 
            planType={subscriptionStatus.planType}
            planTier={subscriptionStatus.planTier}
            isMonitor={subscriptionStatus.isMonitor}
          />
        </div>
      )}

      {/* 書籍セクション */}
      <div id="books-section">
        {/* 使用量ヘッダー（一般ユーザー向け） */}
        {user && !isAdmin && (
          <div className="mb-4 flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2">
            <span className="text-xs text-gray-500">残り回数</span>
            <KdlUsageHeader
              userId={user.id}
              onLimitsChange={setUsageLimits}
              refreshTrigger={usageRefreshTrigger}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? '全ユーザーの書籍' : 'あなたの書籍'}
          </h1>
          {/* 新規作成ボタン - 書籍上限チェック */}
          {usageLimits && !usageLimits.bookCreation.canCreate && !isAdmin ? (
            <div
              className="flex items-center gap-2 bg-gray-300 text-gray-500 font-bold px-4 py-2 rounded-xl cursor-not-allowed"
              title={`書籍作成の上限（${usageLimits.bookCreation.limit}冊）に達しました`}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">上限に達しました</span>
              <span className="sm:hidden">上限</span>
            </div>
          ) : (
            <Link
              href={`/kindle/new${adminKeyParam}`}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">新しい本を作成</span>
              <span className="sm:hidden">新規</span>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : isAdmin ? (
          // 管理者向け: ユーザーごとにグループ化した表示
          userBooks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-12 text-center">
              <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
              <h2 className="text-xl font-bold text-gray-700 mb-2">まだ書籍がありません</h2>
              <p className="text-gray-500 mb-6">ユーザーが書籍を作成するとここに表示されます</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userBooks.map((userBook) => (
                <div
                  key={userBook.user_id}
                  className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
                >
                  {/* ユーザーヘッダー */}
                  <button
                    onClick={() => toggleUserExpanded(userBook.user_id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <User size={20} className="text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{userBook.user_email}</p>
                        <p className="text-sm text-gray-500">
                          {userBook.total_books}冊の書籍 · 
                          {userBook.completed_sections}/{userBook.total_sections}節完了
                          ({getProgressPercentage(userBook.completed_sections, userBook.total_sections)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* ユーザー進捗バー */}
                      <div className="hidden sm:block w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              getProgressPercentage(userBook.completed_sections, userBook.total_sections) === 100
                                ? 'bg-green-500'
                                : getProgressPercentage(userBook.completed_sections, userBook.total_sections) >= 50
                                ? 'bg-amber-500'
                                : 'bg-orange-400'
                            }`}
                            style={{ width: `${getProgressPercentage(userBook.completed_sections, userBook.total_sections)}%` }}
                          />
                        </div>
                      </div>
                      {expandedUsers.has(userBook.user_id) ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* 書籍リスト */}
                  {expandedUsers.has(userBook.user_id) && (
                    <div className="p-4 space-y-3">
                      {userBook.books.map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          // 課金者向け: 自分の書籍のみ表示
          books.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-12 text-center">
              <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
              <h2 className="text-xl font-bold text-gray-700 mb-2">まだ書籍がありません</h2>
              <p className="text-gray-500 mb-6">新しい本を作成して執筆を始めましょう</p>
              <Link
                href={`/kindle/new${adminKeyParam}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
              >
                <Plus size={20} />
                新しい本を作成
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )
        )}
      </div>
        </>
      )}

      {/* 表紙作成モーダル */}
      {coverModalBookId && coverModalBook && user && (
        <KindleCoverGenerator
          bookId={coverModalBookId}
          bookTitle={coverModalBook.title}
          bookSubtitle={coverModalBook.subtitle}
          userId={user.id}
          onClose={() => {
            setCoverModalBookId(null);
            setCoverModalBook(null);
          }}
          onCoverGenerated={(imageUrl) => {
            // bookLPsキャッシュを更新して表紙一覧に即反映
            setBookLPs(prev => ({
              ...prev,
              [coverModalBookId]: { ...prev[coverModalBookId], cover_image_url: imageUrl },
            }));
            setCoverModalBookId(null);
            setCoverModalBook(null);
          }}
        />
      )}

      {/* KDP情報モーダル */}
      {kdpModalBookId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in">
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-xl">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">KDP登録情報</h2>
                  <p className="text-sm text-gray-500">Amazon Kindle Direct Publishing用</p>
                </div>
              </div>
              <button
                onClick={() => setKdpModalBookId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {kdpLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">KDP情報を読み込み中...</p>
                </div>
              ) : kdpError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="text-amber-400 mb-4" size={48} />
                  <p className="text-gray-700 font-medium text-center mb-4">{kdpError}</p>
                  <Link
                    href={`/kindle/${kdpModalBookId}${adminKeyParam}`}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors font-medium"
                  >
                    執筆画面へ
                  </Link>
                </div>
              ) : kdpInfo ? (
                <div className="space-y-6">
                  {/* キャッチコピー */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        <h3 className="font-bold text-gray-900">キャッチコピー</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.catch_copy, 'キャッチコピー')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{kdpInfo.catch_copy}</p>
                  </div>

                  {/* キーワード */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-gray-500" />
                        <h3 className="font-bold text-gray-900">キーワード（7個）</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.keywords.join(', '), 'キーワード')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {kdpInfo.keywords.map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => handleCopyToClipboard(keyword, `キーワード${index + 1}`)}
                          className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 推奨カテゴリー */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderTree size={16} className="text-gray-500" />
                        <h3 className="font-bold text-gray-900">推奨カテゴリー</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.categories.join('\n'), 'カテゴリー')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                    </div>
                    <div className="space-y-2">
                      {kdpInfo.categories.map((category, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200"
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 商品紹介文 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-500" />
                        <h3 className="font-bold text-gray-900">商品紹介文</h3>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(kdpInfo.description, '紹介文')}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        <Copy size={14} />
                        コピー
                      </button>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: kdpInfo.description }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      ※ HTMLタグ付きでコピーされます。KDPの紹介文欄に直接貼り付けてください。
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* モーダルフッター */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setKdpModalBookId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </KdlDashboardLayout>
  );
}

// エクスポートするページコンポーネント（Suspenseでラップ）
export default function KindleListPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KindleListPageContent />
    </Suspense>
  );
}
