'use client';

import { useState, useEffect, Suspense } from 'react';
import EntertainmentEditor from '@/components/entertainment/EntertainmentEditor';
import { type EntertainmentForm, defaultEntertainmentForm } from '@/lib/entertainment/defaults';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import { Loader2 } from 'lucide-react';

function EntertainmentCreateContent() {
  const [form, setForm] = useState<EntertainmentForm>(defaultEntertainmentForm);
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
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || undefined });
        } else {
          setUser(null);
        }
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || undefined });
      }
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
        <Loader2 className="animate-spin text-pink-600" size={48} />
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
        currentService="entertainment_quiz"
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />

      <EntertainmentEditor
        form={form}
        setForm={setForm}
        user={user}
      />
    </div>
  );
}

export default function EntertainmentCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-pink-600" size={48} />
      </div>
    }>
      <EntertainmentCreateContent />
    </Suspense>
  );
}
