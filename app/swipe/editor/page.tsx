'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import SwipeEditor from '@/components/swipe/SwipeEditor';
import { Loader2 } from 'lucide-react';

function SwipeEditorContent() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      if (currentUser) {
        setUser({ id: currentUser.id, email: currentUser.email });
        const adminEmails = getAdminEmails();
        setIsAdmin(adminEmails.some(e => currentUser.email?.toLowerCase() === e.toLowerCase()));
      }

      setIsLoading(false);
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={async () => {
          await supabase?.auth.signOut();
          router.push('/');
        }}
        setShowAuth={setShowAuth}
        currentService="swipe"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={(u: { id: string; email?: string }) => {
          setUser(u);
          setShowAuth(false);
        }}
      />

      <SwipeEditor userId={user?.id} isAdmin={isAdmin} />
    </div>
  );
}

export default function SwipeEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
        </div>
      }
    >
      <SwipeEditorContent />
    </Suspense>
  );
}
