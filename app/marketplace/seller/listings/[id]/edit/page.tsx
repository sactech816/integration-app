'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ListingForm from '@/components/marketplace/ListingForm';
import { ArrowLeft, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function EditListingPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      setUser(session.user);
      setAccessToken(session.access_token);

      // 出品詳細取得
      const res = await fetch(`/api/marketplace/listings/${id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        if (d.listing.seller_id !== session.user.id) {
          setError('この出品を編集する権限がありません');
        } else {
          setListing(d.listing);
        }
      } else {
        setError('出品が見つかりませんでした');
      }

      setLoading(false);
    };
    init();
  }, [id]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
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
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">ログインが必要です</h2>
              <p className="text-gray-600 mb-6">出品を編集するには、ログインまたは新規登録が必要です。</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                ログイン / 新規登録
              </button>
            </div>
          </div>
        </main>
        <Footer />
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} setUser={setUser} />}
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">{error}</p>
            <Link href="/marketplace/seller" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
              出品管理に戻る
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/marketplace/seller" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            出品管理に戻る
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">サービス編集</h1>

          <div className="bg-white rounded-xl border p-6">
            <ListingForm
              listing={listing}
              accessToken={accessToken}
              onSaved={() => router.push('/marketplace/seller')}
              onCancel={() => router.back()}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
