'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import LineDashboard from '@/components/line/LineDashboard';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function LineDashboardPage() {
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
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="line" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="line" />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">LINE配信機能を利用するにはログインしてください。</p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition-all min-h-[44px]"
            >
              ログイン / 新規登録
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userPlan.isProUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="line" />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">PROプラン限定機能</h2>
            <p className="text-gray-600 mb-6">LINE配信機能はPROプランでご利用いただけます。</p>
            <button
              onClick={() => navigateTo('/dashboard?view=settings')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition-all min-h-[44px]"
            >
              PROプランにアップグレード
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="line" />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <LineDashboard userId={user.id} />
      </div>
    </div>
  );
}
