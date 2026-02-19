'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MarketplaceOrder } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import OrderCard from '@/components/marketplace/OrderCard';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';

type RoleFilter = 'all' | 'buyer' | 'seller';

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [orders, setOrders] = useState<(MarketplaceOrder & { is_buyer?: boolean; buyer_profile?: any; seller_profile?: any })[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      setUser(session.user);
      setAccessToken(session.access_token);

      const planRes = await fetch(`/api/user/plan?userId=${session.user.id}`);
      if (planRes.ok) { const d = await planRes.json(); setPlanTier(d.planTier); }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!accessToken || planTier !== 'pro') return;
      setLoadingOrders(true);
      try {
        const params = new URLSearchParams();
        if (roleFilter !== 'all') params.set('role', roleFilter);

        const res = await fetch(`/api/marketplace/orders?${params}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const d = await res.json();
          setOrders(d.orders || []);
        }
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [accessToken, planTier, roleFilter]);

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

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            マーケットに戻る
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            案件一覧
          </h1>

          {/* ロールフィルタ */}
          <div className="flex gap-2 mb-6">
            {([
              { key: 'all', label: 'すべて' },
              { key: 'buyer', label: '依頼した案件' },
              { key: 'seller', label: '受注した案件' },
            ] as { key: RoleFilter; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 案件一覧 */}
          {loadingOrders ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">案件はまだありません</p>
              <Link href="/marketplace" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
                サービスを探す →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
