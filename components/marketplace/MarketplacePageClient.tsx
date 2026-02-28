'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import ListingCard from '@/components/marketplace/ListingCard';
import { Search, Store, Plus, ShoppingBag, Loader2, Sparkles, ArrowRight, TrendingUp, Users, Star } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loadingListings, setLoadingListings] = useState(false);

  // 認証チェック（任意）
  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setAccessToken(session.access_token);
      }
      setLoading(false);
    };
    init();
  }, []);

  // 出品一覧取得（認証不要）
  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const res = await fetch(`/api/marketplace/listings?${params}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
    } finally {
      setLoadingListings(false);
    }
  }, [accessToken, selectedCategory, searchQuery, page]);

  useEffect(() => {
    if (!loading) fetchListings();
  }, [fetchListings, loading]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
  };

  // 検索（デバウンス付き）
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
    }, 400);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPage(1);
  };

  const isLoggedIn = !!user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} headerClassName="bg-white/95" />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* ヒーローセクション */}
        <section className="relative pt-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

          <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm text-white/90 font-medium">プロのスキルをあなたのビジネスに</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                スキルマーケット
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                LP作成、診断クイズ、デザインなど、<br className="hidden sm:block" />
                プロに依頼してビジネスを加速させましょう
              </p>

              {/* 検索バー */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearchInput(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-0 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 shadow-xl shadow-black/10 focus:ring-2 focus:ring-white/50 focus:bg-white placeholder-gray-400 text-base"
                    placeholder="キーワードでサービスを検索..."
                  />
                </div>
              </form>

              {/* 統計バー */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 text-white/70">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">{total}件のサービス</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">プロが在籍</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">安心取引</span>
                </div>
              </div>
            </div>
          </div>

          {/* ウェーブ装飾 */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 40C240 70 480 80 720 60C960 40 1200 20 1440 40V80H0V40Z" fill="#f9fafb" />
            </svg>
          </div>
        </section>

        {/* アクションボタン */}
        {isLoggedIn && (
          <div className="max-w-6xl mx-auto px-4 -mt-4 mb-6 relative z-10">
            <div className="flex justify-end gap-3">
              <Link
                href="/marketplace/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-500" />
                案件一覧
              </Link>
              <Link
                href="/marketplace/seller"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                出品する
              </Link>
            </div>
          </div>
        )}

        {/* カテゴリフィルタ */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <CategoryFilter
            selected={selectedCategory}
            onChange={(cat) => { setSelectedCategory(cat); setPage(1); }}
          />
        </div>

        {/* 出品一覧 */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          {loadingListings ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-sm text-gray-400">サービスを読み込み中...</span>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">サービスがまだありません</h3>
              <p className="text-gray-400 mb-6">最初の出品者になって、スキルを活かしましょう！</p>
              {isLoggedIn && (
                <Link
                  href="/marketplace/seller/listings/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  サービスを出品する
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500 font-medium">
                  {selectedCategory ? 'フィルタ結果: ' : ''}{total}件のサービス
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* ページネーション */}
              {total > 20 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    前へ
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(Math.ceil(total / 20), 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            page === pageNum
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= total}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} setUser={setUser} />
      )}
    </>
  );
}
