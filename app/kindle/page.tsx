'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Plus, Loader2, Edit3, Trash2, Calendar, FileText, HelpCircle, Rocket,
  Crown, Sparkles, Zap, ArrowRight, X
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import AIUsageDisplay from '@/components/kindle/AIUsageDisplay';
import { getAdminEmails } from '@/lib/constants';

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  chapters_count?: number;
  sections_count?: number;
}

export default function KindleListPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasActiveSubscription: boolean;
    planType: 'monthly' | 'yearly' | 'none';
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  // 管理者かどうかを判定
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some((email: string) =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

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

  // 未課金ユーザー（管理者以外）はLPにリダイレクト
  useEffect(() => {
    if (loadingSubscription) return; // まだ読み込み中
    
    // 管理者は常にアクセス可能
    if (isAdmin) return;
    
    // 課金者はアクセス可能
    if (subscriptionStatus?.hasActiveSubscription) return;
    
    // 未課金ユーザーはLPの料金セクションにリダイレクト
    router.replace('/kindle/lp#pricing');
  }, [loadingSubscription, isAdmin, subscriptionStatus, router]);

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
          },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('kdl_books')
          .select('id, title, subtitle, status, created_at, updated_at')
          .order('updated_at', { ascending: false });

        if (fetchError) throw fetchError;
        setBooks(data || []);
      } catch (err: any) {
        setError(err.message || '書籍の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
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

      setBooks(prev => prev.filter(b => b.id !== bookId));
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

  // アクセス権チェック中、または未課金ユーザーがリダイレクト中はローディング表示
  if (loadingSubscription || (!isAdmin && !subscriptionStatus?.hasActiveSubscription)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-600" size={40} />
          <p className="text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-600" size={28} />
            <div>
              <span className="font-bold text-xl text-gray-900">キンドルダイレクトライト</span>
              <span className="text-xs text-gray-500 ml-2">KDL</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/kindle/guide"
              className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg text-sm font-medium"
            >
              <HelpCircle size={16} />
              <span className="hidden sm:inline">📖 まずお読みください</span>
              <span className="sm:hidden">📖</span>
            </Link>
            <Link
              href="/kindle/publish-guide"
              className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg text-sm font-medium"
            >
              <Rocket size={16} />
              <span className="hidden sm:inline">🚀 出版準備ガイド</span>
              <span className="sm:hidden">🚀</span>
            </Link>
            <Link
              href="/kindle/new"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">新しい本を作成</span>
              <span className="sm:hidden">新規</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 未加入者向けサブスク促進バナー */}
      {showBanner && !loadingSubscription && !subscriptionStatus?.hasActiveSubscription && (
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
      {!loadingSubscription && subscriptionStatus?.hasActiveSubscription && (
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

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* AI使用量表示（ログインユーザー向け） */}
        {user && subscriptionStatus && (
          <div className="mb-6">
            <AIUsageDisplay 
              userId={user.id} 
              planType={subscriptionStatus.planType} 
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-6">あなたの書籍</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-12 text-center">
            <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-700 mb-2">まだ書籍がありません</h2>
            <p className="text-gray-500 mb-6">新しい本を作成して執筆を始めましょう</p>
            <Link
              href="/kindle/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
            >
              <Plus size={20} />
              新しい本を作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-md border border-amber-100 p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/kindle/${book.id}`}
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
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        book.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {book.status === 'published' ? '公開済み' : '下書き'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/kindle/${book.id}`}
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}





















