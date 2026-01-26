'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BookOpen, Plus, Loader2, Edit3, Trash2, Calendar, FileText, HelpCircle, Rocket,
  Crown, Sparkles, Zap, ArrowRight, X, Users, ChevronDown, ChevronUp, BarChart3, User
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import AIUsageDisplay from '@/components/kindle/AIUsageDisplay';
import AIModelSelector from '@/components/kindle/AIModelSelector';
import AdminPlanSwitcher from '@/components/shared/AdminPlanSwitcher';
import KDLFooter from '@/components/shared/KDLFooter';
import { getAdminEmails } from '@/lib/constants';

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
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // 管理者かどうかを判定
  const adminEmails = getAdminEmails();
  const [isAdmin, setIsAdmin] = useState(false);

  // 管理者用: プラン体験モード（LocalStorageから復元）
  const [adminTestPlan, setAdminTestPlan] = useState<'none' | 'lite' | 'standard' | 'pro' | 'business' | 'enterprise'>('pro');

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

  // 管理者の場合、LocalStorageから体験プランを復元
  useEffect(() => {
    if (isAdmin && typeof window !== 'undefined') {
      const savedPlan = localStorage.getItem('adminTestPlan');
      if (savedPlan && ['lite', 'standard', 'pro', 'business'].includes(savedPlan)) {
        setAdminTestPlan(savedPlan as 'lite' | 'standard' | 'pro' | 'business');
      }
    }
  }, [isAdmin]);

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

        if (session?.user) {
          const response = await fetch(`/api/subscription/status?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setSubscriptionStatus({
              hasActiveSubscription: data.hasActiveSubscription,
              planType: data.planType,
              planTier: data.planTier,
              isMonitor: data.isMonitor,
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

  // アクセス権チェック中、または未課金ユーザーがリダイレクト中はローディング表示
  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-600" size={40} />
          <p className="text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 書籍カードコンポーネント
  const BookCard = ({ book, showUserInfo = false }: { book: Book; showUserInfo?: boolean }) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className={`mx-auto px-4 py-3 sm:py-4 flex items-center justify-between ${isAdmin ? 'max-w-6xl' : 'max-w-4xl'}`}>
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-600" size={24} />
            <div>
              <span className="font-bold text-base sm:text-xl text-gray-900 hidden sm:inline">キンドルダイレクトライト</span>
              <span className="font-bold text-base text-gray-900 sm:hidden">KDL</span>
              <span className="text-xs text-gray-500 ml-1 hidden sm:inline">KDL</span>
            </div>
            {isAdmin && (
              <span className="ml-1 sm:ml-2 bg-purple-100 text-purple-700 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">
                <span className="hidden sm:inline">管理者モード</span>
                <span className="sm:hidden">管理者</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/kindle/guide"
              className="flex items-center justify-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 hover:bg-amber-100 p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium"
              title="まずお読みください"
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline">📖 まずお読みください</span>
            </Link>
            <Link
              href="/kindle/publish-guide"
              className="flex items-center justify-center gap-1.5 text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium"
              title="出版準備ガイド"
            >
              <Rocket size={18} />
              <span className="hidden sm:inline">🚀 出版準備ガイド</span>
            </Link>
            <Link
              href={`/kindle/new${adminKeyParam}`}
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">新しい本を作成</span>
              <span className="sm:hidden">新規</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 未加入者向けサブスク促進バナー */}
      {showBanner && !loadingSubscription && !subscriptionStatus?.hasActiveSubscription && !isAdmin && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
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
      )}

      {/* 加入者向けステータス表示 */}
      {!loadingSubscription && subscriptionStatus?.hasActiveSubscription && !isAdmin && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <Crown size={18} className="text-green-600" />
                </div>
                <span className="text-green-700 font-bold text-sm">
                  {subscriptionStatus.planType === 'yearly' ? '年間プラン' : '月額プラン'}
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  有効
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-600 text-xs">
                <Zap size={14} />
                <span>AI機能フル解放中</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 管理者向け統計バナー */}
      {isAdmin && adminStats && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
          <div className="max-w-6xl mx-auto px-4 py-4">
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

      {/* メインコンテンツ */}
      <main className={`mx-auto px-4 py-8 ${isAdmin ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {/* 管理者用: プラン体験切り替え */}
        {user && isAdmin && (
          <AdminPlanSwitcher 
            currentPlan={adminTestPlan}
            onPlanChange={setAdminTestPlan}
          />
        )}

        {/* AI使用量表示（ログインユーザー向け） */}
        {user && subscriptionStatus && !isAdmin && (
          <div className="mb-6">
            <AIUsageDisplay 
              userId={user.id} 
              planType={subscriptionStatus.planType} 
            />
          </div>
        )}

        {/* AIモード選択（管理者・課金ユーザー・モニターユーザのPro以上） */}
        {user && subscriptionStatus && (
          <div className="mb-6">
            <AIModelSelector 
              userId={user.id}
              planTier={isAdmin ? adminTestPlan : (subscriptionStatus.planTier || 'none')}
              isAdmin={isAdmin}
              isMonitor={subscriptionStatus.isMonitor || false}
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
          {isAdmin ? '全ユーザーの書籍' : 'あなたの書籍'}
        </h1>

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
                        <BookCard key={book.id} book={book} showUserInfo={false} />
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
      </main>

      {/* 共通フッター */}
      <KDLFooter adminKeyParam={adminKeyParam} />
    </div>
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
