'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceProfile } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import SellerProfileForm from '@/components/marketplace/SellerProfileForm';
import { ArrowLeft, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function SellerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      setUser(session.user);
      setAccessToken(session.access_token);

      const profileRes = await fetch('/api/marketplace/profiles', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (profileRes.ok) {
        const d = await profileRes.json();
        setProfile(d.profile);
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
              <p className="text-gray-600 mb-6">プロフィールを作成するには、ログインまたは新規登録が必要です。</p>
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

  return (
    <>
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuthModal} />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/marketplace/seller" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            出品管理に戻る
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {profile ? 'プロフィール編集' : 'クリエイタープロフィール作成'}
          </h1>

          <div className="bg-white rounded-xl border p-6">
            <SellerProfileForm
              profile={profile}
              accessToken={accessToken}
              onSaved={(saved) => {
                setProfile(saved);
                router.push('/marketplace/seller');
              }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
