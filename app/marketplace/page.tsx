'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import ListingCard from '@/components/marketplace/ListingCard';
import { Search, Store, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage() {
  const router = useRouter();
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
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-6 h-6 text-indigo-600" />
                スキルマーケット
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                プロに依頼して、あなたのビジネスを加速させましょう
              </p>
            </div>
            {isLoggedIn && (
              <div className="flex gap-2">
                <Link
                  href="/marketplace/orders"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  案件一覧
                </Link>
                <Link
                  href="/marketplace/seller"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  出品する
                </Link>
              </div>
            )}
          </div>

          {/* 検索 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="キーワードでサービスを検索..."
              />
            </div>
          </form>

          {/* カテゴリフィルタ */}
          <div className="mb-6">
            <CategoryFilter
              selected={selectedCategory}
              onChange={(cat) => { setSelectedCategory(cat); setPage(1); }}
            />
          </div>

          {/* 出品一覧 */}
          {loadingListings ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">まだ出品されたサービスがありません</p>
              {isLoggedIn && (
                <>
                  <p className="text-sm text-gray-400 mt-1">最初の出品者になりましょう！</p>
                  <Link
                    href="/marketplace/seller/listings/new"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    サービスを出品する
                  </Link>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{total}件のサービス</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* ページネーション */}
              {total > 20 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    {page} / {Math.ceil(total / 20)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= total}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
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
