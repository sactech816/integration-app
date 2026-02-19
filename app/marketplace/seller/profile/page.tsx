'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MarketplaceProfile } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ProGate from '@/components/marketplace/ProGate';
import SellerProfileForm from '@/components/marketplace/SellerProfileForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getAdminEmails } from '@/lib/constants';

export default function SellerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [planTier, setPlanTier] = useState('free');
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

      const planRes = await fetch(`/api/user/plan?userId=${session.user.id}`);
      if (planRes.ok) { const d = await planRes.json(); setPlanTier(d.planTier); }

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
