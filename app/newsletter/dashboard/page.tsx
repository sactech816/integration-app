'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import NewsletterDashboard from '@/components/newsletter/NewsletterDashboard';
import Link from 'next/link';
import { Mail, Loader2 } from 'lucide-react';

export default function NewsletterDashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { userPlan, isLoading: planLoading } = useUserPlan(user?.id || null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    window.location.href = page.startsWith('/') ? page : `/${page}`;
  };

  if (authLoading || planLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="newsletter" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="newsletter" />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">メルマガ機能を利用するにはログインしてください。</p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 transition-all min-h-[44px]"
            >
              ログイン / 新規登録
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="newsletter" />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
      <NewsletterDashboard userId={user.id} isProUser={userPlan.isProUser} planTier={userPlan.planTier} />
    </div>
  );
}
