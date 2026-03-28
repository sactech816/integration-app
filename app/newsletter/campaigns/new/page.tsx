'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import CampaignEditor from '@/components/newsletter/CampaignEditor';
import LoginRequired from '@/components/shared/LoginRequired';
import { Loader2 } from 'lucide-react';

function NewCampaignContent() {
  const searchParams = useSearchParams();
  const listId = searchParams.get('listId') || undefined;

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user || null);
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };

    init();
    return () => { subscription?.unsubscribe(); };
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-violet-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header setPage={navigateTo} user={null} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="newsletter" />
        <LoginRequired toolName="メルマガメーカー" onLogin={() => setShowAuth(true)} />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
        currentService="newsletter"
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />
      <CampaignEditor defaultListId={listId} />
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-violet-600" size={48} />
      </div>
    }>
      <NewCampaignContent />
    </Suspense>
  );
}
