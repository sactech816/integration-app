'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceProfile, MarketplaceListing } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ProGate from '@/components/marketplace/ProGate';
import SellerProfileCard from '@/components/marketplace/SellerProfileCard';
import { Plus, Edit3, Eye, EyeOff, Trash2, ArrowLeft, Loader2, UserCog } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_MAP, ORDER_STATUS_LABELS } from '@/constants/marketplace';
import { getAdminEmails } from '@/lib/constants';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [planTier, setPlanTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      setUser(session.user);
      setAccessToken(session.access_token);

      const planRes = await fetch(`/api/user/plan?userId=${session.user.id}`);
      if (planRes.ok) { const d = await planRes.json(); setPlanTier(d.planTier); }

      // プロフィール取得
      const profileRes = await fetch('/api/marketplace/profiles', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (profileRes.ok) {
        const d = await profileRes.json();
        setProfile(d.profile);
      }

      // 自分の出品一覧
      const listingsRes = await fetch('/api/marketplace/listings?my=true', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (listingsRes.ok) {
        const d = await listingsRes.json();
        setListings(d.listings || []);
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
  };

  const toggleListingStatus = async (listing: MarketplaceListing) => {
    const newStatus = listing.status === 'published' ? 'paused' : 'published';
    const res = await fetch(`/api/marketplace/listings/${listing.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm('この出品を削除しますか？')) return;
    const res = await fetch(`/api/marketplace/listings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (res.ok) {
      setListings(prev => prev.filter(l => l.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some((email: string) => email.toLowerCase() === user.email?.toLowerCase());

  if (!user || (planTier !== 'pro' && !isAdmin)) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16"><ProGate /></main>
        <Footer />
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} setUser={setUser} />}
      </>
    );
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            マーケットに戻る
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">出品管理</h1>

          {/* プロフィール */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">クリエイタープロフィール</h2>
              <Link
                href="/marketplace/seller/profile"
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
              >
                <UserCog className="w-4 h-4" />
                {profile ? '編集' : '作成する'}
              </Link>
            </div>
            {profile ? (
              <SellerProfileCard profile={profile} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                出品するには、まずクリエイタープロフィールを作成してください。
                <Link href="/marketplace/seller/profile" className="text-indigo-600 font-medium ml-1 hover:underline">
                  作成する →
                </Link>
              </div>
            )}
          </div>

          {/* 出品一覧 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">出品サービス ({listings.length}件)</h2>
              {profile && (
                <Link
                  href="/marketplace/seller/listings/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  新規出品
                </Link>
              )}
            </div>

            {listings.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center">
                <p className="text-gray-500">まだ出品がありません</p>
                {profile && (
                  <Link
                    href="/marketplace/seller/listings/new"
                    className="inline-flex items-center gap-1.5 mt-3 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    最初のサービスを出品する
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map(listing => {
                  const cat = CATEGORY_MAP[listing.category];
                  return (
                    <div key={listing.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {cat && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {cat.label}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            listing.status === 'published'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {listing.status === 'published' ? '公開中' : '非公開'}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm truncate">{listing.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          ¥{listing.price_min.toLocaleString()}
                          {listing.price_max ? `〜¥${listing.price_max.toLocaleString()}` : ''}
                          {listing.order_count > 0 && ` · ${listing.order_count}件の実績`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleListingStatus(listing)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title={listing.status === 'published' ? '非公開にする' : '公開する'}
                        >
                          {listing.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
