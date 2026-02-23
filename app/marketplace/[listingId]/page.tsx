'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing, MarketplaceReview } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import SellerProfileCard from '@/components/marketplace/SellerProfileCard';
import ReviewList from '@/components/marketplace/ReviewList';
import { ArrowLeft, Clock, ShoppingBag, MessageSquare, Loader2, LogIn, Star, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_MAP } from '@/constants/marketplace';

export default function ListingDetailPage() {
  const { listingId } = useParams() as { listingId: string };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestBudget, setRequestBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setAccessToken(session.access_token);
      }

      // 出品詳細取得（認証不要）
      const headers: Record<string, string> = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch(`/api/marketplace/listings/${listingId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setListing(data.listing);
        setReviews(data.reviews || []);
      }
      setLoading(false);
    };
    init();
  }, [listingId]);

  const handleSubmitRequest = async () => {
    if (!listing || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          listing_id: listing.id,
          title: requestTitle || listing.title,
          description: requestDesc || null,
          budget: requestBudget ? parseInt(requestBudget) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '依頼に失敗しました');
        return;
      }

      const data = await res.json();
      router.push(`/marketplace/orders/${data.order.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
  };

  const formatPrice = (l: MarketplaceListing) => {
    if (l.price_type === 'negotiable') return '要相談';
    const min = l.price_min.toLocaleString();
    if (l.price_type === 'range' && l.price_max) return `¥${min}〜¥${l.price_max.toLocaleString()}`;
    return `¥${min}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!listing) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-4xl mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-4">サービスが見つかりませんでした</p>
            <Link href="/marketplace" className="text-indigo-600 text-sm font-medium hover:underline">
              マーケットに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const category = CATEGORY_MAP[listing.category];
  const isOwnListing = user && listing.seller_id === user.id;

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} headerClassName="bg-white/95" />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* パンくず */}
          <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            マーケットに戻る
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-6">
              {/* サムネイル */}
              {listing.thumbnail_url ? (
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                  <img src={listing.thumbnail_url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/60 rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="text-4xl">{category?.isToolLinked ? '🔧' : '📋'}</span>
                  </div>
                </div>
              )}

              {/* タイトル・カテゴリ */}
              <div>
                {category && (
                  <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-lg mb-3 ${
                    category.isToolLinked
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {category.label}
                    {category.isToolLinked && ' (ツール連携)'}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
              </div>

              {/* 説明 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  サービス内容
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>

              {/* レビュー */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  レビュー ({reviews.length}件)
                </h2>
                <ReviewList reviews={reviews} />
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-5">
              {/* 価格カード */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {formatPrice(listing)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
                  {listing.delivery_days && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      納期 {listing.delivery_days}日
                    </span>
                  )}
                  {listing.order_count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-indigo-400" />
                      {listing.order_count}件の実績
                    </span>
                  )}
                </div>

                {isOwnListing ? (
                  <Link
                    href="/dashboard?view=marketplace-seller"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                  >
                    自分の出品を管理する
                  </Link>
                ) : !user ? (
                  /* 未ログインユーザー向け */
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      ログインして相談する
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      依頼にはログインが必要です
                    </p>
                  </div>
                ) : !showRequestForm ? (
                  <button
                    onClick={() => {
                      setRequestTitle(listing.title + 'の依頼');
                      setShowRequestForm(true);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    相談する
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={requestTitle}
                      onChange={e => setRequestTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="依頼タイトル"
                    />
                    <textarea
                      value={requestDesc}
                      onChange={e => setRequestDesc(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="依頼の詳細（目的、希望など）"
                    />
                    <input
                      type="number"
                      value={requestBudget}
                      onChange={e => setRequestBudget(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="希望予算（円）"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSubmitRequest}
                        disabled={submitting}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1 transition-all"
                      >
                        {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        依頼送信
                      </button>
                    </div>
                  </div>
                )}

                {/* 安心取引バッジ */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>安心・安全なお取引をサポートします</span>
                  </div>
                </div>
              </div>

              {/* 出品者プロフィール */}
              {listing.seller_profile && (
                <SellerProfileCard profile={listing.seller_profile} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} setUser={setUser} />
      )}
    </>
  );
}
