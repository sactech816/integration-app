'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MarketplaceProfile, MarketplaceListing, MarketplaceOrder } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import SellerProfileCard from '@/components/marketplace/SellerProfileCard';
import OrderCard from '@/components/marketplace/OrderCard';
import {
  Plus, Edit3, Eye, EyeOff, Trash2, Loader2, UserCog,
  Store, ShoppingBag, Package, MessageSquare, Star,
  ArrowRight, ExternalLink, TrendingUp, BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_MAP } from '@/constants/marketplace';

type TabId = 'overview' | 'listings' | 'orders' | 'profile';

interface MarketplaceSellerDashboardProps {
  userId: string;
}

export default function MarketplaceSellerDashboard({ userId }: MarketplaceSellerDashboardProps) {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [orders, setOrders] = useState<(MarketplaceOrder & { is_buyer?: boolean; buyer_profile?: any; seller_profile?: any })[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      setAccessToken(session.access_token);

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

      // 案件一覧
      const ordersRes = await fetch('/api/marketplace/orders', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders || []);
      }

      setLoading(false);
    };
    init();
  }, [userId]);

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

  const publishedCount = listings.filter(l => l.status === 'published').length;
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const sellerOrders = orders.filter(o => !o.is_buyer);
  const buyerOrders = orders.filter(o => o.is_buyer);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: '概要', icon: BarChart3 },
    { id: 'listings', label: '出品サービス', icon: Package, badge: listings.length },
    { id: 'orders', label: '案件・やりとり', icon: MessageSquare, badge: activeOrders.length },
    { id: 'profile', label: 'プロフィール', icon: UserCog },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            スキルマーケット管理
          </h2>
          <p className="text-sm text-gray-500 mt-1">出品サービスの管理や依頼者とのやりとりができます</p>
        </div>
        <Link
          href="/marketplace"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          マーケットを見る
        </Link>
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 概要タブ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                  <p className="text-xs text-gray-500">出品サービス</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
                  <p className="text-xs text-gray-500">公開中</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sellerOrders.length}</p>
                  <p className="text-xs text-gray-500">受注した案件</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                  <p className="text-xs text-gray-500">進行中の案件</p>
                </div>
              </div>
            </div>
          </div>

          {/* プロフィール未作成時の案内 */}
          {!profile && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserCog className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">クリエイタープロフィールを作成しましょう</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    出品するには、まずプロフィールの設定が必要です。スキルや対応可能なツールを登録しましょう。
                  </p>
                  <Link
                    href="/marketplace/seller/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    プロフィールを作成する
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* プロフィールカード */}
          {profile && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">クリエイタープロフィール</h3>
                <Link
                  href="/marketplace/seller/profile"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  編集
                </Link>
              </div>
              <SellerProfileCard profile={profile} compact />
            </div>
          )}

          {/* 進行中の案件 */}
          {activeOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">進行中の案件</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  すべて見る
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {activeOrders.slice(0, 3).map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {/* クイックアクション */}
          {profile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/marketplace/seller/listings/new"
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm p-4 transition-all"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">新規出品</p>
                  <p className="text-xs text-gray-500">サービスを出品する</p>
                </div>
              </Link>
              <Link
                href="/marketplace"
                target="_blank"
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm p-4 transition-all"
              >
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">マーケットを見る</p>
                  <p className="text-xs text-gray-500">他のサービスを探す</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 出品サービスタブ */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">出品サービス ({listings.length}件)</h3>
            {profile && (
              <Link
                href="/marketplace/seller/listings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                新規出品
              </Link>
            )}
          </div>

          {!profile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              出品するには、まずクリエイタープロフィールを作成してください。
              <Link href="/marketplace/seller/profile" className="text-indigo-600 font-medium ml-1 hover:underline">
                作成する →
              </Link>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-2">まだ出品がありません</p>
              {profile && (
                <Link
                  href="/marketplace/seller/listings/new"
                  className="inline-flex items-center gap-1.5 mt-2 text-indigo-600 text-sm font-medium hover:underline"
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
                  <div key={listing.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-4 flex items-center gap-4 transition-all">
                    {/* サムネイル小 */}
                    <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {listing.thumbnail_url ? (
                        <img src={listing.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-5 h-5 text-indigo-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {cat && (
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            {cat.label}
                          </span>
                        )}
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        href={`/marketplace/${listing.id}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="プレビュー"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/marketplace/seller/listings/${listing.id}/edit`}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="編集"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => toggleListingStatus(listing)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title={listing.status === 'published' ? '非公開にする' : '公開する'}
                      >
                        {listing.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
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
      )}

      {/* 案件・やりとりタブ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">案件一覧</h3>

          {/* 受注した案件 */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              受注した案件 ({sellerOrders.length}件)
            </h4>
            {sellerOrders.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center">
                <p className="text-sm text-gray-400">受注した案件はまだありません</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sellerOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* 依頼した案件 */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              依頼した案件 ({buyerOrders.length}件)
            </h4>
            {buyerOrders.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center">
                <p className="text-sm text-gray-400">依頼した案件はまだありません</p>
                <Link href="/marketplace" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
                  サービスを探す →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {buyerOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* プロフィールタブ */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">クリエイタープロフィール</h3>
            <Link
              href="/marketplace/seller/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <UserCog className="w-4 h-4" />
              {profile ? 'プロフィールを編集' : 'プロフィールを作成'}
            </Link>
          </div>

          {profile ? (
            <SellerProfileCard profile={profile} />
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCog className="w-8 h-8 text-indigo-300" />
              </div>
              <p className="text-gray-500 mb-2">プロフィールがまだ作成されていません</p>
              <p className="text-sm text-gray-400 mb-4">出品するにはプロフィールの作成が必要です</p>
              <Link
                href="/marketplace/seller/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                作成する
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
