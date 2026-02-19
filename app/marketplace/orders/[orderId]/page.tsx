'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceOrder } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import SellerProfileCard from '@/components/marketplace/SellerProfileCard';
import OrderMessages from '@/components/marketplace/OrderMessages';
import ReviewForm from '@/components/marketplace/ReviewForm';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Truck, Play, Clock } from 'lucide-react';
import Link from 'next/link';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants/marketplace';

export default function OrderDetailPage() {
  const { orderId } = useParams() as { orderId: string };
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [order, setOrder] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async (token: string) => {
    const res = await fetch(`/api/marketplace/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setOrder(d.order);
      setReview(d.review);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      setUser(session.user);
      setAccessToken(session.access_token);

      await fetchOrder(session.access_token);
      setLoading(false);
    };
    init();
  }, [orderId]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
  };

  const updateStatus = async (newStatus: string) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const d = await res.json();
        setOrder((prev: any) => ({ ...prev, ...d.order }));
      } else {
        const d = await res.json();
        alert(d.error || 'ステータスの更新に失敗しました');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">案件詳細を見るにはログインが必要です</p>
          </div>
        </main>
        <Footer />
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} setUser={setUser} />}
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">案件が見つかりませんでした</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isBuyer = order.is_buyer;
  const isSeller = !isBuyer;
  const statusStyle = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.requested;

  // ステータス遷移アクション
  const getActions = () => {
    const actions: { label: string; status: string; icon: React.ElementType; variant: string }[] = [];
    switch (order.status) {
      case 'requested':
        if (isSeller) actions.push({ label: '受注する', status: 'accepted', icon: CheckCircle2, variant: 'indigo' });
        actions.push({ label: 'キャンセル', status: 'cancelled', icon: XCircle, variant: 'gray' });
        break;
      case 'accepted':
        if (isSeller) actions.push({ label: '作業開始', status: 'in_progress', icon: Play, variant: 'indigo' });
        actions.push({ label: 'キャンセル', status: 'cancelled', icon: XCircle, variant: 'gray' });
        break;
      case 'in_progress':
        if (isSeller) actions.push({ label: '納品する', status: 'delivered', icon: Truck, variant: 'purple' });
        break;
      case 'delivered':
        if (isBuyer) {
          actions.push({ label: '完了を承認', status: 'completed', icon: CheckCircle2, variant: 'green' });
          actions.push({ label: '修正依頼', status: 'in_progress', icon: Clock, variant: 'gray' });
        }
        break;
    }
    return actions;
  };

  const actions = getActions();

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/marketplace/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            案件一覧に戻る
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* メイン */}
            <div className="lg:col-span-2 space-y-6">
              {/* 案件ヘッダー */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isBuyer ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {isBuyer ? '依頼者' : '出品者'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{order.title}</h1>
                {order.description && (
                  <p className="mt-2 text-gray-600 text-sm whitespace-pre-wrap">{order.description}</p>
                )}
                {order.budget && (
                  <p className="mt-2 text-sm text-gray-500">
                    予算: <span className="font-semibold text-gray-900">¥{order.budget.toLocaleString()}</span>
                  </p>
                )}

                {/* アクションボタン */}
                {actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    {actions.map(({ label, status, icon: Icon, variant }) => (
                      <button
                        key={status}
                        onClick={() => {
                          if (status === 'cancelled' && !confirm('キャンセルしますか？')) return;
                          updateStatus(status);
                        }}
                        disabled={updatingStatus}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          variant === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                          variant === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                          variant === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                          'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* メッセージ */}
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="font-semibold text-gray-900 text-sm">メッセージ</h2>
                </div>
                <OrderMessages
                  orderId={orderId}
                  currentUserId={user.id}
                  accessToken={accessToken}
                />
              </div>

              {/* レビュー（完了 & 依頼者 & 未レビュー） */}
              {order.status === 'completed' && isBuyer && !review && (
                <ReviewForm
                  orderId={orderId}
                  accessToken={accessToken}
                  onSubmitted={() => fetchOrder(accessToken)}
                />
              )}
            </div>

            {/* サイドバー */}
            <div className="space-y-4">
              {/* ステータスタイムライン */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">進行状況</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { key: 'created_at', label: '依頼作成' },
                    { key: 'accepted_at', label: '受注確認' },
                    { key: 'delivered_at', label: '納品' },
                    { key: 'completed_at', label: '完了' },
                  ].map(({ key, label }) => {
                    const date = order[key];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${date ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <span className={date ? 'text-gray-900' : 'text-gray-400'}>{label}</span>
                        {date && (
                          <span className="text-gray-400 ml-auto">
                            {new Date(date).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 相手のプロフィール */}
              {order.seller_profile && isBuyer && (
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">出品者</h3>
                  <SellerProfileCard profile={order.seller_profile} compact />
                </div>
              )}
              {order.buyer_profile && isSeller && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">依頼者</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {order.buyer_profile.display_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm text-gray-700">{order.buyer_profile.display_name || '未設定'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
