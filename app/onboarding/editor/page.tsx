'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import { fetchMakersSubscriptionStatus } from '@/lib/subscription';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import OnboardingEditor from '@/components/onboarding/OnboardingEditor';
import { Loader2 } from 'lucide-react';

function OnboardingEditorContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const newParam = searchParams.get('new');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingModal, setEditingModal] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      // Pro判定
      if (currentUser) {
        try {
          const status = await fetchMakersSubscriptionStatus(currentUser.id);
          const currentIsAdmin = currentUser.email && adminEmails.some(email =>
            currentUser.email?.toLowerCase() === email.toLowerCase()
          );
          setIsUnlocked(!!currentIsAdmin || !!status?.hasActiveSubscription);
        } catch { /* ignore */ }
      }

      if (newParam) {
        setEditingModal(null);
      } else if (editId) {
        const { data } = await supabase
          .from('onboarding_modals')
          .select('*')
          .eq('slug', editId)
          .single();

        if (data) {
          setEditingModal(data);
        }
      }
      setIsLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, [editId, newParam]);

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
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
        currentService="onboarding"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />

      <OnboardingEditor
        user={user}
        isAdmin={isAdmin}
        initialData={editingModal}
        setPage={navigateTo}
        onBack={() => navigateTo('dashboard')}
        setShowAuth={setShowAuth}
        isUnlocked={isUnlocked}
      />
    </div>
  );
}

export default function OnboardingEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    }>
      <OnboardingEditorContent />
    </Suspense>
  );
}
