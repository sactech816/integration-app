'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing, MarketplaceReview } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ProGate from '@/components/marketplace/ProGate';
import SellerProfileCard from '@/components/marketplace/SellerProfileCard';
import ReviewList from '@/components/marketplace/ReviewList';
import { ArrowLeft, Clock, ShoppingBag, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_MAP } from '@/constants/marketplace';

export default function ListingDetailPage() {
  const { listingId } = useParams() as { listingId: string };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [planTier, setPlanTier] = useState('free');
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
      if (!session?.user) { setLoading(false); return; }

      setUser(session.user);
      setAccessToken(session.access_token);

      const planRes = await fetch(`/api/user/plan?userId=${session.user.id}`);
      if (planRes.ok) {
        const data = await planRes.json();
        setPlanTier(data.planTier);
      }

      // 出品詳細取得
      const res = await fetch(`/api/marketplace/listings/${listingId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user || planTier !== 'pro') {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16"><ProGate /></main>
        <Footer />
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} setUser={setUser} />}
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">サービスが見つかりませんでした</p>
            <Link href="/marketplace" className="text-indigo-600 text-sm mt-2 inline-block">マーケットに戻る</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const category = CATEGORY_MAP[listing.category];
  const isOwnListing = listing.seller_id === user.id;

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* パンくず */}
          <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            マーケットに戻る
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-6">
              {/* サムネイル */}
              {listing.thumbnail_url && (
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={listing.thumbnail_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* タイトル・カテゴリ */}
              <div>
                {category && (
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${
                    category.isToolLinked ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.label}
                    {category.isToolLinked && ' (ツール連携)'}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              </div>

              {/* 説明 */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-gray-900 mb-3">サービス内容</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>

              {/* レビュー */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-gray-900 mb-3">
                  レビュー ({reviews.length}件)
                </h2>
                <ReviewList reviews={reviews} />
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-4">
              {/* 価格カード */}
              <div className="bg-white rounded-xl border p-6 sticky top-20">
                <div className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(listing)}</div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  {listing.delivery_days && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      納期 {listing.delivery_days}日
                    </span>
                  )}
                  {listing.order_count > 0 && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      {listing.order_count}件の実績
                    </span>
                  )}
                </div>

                {isOwnListing ? (
                  <Link
                    href="/marketplace/seller"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-3 rounded-lg font-medium text-sm"
                  >
                    自分の出品を管理する
                  </Link>
                ) : !showRequestForm ? (
                  <button
                    onClick={() => {
                      setRequestTitle(listing.title + 'の依頼');
                      setShowRequestForm(true);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="依頼タイトル"
                    />
                    <textarea
                      value={requestDesc}
                      onChange={e => setRequestDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="依頼の詳細（目的、希望など）"
                    />
                    <input
                      type="number"
                      value={requestBudget}
                      onChange={e => setRequestBudget(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="希望予算（円）"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSubmitRequest}
                        disabled={submitting}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        依頼送信
                      </button>
                    </div>
                  </div>
                )}
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
    </>
  );
}
