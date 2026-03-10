'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceProfile, MarketplaceListing } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ListingCard from '@/components/marketplace/ListingCard';
import { SUPPORTED_TOOLS_MAP, KINDLE_SUBTYPES } from '@/constants/marketplace';
import {
  ArrowLeft,
  Star,
  Clock,
  ShoppingBag,
  ExternalLink,
  Loader2,
  UserCircle,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CreatorDetailPage() {
  const { creatorId } = useParams() as { creatorId: string };
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setAccessToken(session.access_token);
      }

      const headers: Record<string, string> = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      // クリエイタープロフィール取得
      const profileRes = await fetch(`/api/marketplace/creators?user_id=${creatorId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.creator);
      }

      // 出品サービス取得
      const listingsRes = await fetch(`/api/marketplace/listings?seller_id=${creatorId}`, {
        headers,
      });
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData.listings || []);
      }

      setLoading(false);
    };
    init();
  }, [creatorId]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-4xl mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-4">クリエイターが見つかりませんでした</p>
            <Link
              href="/marketplace"
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              マーケットに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const kindleSubtypeMap = Object.fromEntries(KINDLE_SUBTYPES.map((s) => [s.id, s]));

  return (
    <>
      <Header
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuthModal}
        headerClassName="bg-white/95"
      />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* パンくず */}
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            マーケットに戻る
          </Link>

          {/* プロフィールセクション */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
            {/* アバター・名前・統計 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* アバター */}
              <div className="shrink-0">
                {profile.avatar_url ? (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 relative shadow-md">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-md">
                    <UserCircle className="w-12 h-12 text-indigo-300" />
                  </div>
                )}
              </div>

              {/* 名前・統計 */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {profile.display_name}
                </h1>

                {/* 統計バッジ */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {profile.avg_rating > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900">
                        {profile.avg_rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">({profile.total_reviews}件)</span>
                    </div>
                  )}
                  {profile.total_orders > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <ShoppingBag className="w-4 h-4 text-indigo-400" />
                      <span>{profile.total_orders}件の実績</span>
                    </div>
                  )}
                  {profile.response_time && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>返信: {profile.response_time}</span>
                    </div>
                  )}
                </div>

                {/* 自己紹介 */}
                {profile.bio && (
                  <div
                    className="text-gray-700 leading-relaxed text-sm sm:text-base prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: profile.bio }}
                  />
                )}
              </div>
            </div>

            {/* スキル・ツール・Kindleサブタイプ */}
            {(profile.skills.length > 0 ||
              profile.supported_tools.length > 0 ||
              profile.kindle_subtypes.length > 0) && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                {/* スキル */}
                {profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      スキル
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 対応ツール */}
                {profile.supported_tools.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      対応ツール
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.supported_tools.map((toolId) => {
                        const tool = SUPPORTED_TOOLS_MAP[toolId];
                        return (
                          <span
                            key={toolId}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-100"
                          >
                            {tool?.label || toolId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Kindleサブタイプ */}
                {profile.kindle_subtypes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Kindle対応
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.kindle_subtypes.map((subtypeId) => {
                        const subtype = kindleSubtypeMap[subtypeId];
                        return (
                          <span
                            key={subtypeId}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                          >
                            {subtype?.label || subtypeId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ポートフォリオ */}
            {profile.portfolio_urls.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  ポートフォリオ
                </h3>
                <div className="space-y-2">
                  {profile.portfolio_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 出品サービス */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              出品サービス
              {listings.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({listings.length}件)
                </span>
              )}
            </h2>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">まだサービスが出品されていません</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          setUser={setUser}
        />
      )}
    </>
  );
}
