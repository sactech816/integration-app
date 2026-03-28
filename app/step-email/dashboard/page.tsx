'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import StepEmailDashboard from '@/components/step-email/StepEmailDashboard';
import LoginRequired from '@/components/shared/LoginRequired';
import { Loader2 } from 'lucide-react';

export default function StepEmailDashboardPage() {
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

  const navigateTo = (page: string) => {
    window.location.href = page.startsWith('/') ? page : `/${page}`;
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  if (authLoading || planLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="step-email" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header setPage={navigateTo} user={null} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="step-email" />
        <LoginRequired toolName="ステップメール" onLogin={() => setShowAuth(true)} />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="step-email" />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
      <StepEmailDashboard userId={user.id} isProUser={userPlan.isProUser} planTier={userPlan.planTier} />
    </div>
  );
}
